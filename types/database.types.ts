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
          paikkakunnat: string[] | null;
          toimialat: string[] | null;
          ai_profiili_kuvaus: string | null;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          plan: string;
          plan_expires_at: string | null;
          email: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          paikkakunnat?: string[] | null;
          toimialat?: string[] | null;
          ai_profiili_kuvaus?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          plan?: string;
          plan_expires_at?: string | null;
          email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          paikkakunnat?: string[] | null;
          toimialat?: string[] | null;
          ai_profiili_kuvaus?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          plan?: string;
          plan_expires_at?: string | null;
          email?: string | null;
          created_at?: string;
          updated_at?: string;
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
