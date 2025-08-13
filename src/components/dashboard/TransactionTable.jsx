import React, { useMemo, useState, useEffect, useRef } from "react";
import { formatMoneyCents } from "entities/transaction/transaction.model";

export default function TransactionTable({ rows = [], onBulkAdd }) {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("All");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");

  const fileRef = useRef(null);
  const [importPreview, setImportPreview] = useState([]);
  const [importCount, setImportCount] = useState(0);
  const [importErr, setImportErr] = useState("");
  const [importBusy, setImportBusy] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim().toLowerCase()), 200);
    return () => clearTimeout(t);
  }, [q]);

  const categories = useMemo(() => {
    const set = new Set(rows.map(r => (r.category || "Uncategorized").trim() || "Uncategorized"));
    return ["All", ...Array.from(set)];
  }, [rows]);

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => {
      const da = Date.parse(a?.date || 0) || 0;
      const db = Date.parse(b?.date || 0) || 0;
      return db - da;
    });
  }, [rows]);

  const filtered = useMemo(() => {
    const fromTs = from ? Date.parse(from) : null;
    const toTs = to ? Date.parse(to) : null;

    return sorted.filter(tx => {
      if (fromTs && (!tx.date || Date.parse(tx.date) < fromTs)) return false;
      if (toTs && (!tx.date || Date.parse(tx.date) > toTs)) return false;

      const cat = (tx.category || "Uncategorized").trim() || "Uncategorized";
      if (category !== "All" && cat !== category) return false;

      if (debouncedQ) {
        const merchant = String(tx.merchant || "").toLowerCase();
        const comment = String(tx.comment || "").toLowerCase();
        const catLower = cat.toLowerCase();
        if (!merchant.includes(debouncedQ) && !comment.includes(debouncedQ) && !catLower.includes(debouncedQ)) {
          return false;
        }
      }
      return true;
    });
  }, [sorted, debouncedQ, category, from, to]);

  // ---------- CSV helpers ----------
  function escapeCSVField(v) {
    const s = v == null ? "" : String(v);
    return `"${s.replace(/"/g, '""')}"`;
  }
  function toCSV(rowsForCSV) {
    const headers = ["Date", "Merchant", "Category", "Amount", "Currency", "Comment"];
    const lines = [];
    lines.push(headers.map(escapeCSVField).join(","));
    for (const tx of rowsForCSV) {
      const line = [
        tx.date || "",
        tx.merchant || "",
        tx.category || "Uncategorized",
        (tx.amountCents ?? 0) / 100,
        tx.currency || "GBP",
        tx.comment || ""
      ].map(escapeCSVField).join(",");
      lines.push(line);
    }
    return lines.join("\r\n");
  }
  function downloadCSV() {
    const csv = toCSV(filtered);
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = new Date().toISOString().slice(0,10);
    a.href = url;
    a.download = `transactions_${stamp}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  // ---------- Import ----------
  function handleChooseFile() {
    setImportErr(""); setImportPreview([]); setImportCount(0);
    fileRef.current?.click();
  }
  async function handleFileChange(e) {
    setImportErr(""); setImportPreview([]); setImportCount(0);
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const rows = parseCSV(text);
      const normalized = [];
      for (const r of rows) {
        const date = normalizeDate(r.Date || r.date || r["Transaction Date"] || "");
        const merchant = (r.Merchant || r.merchant || r.Payee || "").trim();
        const category = (r.Category || r.category || "Uncategorized").trim() || "Uncategorized";
        const currency = (r.Currency || r.currency || "GBP").toUpperCase();
        const comment = (r.Comment || r.comment || r.Note || "").trim();
        const amountDec = parseFloat(String(r.Amount ?? r.amount ?? "0").replace(/[, ]/g, ""));
        const amountCents = Number.isFinite(amountDec) ? Math.round(amountDec * 100) : 0;

        if (!date || !merchant || !Number.isFinite(amountCents)) continue;
        normalized.push({ date, merchant, amountCents, currency, category, comment });
      }
      setImportPreview(normalized.slice(0, 10));
      setImportCount(normalized.length);
      e.target._fullParsed = normalized;
    } catch (err) {
      setImportErr(err?.message || "Failed to parse CSV");
    }
  }
  async function handleImportAdd() {
    if (!onBulkAdd) return;
    const input = fileRef.current;
    const normalized = input?._fullParsed || [];
    if (!normalized.length) {
      setImportErr("Nothing to import."); return;
    }
    setImportBusy(true); setImportErr("");
    try {
      await onBulkAdd(normalized);
      setImportPreview([]); setImportCount(0);
      if (fileRef.current) {
        fileRef.current.value = "";
        fileRef.current._fullParsed = undefined;
      }
    } catch (e) {
      setImportErr(e?.message || "Bulk add failed");
    } finally {
      setImportBusy(false);
    }
  }

  return (
    <section className="grid gap-4">
      {/* Controls */}
      <div className="grid gap-3 md:grid-cols-[minmax(220px,1fr)_160px_150px_150px_auto_auto_auto]">
        <input
          type="search"
          placeholder="Search…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-blue-500"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-blue-500"
        >
          {categories.map((c) => (<option key={c} value={c}>{c}</option>))}
        </select>

        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-blue-500"
        />
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-blue-500"
        />

        <span className="justify-self-start md:justify-self-end self-center text-sm text-slate-500 whitespace-nowrap">
          {filtered.length} / {rows.length} rows
        </span>

        <button
          onClick={downloadCSV}
          className="inline-flex items-center gap-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg px-3 py-2 hover:from-blue-700 hover:to-blue-800 whitespace-nowrap"
          >
          Download Transactions
        </button>

        <span className="justify-self-start md:justify-self-end inline-flex flex-wrap items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={handleChooseFile}
            className="inline-flex items-center gap-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg px-3 py-2 hover:from-blue-700 hover:to-blue-800 whitespace-nowrap"
            >
            Import Transactions
          </button>
          {onBulkAdd ? (
            <button
              onClick={handleImportAdd}
              disabled={!importCount || importBusy}
              className="h-10 rounded-lg border border-slate-900 bg-white px-3 text-sm font-medium shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 whitespace-nowrap"
            >
              {importBusy ? "Importing…" : `Import & Add (${importCount})`}
            </button>
          ) : null}
        </span>
      </div>

      {/* Import preview */}
      {(importPreview.length > 0 || importErr) && (
        <div className="rounded-xl border border-slate-200 p-3">
          {importErr ? (
            <div className="text-red-700 mb-2">{importErr}</div>
          ) : (
            <>
              <div className="text-slate-500 mb-2">
                Previewing first {importPreview.length} of {importCount} parsed rows
              </div>
              <div className="overflow-auto max-h-60">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="text-left">
                      {["Date","Merchant","Category","Amount","Currency","Comment"].map(h=>(
                        <th key={h} className="border-b border-slate-200 px-3 py-2 font-semibold text-slate-700">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {importPreview.map((tx, i) => (
                      <tr key={i} className="odd:bg-white even:bg-slate-50/40">
                        <td className="border-b border-slate-100 px-3 py-2">{safeDate(tx.date)}</td>
                        <td className="border-b border-slate-100 px-3 py-2">{tx.merchant}</td>
                        <td className="border-b border-slate-100 px-3 py-2">{tx.category}</td>
                        <td className="border-b border-slate-100 px-3 py-2 tabular-nums">
                          {formatMoneyCents(tx.amountCents, tx.currency)}
                        </td>
                        <td className="border-b border-slate-100 px-3 py-2">{tx.currency}</td>
                        <td className="border-b border-slate-100 px-3 py-2">{tx.comment || ""}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* Mobile cards */}
      <div className="grid gap-3 md:hidden">
        {filtered.map(tx => (
          <div key={tx.id} className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>{safeDate(tx.date)}</span>
              <span className="tabular-nums font-semibold text-slate-800">
                {formatMoneyCents(tx.amountCents, tx.currency || "GBP")}
              </span>
            </div>
            <div className="mt-1 font-medium text-slate-800 break-words">{tx.merchant}</div>
            <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
              <span className="inline-block rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5">
                {tx.category || "Uncategorized"}
              </span>
              <span>{tx.currency || "GBP"}</span>
            </div>
            {tx.comment ? (
              <div className="mt-1 text-sm text-slate-600 break-words">{tx.comment}</div>
            ) : null}
          </div>
        ))}
        {!filtered.length && (
          <div className="text-slate-500 text-sm">No matching transactions.</div>
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full border-collapse text-sm table-fixed md:min-w-full min-w-[720px]">
          <colgroup>
            <col className="w-32" />  {/* Date */}
            <col className="w-56" />  {/* Merchant */}
            <col className="w-40" />  {/* Category */}
            <col className="w-32" />  {/* Amount */}
            <col className="w-24" />  {/* Currency */}
            <col />                   {/* Comment */}
          </colgroup>
          <thead className="sticky top-0 bg-slate-50">
            <tr className="text-left">
              {["Date","Merchant","Category","Amount","Currency","Comment"].map(h=>(
                <th key={h} className="border-b border-slate-200 px-3 py-2 font-semibold text-slate-700">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(tx=>(
              <tr key={tx.id} className="odd:bg-white even:bg-slate-50/40 align-top">
                <td className="border-b border-slate-100 px-3 py-2 whitespace-nowrap">{safeDate(tx.date)}</td>
                <td className="border-b border-slate-100 px-3 py-2">
                  <span className="block truncate" title={tx.merchant}>{tx.merchant}</span>
                </td>
                <td className="border-b border-slate-100 px-3 py-2">
                  <span className="inline-block max-w-full truncate rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs">
                    {tx.category || "Uncategorized"}
                  </span>
                </td>
                <td className="border-b border-slate-100 px-3 py-2 tabular-nums whitespace-nowrap">
                  {formatMoneyCents(tx.amountCents, tx.currency||"GBP")}
                </td>
                <td className="border-b border-slate-100 px-3 py-2 whitespace-nowrap">{tx.currency||"GBP"}</td>
                <td className="border-b border-slate-100 px-3 py-2 break-words">
                  {tx.comment||""}
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr><td className="px-3 py-6 text-slate-500" colSpan={6}>No matching transactions.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// --- helpers (unchanged) ---
function safeDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}

function parseCSV(text) {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").filter(Boolean);
  if (!lines.length) return [];
  const headers = splitCSVLine(lines[0]).map(h => h.trim());
  const out = [];
  for (let i = 1; i < lines.length; i++) {
    const fields = splitCSVLine(lines[i]);
    if (!fields.length || fields.every(f => f.trim() === "")) continue;
    const obj = {};
    for (let j = 0; j < headers.length; j++) obj[headers[j]] = fields[j] ?? "";
    out.push(obj);
  }
  return out;
}
function splitCSVLine(line) {
  const result = []; let field = ""; let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') { if (line[i + 1] === '"') { field += '"'; i++; } else { inQuotes = false; } }
      else { field += ch; }
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === ",") { result.push(field); field = ""; }
      else field += ch;
    }
  }
  result.push(field); return result;
}
function normalizeDate(input) {
  if (!input) return "";
  const t = input.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(t)) return t.slice(0, 10);
  const m = t.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})$/);
  if (m) {
    let d = parseInt(m[1], 10); let mo = parseInt(m[2], 10); let y = parseInt(m[3], 10);
    if (y < 100) y += 2000;
    if (d > 12) { const dd = String(d).padStart(2, "0"); const mm = String(mo).padStart(2, "0"); return `${y}-${mm}-${dd}`; }
    const dd = String(mo).padStart(2, "0"); const mm = String(d).padStart(2, "0"); return `${y}-${mm}-${dd}`;
  }
  const ts = Date.parse(t);
  if (Number.isFinite(ts)) { const d = new Date(ts); const mm = String(d.getMonth() + 1).padStart(2, "0"); const dd = String(d.getDate()).padStart(2, "0"); return `${d.getFullYear()}-${mm}-${dd}`; }
  return "";
}