// src/pages/Dashboard.jsx
import React, { useCallback, useEffect, useState, useRef } from "react";
import { setCookie, getCookie, deleteCookie } from "lib/cookies";
import { authAndGetToken, fetchAllTransactions, createNewTransaction } from "entities/transaction";
import AddTransactionForm from "components/dashboard/AddTransactionForm.jsx";
import AuthForm from "components/dashboard/AuthForm.jsx";
import TransactionTable from "components/dashboard/TransactionTable.jsx";
import StatsOverview from "components/dashboard/StatsOverview.jsx";
import ErrorBoundary from "components/dashboard/ErrorBoundary";
import { Plus, X } from "lucide-react";

// trivial inline modal (keeps your deps light)
function Modal({ open, onClose, children, title }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white -xl shadow-xl border border-slate-200">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
            <h3 className="text-slate-800 font-semibold">{title}</h3>
            <button className="p-1  hover:bg-slate-100" onClick={onClose} aria-label="Close">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="px-4 py-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [authToken, setAuthToken] = useState(getCookie("authToken") || "");
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);

  const modalFirstFieldRef = useRef(null);
  useEffect(() => {
    if (showAddModal) modalFirstFieldRef.current?.focus();
  }, [showAddModal]);

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

  const handleSignIn = useCallback(
    async ({ email, password }) => {
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
    },
    [refresh]
  );

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

  const handleAdd = useCallback(
    async ({ date, merchant, amount }) => {
      if (!authToken) throw new Error("Not signed in");
      const amountCents = Math.round(Number(amount) * 100);
      try {
        await createNewTransaction(authToken, { date, merchant, amountCents, currency: "GBP" });
        await refresh();            // authoritative refresh
        setShowAddModal(false);     // close modal on success
      } catch (e) {
        console.error(e);
        setError(e?.message || "Create failed");
        throw e;
      }
    },
    [authToken, refresh]
  );

  // bulk import from CSV (invoked by TransactionTable)
  const handleBulkAdd = useCallback(
    async (items) => {
      if (!authToken) throw new Error("Not signed in");
      setError("");
      try {
        for (const it of items) {
          const row = await createNewTransaction(authToken, it);
          setTransactions((prev) => [row, ...prev]);
        }
        await refresh();
      } catch (e) {
        console.error(e);
        setError(e?.message || "Bulk add failed");
      }
    },
    [authToken, refresh]
  );

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
    <div className="space-y-6">
      {/* Top bar */}
      <header className="bg-white/90 backdrop-blur -xl border border-slate-200 p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-slate-600">Welcome {userEmail || window.__AUTH_EMAIL__ || ""}</div>
        <div className="flex items-center gap-2">
          <button
            onClick={refresh}
            disabled={loading}
            className="h-9 -lg border border-slate-300 bg-white px-3 text-sm font-medium shadow-sm hover:bg-slate-50 disabled:opacity-60"
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="h-9 inline-flex items-center gap-2 -lg bg-blue-600 px-3 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Transaction
          </button>
          <button
            onClick={handleLogout}
            className="h-9 -lg bg-rose-600 px-3 text-sm font-medium text-white shadow-sm hover:bg-rose-700"
          >
            Log out
          </button>
        </div>
      </header>

      {/* Stats */}
      <StatsOverview transactions={transactions} loading={loading} />

      {/* Table */}
      <div className="bg-white/90 backdrop-blur -xl border border-slate-200">
        <TransactionTable rows={transactions} onBulkAdd={handleBulkAdd} />
      </div>

      {/* Error toast */}
      {error ? (
        <div className="-lg bg-rose-50 text-rose-700 border border-rose-200 px-3 py-2">
          {error}
        </div>
      ) : null}

      {/* Add modal */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Add Transaction">
        <AddTransactionForm onAdd={handleAdd} firstFieldRef={modalFirstFieldRef} />
      </Modal>
    </div>
  );
}