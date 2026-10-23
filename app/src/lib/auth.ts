import { verifySession } from "./db";

/**
 * Admin auth for the staff console. Accepts either:
 *  - a valid Whop-login session token (from /api/admin/login), or
 *  - the static ADMIN_TOKEN secret (fallback).
 * Pass the credential in the `x-admin-token` header.
 */
export async function adminAuthed(request: Request): Promise<boolean> {
  const token = request.headers.get("x-admin-token") ?? "";
  if (!token) return false;
  const staticTok = process.env.ADMIN_TOKEN;
  if (staticTok && token === staticTok) return true;
  const session = await verifySession(token);
  return !!session;
}
