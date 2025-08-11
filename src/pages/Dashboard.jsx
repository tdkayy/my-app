// src/pages/Dashboard.jsx
import React, { useCallback, useEffect, useState } from "react";
import { setCookie, getCookie, deleteCookie } from "lib/cookies";
import {
  authAndGetToken,
  fetchAllTransactions,
  createNewTransaction,
} from "entities/transaction";
import AddTransactionForm from "components/dashboard/AddTransactionForm.jsx";
import AuthForm from "components/dashboard/AuthForm.jsx";
import TransactionTable from "components/dashboard/TransactionTable.jsx";
import StatsOverview from "components/dashboard/StatsOverview.jsx";

export default function Dashboard() {
  const [authToken, setAuthToken] = useState(getCookie("authToken") || "");
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [transactions, setTransactions] = useState([]);

  const refresh = useCallback(async () => {
    if (!authToken) return;
    setLoading(true);
    setError("");
    try {
      const list = await fetchAllTransactions(authToken);
      setTransactions(list);
    } catch (e) {
      console.error(e);
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
      const list = await fetchAllTransactions(token);
      setTransactions(list);
    } catch (e) {
      console.error(e);
      setError(e?.message || "Sign in failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authToken) return;
    refresh();
  }, [authToken, refresh]);

  const handleLogout = useCallback(() => {
    deleteCookie("authToken");
    setAuthToken("");
    setUserEmail("");
    setTransactions([]);
    setError("");
  }, []);

  // Add single transaction
  const handleAdd = useCallback(
    async ({ date, merchant, amount }) => {
      if (!authToken) throw new Error("Not signed in");
      const amountCents = Math.round(Number(amount) * 100);

      console.log("[handleAdd]", { date, merchant, amount, amountCents });

      const created = await createNewTransaction(authToken, {
        date,               // "YYYY-MM-DD"
        merchant,           // string
        amountCents,        // integer
        currency: "GBP",
      });

      console.log("[handleAdd ← normalized]", created);

      // optimistic insert
      setTransactions((prev) => [created, ...prev]);
    },
    [authToken]
  );

  // CSV Import & Add
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

  if (!authToken) {
    return <AuthForm onAuth={handleSignIn} loading={loading} error={error} />;
  }

  return (
    <div className="page">
      <header
        className="dashboardHeader"
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}
      >
        <h2>Dashboard</h2>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ color: "#6b7280" }}>{userEmail || "signed in"}</span>
          <button onClick={refresh} disabled={loading}>
            {loading ? "Refreshing…" : "Refresh"}
          </button>
          <button onClick={handleLogout}>Log out</button>
        </div>
      </header>

      <StatsOverview transactions={transactions} loading={loading} />

      <section className="card" style={{ marginTop: 16 }}>
        <h3>Add Transaction</h3>
        <AddTransactionForm onAdd={handleAdd} />
      </section>

      <section className="card" style={{ marginTop: 16 }}>
        <TransactionTable rows={transactions} onBulkAdd={handleBulkAdd} />
      </section>

      {error ? (
        <div className="error" style={{ color: "#b91c1c", marginTop: 8 }}>
          {error}
        </div>
      ) : null}

      {/* DEV DEBUG NOTE */}
      <div style={{ marginTop: 8, color: "#6b7280", fontSize: 12 }}>
        Open the console to see <code>[handleAdd]</code> and <code>[CreateTx →/←]</code> logs.
      </div>
    </div>
  );
}
