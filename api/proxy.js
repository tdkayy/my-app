// /api/proxy.js
// Node.js serverless proxy for Expensify API on Vercel
// Env vars required in Vercel -> Settings -> Environment Variables:
//   EXPENSIFY_PARTNER_NAME
//   EXPENSIFY_PARTNER_PASSWORD
// Optional:
//   ALLOW_ORIGIN  (defaults to "*")

const EXPENSIFY_API_URL = "https://www.expensify.com/api";

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function sendJSON(res, status, obj, origin) {
  res.statusCode = status;
  const headers = {
    "Content-Type": "application/json",
    ...corsHeaders(origin),
  };
  Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));
  res.end(JSON.stringify(obj));
}

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

module.exports = async (req, res) => {
  const allowOrigin = process.env.ALLOW_ORIGIN || "*";

  // CORS preflight
  if (req.method === "OPTIONS") {
    Object.entries(corsHeaders(allowOrigin)).forEach(([k, v]) => res.setHeader(k, v));
    res.statusCode = 204;
    return res.end();
  }

  if (req.method !== "POST") {
    return sendJSON(res, 405, { error: "Use POST" }, allowOrigin);
  }

  // Read raw body (Vercel doesn't auto-parse)
  let raw = "";
  try {
    for await (const chunk of req) raw += chunk;
  } catch {
    return sendJSON(res, 400, { error: "Failed reading request body" }, allowOrigin);
  }

  let body;
  try {
    body = JSON.parse(raw || "{}");
  } catch {
    return sendJSON(res, 400, { error: "Invalid JSON" }, allowOrigin);
  }

  const command = String(body?.command || "").trim();
  if (!command) {
    return sendJSON(res, 400, { error: "Missing command" }, allowOrigin);
  }

  // Build upstream payload
  const upstream = { ...body };

  // Add partner credentials for Authenticate
  if (command === "Authenticate") {
    upstream.partnerName = process.env.EXPENSIFY_PARTNER_NAME;
    upstream.partnerPassword = process.env.EXPENSIFY_PARTNER_PASSWORD;
  }

  // Normalize create payloads
  if (command === "CreateTransaction") {
    if (!upstream.transaction) {
      const created = normalizeToISODate(upstream.created);
      upstream.transaction = {
        created,
        merchant: upstream.merchant || "",
        amount: Number(upstream.amount || 0),
        currency: upstream.currency || "GBP",
      };
      delete upstream.created;
      delete upstream.amount;
      delete upstream.merchant;
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
    // Pass through Expensify response (but keep CORS)
    return sendJSON(res, upstreamRes.ok ? upstreamRes.status : 502, json, allowOrigin);
  } catch {
    // Expensify should return JSON; if it doesn't, surface it
    return sendJSON(
      res,
      502,
      { error: "Invalid JSON from Expensify", upstreamStatus: upstreamRes.status, snippet: text?.slice(0, 200) || "" },
      allowOrigin
    );
  }
};
