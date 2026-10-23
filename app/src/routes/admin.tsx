import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { site } from "../config/site";
import { Logo } from "../components/ui/Logo";
import { Icon } from "../components/ui/Icon";
import { money } from "../lib/format";
import { track } from "../lib/track";

export const Route = createFileRoute("/admin")({ component: Admin });

type Tab = "invoices" | "leads" | "pixels";

/* ------------------------- Whop OAuth (PKCE) ------------------------- */

const APP_ID = site.brand.appId;
const OAUTH_SCOPE = "openid profile email";

function base64url(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function randomString(len = 48): string {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  return base64url(bytes);
}
async function pkceChallenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  return base64url(new Uint8Array(digest));
}
function redirectUri(): string {
  return `${window.location.origin}/admin`;
}
async function startWhopSignIn() {
  const verifier = randomString();
  const state = randomString(16);
  sessionStorage.setItem("ir_pkce", verifier);
  sessionStorage.setItem("ir_state", state);
  const params = new URLSearchParams({
    response_type: "code",
    client_id: APP_ID,
    redirect_uri: redirectUri(),
    scope: OAUTH_SCOPE,
    state,
    nonce: randomString(16), // required by Whop for the openid scope
    code_challenge: await pkceChallenge(verifier),
    code_challenge_method: "S256",
  });
  window.location.href = `https://api.whop.com/oauth/authorize?${params.toString()}`;
}

function Admin() {
  const [tab, setTab] = useState<Tab>("invoices");
  const [auth, setAuth] = useState(""); // session token used as x-admin-token for API calls
  const [userName, setUserName] = useState("");
  const [status, setStatus] = useState<"checking" | "out" | "signingin" | "in" | "error">("checking");
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const url = new URLSearchParams(window.location.search);
        const code = url.get("code");
        const state = url.get("state");
        if (code && state) {
          setStatus("signingin");
          const verifier = sessionStorage.getItem("ir_pkce") ?? "";
          const savedState = sessionStorage.getItem("ir_state") ?? "";
          window.history.replaceState(null, "", "/admin");
          if (!verifier || state !== savedState) {
            setError("Sign-in could not be verified. Please try again.");
            setStatus("error");
            return;
          }
          const tokRes = await fetch("https://api.whop.com/oauth/token", {
            method: "POST",
            headers: { "content-type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              grant_type: "authorization_code",
              code,
              redirect_uri: redirectUri(),
              client_id: APP_ID,
              code_verifier: verifier,
            }),
          });
          if (!tokRes.ok) {
            setError("Could not complete Whop sign-in (token exchange).");
            setStatus("error");
            return;
          }
          const { access_token } = (await tokRes.json()) as { access_token?: string };
          const loginRes = await fetch("/api/admin-login", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ access_token }),
          });
          const body = (await loginRes.json()) as { session?: string; name?: string; error?: string; sub?: string };
          if (!loginRes.ok || !body.session) {
            setError(
              (body.error ?? "This account isn't authorized for the staff console.") +
                (body.sub ? ` (your Whop id: ${body.sub})` : ""),
            );
            setStatus("error");
            return;
          }
          try {
            localStorage.setItem("ir_admin_session", body.session);
          } catch {
            /* ignore */
          }
          setAuth(body.session);
          setUserName(body.name ?? "");
          setStatus("in");
          return;
        }
        const saved = localStorage.getItem("ir_admin_session");
        if (saved) {
          setAuth(saved);
          setStatus("in");
          return;
        }
        setStatus("out");
      } catch (e) {
        setError((e as Error).message);
        setStatus("error");
      }
    })();
  }, []);

  function signOut() {
    try {
      localStorage.removeItem("ir_admin_session");
    } catch {
      /* ignore */
    }
    setAuth("");
    setUserName("");
    setStatus("out");
  }

  if (status !== "in") {
    return <SignIn status={status} error={error} onToken={(t) => { setAuth(t); setStatus("in"); }} />;
  }

  return (
    <div className="subpage">
      <header className="header" data-scrolled="true">
        <div className="container header__inner">
          <Logo />
          <span className="header__spacer" />
          <span className="chip">
            <Icon name="lock" /> {userName ? `Signed in — ${userName}` : "Staff console"}
          </span>
          <button className="btn btn--secondary" style={{ marginLeft: "1rem", minHeight: 38 }} onClick={signOut} type="button">
            Sign out
          </button>
        </div>
      </header>

      <main className="subpage__main">
        <div className="container admin">
          <h1 style={{ fontSize: "1.8rem" }}>{site.brand.shortName} staff tools</h1>
          <p style={{ color: "var(--color-muted)", marginTop: "0.4rem", marginBottom: "1.2rem" }}>
            Bill final balances, review incoming leads, and check tracking — all powered by the Whop API.
          </p>

          <div className="seg" role="tablist" style={{ marginBottom: "1.5rem" }}>
            <button data-active={tab === "invoices"} onClick={() => setTab("invoices")} type="button">
              Invoices
            </button>
            <button data-active={tab === "leads"} onClick={() => setTab("leads")} type="button">
              Leads
            </button>
            <button data-active={tab === "pixels"} onClick={() => setTab("pixels")} type="button">
              Pixels
            </button>
          </div>

          {tab === "invoices" && <InvoicesTab token={auth} />}
          {tab === "leads" && <LeadsTab token={auth} />}
          {tab === "pixels" && <PixelsTab token={auth} />}
        </div>
      </main>
    </div>
  );
}

