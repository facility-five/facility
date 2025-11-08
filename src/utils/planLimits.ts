import { supabase } from "@/integrations/supabase/client";
import { Plan } from "@/types/entities";

export interface PlanLimits {
  maxAdministrators: number | null;
  maxCondos: number | null;
  maxBlocks: number | null;
  maxUnits: number | null;
  maxUsers: number | null;
  hasReachedAdministratorsLimit: boolean;
  hasReachedCondosLimit: boolean;
  hasReachedBlocksLimit: boolean;
  hasReachedUnitsLimit: boolean;
  hasReachedUsersLimit: boolean;
  currentAdministrators: number;
  currentCondos: number;
  currentBlocks: number;
  currentUnits: number;
  currentUsers: number;
}

export async function getPlanLimits(userId: string): Promise<PlanLimits> {
  try {
    // Buscar plano ativo do usuário
    const { data: paymentData, error: paymentError } = await supabase
      .from('payments')
      .select(`
        plan_id,
        plans:plan_id (
          max_administrators,
          max_condos,
          max_blocks,
          max_units,
          max_users
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (paymentError) throw paymentError;

    // Extrair os limites do plano
    const plan = paymentData?.plans?.[0] as Partial<Plan> | undefined;

    // Buscar contagens
    const { data: counts, error: countError } = await supabase.rpc('get_tenant_counts', { p_tenant_id: userId });

    if (countError) throw countError;
    
    // Extrair as contagens
    const {
      administrators_count,
      condominiums_count,
      blocks_count,
      units_count,
      profiles_count,
    } = counts as {
      administrators_count: number;
      condominiums_count: number;
      blocks_count: number;
      units_count: number;
      profiles_count: number;
    };

    const currentAdministrators = administrators_count ?? 0;
    const currentCondos = condominiums_count ?? 0;
    const currentBlocks = blocks_count ?? 0;
    const currentUnits = units_count ?? 0;
    const currentUsers = profiles_count ?? 0;

    return {
      maxAdministrators: plan?.max_administrators ?? null,
      maxCondos: plan?.max_condos ?? null,
      maxBlocks: plan?.max_blocks ?? null,
      maxUnits: plan?.max_units ?? null,
      maxUsers: plan?.max_users ?? null,
      hasReachedAdministratorsLimit: plan?.max_administrators != null && currentAdministrators >= plan.max_administrators,
      hasReachedCondosLimit: plan?.max_condos != null && currentCondos >= plan.max_condos,
      hasReachedBlocksLimit: plan?.max_blocks != null && currentBlocks >= plan.max_blocks,
      hasReachedUnitsLimit: plan?.max_units != null && currentUnits >= plan.max_units,
      hasReachedUsersLimit: plan?.max_users != null && currentUsers >= plan.max_users,
      currentAdministrators,
      currentCondos,
      currentBlocks,
      currentUnits,
      currentUsers,
    };
  } catch (error) {
    console.error('Error getting plan limits:', error);
    // Retornar valores default permitindo operação sem limites
    return {
      maxAdministrators: null,
      maxCondos: null,
      maxBlocks: null,
      maxUnits: null,
      maxUsers: null,
      hasReachedAdministratorsLimit: false,
      hasReachedCondosLimit: false,
      hasReachedBlocksLimit: false,
      hasReachedUnitsLimit: false,
      hasReachedUsersLimit: false,
      currentAdministrators: 0,
      currentCondos: 0,
      currentBlocks: 0,
      currentUnits: 0,
      currentUsers: 0,
    };
  }
}

export async function checkPlanLimit(
  userId: string,
  resource: 'administrators' | 'condos' | 'blocks' | 'units' | 'users'
): Promise<boolean> {
  try {
    const limits = await getPlanLimits(userId);
    
    switch (resource) {
      case 'administrators':
        return !limits.hasReachedAdministratorsLimit;
      case 'condos':
        return !limits.hasReachedCondosLimit;
      case 'blocks':
        return !limits.hasReachedBlocksLimit;
      case 'units':
        return !limits.hasReachedUnitsLimit;
      case 'users':
        return !limits.hasReachedUsersLimit;
      default:
        return true;
    }
  } catch (error) {
    console.error('Error checking plan limit:', error);
    return true; // Em caso de erro, permitir a operação
  }
}

export function formatPlanLimits(limits: PlanLimits): string[] {
  const features = [];

  if (limits.maxAdministrators !== null) {
    features.push(`${limits.currentAdministrators}/${limits.maxAdministrators} administradoras`);
  }
  if (limits.maxCondos !== null) {
    features.push(`${limits.currentCondos}/${limits.maxCondos} condomínios`);
  }
  if (limits.maxBlocks !== null) {
    features.push(`${limits.currentBlocks}/${limits.maxBlocks} blocos`);
  }
  if (limits.maxUnits !== null) {
    features.push(`${limits.currentUnits}/${limits.maxUnits} unidades`);
  }
  if (limits.maxUsers !== null) {
    features.push(`${limits.currentUsers}/${limits.maxUsers} usuários`);
  }

  return features;
}