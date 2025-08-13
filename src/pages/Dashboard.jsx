// src/Dashboard.jsx
import React, { useCallback, useEffect, useState } from "react";
import { setCookie, getCookie, deleteCookie } from "lib/cookies";
import { authAndGetToken, fetchAllTransactions, createNewTransaction } from "entities/transaction";
import AddTransactionForm from "components/dashboard/AddTransactionForm.jsx";
import AuthForm from "components/dashboard/AuthForm.jsx";
import TransactionTable from "components/dashboard/TransactionTable.jsx";
import StatsOverview from "components/dashboard/StatsOverview.jsx";
import ErrorBoundary from "components/dashboard/ErrorBoundary";
import { Plus } from "lucide-react";

export default function Dashboard() {
  const [authToken, setAuthToken] = useState(getCookie("authToken") || "");
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [showModal, setShowModal] = useState(false); // purely presentational

  const refresh = useCallback(async () => {
    if (!authToken) return;
    setLoading(true);
    setError("");
    try {
      const list = await fetchAllTransactions(authToken);
      setTransactions(list);
    } catch (e) {
      setError(e?.message || "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }, [authToken]);

  const handleSignIn = useCallback(async ({ email, password }) => {
    setError("");
    setLoading(true);
    try {
      const token = await authAndGetToken({ email, password });
      setAuthToken(token);
      setCookie("authToken", token, 7);
      setUserEmail(email);
      window.__AUTH_EMAIL__ = email;
      await refresh();
    } catch (e) {
      setError(e?.message || "Sign in failed");
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  useEffect(() => {
    if (!authToken) return;
    window.__AUTH_EMAIL__ = userEmail || window.__AUTH_EMAIL__ || "";
    refresh();
  }, [authToken, userEmail, refresh]);

  const clearUISession = () => {
    try {
      for (const k of Object.keys(localStorage)) {
        if (k.startsWith("txTable:v1:") || k.startsWith("addForm:v1:")) {
          localStorage.removeItem(k);
        }
      }
    } catch {}
  };

  const handleLogout = useCallback(() => {
    clearUISession();
    deleteCookie("authToken");
    setAuthToken("");
    setUserEmail("");
    setTransactions([]);
    setError("");
    window.__AUTH_EMAIL__ = "";
  }, []);

  const handleAdd = useCallback(async ({ date, merchant, amount }) => {
    if (!authToken) throw new Error("Not signed in");
    const amountCents = Math.round(Number(amount) * 100);
    try {
      await createNewTransaction(authToken, { date, merchant, amountCents, currency: "GBP" });
      await refresh();
    } catch (e) {
      console.error(e);
      setError(e?.message || "Create failed");
      throw e;
    }
  }, [authToken, refresh]);

  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(""), 4000);
    return () => clearTimeout(t);
  }, [error]);

  if (!authToken) {
    return (
      <ErrorBoundary>
        <AuthForm onAuth={handleSignIn} loading={loading} error={error} />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      {/* Page header */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-slate-600">
          {userEmail ? (
            <>Welcome <span className="font-medium text-slate-900">{userEmail}</span></>
          ) : ("signed in")}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={refresh}
            disabled={loading}
            className="rounded-lg border border-slate-300 bg-amber-600 px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-60"
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Transaction
          </button>

          <button
            onClick={handleLogout}
            className="rounded-lg border border-slate-300 bg-red-600 px-3 py-2 text-sm hover:bg-slate-50"
          >
            Log out
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60 p-4 mb-4">
        <StatsOverview transactions={transactions} loading={loading} />
      </div>

{/* Table */}
<section className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60 mt-4">
  {/* Negative mx on mobile lets the scroll go edge-to-edge, then snaps back on sm+ */}
  <div className="-mx-4 sm:mx-0">
    <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
      <TransactionTable rows={transactions} onBulkAdd={undefined} />
    </div>
  </div>
</section>
      {error ? <div className="text-red-600 mt-3 text-sm">{error}</div> : null}

      {/* Modal (presentation only) */}
      {showModal && (
        <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-4 bg-slate-900/40">
          <div className="w-full sm:max-w-lg rounded-2xl bg-white shadow-xl ring-1 ring-slate-200/70">
            <div className="border-b border-slate-200 px-4 py-3 flex items-center justify-between">
              <h3 className="text-base font-semibold">Add New Transaction</h3>
              <button
                className="rounded-md px-2 py-1 text-slate-500 hover:bg-slate-100"
                onClick={() => setShowModal(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              {/* vertical form layout already handled in AddTransactionForm */}
              <AddTransactionForm onAdd={async (...a) => { await handleAdd(...a); setShowModal(false); }} />
            </div>
          </div>
        </div>
      )}
    </ErrorBoundary>
  );
}