function SignIn({
  status,
  error,
  onToken,
}: {
  status: string;
  error: string;
  onToken: (t: string) => void;
}) {
  const [showToken, setShowToken] = useState(false);
  const [tok, setTok] = useState("");
  return (
    <div className="status-page">
      <div className="status-card">
        <span className="status-icon status-icon--ok">
          <Icon name="lock" size={28} />
        </span>
        <h1 style={{ fontSize: "1.5rem" }}>{site.brand.shortName} staff console</h1>
        <p style={{ color: "var(--color-muted)", marginTop: "0.5rem" }}>
          Sign in with the Whop account that owns this business to manage invoices, leads, and tracking.
        </p>

        {status === "signingin" && <p style={{ marginTop: "1.2rem" }}>Signing you in…</p>}
        {status === "error" && (
          <div className="notice notice--err" style={{ marginTop: "1.2rem" }}>
            {error}
          </div>
        )}

        <button
          className="btn btn--primary btn--block btn--lg"
          style={{ marginTop: "1.4rem" }}
          onClick={() => startWhopSignIn()}
          disabled={status === "signingin"}
          type="button"
        >
          Sign in with Whop
        </button>

        <button
          className="btn"
          style={{ marginTop: "0.8rem", color: "var(--color-muted)", background: "transparent" }}
          onClick={() => setShowToken((v) => !v)}
          type="button"
        >
          Use admin token instead
        </button>
        {showToken && (
          <div style={{ marginTop: "0.8rem", display: "flex", gap: "0.5rem" }}>
            <input
              type="password"
              value={tok}
              onChange={(e) => setTok(e.target.value)}
              placeholder="ADMIN_TOKEN"
              style={{ flex: 1 }}
            />
            <button className="btn btn--secondary" onClick={() => tok && onToken(tok)} type="button">
              Enter
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ----------------------------- Invoices ----------------------------- */

interface SavedCard {
  id: string;
  memberId: string;
  name?: string;
  email?: string;
  paymentMethodId: string;
  card?: string;
}

const DEPOSIT = site.plans.deposit.priceCents / 100;
const INSPECTION = site.plans.inspection.priceCents / 100;

function InvoicesTab({ token }: { token: string }) {
  const [cards, setCards] = useState<SavedCard[]>([]);
  const [mode, setMode] = useState<"charge" | "send">("send");
  const [selected, setSelected] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [quote, setQuote] = useState<number>(2200);
  const [applyDeposit, setApplyDeposit] = useState(true);
  const [applyInspection, setApplyInspection] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function loadCards() {
    try {
      const res = await fetch("/api/setup-intents", { headers: { "x-admin-token": token } });
      const body = (await res.json()) as { data?: SavedCard[] };
      setCards(body.data ?? []);
    } catch {
      setCards([]);
    }
  }
  useEffect(() => {
    if (mode === "charge") loadCards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const credits = (applyDeposit ? DEPOSIT : 0) + (applyInspection ? INSPECTION : 0);
  const total = Math.max(0, quote - credits);
  const card = cards.find((c) => c.id === selected);
  const canSubmit = total > 0 && (mode === "charge" ? !!card : !!email && !!name) && !submitting;

  async function submit() {
    setSubmitting(true);
    setResult(null);
    const lineItems = [
      { label: "Roofing project — balance due", amount: quote },
      ...(applyDeposit ? [{ label: "Less project deposit", amount: -DEPOSIT }] : []),
      ...(applyInspection ? [{ label: "Less inspection credit", amount: -INSPECTION }] : []),
    ];
    const payload =
      mode === "charge"
        ? { mode, memberId: card?.memberId, paymentMethodId: card?.paymentMethodId, lineItems }
        : { mode, email, customerName: name, lineItems };
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "content-type": "application/json", "x-admin-token": token },
        body: JSON.stringify(payload),
      });
      const body = (await res.json()) as { ok?: boolean; id?: string; status?: string; error?: string };
      if (!res.ok || !body.ok) throw new Error(body.error || "Failed to create invoice.");
      setResult({
        ok: true,
        msg:
          mode === "send"
            ? `Invoice ${body.id ?? ""} created and emailed to ${email}.`
            : `Invoice ${body.id ?? ""} created — the saved card will be charged.`,
      });
    } catch (e) {
      setResult({ ok: false, msg: (e as Error).message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <h2 style={{ fontSize: "1.25rem" }}>Bill a final balance</h2>
      <p style={{ color: "var(--color-muted)", fontSize: "0.92rem", margin: "0.3rem 0 1.2rem" }}>
        Email the customer an invoice to pay, or auto-charge a card saved at deposit — via the Whop Invoices API.
      </p>
      <div className="admin__grid">
        <div className="admin-panel">
          <div className="seg" style={{ marginBottom: "1.2rem" }}>
            <button data-active={mode === "send"} onClick={() => setMode("send")} type="button">
              Email an invoice
            </button>
            <button data-active={mode === "charge"} onClick={() => setMode("charge")} type="button">
              Charge saved card
            </button>
          </div>

          {mode === "send" ? (
            <>
              <div className="field">
                <label htmlFor="cname">Customer name</label>
                <input id="cname" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Smith" />
              </div>
              <div className="field" style={{ marginTop: "0.8rem" }}>
                <label htmlFor="cemail">Customer email</label>
                <input id="cemail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" />
              </div>
              <p style={{ fontSize: "0.78rem", color: "var(--color-muted)", marginTop: "0.5rem" }}>
                Whop emails the invoice to this address automatically.
              </p>
            </>
          ) : (
            <div className="field">
              <label htmlFor="card">Customer (card on file)</label>
              <select id="card" value={selected} onChange={(e) => setSelected(e.target.value)}>
                <option value="">{cards.length ? "Select a saved card…" : "No saved cards — enter token & switch tabs to load"}</option>
                {cards.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name ?? c.email ?? c.memberId} — {c.card ?? "card on file"}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="admin-panel">
          <div className="field">
            <label htmlFor="quote">Quoted project total (USD)</label>
            <input id="quote" type="number" min={0} value={quote} onChange={(e) => setQuote(Number(e.target.value))} />
            <span style={{ fontSize: "0.76rem", color: "var(--color-muted)", marginTop: "0.3rem" }}>
              New accounts cap invoices at $2,500; verified accounts support more.
            </span>
          </div>
          <label className="chip" style={{ marginTop: "1rem", cursor: "pointer" }}>
            <input type="checkbox" checked={applyDeposit} onChange={(e) => setApplyDeposit(e.target.checked)} /> Credit deposit ({money(DEPOSIT * 100)})
          </label>
          <label className="chip" style={{ marginTop: "0.6rem", cursor: "pointer" }}>
            <input type="checkbox" checked={applyInspection} onChange={(e) => setApplyInspection(e.target.checked)} /> Credit inspection ({money(INSPECTION * 100)})
          </label>
          <div style={{ marginTop: "1.1rem", borderTop: "1px solid var(--color-border)", paddingTop: "0.6rem" }}>
            <div className="admin-total">
              <span>Balance due</span>
              <span>{money(total * 100)}</span>
            </div>
          </div>
          <button className="btn btn--primary btn--block btn--lg" style={{ marginTop: "1.1rem" }} disabled={!canSubmit} onClick={submit} type="button">
            {submitting ? "Creating…" : mode === "send" ? "Email invoice" : "Charge card on file"}
          </button>
        </div>
      </div>
      {result && (
        <div className={`notice ${result.ok ? "notice--ok" : "notice--err"}`} style={{ marginTop: "1.3rem" }}>
          {result.msg}
        </div>
      )}
    </>
  );
}

/* ------------------------------- Leads ------------------------------- */

interface LeadRow {
  id: string;
  name: string;
  details: string;
  createdAt?: string;
}

function LeadsTab({ token }: { token: string }) {
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");

  async function load() {
    setLoading(true);
    setNote("");
    try {
      const res = await fetch("/api/leads-list", { headers: { "x-admin-token": token } });
      const body = (await res.json()) as { data?: LeadRow[]; note?: string };
      setLeads(body.data ?? []);
      if (body.note) setNote(body.note);
    } catch {
      setNote("Could not load leads.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
        <div>
          <h2 style={{ fontSize: "1.25rem" }}>Incoming leads</h2>
          <p style={{ color: "var(--color-muted)", fontSize: "0.92rem", marginTop: "0.3rem" }}>
            Estimate requests from the site. Also in your dashboard under Marketing → Leads.
          </p>
        </div>
        <button className="btn btn--secondary" onClick={load} type="button">
          {loading ? "Loading…" : "Refresh"}
        </button>
      </div>

      <div className="admin-panel" style={{ marginTop: "1.2rem" }}>
        {leads.length === 0 ? (
          <p style={{ color: "var(--color-muted)", fontSize: "0.92rem" }}>
            {note || "Enter your admin token, then Refresh to load leads."}
          </p>
        ) : (
          <div style={{ display: "grid", gap: "0.8rem" }}>
            {leads.map((l) => (
              <div key={l.id} style={{ borderBottom: "1px solid var(--color-border)", paddingBottom: "0.8rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
                  <strong style={{ color: "var(--color-primary)" }}>{l.name}</strong>
                  {l.createdAt && (
                    <span style={{ fontSize: "0.78rem", color: "var(--color-muted)" }}>
                      {new Date(l.createdAt).toLocaleString()}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: "0.9rem", color: "var(--color-text)", marginTop: "0.25rem" }}>{l.details}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

/* ------------------------------- Pixels ------------------------------ */

const EVENTS = [
  { name: "estimate_requested", when: "Estimate form submitted", custom: true, auto: false },
  { name: "service_viewed", when: "A service card scrolls into view", custom: true, auto: false },
  { name: "deposit_started", when: "Deposit checkout opens", custom: true, auto: false },
  { name: "lead", when: "Estimate form submitted (Whop lead capture)", custom: false, auto: false },
  { name: "page view", when: "Every page — automatic (Whop)", custom: false, auto: true },
  { name: "checkout / purchase", when: "Whop checkout — automatic (Whop)", custom: false, auto: true },
];

function PixelsTab({ token }: { token: string }) {
  const [fired, setFired] = useState(false);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [recent, setRecent] = useState<{ event: string; created_at: string }[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/pixel-stats", { headers: { "x-admin-token": token } });
      const b = (await res.json()) as { counts?: { event: string; count: number }[]; recent?: { event: string; created_at: string }[] };
      const map: Record<string, number> = {};
      (b.counts ?? []).forEach((c) => (map[c.event] = c.count));
      setCounts(map);
      setRecent(b.recent ?? []);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    if (token) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
        <div>
          <h2 style={{ fontSize: "1.25rem" }}>Tracking (Whop Pixel)</h2>
          <p style={{ color: "var(--color-muted)", fontSize: "0.92rem", marginTop: "0.3rem" }}>
            Live counts of custom events fired via <span className="mono">whop.track</span>.
          </p>
        </div>
        <button className="btn btn--secondary" onClick={load} type="button">
          {loading ? "…" : "Refresh"}
        </button>
      </div>

      <div className="admin-panel" style={{ marginTop: "1.2rem" }}>
        <div style={{ display: "grid", gap: "0.7rem" }}>
          {EVENTS.map((e) => (
            <div key={e.name} style={{ display: "flex", alignItems: "center", gap: "0.7rem", borderBottom: "1px solid var(--color-border)", paddingBottom: "0.6rem" }}>
              <span className="mono" style={{ color: e.custom ? "var(--color-accent)" : "var(--color-muted)", minWidth: 170 }}>
                {e.name}
              </span>
              <span style={{ fontSize: "0.86rem", color: "var(--color-muted)" }}>{e.when}</span>
              <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.6rem" }}>
                {e.custom && <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--color-copper)" }}>CUSTOM</span>}
                <span className="mono" style={{ fontWeight: 700, color: "var(--color-primary)", minWidth: 36, textAlign: "right" }}>
                  {e.auto ? "auto" : (counts[e.name] ?? 0)}
                </span>
              </span>
            </div>
          ))}
        </div>

        <button
          className="btn btn--secondary"
          style={{ marginTop: "1.2rem" }}
          type="button"
          onClick={() => {
            track("admin_test_event", { event_id: `test_${Date.now()}`, source: "staff_console" });
            setFired(true);
            setTimeout(load, 1400);
          }}
        >
          Fire a test event
        </button>
        {fired && (
          <div className="notice notice--ok" style={{ marginTop: "1rem" }}>
            Sent <span className="mono">admin_test_event</span>. Counts refresh in a moment; also verify in Dashboard → Pixel or with{" "}
            <span className="mono">?debug=1</span>.
          </div>
        )}

        {recent.length > 0 && (
          <div style={{ marginTop: "1.4rem" }}>
            <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Recent events
            </p>
            <div style={{ display: "grid", gap: "0.35rem", marginTop: "0.5rem" }}>
              {recent.map((r, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.84rem" }}>
                  <span className="mono" style={{ color: "var(--color-accent)" }}>{r.event}</span>
                  <span style={{ color: "var(--color-muted)" }}>{new Date(r.created_at).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
