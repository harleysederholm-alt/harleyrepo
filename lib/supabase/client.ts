/**
 * Supabase Client (Client-side)
 *
 * Käytetään React-komponenteissa ja client-side-logiikassa.
 */

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database.types';

export const createClient = () => {
  return createClientComponentClient<Database>();
};

// Singleton instance
export const supabase = createClient();
