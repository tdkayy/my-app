// src/components/dashboard/StatsOverview.jsx
import React, { useMemo } from "react";
import { formatMoneyCents } from "entities/transaction/transaction.model";
import { CreditCard, ListChecks, CalendarDays, LineChart } from "lucide-react";

export default function StatsOverview({ transactions = [], loading = false }) {
  const { totalCents, count, last30Count, avgCents, topMerchant } = useMemo(() => {
    const now = Date.now();
    const MS_30D = 30 * 24 * 60 * 60 * 1000;
    let total = 0, c = 0, last30 = 0;
    const merchants = Object.create(null);

    for (const t of transactions) {
      const val = Number(t?.amountCents || 0);
      if (!Number.isFinite(val)) continue;
      total += val; c += 1;

      const ts = Date.parse(t?.date || "");
      if (Number.isFinite(ts) && ts > 0 && (now - ts) <= MS_30D) last30 += 1;

      const m = (t?.merchant || "").trim();
      if (m) merchants[m] = (merchants[m] || 0) + 1;
    }

    const avg = c ? Math.round(total / c) : 0;
    let top = "", topCnt = 0;
    for (const [m, cnt] of Object.entries(merchants)) if (cnt > topCnt) { top = m; topCnt = cnt; }

    return { totalCents: total, count: c, last30Count: last30, avgCents: avg, topMerchant: top };
  }, [transactions]);

  return (
    <section className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-4 mb-2">
      <Card title="Total" icon={CreditCard}>
        {loading ? <Skeleton /> : <strong className="text-lg sm:text-xl">{formatMoneyCents(totalCents)}</strong>}
      </Card>
      <Card title="Transactions" icon={ListChecks}>
        {loading ? <Skeleton /> : <strong className="text-lg sm:text-xl">{count}</strong>}
      </Card>
      <Card title="Last 30 days" icon={CalendarDays}>
        {loading ? <Skeleton /> : <strong className="text-lg sm:text-xl">{last30Count}</strong>}
      </Card>
      <Card title="Average" icon={LineChart}>
        {loading ? <Skeleton /> : <strong className="text-lg sm:text-xl">{formatMoneyCents(avgCents)}</strong>}
      </Card>

      <div className="md:col-span-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-500 mb-1">Top Merchant</div>
          <div className="text-base sm:text-lg"><strong>{topMerchant || "—"}</strong></div>
        </div>
      </div>
    </section>
  );
}

function Card({ title, icon: Icon, children }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 mb-1">
        {Icon ? <Icon className="w-4 h-4 text-blue-600" /> : null}
        <span>{title}</span>
      </div>
      <div className="text-slate-900">{children}</div>
    </div>
  );
}
function Skeleton() {
  return <div className="h-5 bg-slate-100 rounded-md" />;
}