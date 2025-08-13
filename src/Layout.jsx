// src/Layout.jsx
import React from "react";
import { Link, NavLink } from "react-router-dom";

export default function Layout({ children }) {
  return (
    <div className="min-h-dvh flex flex-col bg-gradient-to-br from-slate-50 to-blue-50 text-slate-900 selection:bg-blue-200/60">
      {/* Top bar */}
      <header className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/90 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-3">
            {/* Brand */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                </span>
              <div className="leading-tight">
                <div className="font-semibold -mb-0.5">Adesanya Banking</div>
                <div className="text-[11px] text-slate-500">The Future of Expense Management</div>
              </div>
            </Link>

            {/* Nav + CTAs */}
            <div className="ml-auto flex flex-wrap items-center gap-2">
              <nav className="flex items-center gap-2 text-sm">
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    `px-3 py-1.5 rounded-lg hover:bg-slate-100 ${isActive ? "text-blue-600 font-semibold" : "text-slate-600"}`
                  }
                >
                  Dashboard
                </NavLink>
                <NavLink
                  to="/docs"
                  className={({ isActive }) =>
                    `px-3 py-1.5 rounded-lg hover:bg-slate-100 ${isActive ? "text-blue-600 font-semibold" : "text-slate-600"}`
                  }
                >
                  Documentation
                </NavLink>
              </nav>

              <a
                href="https://github.com/tdkayy/my-app"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
              >
                View Code
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">{children}</div>
      </main>

      {/* Footer pinned */}
      <footer className="mt-6 border-t border-slate-200/70 bg-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Built as a technical challenge demonstration</span>
          <span>Technologies: React, PHP, Expensify API</span>
        </div>
      </footer>
    </div>
  );
}
