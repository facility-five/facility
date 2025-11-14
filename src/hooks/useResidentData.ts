/**
 * Hook para cache inteligente de dados do morador
 * Evita refetching desnecessário e melhora a performance
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class ResidentDataCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  invalidate(key: string) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }
}

const cache = new ResidentDataCache();

export interface ResidentProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  document_number: string | null;
  unit_id: string | null;
  condo_id: string | null;
  unit_number: string | null;
  block_name: string | null;
  condominium_name: string | null;
  is_owner: boolean;
  is_tenant: boolean;
}

export const useResidentProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ResidentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchingRef = useRef(false);

  const fetchProfile = useCallback(async (forceRefresh = false) => {
    if (!user?.id || fetchingRef.current) return;

    const cacheKey = `resident-profile-${user.id}`;
    
    if (!forceRefresh) {
      const cached = cache.get<ResidentProfile>(cacheKey);
      if (cached) {
        setProfile(cached);
        setLoading(false);
        return;
      }
    }

    fetchingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('residents')
        .select(`
          *,
          units(number, blocks(name)),
          condominiums(name)
        `)
        .eq('profile_id', user.id)
        .single();

      if (error) throw error;

      const formattedProfile: ResidentProfile = {
        id: data.id,
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: data.email || '',
        phone: data.phone,
        document_number: data.document_number,
        unit_id: data.unit_id,
        condo_id: data.condo_id,
        unit_number: data.units?.number || null,
        block_name: data.units?.blocks?.name || null,
        condominium_name: data.condominiums?.name || null,
        is_owner: data.is_owner || false,
        is_tenant: data.is_tenant || false,
      };

      setProfile(formattedProfile);
      cache.set(cacheKey, formattedProfile, 10 * 60 * 1000); // 10 minutes cache
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching resident profile:', err);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchProfile();
    }
  }, [user?.id, fetchProfile]);

  const updateProfile = useCallback(async (updates: Partial<ResidentProfile>) => {
    if (!profile) return false;

    try {
      const { error } = await supabase
        .from('residents')
        .update(updates)
        .eq('id', profile.id);

      if (error) throw error;

      const updatedProfile = { ...profile, ...updates };
      setProfile(updatedProfile);
      
      // Update cache
      const cacheKey = `resident-profile-${user?.id}`;
      cache.set(cacheKey, updatedProfile, 10 * 60 * 1000);
      
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  }, [profile, user?.id]);

  const invalidateCache = useCallback(() => {
    if (user?.id) {
      const cacheKey = `resident-profile-${user.id}`;
      cache.invalidate(cacheKey);
    }
  }, [user?.id]);

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile,
    invalidateCache
  };
};

export const useResidentRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(async (forceRefresh = false) => {
    if (!user?.id) return;

    const cacheKey = `resident-requests-${user.id}`;
    
    if (!forceRefresh) {
      const cached = cache.get<any[]>(cacheKey);
      if (cached) {
        setRequests(cached);
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("resident_requests")
        .select("*")
        .eq("resident_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setRequests(data || []);
      cache.set(cacheKey, data || [], 2 * 60 * 1000); // 2 minutes cache
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchRequests();
    }
  }, [user?.id, fetchRequests]);

  const createRequest = useCallback(async (requestData: any) => {
    try {
      const { data, error } = await supabase
        .from("resident_requests")
        .insert([{ ...requestData, resident_id: user?.id }])
        .select()
        .single();

      if (error) throw error;

      // Invalidate cache and refetch
      const cacheKey = `resident-requests-${user?.id}`;
      cache.invalidate(cacheKey);
      await fetchRequests(true);

      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, [user?.id, fetchRequests]);

  return {
    requests,
    loading,
    error,
    fetchRequests,
    createRequest
  };
};

// Cleanup cache on logout
export const clearResidentCache = () => {
  cache.clear();
};