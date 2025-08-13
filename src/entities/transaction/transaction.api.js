// src/entities/transaction/transaction.api.js
import { postToAPI } from "lib/apiClient";
import { createTransactionModel } from "./transaction.model";

// --- UTC epoch helper (handles "YYYY-MM-DD" reliably) ---
function toEpochSeconds(dateLike) {
  if (!dateLike) return Math.floor(Date.now() / 1000);
  if (typeof dateLike === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateLike)) {
    const [y, m, d] = dateLike.split("-").map(Number);
    return Math.floor(Date.UTC(y, m - 1, d) / 1000);
  }
  const t = new Date(dateLike).getTime();
  return Number.isFinite(t) ? Math.floor(t / 1000) : Math.floor(Date.now() / 1000);
}

function normalizeUpstream(tx) {
  const id       = tx.transactionID || tx.id || String(Date.now() + Math.random());
  const created  = tx.created;
  const isoDate  = typeof created === "number"
    ? new Date(created * 1000).toISOString().slice(0, 10)
    : (tx.transactionDate || tx.posted || tx.date || "");
  const merchant = tx.merchant || tx.merchantName || tx.payee || "";
  const currency = (tx.currency || tx.currencyCode || "GBP").toUpperCase();
  const category = tx.category || tx.tag || "Uncategorized";
  const comment  = tx.comment || tx.note || "";
  const amount   = Number(tx.amount ?? tx.convertedAmount ?? 0);
  const amountCents = Number.isFinite(amount) ? Math.round(amount * 100) : 0;

  return createTransactionModel({
    id,
    date: isoDate,
    merchant,
    amountCents,
    currency,
    category,
    comment,
  });
}

export async function authAndGetToken({ email, password }) {
  const res = await postToAPI({
    command: "Authenticate",
    partnerUserID: email,
    partnerUserSecret: password,
  });
  console.log("[authAndGetToken ←]", res);
  if (!res || !res.authToken) throw new Error("Authentication failed");
  return res.authToken;
}

export async function fetchAllTransactions(authToken) {
  const res  = await postToAPI({
    command: "Get",
    authToken,
    returnValueList: "transactionList",
  });
  console.log("[fetchAllTransactions ←]", res);
  const list = res.transactionList || res.transactions || res || [];
  return (Array.isArray(list) ? list : []).map(normalizeUpstream);
}

export async function createNewTransaction(
  authToken,
  { date, merchant, amountCents, currency = "GBP" }
) {
  const created = toEpochSeconds(date);
  const amount  = (Number(amountCents) || 0) / 100; // decimal for Expensify

  const payload = {
    command: "CreateTransaction",
    authToken,
    created,                        // epoch seconds (UTC midnight for the given day)
    merchant,
    amount,                         // decimal
    currency: (currency || "GBP").toUpperCase(),
  };
  console.log("[CreateTx → payload]", payload);

  const res = await postToAPI(payload);
  console.log("[CreateTx ← response]", res);

  // Some responses are { jsonCode:200 } or { data:{} }
  const candidate =
    (res && res.transaction) ||
    (res && res.data && Object.keys(res.data).length ? res.data : null);

  const base = {
    transactionID: String(Date.now() + Math.random()),
    created,
    merchant,
    amount,
    currency: (currency || "GBP").toUpperCase(),
    category: "Uncategorized",
    comment: "(pending)",
  };
  const createdTx = { ...base, ...(candidate || {}) };

  return normalizeUpstream(createdTx);
}