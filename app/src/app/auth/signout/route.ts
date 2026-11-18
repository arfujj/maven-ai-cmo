import { NextResponse } from "next/server";
import { supabaseServer, authEnabled } from "@/lib/supabase/server";

export async function POST(req: Request) {
  if (authEnabled) await (await supabaseServer()).auth.signOut();
  return NextResponse.redirect(new URL("/", req.url), { status: 303 });
}
