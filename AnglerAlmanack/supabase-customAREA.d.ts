import { PostgrestBuilder } from '@supabase/postgrest-js';
import { SupabaseClient } from '@supabase/supabase-js';

declare module '@supabase/supabase-js' {
  interface SupabaseClient {
    rpc<TResult = any, TParams = Record<string, unknown>>(
      fn: string,
      params?: TParams
    ): PostgrestBuilder<TResult>;
  }
}
