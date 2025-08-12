// src/lib/apiClient.js

// Decide backend automatically:
// - PROD + no VITE_API_URL  -> use Vercel serverless at /api
// - otherwise               -> use PHP proxy (default /api.php or VITE_API_URL)
const API_URL = (import.meta.env.PROD && !import.meta.env.VITE_API_URL)
  ? "/api"
  : (import.meta.env.VITE_API_URL || "/api.php");

function isPHPProxy() {
  // crude but reliable enough
  return API_URL.endsWith(".php");
}

export async function postToAPI(body) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API HTTP ${res.status}: ${text || res.statusText}`);
  }

  const json = await res.json().catch(() => null);
  if (!json) throw new Error("Invalid JSON from API");

  // normalize error handling
  if (json.error) throw new Error(json.error);
  if (typeof json.jsonCode !== "undefined" && json.jsonCode !== 200 && !json.authToken) {
    throw new Error(json.message || json.title || "Expensify error");
  }
  return json;
}

// ---- named exports expected by transaction.api.js ----
export function authenticate({ email, password }) {
  return postToAPI({
    command: "Authenticate",
    partnerUserID: email,
    partnerUserSecret: password,
  });
}

export function getTransactions(authToken) {
  return postToAPI({ command: "Get", authToken });
}

/**
 * createTransaction(authToken, payload)
 * Accepts either:
 *  - { date: 'YYYY-MM-DD', amountCents, merchant, currency }
 *  - { created: epochSeconds, amount: decimal, merchant, currency }
 * and maps to the correct backend shape automatically.
 */
export function createTransaction(authToken, payload) {
  const currency = payload.currency || "GBP";

  if (isPHPProxy()) {
    // PHP proxy expects: { command, authToken, transaction: { created: ISO, amount: decimal, ... } }
    const dateISO = payload.date
      ?? (payload.created
            ? new Date(payload.created * 1000).toISOString().slice(0, 10)
            : new Date().toISOString().slice(0, 10));

    const amountDecimal =
      typeof payload.amount === "number"
        ? payload.amount
        : (Number(payload.amountCents || 0) / 100);

    return postToAPI({
      command: "CreateTransaction",
      authToken,
      transaction: {
        created: dateISO,
        merchant: payload.merchant,
        amount: amountDecimal,
        currency,
      },
    });
  }

  // Vercel serverless expects flat fields: { command, authToken, created: epochSeconds, amount: decimal, ... }
  const created = (typeof payload.created === "number")
    ? payload.created
    : (() => {
        const iso = String(payload.date || "");
        const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (m) {
          const [_, y, mo, d] = m.map(Number);
          return Math.floor(Date.UTC(y, mo - 1, d) / 1000);
        }
        return Math.floor(Date.now() / 1000);
      })();

  const amount = (typeof payload.amount === "number")
    ? payload.amount
    : (Number(payload.amountCents || 0) / 100);

  return postToAPI({
    command: "CreateTransaction",
    authToken,
    created,
    merchant: payload.merchant,
    amount,
    currency,
  });
}
