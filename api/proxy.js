// api/proxy.js
// Node serverless proxy for Expensify on Vercel

const EXPENSIFY_API_URL =
  process.env.EXPENSIFY_API_URL || "https://www.expensify.com/api";

function normalizeToISODate(v) {
  if (typeof v === "number" && Number.isFinite(v)) {
    return new Date(v * 1000).toISOString().slice(0, 10);
  }
  const s = String(v || "").trim();
  if (!s) return new Date().toISOString().slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const t = Date.parse(s);
  if (Number.isFinite(t)) return new Date(t).toISOString().slice(0, 10);
  return new Date().toISOString().slice(0, 10);
}

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
  return {};
}

export default async function handler(req, res) {
  const allowOrigin = process.env.ALLOW_ORIGIN || "*";

  // CORS preflight
  if (req.method === "OPTIONS") {
    const headers = corsHeaders(allowOrigin);
    for (const [k, v] of Object.entries(headers)) res.setHeader(k, v);
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

  // Build upstream payload
  const upstream = { ...body };

  // Add partner creds for Authenticate
  if (command === "Authenticate") {
    upstream.partnerName = process.env.PARTNER_NAME || "applicant";
    upstream.partnerPassword = process.env.PARTNER_PASSWORD || "";
  }

  // Normalize CreateTransaction shape
  if (command === "CreateTransaction") {
    if (!upstream.transaction) {
      upstream.transaction = {
        created: normalizeToISODate(upstream.created),
        merchant: upstream.merchant || "",
        amount: Number(upstream.amount || 0),
        currency: upstream.currency || "GBP",
      };
      delete upstream.created;
      delete upstream.merchant;
      delete upstream.amount;
      delete upstream.currency;
    } else {
      upstream.transaction = {
        ...upstream.transaction,
        created: normalizeToISODate(upstream.transaction.created),
      };
    }
  }

  // Forward to Expensify
  let upstreamRes;
  try {
    upstreamRes = await fetch(EXPENSIFY_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(upstream),
    });
  } catch (e) {
    return sendJSON(res, 502, { error: "Upstream fetch failed", detail: String(e) }, allowOrigin);
  }

  const text = await upstreamRes.text();
  try {
    const json = JSON.parse(text);
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

// Use Node serverless runtime (remove this block entirely if you prefer defaults)
export const config = {
  runtime: "nodejs",
};