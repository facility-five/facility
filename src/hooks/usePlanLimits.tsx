import { useEffect, useState } from 'react';
import { PlanLimits, getPlanLimits } from '@/utils/planLimits';
import { useAuth } from '@/contexts/AuthContext';

export function usePlanLimits() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [limits, setLimits] = useState<PlanLimits | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadLimits = async () => {
      if (!user?.id) {
        setLimits(null);
        setIsLoading(false);
        return;
      }

      try {
        const planLimits = await getPlanLimits(user.id);
        if (isMounted) {
          setLimits(planLimits);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to load plan limits'));
          setLimits(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    setIsLoading(true);
    loadLimits();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const formattedLimits = limits ? `${limits.currentAdministrators}/${limits.maxAdministrators ?? '∞'} administradoras, ${limits.currentCondos}/${limits.maxCondos ?? '∞'} condomínios` : '';

  return {
    isLoading,
    error,
    limits,
    formattedLimits,
    // Funções auxiliares
    hasReachedLimit: (resource: 'administrators' | 'condos' | 'blocks' | 'units' | 'users') => {
      if (!limits) return false;

      switch (resource) {
        case 'administrators':
          return limits.hasReachedAdministratorsLimit;
        case 'condos':
          return limits.hasReachedCondosLimit;
        case 'blocks':
          return limits.hasReachedBlocksLimit;
        case 'units':
          return limits.hasReachedUnitsLimit;
        case 'users':
          return limits.hasReachedUsersLimit;
        default:
          return false;
      }
    },
    // Retorna a mensagem de limite atingido para o recurso
    getLimitMessage: (resource: 'administrators' | 'condos' | 'blocks' | 'units' | 'users') => {
      if (!limits) return '';

      const resourceNames = {
        administrators: 'administradoras',
        condos: 'condomínios',
        blocks: 'blocos',
        units: 'unidades',
        users: 'usuários'
      };

      const maxValue = {
        administrators: limits.maxAdministrators,
        condos: limits.maxCondos,
        blocks: limits.maxBlocks,
        units: limits.maxUnits,
        users: limits.maxUsers
      }[resource];

      const currentValue = {
        administrators: limits.currentAdministrators,
        condos: limits.currentCondos,
        blocks: limits.currentBlocks,
        units: limits.currentUnits,
        users: limits.currentUsers
      }[resource];

      return maxValue ? 
        `Limite de ${maxValue} ${resourceNames[resource]} atingido (${currentValue}/${maxValue})` : 
        '';
    }
  };
}