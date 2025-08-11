import React, { useMemo, useState, useEffect, useRef } from "react";
import { formatMoneyCents } from "entities/transaction/transaction.model";

/**
 * Props:
 * - rows: Array<{ id, date, merchant, amountCents, currency, category, comment }>
 * - onBulkAdd?: (items: Array<{ date, merchant, amountCents, currency, category?, comment? }>) => Promise<void> | void
 */
export default function TransactionTable({ rows = [], onBulkAdd }) {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("All");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");

  // import state
  const fileRef = useRef(null);
  const [importPreview, setImportPreview] = useState([]); // normalized preview rows
  const [importCount, setImportCount] = useState(0);
  const [importErr, setImportErr] = useState("");
  const [importBusy, setImportBusy] = useState(false);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim().toLowerCase()), 200);
    return () => clearTimeout(t);
  }, [q]);

  // Categories available in data
  const categories = useMemo(() => {
    const set = new Set(rows.map(r => (r.category || "Uncategorized").trim() || "Uncategorized"));
    return ["All", ...Array.from(set)];
  }, [rows]);

  // Sort newest first
  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => {
      const da = Date.parse(a?.date || 0) || 0;
      const db = Date.parse(b?.date || 0) || 0;
      return db - da;
    });
  }, [rows]);

  // Apply filters
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

  // --- Export CSV (unchanged) ---
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

  // --- Import CSV ---
  function handleChooseFile() {
    setImportErr("");
    setImportPreview([]);
    setImportCount(0);
    fileRef.current?.click();
  }

  async function handleFileChange(e) {
    setImportErr("");
    setImportPreview([]);
    setImportCount(0);
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const rows = parseCSV(text); // array of objects keyed by header
      const normalized = [];
      for (const r of rows) {
        const date = normalizeDate(r.Date || r.date || r["Transaction Date"] || "");
        const merchant = (r.Merchant || r.merchant || r.Payee || "").trim();
        const category = (r.Category || r.category || "Uncategorized").trim() || "Uncategorized";
        const currency = (r.Currency || r.currency || "GBP").toUpperCase();
        const comment = (r.Comment || r.comment || r.Note || "").trim();
        const amountDec = parseFloat(String(r.Amount ?? r.amount ?? "0").replace(/[, ]/g, ""));
        const amountCents = Number.isFinite(amountDec) ? Math.round(amountDec * 100) : 0;

        if (!date || !merchant || !Number.isFinite(amountCents)) continue; // basic validation

        normalized.push({ date, merchant, amountCents, currency, category, comment });
      }
      setImportPreview(normalized.slice(0, 10));
      setImportCount(normalized.length);
      // stash full set on the element for later submit (no global state)
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
      setImportErr("Nothing to import.");
      return;
    }
    setImportBusy(true);
    setImportErr("");
    try {
      await onBulkAdd(normalized);
      // clear state after success
      setImportPreview([]);
      setImportCount(0);
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
    <div className="txTableWrap" style={{ display: "grid", gap: 8 }}>
      {/* Controls */}
      <div
        className="tableHeader"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(240px, 1fr) 180px repeat(2, 160px) auto auto auto",
          gap: 8,
          alignItems: "center"
        }}
      >
        <input
          type="search"
          placeholder="Search merchant, category, comment…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={input}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)} style={input}>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} style={input} />
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} style={input} />
        <span style={{ justifySelf: "end", color: "#6b7280" }}>
          {filtered.length} / {rows.length} rows
        </span>
        <button onClick={downloadCSV} style={button}>Export CSV</button>
        <span style={{ display: "inline-flex", gap: 8, alignItems: "center", justifySelf: "end" }}>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          <button onClick={handleChooseFile} style={button}>Import CSV</button>
          {onBulkAdd ? (
            <button onClick={handleImportAdd} style={{ ...button, opacity: importCount ? 1 : 0.6 }} disabled={!importCount || importBusy}>
              {importBusy ? "Importing…" : `Import & Add (${importCount})`}
            </button>
          ) : null}
        </span>
      </div>

      {/* Import preview */}
      {(importPreview.length > 0 || importErr) && (
        <div className="card" style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 12 }}>
          {importErr ? <div style={{ color: "#b91c1c", marginBottom: 8 }}>{importErr}</div> : null}
          {!importErr && (
            <>
              <div style={{ color: "#6b7280", marginBottom: 8 }}>
                Previewing first {importPreview.length} of {importCount} parsed rows
              </div>
              <div style={{ overflow: "auto", maxHeight: 240 }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={th}>Date</th>
                      <th style={th}>Merchant</th>
                      <th style={th}>Category</th>
                      <th style={th}>Amount</th>
                      <th style={th}>Currency</th>
                      <th style={th}>Comment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importPreview.map((tx, i) => (
                      <tr key={i}>
                        <td style={td}>{safeDate(tx.date)}</td>
                        <td style={td}>{tx.merchant}</td>
                        <td style={td}>{tx.category}</td>
                        <td style={{ ...td, fontVariantNumeric: "tabular-nums" }}>
                          {formatMoneyCents(tx.amountCents, tx.currency)}
                        </td>
                        <td style={td}>{tx.currency}</td>
                        <td style={td}>{tx.comment || ""}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* Main table */}
      <div style={{ overflow: "auto", maxHeight: "65vh", border: "1px solid #e5e7eb", borderRadius: 10 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ position: "sticky", top: 0, background: "#f9fafb" }}>
            <tr>
              <th style={th}>Date</th>
              <th style={th}>Merchant</th>
              <th style={th}>Category</th>
              <th style={th}>Amount</th>
              <th style={th}>Currency</th>
              <th style={th}>Comment</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((tx) => {
              const dateText = tx?.date ? safeDate(tx.date) : "";
              return (
                <tr key={tx.id}>
                  <td style={td}>{dateText}</td>
                  <td style={td}>{tx.merchant || ""}</td>
                  <td style={td}><Badge text={(tx.category || "Uncategorized")} /></td>
                  <td style={{ ...td, fontVariantNumeric: "tabular-nums" }}>
                    {formatMoneyCents(tx.amountCents, tx.currency || "GBP")}
                  </td>
                  <td style={td}>{tx.currency || "GBP"}</td>
                  <td style={td}>{tx.comment || ""}</td>
                </tr>
              );
            })}
            {!filtered.length && (
              <tr>
                <td style={td} colSpan={6}>No matching transactions.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- helpers ---
function safeDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}

const th = {
  textAlign: "left",
  padding: "10px 12px",
  borderBottom: "1px solid #f1f5f9",
  whiteSpace: "nowrap",
};
const td = {
  padding: "10px 12px",
  borderBottom: "1px solid #f1f5f9",
  whiteSpace: "nowrap",
};
const input = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #d1d5db",
  font: "inherit",
};
const button = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #111827",
  background: "white",
  cursor: "pointer",
};

function Badge({ text }) {
  return (
    <span style={{
      display: "inline-block",
      padding: "2px 8px",
      borderRadius: 999,
      border: "1px solid #e5e7eb",
      background: "#f9fafb",
      fontSize: 12,
    }}>
      {text}
    </span>
  );
}

/**
 * Lightweight CSV → rows-of-objects parser.
 * - Supports quoted fields, commas inside quotes, and newlines.
 * - Returns array of objects keyed by header row.
 */
function parseCSV(text) {
  // Split into lines (handle CRLF/CR)
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").filter(Boolean);
  if (!lines.length) return [];

  const headers = splitCSVLine(lines[0]).map(h => h.trim());
  const out = [];

  for (let i = 1; i < lines.length; i++) {
    const fields = splitCSVLine(lines[i]);
    if (!fields.length || fields.every(f => f.trim() === "")) continue;

    const obj = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = fields[j] ?? "";
    }
    out.push(obj);
  }
  return out;
}

function splitCSVLine(line) {
  const result = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (inQuotes) {
      if (ch === '"') {
        // Look ahead for escaped quote
        if (line[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        result.push(field);
        field = "";
      } else {
        field += ch;
      }
    }
  }
  result.push(field);
  return result;
}

function normalizeDate(input) {
  if (!input) return "";
  // Accept YYYY-MM-DD or dd/mm/yyyy or mm/dd/yyyy (best-effort)
  const t = input.trim();

  // ISO-ish pass-through
  if (/^\d{4}-\d{2}-\d{2}/.test(t)) return t.slice(0, 10);

  // Try dd/mm/yyyy or mm/dd/yyyy
  const m = t.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})$/);
  if (m) {
    let d = parseInt(m[1], 10);
    let mo = parseInt(m[2], 10);
    let y = parseInt(m[3], 10);
    if (y < 100) y += 2000;
    // choose day/month heuristic: if first > 12 treat as day-first
    if (d > 12) {
      const dd = String(d).padStart(2, "0");
      const mm = String(mo).padStart(2, "0");
      return `${y}-${mm}-${dd}`;
    }
    // otherwise assume mm/dd/yyyy
    const dd = String(mo).padStart(2, "0");
    const mm = String(d).padStart(2, "0");
    return `${y}-${mm}-${dd}`;
  }

  // Fallback: Date.parse
  const ts = Date.parse(t);
  if (Number.isFinite(ts)) {
    const d = new Date(ts);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${mm}-${dd}`;
  }
  return "";
}
