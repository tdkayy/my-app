import React from "react";
import { Link } from "react-router-dom";
import {
  Rocket,
  Shield,
  Database,
  Upload,
  Download,
  CheckCircle2,
  Server,
  GitBranch,
  Clock,
} from "lucide-react";
import { createPageUrl } from "@/utils";

export default function Documentation() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero */}
      <header className="border-b border-slate-200/70 bg-white/70 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="space-y-6">
            <div>
              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Adesanya Banking — Overview & Build Notes
              </h1>
              <p className="mt-2 max-w-3xl text-slate-600">
                A technical walk-through of the demo: architecture, data model,
                auth flow, and the reasoning behind key UX decisions. Everything
                you need to understand, run, and extend the project.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
          {/* Sticky ToC (desktop) */}
          <nav className="hidden lg:block">
            <div className="sticky top-24 space-y-2">
              {[
                ["overview", "Overview"],
                ["architecture", "Architecture"],
                ["auth", "Auth & Sessions"],
                ["data", "Data & Transactions"],
                ["import", "Import / Export"],
                ["deployment", "Deployment"],
                ["roadmap", "Roadmap"],
              ].map(([id, label]) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className="block rounded-md px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                >
                  {label}
                </a>
              ))}
            </div>
          </nav>

          {/* Content */}
          <div className="space-y-12">
            {/* Overview */}
            <Section id="overview" icon={Rocket} title="Project Overview">
              <p>
                This application was built as a focused technical exercise to
                demonstrate full-stack skills with <b>React</b>, a lightweight{" "}
                <b>PHP</b> backend, and the <b>Expensify API</b>. It showcases
                sign-in, robust CSV import, a responsive transaction table that
                handles large datasets (~15k rows), and a clean, mobile-first
                UI.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Kpi
                  icon={Shield}
                  title="Secure Auth"
                  desc="Token-based auth + cookie session."
                />
                <Kpi
                  icon={Database}
                  title="Scalable Table"
                  desc="Virtual-friendly patterns; truncated cells; sticky header."
                />
                <Kpi
                  icon={Upload}
                  title="CSV Import"
                  desc="Preview + normalized fields + bulk add."
                />
                <Kpi
                  icon={Download}
                  title="CSV Export"
                  desc="Filtered export with one click."
                />
              </div>
            </Section>

            {/* Architecture */}
            <Section id="architecture" icon={Server} title="Architecture">
              <ul className="list-disc pl-5 space-y-2 text-slate-700">
                <li>
                  <b>Frontend:</b> Vite + React + Tailwind. Declarative UI,
                  small footprint.
                </li>
                <li>
                  <b>Backend:</b> PHP thin layer for auth proxying and CORS-free
                  API calls.
                </li>
                <li>
                  <b>API:</b> Expensify endpoints wrapped in a stable interface.
                </li>
                <li>
                  <b>Deployment:</b> Vercel for the frontend, PHP proxy on a
                  serverless-friendly host.
                </li>
              </ul>

              <Callout>
                Keep the proxy <i>stateless</i>. Forward only what’s required,
                validate inputs, and never leak upstream error details directly
                to the client.
              </Callout>
            </Section>

            {/* Auth */}
            <Section id="auth" icon={Shield} title="Authentication & Sessions">
              <ol className="space-y-3">
                {[
                  "User signs in with the provided test account.",
                  "Backend exchanges credentials for an auth token with Expensify.",
                  "Token is stored in an http-only cookie for the demo.",
                  "Subsequent requests go through the PHP proxy with that session.",
                ].map((t, i) => (
                  <li key={i} className="flex gap-3">
                    <StepDot />
                    <span className="text-slate-700">{t}</span>
                  </li>
                ))}
              </ol>
            </Section>

            {/* Data */}
            <Section id="data" icon={Database} title="Data & Transactions">
              <p className="mb-4">
                Transactions are normalized into a simple shape and sorted by
                date (desc). Filtering is client-side (search, date range,
                category).
              </p>

              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                <table className="w-full border-collapse text-sm">
                  <thead className="bg-slate-50 text-left">
                    <tr>
                      {["field", "type", "notes"].map((h) => (
                        <th
                          key={h}
                          className="px-3 py-2 font-semibold text-slate-700"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["date", "ISO string", "Normalized (YYYY-MM-DD)."],
                      [
                        "merchant",
                        "string",
                        "Truncated in UI; title shows full value.",
                      ],
                      ["category", "string", "‘Uncategorized’ by default."],
                      [
                        "amountCents",
                        "number",
                        "Stored in minor units; rendered with currency.",
                      ],
                      ["currency", "string", "Uppercase ISO (e.g., GBP, USD)."],
                      ["comment", "string", "Free text; truncated in table."],
                    ].map((r) => (
                      <tr
                        key={r[0]}
                        className="odd:bg-white even:bg-slate-50/40"
                      >
                        {r.map((c, i) => (
                          <td key={i} className="px-3 py-2 text-slate-700">
                            {c}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>

            {/* Import / Export */}
            <Section id="import" icon={Upload} title="Import / Export">
              <div className="grid gap-6 md:grid-cols-2">
                <Card
                  title="CSV Import"
                  items={[
                    "Client parses CSV with a robust delimiter/quote handler.",
                    "Rows are previewed (first 10) before bulk add.",
                    "Dates normalized; currency coerced to uppercase; amounts to cents.",
                  ]}
                />
                <Card
                  title="CSV Export"
                  items={[
                    "Respects current filters.",
                    "Includes BOM for Excel compatibility.",
                    "Simple, predictable headers for re-import.",
                  ]}
                />
              </div>
            </Section>

            {/* Deployment */}
            <Section id="deployment" icon={GitBranch} title="Deployment">
              <ul className="list-disc pl-5 space-y-2 text-slate-700">
                <li>Frontend on Vercel (static + edge cache).</li>
                <li>PHP proxy on a serverless-friendly host (or tiny VM).</li>
                <li>Environment variables for credentials & endpoints.</li>
                <li>Healthcheck route for uptime monitoring.</li>
              </ul>
            </Section>

            {/* Roadmap */}
            <Section id="roadmap" icon={Clock} title="Roadmap">
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ["Pagination / Virtual rows", "Improve perf for 50k+ rows."],
                  ["Categories CRUD", "Manage custom categories in-app."],
                  ["Charts & Insights", "Monthly spend, top merchants."],
                  ["End-to-end tests", "Playwright smoke flows."],
                ].map(([t, d]) => (
                  <div
                    key={t}
                    className="rounded-xl border border-slate-200 bg-white p-4"
                  >
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-600" />
                      <div>
                        <div className="font-medium text-slate-800">{t}</div>
                        <div className="text-sm text-slate-600">{d}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ---------- small building blocks ---------- */

function Section({ id, icon: Icon, title, children }) {
  return (
    <section id={id} className="scroll-mt-28">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 ring-1 ring-inset ring-blue-200">
          <Icon className="h-5 w-5 text-blue-700" />
        </span>
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
      </div>
      <div className="prose prose-slate max-w-none prose-p:leading-relaxed prose-li:leading-relaxed">
        {children}
      </div>
    </section>
  );
}

function Kpi({ icon: Icon, title, desc }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-2 flex items-center gap-2">
        <Icon className="h-4 w-4 text-blue-700" />
        <div className="font-semibold text-slate-800">{title}</div>
      </div>
      <div className="text-sm text-slate-600">{desc}</div>
    </div>
  );
}

function Card({ title, items }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-2 font-semibold text-slate-800">{title}</div>
      <ul className="space-y-2">
        {items.map((t) => (
          <li key={t} className="flex items-start gap-2 text-slate-700">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
            <span className="text-sm">{t}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Callout({ children }) {
  return (
    <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
      {children}
    </div>
  );
}

function StepDot() {
  return <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-600" />;
}
