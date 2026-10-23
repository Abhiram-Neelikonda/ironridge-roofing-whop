import { useState } from "react";
import { site } from "../../config/site";
import { Icon } from "../ui/Icon";
import { Picture } from "../ui/Picture";
import { track } from "../../lib/track";

type Status = "idle" | "submitting" | "success" | "error";

export function EstimateForm() {
  const f = site.estimateForm;
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;

    // basic validation
    const next: Record<string, string> = {};
    if (!data.name?.trim()) next.name = "Please enter your name.";
    if (!data.email?.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email)) next.email = "Enter a valid email.";
    if (!data.phone?.trim()) next.phone = "Please enter a phone number.";
    if (!data.service) next.service = "Choose a service.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setStatus("submitting");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = (await res.json().catch(() => ({}))) as { id?: string; error?: string };
      if (!res.ok) throw new Error(body.error || "Something went wrong. Please call us.");
      track(site.tracking.estimateRequested, {
        event_id: body.id, // lead id → dedupes retries
        service: data.service,
      });
      setStatus("success");
      form.reset();
    } catch (err) {
      setMessage((err as Error).message);
      setStatus("error");
    }
  }

  return (
    <section className="section estimate" id="estimate">
      <div className="estimate__bg" aria-hidden="true">
        <Picture name="estimate-texture" alt="" sizes="100vw" />
      </div>
      <div className="container">
        <div className="estimate__grid">
          <div>
            <p className="eyebrow" style={{ color: "var(--color-copper)" }}>
              No obligation. Just expert advice.
            </p>
            <h2 className="section-title">{f.heading}</h2>
            <p className="estimate__lede">{f.subtitle}</p>
            <ul className="estimate__assurances">
              {f.assurances.map((a) => (
                <li className="chip" key={a.label}>
                  <Icon name={a.icon} />
                  {a.label}
                </li>
              ))}
            </ul>
          </div>

          <div className="form-card">
            {status === "success" ? (
              <div className="form-success">
                <span className="form-success__icon">
                  <Icon name="check" size={28} />
                </span>
                <h3 style={{ marginBottom: "0.5rem" }}>Request received</h3>
                <p style={{ color: "var(--color-muted)" }}>
                  Thanks! A roofing specialist will reach out within 1 business day. For anything urgent,
                  call{" "}
                  <a href={site.contact.phoneHref} style={{ color: "var(--color-accent)", fontWeight: 600 }}>
                    {site.contact.phone}
                  </a>
                  .
                </p>
                <button className="btn btn--secondary" style={{ marginTop: "1.3rem" }} onClick={() => setStatus("idle")}>
                  Submit another request
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate>
                {/* honeypot */}
                <div className="hp-field" aria-hidden="true">
                  <label>
                    Company <input name="company_website" tabIndex={-1} autoComplete="off" />
                  </label>
                </div>
                <div className="form-grid">
                  <Field label="Full Name" name="name" placeholder="John Smith" required error={errors.name} />
                  <Field label="Phone Number" name="phone" type="tel" placeholder="(615) 555-0187" required error={errors.phone} />
                  <Field label="Email Address" name="email" type="email" placeholder="you@example.com" required error={errors.email} className="full" />
                  <SelectField label="Service Needed" name="service" options={f.serviceOptions} required error={errors.service} />
                  <SelectField label="Roof Type" name="roof_type" options={f.roofTypeOptions} />
                  <SelectField label="Timeline" name="timeline" options={f.timelineOptions} className="full" />
                  <div className="field full">
                    <label htmlFor="notes">Project Details</label>
                    <textarea id="notes" name="notes" placeholder="Tell us about your roof, any issues, and your goals…" />
                  </div>
                </div>
                {status === "error" && (
                  <div className="notice notice--err" style={{ marginTop: "1rem" }}>
                    {message}
                  </div>
                )}
                <div className="form-foot">
                  <button className="btn btn--primary btn--block btn--lg" disabled={status === "submitting"}>
                    {status === "submitting" ? "Sending…" : "Request My Estimate"} <Icon name="arrow-right" />
                  </button>
                  <p className="form-note">
                    <Icon name="lock" size={13} style={{ verticalAlign: "-2px" }} /> Powered by Whop · Your information is secure
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required,
  error,
  className = "",
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  className?: string;
}) {
  return (
    <div className={`field ${error ? "field--error" : ""} ${className}`.trim()}>
      <label htmlFor={name}>
        {label} {required && <span className="req">*</span>}
      </label>
      <input id={name} name={name} type={type} placeholder={placeholder} required={required} />
      {error && <span className="field__error">{error}</span>}
    </div>
  );
}

function SelectField({
  label,
  name,
  options,
  required,
  error,
  className = "",
}: {
  label: string;
  name: string;
  options: string[];
  required?: boolean;
  error?: string;
  className?: string;
}) {
  return (
    <div className={`field ${error ? "field--error" : ""} ${className}`.trim()}>
      <label htmlFor={name}>
        {label} {required && <span className="req">*</span>}
      </label>
      <select id={name} name={name} defaultValue="" required={required}>
        <option value="" disabled>
          Select…
        </option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      {error && <span className="field__error">{error}</span>}
    </div>
  );
}
