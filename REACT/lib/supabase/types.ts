// Database types matching the Retrofit web app
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          billing_address: string | null
          billing_city: string | null
          billing_state: string | null
          billing_zip_code: string | null
          bio: string | null
          city: string | null
          company: string | null
          created_at: string | null
          email: string | null
          email_notifications: boolean | null
          full_name: string | null
          id: string
          marketing_emails: boolean | null
          notifications_enabled: boolean | null
          phone: string | null
          role: string | null
          state: string | null
          theme: string | null
          updated_at: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          billing_address?: string | null
          billing_city?: string | null
          billing_state?: string | null
          billing_zip_code?: string | null
          bio?: string | null
          city?: string | null
          company?: string | null
          created_at?: string | null
          email?: string | null
          email_notifications?: boolean | null
          full_name?: string | null
          id: string
          marketing_emails?: boolean | null
          notifications_enabled?: boolean | null
          phone?: string | null
          role?: string | null
          state?: string | null
          theme?: string | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          billing_address?: string | null
          billing_city?: string | null
          billing_state?: string | null
          billing_zip_code?: string | null
          bio?: string | null
          city?: string | null
          company?: string | null
          created_at?: string | null
          email?: string | null
          email_notifications?: boolean | null
          full_name?: string | null
          id?: string
          marketing_emails?: boolean | null
          notifications_enabled?: boolean | null
          phone?: string | null
          role?: string | null
          state?: string | null
          theme?: string | null
          updated_at?: string | null
          zip_code?: string | null
        }
      }
      quotes: {
        Row: {
          address: string | null
          amount: number | null
          approved_amount: number | null
          client_email: string | null
          client_name: string
          client_phone: string | null
          created_at: string | null
          id: string
          labor_cost: number | null
          material_cost: number | null
          notes: string | null
          project_name: string
          project_type: string | null
          rebate_amount: number | null
          square_footage: number | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          amount?: number | null
          approved_amount?: number | null
          client_email?: string | null
          client_name: string
          client_phone?: string | null
          created_at?: string | null
          id?: string
          labor_cost?: number | null
          material_cost?: number | null
          notes?: string | null
          project_name: string
          project_type?: string | null
          rebate_amount?: number | null
          square_footage?: number | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          amount?: number | null
          approved_amount?: number | null
          client_email?: string | null
          client_name?: string
          client_phone?: string | null
          created_at?: string | null
          id?: string
          labor_cost?: number | null
          material_cost?: number | null
          notes?: string | null
          project_name?: string
          project_type?: string | null
          rebate_amount?: number | null
          square_footage?: number | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
      }
      quote_photos: {
        Row: {
          created_at: string | null
          file_name: string
          file_type: string | null
          file_url: string
          id: string
          quote_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          file_name: string
          file_type?: string | null
          file_url: string
          id?: string
          quote_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          file_name?: string
          file_type?: string | null
          file_url?: string
          id?: string
          quote_id?: string
          user_id?: string
        }
      }
      quote_measurements: {
        Row: {
          created_at: string | null
          id: string
          length: number | null
          measurement_type: string | null
          notes: string | null
          quote_id: string
          user_id: string
          width: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          length?: number | null
          measurement_type?: string | null
          notes?: string | null
          quote_id: string
          user_id: string
          width?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          length?: number | null
          measurement_type?: string | null
          notes?: string | null
          quote_id?: string
          user_id?: string
          width?: number | null
        }
      }
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];

