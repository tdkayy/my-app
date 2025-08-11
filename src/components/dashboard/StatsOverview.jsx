import React, { useMemo } from "react";
import { formatMoneyCents } from "entities/transaction/transaction.model";

/**
 * Props:
 * - transactions: Array<Transaction>
 * - loading: boolean
 */
export default function StatsOverview({ transactions = [], loading = false }) {
  const { totalCents, count, last30Count, avgCents, topMerchant } = useMemo(() => {
    const now = Date.now();
    const MS_30D = 30 * 24 * 60 * 60 * 1000;
    let total = 0;
    let c = 0;
    let last30 = 0;
    const merchants = Object.create(null);

    for (const t of transactions) {
      const val = Number(t?.amountCents || 0);
      if (!Number.isFinite(val)) continue;
      total += val;
      c += 1;

      const ts = Date.parse(t?.date || "");
      if (Number.isFinite(ts) && ts > 0 && (now - ts) <= MS_30D) {
        last30 += 1;
      }
      const m = (t?.merchant || "").trim();
      if (m) merchants[m] = (merchants[m] || 0) + 1;
    }

    const avg = c ? Math.round(total / c) : 0;
    let top = "";
    let topCnt = 0;
    for (const [m, cnt] of Object.entries(merchants)) {
      if (cnt > topCnt) { top = m; topCnt = cnt; }
    }

    return { totalCents: total, count: c, last30Count: last30, avgCents: avg, topMerchant: top };
  }, [transactions]);

  return (
    <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
      <Card title="Total">
        {loading ? <Skeleton /> : <strong>{formatMoneyCents(totalCents)}</strong>}
      </Card>
      <Card title="Transactions">
        {loading ? <Skeleton /> : <strong>{count}</strong>}
      </Card>
      <Card title="Last 30 days">
        {loading ? <Skeleton /> : <strong>{last30Count}</strong>}
      </Card>
      <Card title="Average">
        {loading ? <Skeleton /> : <strong>{formatMoneyCents(avgCents)}</strong>}
      </Card>
      <Card title="Top Merchant">
        {loading ? <Skeleton /> : <strong>{topMerchant || "—"}</strong>}
      </Card>
    </section>
  );
}

function Card({ title, children }) {
  return (
    <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 12, padding: 16 }}>
      <div style={{ color: "#6b7280", fontSize: 12, marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 18 }}>{children}</div>
    </div>
  );
}

function Skeleton() {
  return <div style={{ height: 20, background: "#eee", borderRadius: 6 }} />;
}
