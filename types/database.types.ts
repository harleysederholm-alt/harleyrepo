/**
 * Database Types
 *
 * TypeScript-tyypit Supabase-tietokannalle.
 * Generoidaan automaattisesti komennolla: supabase gen types typescript
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          plan: string;
          subscription_status: string | null;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          subscription_current_period_end: string | null;
          created_at: string;
          updated_at: string;
          subscription_id: string | null;
          ai_profile_description: string | null;
          onboarding_completed: boolean | null;
          searches_today: number | null;
          last_search_date: string | null;
          plan_expires_at: string | null;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          plan?: string;
          subscription_status?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          subscription_current_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
          subscription_id?: string | null;
          ai_profile_description?: string | null;
          onboarding_completed?: boolean | null;
          searches_today?: number | null;
          last_search_date?: string | null;
          plan_expires_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          plan?: string;
          subscription_status?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          subscription_current_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
          subscription_id?: string | null;
          ai_profile_description?: string | null;
          onboarding_completed?: boolean | null;
          searches_today?: number | null;
          last_search_date?: string | null;
          plan_expires_at?: string | null;
        };
      };
      hankinnat: {
        Row: {
          id: string;
          title: string;
          organization: string;
          description: string | null;
          cpv_codes: string[] | null;
          deadline: string | null;
          budget_estimate: number | null;
          source_url: string;
          published_at: string | null;
          ai_summary: string | null;
          ai_match_score: number | null;
          ai_recommended_bid: number | null;
          ai_competition_analysis: Json | null;
          scraped_at: string | null;
          updated_at: string | null;
          external_id: string | null;
          ai_analysis: Json | null;
          source_platform: string | null;
          category: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          organization: string;
          description?: string | null;
          cpv_codes?: string[] | null;
          deadline?: string | null;
          budget_estimate?: number | null;
          source_url: string;
          published_at?: string | null;
          ai_summary?: string | null;
          ai_match_score?: number | null;
          ai_recommended_bid?: number | null;
          ai_competition_analysis?: Json | null;
          scraped_at?: string | null;
          updated_at?: string | null;
          external_id?: string | null;
          ai_analysis?: Json | null;
          source_platform?: string | null;
          category?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          organization?: string;
          description?: string | null;
          cpv_codes?: string[] | null;
          deadline?: string | null;
          budget_estimate?: number | null;
          source_url?: string;
          published_at?: string | null;
          ai_summary?: string | null;
          ai_match_score?: number | null;
          ai_recommended_bid?: number | null;
          ai_competition_analysis?: Json | null;
          scraped_at?: string | null;
          updated_at?: string | null;
          external_id?: string | null;
          ai_analysis?: Json | null;
          source_platform?: string | null;
          category?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Helper types
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Hankinta = Database['public']['Tables']['hankinnat']['Row'] & {
  ai_score?: number; // Runtime calculated AI match score
};
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type HankintaInsert = Database['public']['Tables']['hankinnat']['Insert'];
