export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      administrators: {
        Row: {
          id: string
          tenant_id: string
          name: string
          nif: string | null
          email: string | null
          phone: string | null
          website: string | null
          logo: string | null
          address: string | null
          city: string | null
          state: string | null
          country: string
          postal_code: string | null
          responsible_name: string | null
          responsible_email: string | null
          responsible_phone: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
          status: string
        }
        Insert: {
          id?: string
          tenant_id: string
          name: string
          nif?: string | null
          email?: string | null
          phone?: string | null
          website?: string | null
          logo?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          country?: string
          postal_code?: string | null
          responsible_name?: string | null
          responsible_email?: string | null
          responsible_phone?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          status?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          name?: string
          nif?: string | null
          email?: string | null
          phone?: string | null
          website?: string | null
          logo?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          country?: string
          postal_code?: string | null
          responsible_name?: string | null
          responsible_email?: string | null
          responsible_phone?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          status?: string
        }
      }
      condominiums: {
        Row: {
          id: string
          administrator_id: string
          name: string
          nif: string | null
          email: string | null
          phone: string | null
          website: string | null
          logo: string | null
          address: string | null
          city: string | null
          state: string | null
          country: string
          postal_code: string | null
          area: number | null
          type: string | null
          total_blocks: number
          total_units: number
          created_at: string
          updated_at: string
          deleted_at: string | null
          status: string
        }
        Insert: {
          id?: string
          administrator_id: string
          name: string
          nif?: string | null
          email?: string | null
          phone?: string | null
          website?: string | null
          logo?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          country?: string
          postal_code?: string | null
          area?: number | null
          type?: string | null
          total_blocks?: number
          total_units?: number
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          status?: string
        }
        Update: {
          id?: string
          administrator_id?: string
          name?: string
          nif?: string | null
          email?: string | null
          phone?: string | null
          website?: string | null
          logo?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          country?: string
          postal_code?: string | null
          area?: number | null
          type?: string | null
          total_blocks?: number
          total_units?: number
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          status?: string
        }
      }
      blocks: {
        Row: {
          id: string
          condominium_id: string
          name: string
          number_of_floors: number | null
          total_units: number
          created_at: string
          updated_at: string
          deleted_at: string | null
          status: string
        }
        Insert: {
          id?: string
          condominium_id: string
          name: string
          number_of_floors?: number | null
          total_units?: number
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          status?: string
        }
        Update: {
          id?: string
          condominium_id?: string
          name?: string
          number_of_floors?: number | null
          total_units?: number
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          status?: string
        }
      }
      units: {
        Row: {
          id: string
          block_id: string
          number: string
          floor: number | null
          area: number | null
          bedrooms: number | null
          bathrooms: number | null
          parking_spots: number | null
          type: string | null
          status: string
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          block_id: string
          number: string
          floor?: number | null
          area?: number | null
          bedrooms?: number | null
          bathrooms?: number | null
          parking_spots?: number | null
          type?: string | null
          status?: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          block_id?: string
          number?: string
          floor?: number | null
          area?: number | null
          bedrooms?: number | null
          bathrooms?: number | null
          parking_spots?: number | null
          type?: string | null
          status?: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      plans: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          interval: string
          currency: string
          features: Json
          max_administrators: number | null
          max_condos: number | null
          max_blocks: number | null
          max_units: number | null
          max_users: number | null
          created_at: string
          updated_at: string
          deleted_at: string | null
          status: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          interval?: string
          currency?: string
          features?: Json
          max_administrators?: number | null
          max_condos?: number | null
          max_blocks?: number | null
          max_units?: number | null
          max_users?: number | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          status?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          interval?: string
          currency?: string
          features?: Json
          max_administrators?: number | null
          max_condos?: number | null
          max_blocks?: number | null
          max_units?: number | null
          max_users?: number | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          status?: string
        }
      }
      payments: {
        Row: {
          id: string
          user_id: string
          plan_id: string
          amount: number
          currency: string
          interval: string
          status: string
          payment_method: string | null
          payment_intent_id: string | null
          subscription_id: string | null
          start_date: string
          end_date: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          plan_id: string
          amount: number
          currency?: string
          interval?: string
          status?: string
          payment_method?: string | null
          payment_intent_id?: string | null
          subscription_id?: string | null
          start_date?: string
          end_date?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          plan_id?: string
          amount?: number
          currency?: string
          interval?: string
          status?: string
          payment_method?: string | null
          payment_intent_id?: string | null
          subscription_id?: string | null
          start_date?: string
          end_date?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_plan_limits: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_resident_account: {
        Args: {
          p_email: string
          p_password: string
          p_full_name: string
          p_unit_id: string
          p_administrator_id: string
          p_is_owner?: boolean
          p_is_tenant?: boolean
          p_is_dependent?: boolean
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}