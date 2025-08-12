import React, { useState } from "react";
import { ShieldCheck } from "lucide-react";

export default function AuthForm({ onAuth, loading = false, error = "" }) {
  const [email, setEmail] = useState("expensifytest@mailinator.com ");
  const [password, setPassword] = useState("hire_me");
  const [localError, setLocalError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    if (!email || !password) {
      setLocalError("Please enter your email and password.");
      return;
    }
    try {
      await onAuth?.({ email: email.trim(), password });
    } catch (e) {
      setLocalError(e?.message || "Login failed");
    }
  };

  return (
    <section className="max-w-xl mx-auto py-10">
      <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-blue-600 text-white grid place-items-center shadow-sm">
        <ShieldCheck className="w-6 h-6" />
      </div>

      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60 p-6">
        <h3 className="text-xl font-semibold mb-4">Sign in</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="block font-medium text-sm mb-1">Email</span>
            <input
              type="email"
              placeholder="expensifytest@mailinator.com "
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
            />
          </label>

          <label className="block">
            <span className="block font-medium text-sm mb-1">Password</span>
            <input
              type="password"
              placeholder="hire_me"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
            />
          </label>

          {(error || localError) ? (
            <div className="text-sm text-red-600">{error || localError}</div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-semibold shadow-sm hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="text-slate-500 text-sm mt-3">
          Use the provided test account. Your authToken will be stored in a cookie for this demo.
        </p>
      </div>
    </section>
  );
}
