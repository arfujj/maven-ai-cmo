import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export const authEnabled = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

export async function supabaseServer() {
  const store = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          /* called from a Server Component; middleware refreshes the session */
        }
      },
    },
  });
}

/** The signed-in user's id and email, or nulls in local mode (no Supabase configured). */
export async function currentUser(): Promise<{ id: string | null; email: string | null }> {
  if (!authEnabled) return { id: null, email: null };
  const { data } = await (await supabaseServer()).auth.getUser();
  return { id: data.user?.id ?? null, email: data.user?.email ?? null };
}

/** The signed-in user's id, or null in local mode (no Supabase configured). */
export async function currentUserId(): Promise<string | null> {
  if (!authEnabled) return null;
  const { data } = await (await supabaseServer()).auth.getUser();
  return data.user?.id ?? null;
}
