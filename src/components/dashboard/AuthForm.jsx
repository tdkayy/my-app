import React, { useState } from "react";

/**
 * Props:
 * - onAuth: ({ email, password }) => Promise<void> | void
 * - loading: boolean
 * - error: string (optional)
 */
export default function AuthForm({ onAuth, loading = false, error = "" }) {
  const [email, setEmail] = useState("expensifytest@mailinator.com");
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
      // onAuth should surface errors via `error` prop; this is a fallback
      setLocalError(e?.message || "Login failed");
    }
  };

  return (
    <section className="card" style={{ maxWidth: 420, margin: "40px auto" }}>
      <h3 style={{ marginTop: 0 }}>Sign in</h3>
      <form onSubmit={handleSubmit}>
        <label style={{ display: "block", marginBottom: 10 }}>
          <span style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Email</span>
          <input
            type="email"
            placeholder="expensifytest@mailinator.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            style={{ width: "100%", padding: 10 }}
            required
          />
        </label>

        <label style={{ display: "block", marginBottom: 10 }}>
          <span style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Password</span>
          <input
            type="password"
            placeholder="hire_me"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            style={{ width: "100%", padding: 10 }}
            required
          />
        </label>

        {(error || localError) ? (
          <div style={{ color: "#b91c1c", margin: "8px 0" }}>
            {error || localError}
          </div>
        ) : null}

        <button type="submit" disabled={loading} style={{ padding: "10px 12px" }}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p style={{ color: "#6b7280", marginTop: 12 }}>
        Use the provided test account. Your authToken will be stored in a cookie for this demo.
      </p>
    </section>
  );
}
