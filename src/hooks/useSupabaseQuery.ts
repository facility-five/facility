/**
 * Hooks reutilizáveis para paginação e cache de queries do Supabase
 * Implementa estratégias de performance e otimização
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { PostgrestResponse, PostgrestError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

// Tipos para paginação
export interface PaginationOptions {
  pageSize?: number;
  initialPage?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  nextPage: () => Promise<void>;
  prevPage: () => Promise<void>;
  goToPage: (page: number) => Promise<void>;
}

// Cache simples em memória
class QueryCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutos

  set(key: string, data: any, ttl = this.defaultTTL) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
    logger.debug(`Cache set: ${key}`, { ttl });
  }

  get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > cached.ttl;
    if (isExpired) {
      this.cache.delete(key);
      logger.debug(`Cache expired: ${key}`);
      return null;
    }

    logger.debug(`Cache hit: ${key}`);
    return cached.data;
  }

  clear(key?: string) {
    if (key) {
      this.cache.delete(key);
      logger.debug(`Cache cleared: ${key}`);
    } else {
      this.cache.clear();
      logger.debug('Cache cleared: all');
    }
  }

  invalidate(pattern: string) {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        logger.debug(`Cache invalidated: ${key}`);
      }
    }
  }
}

// Instância global do cache
export const queryCache = new QueryCache();

// Hook para paginação de dados
export function usePaginatedQuery<T>(
  table: string,
  filters: Record<string, any> = {},
  options: PaginationOptions = {}
): PaginationResult<T> {
  const {
    pageSize = 20,
    initialPage = 1,
    orderBy = 'created_at',
    orderDirection = 'desc',
  } = options;

  const [data, setData] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const cacheKey = `${table}-${JSON.stringify(filters)}-${page}-${pageSize}-${orderBy}-${orderDirection}`;

  const fetchData = useCallback(async (targetPage: number) => {
    // Cancelar requisição anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      // Verificar cache primeiro
      const cachedData = queryCache.get<PaginationResult<T>>(cacheKey);
      if (cachedData) {
        setData(cachedData.data);
        setTotal(cachedData.total);
        setLoading(false);
        return;
      }

      const start = (targetPage - 1) * pageSize;
      const end = start + pageSize - 1;

      logger.debug(`Fetching paginated data: ${table}`, { 
        table, 
        filters, 
        start, 
        end, 
        orderBy, 
        orderDirection 
      });

      // Construir query base
      let query = supabase
        .from(table)
        .select('*', { count: 'exact', head: false })
        .range(start, end)
        .order(orderBy, { ascending: orderDirection === 'asc' });

      // Aplicar filtros
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query = query.eq(key, value);
        }
      });

      const { data: response, error: queryError, count } = await query
        .abortSignal(abortControllerRef.current.signal);

      if (queryError) throw queryError;

      const result = response || [];
      const totalCount = count || 0;

      // Armazenar no cache
      queryCache.set(cacheKey, {
        data: result,
        total: totalCount,
      });

      setData(result as T[]);
      setTotal(totalCount);
      setPage(targetPage);

      logger.debug(`Paginated data fetched successfully: ${table}`, {
        count: result.length,
        total: totalCount,
        page: targetPage,
      });

    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        logger.debug('Request aborted');
        return;
      }

      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar dados';
      logger.error(`Error fetching paginated data: ${table}`, err);
      setError(errorMessage);
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [table, filters, pageSize, orderBy, orderDirection, cacheKey]);

  const nextPage = useCallback(async () => {
    if (hasNext && !loading) {
      await fetchData(page + 1);
    }
  }, [page, hasNext, loading, fetchData]);

  const prevPage = useCallback(async () => {
    if (hasPrev && !loading) {
      await fetchData(page - 1);
    }
  }, [page, hasPrev, loading, fetchData]);

  const goToPage = useCallback(async (targetPage: number) => {
    if (targetPage >= 1 && targetPage <= totalPages && !loading) {
      await fetchData(targetPage);
    }
  }, [totalPages, loading, fetchData]);

  const refetch = useCallback(async () => {
    // Limpar cache para esta query específica
    queryCache.clear(cacheKey);
    await fetchData(page);
  }, [page, cacheKey, fetchData]);

  const totalPages = Math.ceil(total / pageSize);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  useEffect(() => {
    fetchData(page);

    return () => {
      // Cleanup: abortar requisição ao desmontar
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  // Invalidar cache quando filtros mudam
  useEffect(() => {
    queryCache.clear(cacheKey);
    if (page !== initialPage) {
      setPage(initialPage);
    } else {
      fetchData(initialPage);
    }
  }, [JSON.stringify(filters)]);

  return {
    data,
    total,
    page,
    pageSize,
    totalPages,
    hasNext,
    hasPrev,
    loading,
    error,
    refetch,
    nextPage,
    prevPage,
    goToPage,
  };
}

// Hook para cache de queries simples
export function useCachedQuery<T>(
  key: string,
  queryFn: () => Promise<PostgrestResponse<T>>,
  deps: any[] = [],
  ttl = 5 * 60 * 1000 // 5 minutos
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Verificar cache primeiro
      const cachedData = queryCache.get<T[]>(key);
      if (cachedData) {
        setData(cachedData);
        setLoading(false);
        return;
      }

      logger.debug(`Executing cached query: ${key}`);
      const { data: response, error: queryError } = await queryFn();

      if (queryError) throw queryError;

      const result = response || [];
      
      // Armazenar no cache
      queryCache.set(key, result, ttl);
      setData(result);

      logger.debug(`Cached query executed successfully: ${key}`, {
        count: result.length,
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar dados';
      logger.error(`Error executing cached query: ${key}`, err);
      setError(errorMessage);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [key, queryFn, ttl]);

  const refetch = useCallback(async () => {
    queryCache.clear(key);
    await fetchData();
  }, [key, fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData, ...deps]);

  return {
    data,
    loading,
    error,
    refetch,
  };
}

// Hook para infinite scroll
export function useInfiniteQuery<T>(
  table: string,
  filters: Record<string, any> = {},
  options: { pageSize?: number; orderBy?: string; orderDirection?: 'asc' | 'desc' } = {}
) {
  const { pageSize = 20, orderBy = 'created_at', orderDirection = 'desc' } = options;
  
  const [data, setData] = useState<T[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastIdRef = useRef<string | null>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from(table)
        .select('*')
        .order(orderBy, { ascending: orderDirection === 'asc' })
        .limit(pageSize + 1); // +1 para verificar se há mais

      // Aplicar filtros
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query = query.eq(key, value);
        }
      });

      // Cursor-based pagination
      if (lastIdRef.current) {
        query = orderDirection === 'desc' 
          ? query.lt(orderBy, lastIdRef.current)
          : query.gt(orderBy, lastIdRef.current);
      }

      const { data: response, error: queryError } = await query;

      if (queryError) throw queryError;

      const result = response || [];
      const hasMoreItems = result.length > pageSize;
      const items = hasMoreItems ? result.slice(0, -1) : result;

      if (items.length > 0) {
        lastIdRef.current = items[items.length - 1][orderBy];
      }

      setData(prev => [...prev, ...items]);
      setHasMore(hasMoreItems);

      logger.debug(`Infinite query loaded: ${table}`, {
        loaded: items.length,
        total: data.length + items.length,
        hasMore: hasMoreItems,
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar dados';
      logger.error(`Error in infinite query: ${table}`, err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [table, filters, pageSize, orderBy, orderDirection, data.length, hasMore, loading]);

  const reset = useCallback(() => {
    setData([]);
    setHasMore(true);
    setError(null);
    lastIdRef.current = null;
  }, []);

  return {
    data,
    hasMore,
    loading,
    error,
    loadMore,
    reset,
  };
}

// Funções utilitárias para cache management
export const invalidateCache = (pattern?: string) => {
  if (pattern) {
    queryCache.invalidate(pattern);
  } else {
    queryCache.clear();
  }
};

export const invalidateTable = (table: string) => {
  queryCache.invalidate(new RegExp(`^${table}-`));
};

export const invalidateRelated = (tables: string[]) => {
  tables.forEach(table => invalidateTable(table));
};