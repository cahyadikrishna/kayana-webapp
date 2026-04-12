import { createClient } from '@supabase/supabase-js';
import {
	PUBLIC_SUPABASE_URL,
	PUBLIC_SUPABASE_ANON_KEY
} from '$env/static/public';

/**
 * Server-side Supabase client using the public anon key.
 * For Phase 2, swap for the service role key for privileged operations.
 */
export const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);
