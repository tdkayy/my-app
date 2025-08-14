import React, { useState } from "react";

export default function AddTransactionForm({ onAdd }) {
  const [date, setDate] = useState("2025-08-10");
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!date || !merchant || !amount) {
      setError("Please fill in all fields.");
      return;
    }
    const parsed = Number(amount);
    if (Number.isNaN(parsed)) {
      setError("Amount must be a number.");
      return;
    }

    try {
      setSubmitting(true);
      await onAdd?.({ date, merchant: merchant.trim(), amount: parsed });
      setMerchant("");
      setAmount("");
    } catch (e) {
      setError(e?.message || "Failed to add transaction");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-3 md:grid-cols-[1fr,1.5fr,1fr,auto]">
        <label className="flex flex-col">
          <span className="font-semibold text-sm mb-1 text-slate-700">Date</span>
          <input
            name="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={submitting}
            required
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
          />
        </label>

        <label className="flex flex-col">
          <span className="font-semibold text-sm mb-1 text-slate-700">Merchant</span>
          <input
            name="merchant"
            type="text"
            placeholder="Pret A Manger"
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
            disabled={submitting}
            required
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
          />
        </label>

        <label className="flex flex-col">
          <span className="font-semibold text-sm mb-1 text-slate-700">Amount (£)</span>
          <input
            name="amount"
            type="number"
            step="0.01"
            inputMode="decimal"
            placeholder="12.34"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={submitting}
            required
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
          />
        </label>

        <div className="self-end">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-semibold shadow-sm hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting ? "Adding…" : "Add"}
          </button>
        </div>
      </div>

      {error ? <div className="text-red-600 mt-2 text-sm">{error}</div> : null}
    </form>
  );
}
