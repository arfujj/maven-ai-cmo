import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { supabaseServer, authEnabled } from "@/lib/supabase/server";

/** Token-hash sign-in (works when the email is opened on a different device or browser). */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const tokenHash = url.searchParams.get("token_hash");
  // "magiclink" is the older name for the same link; Supabase now verifies it as "email".
  const raw = url.searchParams.get("type") || "email";
  const type = (raw === "magiclink" ? "email" : raw) as EmailOtpType;
  const next = url.searchParams.get("next") || "/dashboard";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
  if (authEnabled && tokenHash) {
    const { error } = await (await supabaseServer()).auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) return NextResponse.redirect(new URL(safeNext, url.origin));
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, url.origin));
  }
  return NextResponse.redirect(new URL("/login?error=That+sign-in+link+is+invalid+or+expired", url.origin));
}
