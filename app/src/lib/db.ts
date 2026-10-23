/**
 * Lead storage in Neon Postgres via the serverless HTTP driver (works on
 * Cloudflare Workers). No-ops when DATABASE_URL isn't set, so the form never
 * breaks without a database.
 *
 *   whop apps secrets set --secret DATABASE_URL="postgresql://…?sslmode=require"
 */
import { neon } from "@neondatabase/serverless";

const URL = process.env.DATABASE_URL;

export interface LeadRecord {
  id: string;
  name: string;
  email: string;
  phone?: string;
  service?: string;
  roof_type?: string;
  timeline?: string;
  notes?: string;
}

export function dbConfigured(): boolean {
  return !!URL;
}

function client() {
  return neon(URL!);
}

async function ensureTable() {
  const sql = client();
  await sql`CREATE TABLE IF NOT EXISTS leads (
    id text PRIMARY KEY,
    name text,
    email text,
    phone text,
    service text,
    roof_type text,
    timeline text,
    notes text,
    created_at timestamptz DEFAULT now()
  )`;
}

export async function insertLead(lead: LeadRecord): Promise<boolean> {
  if (!URL) return false;
  try {
    await ensureTable();
    const sql = client();
    await sql`INSERT INTO leads (id, name, email, phone, service, roof_type, timeline, notes)
      VALUES (${lead.id}, ${lead.name}, ${lead.email}, ${lead.phone ?? ""}, ${lead.service ?? ""}, ${lead.roof_type ?? ""}, ${lead.timeline ?? ""}, ${lead.notes ?? ""})
      ON CONFLICT (id) DO NOTHING`;
    return true;
  } catch (err) {
    console.error("[db] insertLead failed", (err as Error).message);
    return false;
  }
}

export interface LeadRow extends LeadRecord {
  created_at: string;
}

export async function listLeads(limit = 50): Promise<LeadRow[]> {
  if (!URL) return [];
  try {
    await ensureTable();
    const sql = client();
    const rows = await sql`SELECT id, name, email, phone, service, roof_type, timeline, notes, created_at
      FROM leads ORDER BY created_at DESC LIMIT ${limit}`;
    return rows as LeadRow[];
  } catch (err) {
    console.error("[db] listLeads failed", (err as Error).message);
    return [];
  }
}

/* ---------------------------- pixel events ---------------------------- */

async function ensurePixelTable() {
  const sql = client();
  await sql`CREATE TABLE IF NOT EXISTS pixel_events (
    id text PRIMARY KEY,
    event text,
    props jsonb,
    created_at timestamptz DEFAULT now()
  )`;
}

export async function insertEvent(event: string, props: unknown): Promise<boolean> {
  if (!URL || !event) return false;
  try {
    await ensurePixelTable();
    const sql = client();
    const id = globalThis.crypto?.randomUUID?.() ?? `evt_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    await sql`INSERT INTO pixel_events (id, event, props) VALUES (${id}, ${event}, ${JSON.stringify(props ?? {})})`;
    return true;
  } catch (err) {
    console.error("[db] insertEvent failed", (err as Error).message);
    return false;
  }
}

export interface PixelStats {
  counts: { event: string; count: number }[];
  recent: { event: string; created_at: string }[];
}

export async function pixelStats(): Promise<PixelStats> {
  if (!URL) return { counts: [], recent: [] };
  try {
    await ensurePixelTable();
    const sql = client();
    const counts = (await sql`SELECT event, count(*)::int AS count FROM pixel_events GROUP BY event ORDER BY count DESC`) as {
      event: string;
      count: number;
    }[];
    const recent = (await sql`SELECT event, created_at FROM pixel_events ORDER BY created_at DESC LIMIT 12`) as {
      event: string;
      created_at: string;
    }[];
    return { counts, recent };
  } catch (err) {
    console.error("[db] pixelStats failed", (err as Error).message);
    return { counts: [], recent: [] };
  }
}
