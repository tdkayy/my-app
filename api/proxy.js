// /api/proxy.js
// ESM Node function on Vercel (no runtime export needed)
const EXPENSIFY_API_URL =
  process.env.EXPENSIFY_API_URL || "https://www.expensify.com/api";

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}
function sendJSON(res, status, obj, origin) {
  res.statusCode = status;
  const headers = { "Content-Type": "application/json", ...corsHeaders(origin) };
  for (const [k, v] of Object.entries(headers)) res.setHeader(k, v);
  res.end(JSON.stringify(obj));
}
async function readJsonBody(req) {
  try {
    if (req.body && typeof req.body === "object") return req.body;
    if (typeof req.body === "string" && req.body.trim()) return JSON.parse(req.body);
    if (typeof req.json === "function") return await req.json();
  } catch {}
  // stream fallback
  let raw = "";
  for await (const chunk of req) raw += chunk;
  try { return JSON.parse(raw || "{}"); } catch { return {}; }
}
function toISODate(v) {
  if (!v) return new Date().toISOString().slice(0, 10);
  if (typeof v === "number" && Number.isFinite(v)) {
    return new Date(v * 1000).toISOString().slice(0, 10);
  }
  const s = String(v).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const t = Date.parse(s);
  return Number.isFinite(t) ? new Date(t).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);
}
function toFormEncoded(obj) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    p.append(k, typeof v === "object" ? JSON.stringify(v) : String(v));
  }
  return p.toString();
}

export default async function handler(req, res) {
  const allowOrigin = process.env.ALLOW_ORIGIN || "*";

  // CORS preflight
  if (req.method === "OPTIONS") {
    for (const [k, v] of Object.entries(corsHeaders(allowOrigin))) res.setHeader(k, v);
    res.statusCode = 204;
    return res.end();
  }
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJSON(res, 405, { error: "Method not allowed" }, allowOrigin);
  }

  const body = await readJsonBody(req);
  const command = String(body?.command || "").trim();
  if (!command) return sendJSON(res, 400, { error: "Missing command" }, allowOrigin);

  // Build the payload Expensify expects (flat fields, form-encoded)
  const upstream = { command, ...body };

  if (command === "Authenticate") {
    upstream.partnerName = process.env.PARTNER_NAME || "applicant";
    upstream.partnerPassword = process.env.PARTNER_PASSWORD || "";
    // keep partnerUserID / partnerUserSecret from body as-is
  }

  if (command === "CreateTransaction") {
    // flatten: created/merchant/amount/currency at top-level
    upstream.created  = toISODate(body.created);
    upstream.merchant = String(body.merchant || "");
    upstream.currency = (body.currency || "GBP").toUpperCase();
    // amount must be decimal (not cents)
    upstream.amount   = Number.isFinite(body.amount) ? Number(body.amount) : (Number(body.amountCents || 0) / 100);
    // remove any nested object callers might have sent
    delete upstream.transaction;
    delete upstream.amountCents;
  }

  // Forward as application/x-www-form-urlencoded
  let upstreamRes;
  try {
    upstreamRes = await fetch(EXPENSIFY_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: toFormEncoded(upstream),
    });
  } catch (e) {
    return sendJSON(res, 502, { error: "Upstream fetch failed", detail: String(e) }, allowOrigin);
  }

  const text = await upstreamRes.text();
  // Expensify returns JSON for success/fail; if HTML/plain appears, surface snippet
  try {
    const json = JSON.parse(text);
    // If they use jsonCode pattern, pass it straight through
    return sendJSON(res, upstreamRes.ok ? upstreamRes.status : 502, json, allowOrigin);
  } catch {
    return sendJSON(
      res,
      502,
      { error: "Invalid JSON from Expensify", upstreamStatus: upstreamRes.status, snippet: text.slice(0, 400) },
      allowOrigin
    );
  }
}
