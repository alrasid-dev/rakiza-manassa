export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export function supabaseBrowserConfig() {
  return {
    url: String(supabaseUrl || "").trim(),
    anonKey: String(supabaseAnonKey || "").trim(),
  };
}

export function supabaseBrowserReady() {
  const config = supabaseBrowserConfig();
  return Boolean(config.url && config.anonKey && /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(config.url));
}
