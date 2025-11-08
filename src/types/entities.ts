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
  nif: string;
  email: string;
  phone: string;
  website?: string;
  logo?: string;
  address?: string;
  city?: string;
  state?: string;
  country: string;
  postal_code?: string;
  responsible_name: string;
  responsible_email: string;
  responsible_phone: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  status: 'active' | 'inactive' | 'suspended';
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
  total_blocks: number;
  total_units: number;
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