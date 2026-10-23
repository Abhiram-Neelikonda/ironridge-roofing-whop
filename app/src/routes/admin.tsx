import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { site } from "../config/site";
import { Logo } from "../components/ui/Logo";
import { Icon } from "../components/ui/Icon";
import { money } from "../lib/format";
import { track } from "../lib/track";

export const Route = createFileRoute("/admin")({ component: Admin });

type Tab = "invoices" | "leads" | "pixels";

function Admin() {
  const [token, setToken] = useState("");
  const [tab, setTab] = useState<Tab>("invoices");

  return (
    <div className="subpage">
      <header className="header" data-scrolled="true">
        <div className="container header__inner">
          <Logo />
          <span className="header__spacer" />
          <span className="chip">
            <Icon name="lock" /> Staff console
          </span>
        </div>
      </header>

      <main className="subpage__main">
        <div className="container admin">
          <h1 style={{ fontSize: "1.8rem" }}>{site.brand.shortName} staff tools</h1>
          <p style={{ color: "var(--color-muted)", marginTop: "0.4rem", marginBottom: "1.2rem" }}>
            Bill final balances, review incoming leads, and check tracking — all powered by the Whop API.
          </p>

          <div className="field" style={{ maxWidth: 360, marginBottom: "1.3rem" }}>
            <label htmlFor="token">Admin token</label>
            <input id="token" type="password" value={token} onChange={(e) => setToken(e.target.value)} placeholder="ADMIN_TOKEN" />
          </div>

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

          {tab === "invoices" && <InvoicesTab token={token} />}
          {tab === "leads" && <LeadsTab token={token} />}
          {tab === "pixels" && <PixelsTab />}
        </div>
      </main>
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
  { name: "estimate_requested", when: "Estimate form submitted", custom: true },
  { name: "service_viewed", when: "A service card scrolls into view", custom: true },
  { name: "deposit_started", when: "Deposit checkout opens", custom: true },
  { name: "lead", when: "Estimate form submitted (Whop lead capture)", custom: false },
  { name: "page view", when: "Every page — automatic", custom: false },
  { name: "checkout / purchase", when: "Whop checkout — automatic", custom: false },
];

function PixelsTab() {
  const [fired, setFired] = useState(false);
  return (
    <>
      <h2 style={{ fontSize: "1.25rem" }}>Tracking (Whop Pixel)</h2>
      <p style={{ color: "var(--color-muted)", fontSize: "0.92rem", margin: "0.3rem 0 1.2rem" }}>
        Custom events fire through <span className="mono">whop.track</span>. Verify in Dashboard → Pixel, or add{" "}
        <span className="mono">?debug=1</span> to any page and watch the console.
      </p>
      <div className="admin-panel">
        <div style={{ display: "grid", gap: "0.7rem" }}>
          {EVENTS.map((e) => (
            <div key={e.name} style={{ display: "flex", alignItems: "center", gap: "0.7rem", borderBottom: "1px solid var(--color-border)", paddingBottom: "0.6rem" }}>
              <span className="mono" style={{ color: e.custom ? "var(--color-accent)" : "var(--color-muted)", minWidth: 180 }}>
                {e.name}
              </span>
              <span style={{ fontSize: "0.88rem", color: "var(--color-muted)" }}>{e.when}</span>
              {e.custom && (
                <span style={{ marginLeft: "auto", fontSize: "0.7rem", fontWeight: 700, color: "var(--color-copper)" }}>CUSTOM</span>
              )}
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
          }}
        >
          Fire a test event
        </button>
        {fired && (
          <div className="notice notice--ok" style={{ marginTop: "1rem" }}>
            Sent <span className="mono">admin_test_event</span> to the Whop Pixel. Open this page with{" "}
            <span className="mono">?debug=1</span> to see it logged, or check the Pixel dashboard.
          </div>
        )}
      </div>
    </>
  );
}
