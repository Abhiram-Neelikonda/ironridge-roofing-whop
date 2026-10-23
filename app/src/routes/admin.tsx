import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { site } from "../config/site";
import { Logo } from "../components/ui/Logo";
import { Icon } from "../components/ui/Icon";
import { money } from "../lib/format";

export const Route = createFileRoute("/admin")({ component: Admin });

interface SavedCard {
  id: string;
  memberId: string;
  name?: string;
  email?: string;
  paymentMethodId: string;
  card?: string;
  jobRef?: string;
}

const DEPOSIT = site.plans.deposit.priceCents / 100;
const INSPECTION = site.plans.inspection.priceCents / 100;

function Admin() {
  const [token, setToken] = useState("");
  const [cards, setCards] = useState<SavedCard[]>([]);
  const [loadingCards, setLoadingCards] = useState(false);
  const [mode, setMode] = useState<"charge" | "send">("charge");

  const [selected, setSelected] = useState<string>("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  // Default kept under the account's $2,500 purchase cap for demos; raise it on
  // a verified account with higher limits.
  const [quote, setQuote] = useState<number>(2200);
  const [applyDeposit, setApplyDeposit] = useState(true);
  const [applyInspection, setApplyInspection] = useState(false);

  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function loadCards() {
    setLoadingCards(true);
    try {
      const res = await fetch("/api/setup-intents", { headers: { "x-admin-token": token } });
      const body = (await res.json()) as { data?: SavedCard[]; error?: string };
      setCards(body.data ?? []);
    } catch {
      setCards([]);
    } finally {
      setLoadingCards(false);
    }
  }

  useEffect(() => {
    loadCards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const credits =
    (applyDeposit ? DEPOSIT : 0) + (applyInspection ? INSPECTION : 0);
  const total = Math.max(0, quote - credits);
  const card = cards.find((c) => c.id === selected);

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
        msg: `Invoice ${body.id ?? ""} created${body.status ? ` (${body.status})` : ""}. ${
          mode === "charge" ? "The saved card will be charged." : "The invoice email has been sent."
        }`,
      });
    } catch (e) {
      setResult({ ok: false, msg: (e as Error).message });
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit =
    total > 0 && (mode === "charge" ? !!card : !!email && !!name) && !submitting;

  return (
    <div className="subpage">
      <header className="header" data-scrolled="true">
        <div className="container header__inner">
          <Logo />
          <span className="header__spacer" />
          <span className="chip">
            <Icon name="lock" /> Staff · Final Invoicing
          </span>
        </div>
      </header>

      <main className="subpage__main">
        <div className="container admin">
          <h1 style={{ fontSize: "1.8rem" }}>Bill a final balance</h1>
          <p style={{ color: "var(--color-muted)", marginTop: "0.4rem", marginBottom: "1.5rem" }}>
            Charge a saved card on file, or send an invoice for manual payment — both via the Whop Invoices API.
          </p>

          <div className="field" style={{ maxWidth: 360, marginBottom: "1.5rem" }}>
            <label htmlFor="token">Admin token</label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input id="token" type="password" value={token} onChange={(e) => setToken(e.target.value)} placeholder="ADMIN_TOKEN" />
              <button className="btn btn--secondary" onClick={loadCards} type="button">
                {loadingCards ? "…" : "Load"}
              </button>
            </div>
          </div>

          <div className="admin__grid">
            {/* left: customer + mode */}
            <div className="admin-panel">
              <div className="seg" role="tablist" style={{ marginBottom: "1.2rem" }}>
                <button data-active={mode === "charge"} onClick={() => setMode("charge")} type="button">
                  Charge saved card
                </button>
                <button data-active={mode === "send"} onClick={() => setMode("send")} type="button">
                  Send invoice
                </button>
              </div>

              {mode === "charge" ? (
                <div className="field">
                  <label htmlFor="card">Customer (card on file)</label>
                  <select id="card" value={selected} onChange={(e) => setSelected(e.target.value)}>
                    <option value="">
                      {cards.length ? "Select a saved card…" : "No saved cards found"}
                    </option>
                    {cards.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name ?? c.email ?? c.memberId} — {c.card ?? "card on file"}
                      </option>
                    ))}
                  </select>
                  <p style={{ fontSize: "0.8rem", color: "var(--color-muted)", marginTop: "0.5rem" }}>
                    Saved cards come from deposit setup intents. {cards.length === 0 && "Enter your admin token and Load, or complete a deposit + save-card first."}
                  </p>
                </div>
              ) : (
                <>
                  <div className="field">
                    <label htmlFor="cname">Customer name</label>
                    <input id="cname" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Smith" />
                  </div>
                  <div className="field" style={{ marginTop: "0.8rem" }}>
                    <label htmlFor="cemail">Customer email</label>
                    <input id="cemail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" />
                  </div>
                </>
              )}
            </div>

            {/* right: amounts */}
            <div className="admin-panel">
              <div className="field">
                <label htmlFor="quote">Quoted project total (USD)</label>
                <input id="quote" type="number" min={0} value={quote} onChange={(e) => setQuote(Number(e.target.value))} />
                <span style={{ fontSize: "0.76rem", color: "var(--color-muted)", marginTop: "0.3rem" }}>
                  New accounts cap invoices at $2,500; verified accounts support more.
                </span>
              </div>
              <label className="chip" style={{ marginTop: "1rem", cursor: "pointer" }}>
                <input type="checkbox" checked={applyDeposit} onChange={(e) => setApplyDeposit(e.target.checked)} />
                Credit project deposit ({money(DEPOSIT * 100)})
              </label>
              <label className="chip" style={{ marginTop: "0.6rem", cursor: "pointer" }}>
                <input type="checkbox" checked={applyInspection} onChange={(e) => setApplyInspection(e.target.checked)} />
                Credit inspection fee ({money(INSPECTION * 100)})
              </label>

              <div style={{ marginTop: "1.2rem", borderTop: "1px solid var(--color-border)", paddingTop: "0.6rem" }}>
                <div className="admin-row">
                  <span>Project total</span>
                  <span>{money(quote * 100)}</span>
                </div>
                {applyDeposit && (
                  <div className="admin-row">
                    <span>Less deposit</span>
                    <span>−{money(DEPOSIT * 100)}</span>
                  </div>
                )}
                {applyInspection && (
                  <div className="admin-row">
                    <span>Less inspection</span>
                    <span>−{money(INSPECTION * 100)}</span>
                  </div>
                )}
                <div className="admin-total">
                  <span>Balance due</span>
                  <span>{money(total * 100)}</span>
                </div>
              </div>

              <button className="btn btn--primary btn--block btn--lg" style={{ marginTop: "1.2rem" }} disabled={!canSubmit} onClick={submit} type="button">
                {submitting ? "Creating…" : mode === "charge" ? "Charge card on file" : "Send invoice"}
              </button>
            </div>
          </div>

          {result && (
            <div className={`notice ${result.ok ? "notice--ok" : "notice--err"}`} style={{ marginTop: "1.5rem" }}>
              {result.msg}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
