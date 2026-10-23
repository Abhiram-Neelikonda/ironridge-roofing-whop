import { createFileRoute } from "@tanstack/react-router";
import { json } from "../lib/whop-api";
import { createSession } from "../lib/db";

/**
 * POST /api/admin-login { access_token } → verifies a Whop OAuth access token,
 * checks the user is on the ADMIN_USER_IDS allowlist, and issues a staff session.
 *
 *   whop apps secrets set --secret ADMIN_USER_IDS="user_xxx,user_yyy"
 */
interface UserInfo {
  sub?: string;
  name?: string;
  preferred_username?: string;
  email?: string;
}

export const Route = createFileRoute("/api/admin-login")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let accessToken = "";
        try {
          accessToken = ((await request.json()) as { access_token?: string }).access_token ?? "";
        } catch {
          /* ignore */
        }
        if (!accessToken) return json({ error: "Missing access token." }, 400);

        // Who is this Whop user?
        const res = await fetch("https://api.whop.com/oauth/userinfo", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!res.ok) return json({ error: "Could not verify Whop sign-in." }, 401);
        const user = (await res.json()) as UserInfo;
        const sub = user.sub ?? "";
        if (!sub) return json({ error: "No user id from Whop." }, 401);

        // Allowlist check.
        const allow = (process.env.ADMIN_USER_IDS ?? "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        if (allow.length === 0 || !allow.includes(sub)) {
          return json(
            { error: "This Whop account isn't authorized for the staff console.", sub },
            403,
          );
        }

        const name = user.name || user.preferred_username || user.email || "Staff";
        const session = await createSession(sub, name);
        if (!session) return json({ error: "Could not start a session (no database)." }, 500);
        return json({ ok: true, session, name }, 200);
      },
    },
  },
});
