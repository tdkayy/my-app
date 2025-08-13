// src/Layout.jsx
import React from "react";
import { Shield, Github } from "lucide-react";
import { Link } from "react-router-dom";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50 text-slate-900 selection:bg-blue-200/60">
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/90 border-b border-slate-200">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Brand */}
            <Link to="/" className="inline-flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                <Shield className="h-4 w-4" />
              </span>
              <div className="leading-tight">
                <div className="text-sm font-semibold">Adesanya Banking</div>
                <div className="text-[11px] text-slate-500">The Future of Expense Management</div>
              </div>
            </Link>

            {/* Nav */}
            <nav className="ml-auto flex items-center gap-2 sm:gap-3">
              <Link
                to="/dashboard"
                className="px-3 py-2 text-sm font-medium rounded-lg hover:bg-slate-100 transition"
              >
                Dashboard
              </Link>
              <Link
                to="/docs"
                className="px-3 py-2 text-sm font-medium rounded-lg hover:bg-slate-100 transition"
              >
                Documentation
              </Link>
              <a
                href="https://github.com/tdkayy/my-app"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
              >
                <Github className="h-4 w-4" />
                <span>View Code</span>
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>

      {/* Footer — pinned to bottom via flex layout */}
      <footer className="mt-auto border-t border-slate-200 bg-white/80">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 text-sm text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>Built as a technical challenge demonstration</div>
          <div className="text-slate-500">Technologies: React, PHP, Expensify API</div>
          <a
            href="/live"
            className="inline-flex items-center gap-1 text-blue-700 hover:underline"
          >
            Live Demo
          </a>
        </div>
      </footer>
    </div>
  );
}