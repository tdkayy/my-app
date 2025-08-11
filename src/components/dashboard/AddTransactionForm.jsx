// src/components/dashboard/AddTransactionForm.jsx
import React, { useMemo, useState } from "react";

/**
 * Props:
 * - onAdd: ({ date, merchant, amount }) => Promise<void> | void
 */
export default function AddTransactionForm({ onAdd }) {
  // default to today (YYYY-MM-DD)
  const today = useMemo(() => {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${mm}-${dd}`;
  }, []);

  const [date, setDate] = useState(today);
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!date || !merchant || !amount) {
      setError("Please fill in all fields.");
      return;
    }
    const parsed = Number(amount);
    if (!Number.isFinite(parsed)) {
      setError("Amount must be a number.");
      return;
    }

    try {
      setBusy(true);
      await onAdd?.({ date, merchant: merchant.trim(), amount: parsed });
      setMerchant("");
      setAmount("");
    } catch (e) {
      setError(e?.message || "Failed to add transaction");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 1fr auto", gap: 12 }}>
        <label style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontWeight: 600, marginBottom: 6 }}>Date</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={busy}
            required
          />
        </label>

        <label style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontWeight: 600, marginBottom: 6 }}>Merchant</span>
          <input
            type="text"
            placeholder="Pret A Manger"
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
            disabled={busy}
            required
          />
        </label>

        <label style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontWeight: 600, marginBottom: 6 }}>Amount (£)</span>
          <input
            type="number"
            step="0.01"
            inputMode="decimal"
            placeholder="12.34"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={busy}
            required
          />
        </label>

        <div style={{ alignSelf: "end" }}>
          <button type="submit" disabled={busy} style={{ padding: "10px 12px" }}>
            {busy ? "Adding…" : "Add"}
          </button>
        </div>
      </div>

      {error ? <div style={{ color: "#b91c1c", marginTop: 8 }}>{error}</div> : null}
    </form>
  );
}
