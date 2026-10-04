function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export function hasSupabaseServerEnv(): boolean {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL);
}

export function getSupabaseServerEnv() {
  return {
    serviceRoleKey: required("SUPABASE_SERVICE_ROLE_KEY"),
    url: required("NEXT_PUBLIC_SUPABASE_URL"),
  };
}
