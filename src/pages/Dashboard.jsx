import React, { useCallback, useEffect, useState, useRef } from "react";
import { setCookie, getCookie, deleteCookie } from "lib/cookies";
import { authAndGetToken, fetchAllTransactions, createNewTransaction } from "entities/transaction";
import AddTransactionForm from "components/dashboard/AddTransactionForm.jsx";
import AuthForm from "components/dashboard/AuthForm.jsx";
import TransactionTable from "components/dashboard/TransactionTable.jsx";
import StatsOverview from "components/dashboard/StatsOverview.jsx";
import ErrorBoundary from "components/dashboard/ErrorBoundary";
import { Plus, X } from "lucide-react";
import Modal from "components/ui/Modal";  

export default function Dashboard() {
  const [authToken, setAuthToken] = useState(getCookie("authToken") || "");
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [showAdd, setShowAdd] = useState(false);

  const focusRef = useRef(null);
  useEffect(() => { if (showAdd) focusRef.current?.focus(); }, [showAdd]);

  // NEW: controls the modal visibility
  const [showAddModal, setShowAddModal] = useState(false);
  const modalFirstFieldRef = useRef(null);

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
      await refresh();                  // authoritative refresh
      setShowAddModal(false);           // close modal on success
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

  // ===== Modal UX bits (backdrop click + ESC) =====
  useEffect(() => {
    if (!showAddModal) return;
    const onKey = (e) => { if (e.key === "Escape") setShowAddModal(false); };
    window.addEventListener("keydown", onKey);
    // focus first field (date) once modal opens (non-breaking to AddTransactionForm)
    setTimeout(() => {
      modalFirstFieldRef.current?.focus?.();
    }, 0);
    return () => window.removeEventListener("keydown", onKey);
  }, [showAddModal]);

  const stop = (e) => e.stopPropagation();

  if (!authToken) {
    return (
      <ErrorBoundary>
        <AuthForm onAuth={handleSignIn} loading={loading} error={error} />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="page max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <header className="mb-4 flex items-center justify-between gap-3">
          <div className="text-sm text-slate-600">
            {userEmail ? (
              <>Welcome <span className="font-medium text-slate-900">{userEmail}</span></>
            ) : ("signed in")}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={refresh}
              disabled={loading}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-60"
            >
              {loading ? "Refreshing…" : "Refresh"}
            </button>

            {/* Open modal */}
            <button
              onClick={() => setShowAdd(true)}
              className="inline-flex items-center rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Add Transaction
            </button>

            <button
              onClick={handleLogout}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-50"
            >
              Log out
            </button>
          </div>
        </header>

        {/* KPI cards */}
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60 p-4 mb-4">
          <StatsOverview transactions={transactions} loading={loading} />
        </div>

        {/* Table */}
        <section className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60 mt-4 p-4">
          <TransactionTable rows={transactions} onBulkAdd={undefined} />
        </section>

        {error ? <div className="text-red-600 mt-3 text-sm">{error}</div> : null}

        {/* Modal with your exact form component */}
        <Modal title="Add New Transaction" open={showAdd} onClose={() => setShowAdd(false)}>
          <AddTransactionForm
            onAdd={async (data) => {
              await handleAdd(data);
              setShowAdd(false);         // close on success
            }}
          />
        </Modal>
      </div>
    </ErrorBoundary>
  );
}