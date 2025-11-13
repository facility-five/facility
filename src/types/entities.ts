import { Database } from './supabase';

export interface User {
  id: string;
  email: string;
  user_type: 'tenant' | 'administrator' | 'manager' | 'resident';
  created_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  whatsapp: string;
  role: string;
  status: string;
  subscription_status: string;
  last_sign_in_at: string;
  company_name?: string;
  company_document?: string;
  company_phone?: string;
  company_email?: string;
  company_website?: string;
  company_logo?: string;
  company_address?: string;
  company_city?: string;
  company_state?: string;
  company_country?: string;
  company_postal_code?: string;
}

export interface Administrator {
  id: string;
  tenant_id: string;
  name: string;
  document: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  status: 'active' | 'inactive';
}

export interface Communication {
  id: string;
  title: string;
  content: string;
  type: 'announcement' | 'maintenance' | 'emergency' | 'general';
  condominium_id: string;
  created_by: string;
  priority: 'low' | 'medium' | 'high';
  target_audience: 'all' | 'residents' | 'owners' | 'managers';
  is_active: boolean;
  scheduled_for?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  condominiums?: {
    name: string;
  };
}

export interface Condominium {
  id: string;
  administrator_id: string;
  name: string;
  nif?: string;
  email?: string;
  phone?: string;
  website?: string;
  logo?: string;
  address?: string;
  city?: string;
  state?: string;
  country: string;
  postal_code?: string;
  area?: number;
  type?: string;
  // Campo legado para compatibilidade retroativa
  condo_type?: string;
  total_blocks: number;
  total_units: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  status: 'active' | 'inactive';
}

// Tipo auxiliar para normalização de condomínios
export interface NormalizedCondominium extends Condominium {
  condo_type: string; // Garante que existe para código legado
}

export interface CommonArea {
  id: string;
  name: string;
  description?: string;
  condominium_id: string;
  type?: string;
  capacity?: number;
  hourly_rate?: number;
  daily_rate?: number;
  rules?: string;
  images?: string[];
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  status: 'active' | 'inactive';
}

export interface Resident {
  id: string;
  user_id: string;
  condominium_id: string;
  unit_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  is_owner: boolean;
  move_in_date?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  status: 'active' | 'inactive';
}

export interface Block {
  id: string;
  condominium_id: string;
  name: string;
  number_of_floors?: number;
  total_units: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  status: 'active' | 'inactive';
}

export interface Unit {
  id: string;
  block_id: string;
  number: string;
  floor?: number;
  area?: number;
  bedrooms?: number;
  bathrooms?: number;
  parking_spots?: number;
  type?: string;
  status: 'available' | 'occupied' | 'reserved';
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface Plan {
  id: string;
  name: string;
  description?: string;
  price: number;
  interval: 'month' | 'year';
  currency: string;
  features: string[];
  max_administrators?: number;
  max_condos?: number;
  max_blocks?: number;
  max_units?: number;
  max_users?: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  status: 'active' | 'inactive';
}

export interface Payment {
  id: string;
  user_id: string;
  plan_id: string;
  amount: number;
  currency: string;
  interval: 'month' | 'year';
  status: 'pending' | 'active' | 'cancelled' | 'failed';
  payment_method?: string;
  payment_intent_id?: string;
  subscription_id?: string;
  start_date: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}
