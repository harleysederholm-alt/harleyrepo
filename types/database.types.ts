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
          id: number;
          otsikko: string;
          kunta: string;
          maarapaiva: string | null;
          linkki_lahteeseen: string;
          toimiala_ai: string | null;
          tiivistelma_ai: string | null;
          riskit_ai: string | null;
          raakadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: never; // BIGINT GENERATED ALWAYS AS IDENTITY
          otsikko: string;
          kunta: string;
          maarapaiva?: string | null;
          linkki_lahteeseen: string;
          toimiala_ai?: string | null;
          tiivistelma_ai?: string | null;
          riskit_ai?: string | null;
          raakadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: never;
          otsikko?: string;
          kunta?: string;
          maarapaiva?: string | null;
          linkki_lahteeseen?: string;
          toimiala_ai?: string | null;
          tiivistelma_ai?: string | null;
          riskit_ai?: string | null;
          raakadata?: Json | null;
          created_at?: string;
          updated_at?: string;
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
