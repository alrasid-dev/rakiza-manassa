import { ENV, databaseReady, isSupabaseProjectUrl } from "./env";

export function dataConnectionsStatus() {
  return {
    databaseConfigured: databaseReady(),
    supabaseConfigured: Boolean(ENV.supabaseUrl && ENV.supabaseAnonKey),
    supabaseProjectUrlReady: isSupabaseProjectUrl(),
  };
}
