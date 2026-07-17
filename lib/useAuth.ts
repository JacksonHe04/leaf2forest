import { useQuery } from '@tanstack/react-query';

interface AuthUser {
  id: string;
  is_admin: boolean;
  classmate_id: string | null;
  user_id: string | null;
  name: string | null;
}

async function fetchAuth(): Promise<{ user: AuthUser | null }> {
  const res = await fetch('/api/auth/me');
  if (!res.ok) return { user: null };
  return res.json();
}

/**
 * useAuth — client-side auth state hook.
 * Fetches /api/auth/me once and caches the result via React Query.
 * staleTime: 5 minutes so navigation between pages doesn't re-fetch.
 */
export function useAuth() {
  const { data } = useQuery({
    queryKey: ['auth'],
    queryFn: fetchAuth,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const user = data?.user ?? null;
  return {
    user,
    isLoggedIn: !!user,
    isAdmin: user?.is_admin ?? false,
  };
}
