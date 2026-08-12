import { NextResponse } from "next/server";
import { auth } from "./auth";

// Every mail-ops API route must call this first. Because the signIn
// callback in auth.ts already rejects any non-admin Google account,
// "a session exists" is equivalent to "this is the admin" — but we
// still respond 404 (not 401/403) on failure so an unauthenticated
// caller learns nothing about whether the route exists.
export async function requireAdminSession() {
  const session = await auth();
  if (!session || session.error || !session.accessToken) {
    return { session: null, response: NextResponse.json({ error: "not found" }, { status: 404 }) };
  }
  return { session, response: null };
}
