import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Code2, ExternalLink, Github } from "lucide-react";

export default function Layout({ children }) {
  const location = useLocation();

  const isDash = location.pathname === createPageUrl("Dashboard");
  const isDocs = location.pathname === createPageUrl("Documentation");

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50 text-slate-900 selection:bg-blue-200/60">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-0">
          {/* Make header responsive without hiding anything */}
          <div className="flex flex-col gap-3 sm:h-16 sm:flex-row sm:items-center sm:justify-between">
            {/* Brand */}
            <Link to={createPageUrl("Dashboard")} className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 grid place-items-center">
                <Code2 className="w-5 h-5 text-white" />
              </div>
              <div className="leading-tight">
                <div className="text-base font-bold">Adesanya Banking</div>
                <div className="text-[11px] text-slate-500 -mt-0.5">The Future of Expense Management</div>
              </div>
            </Link>

            {/* Nav (scrollable on tiny screens to avoid clipping) */}
            <div className="flex items-center justify-between gap-3">
              <nav className="flex items-center gap-6 overflow-x-auto whitespace-nowrap [-webkit-overflow-scrolling:touch]">
                <Link
                  to={createPageUrl("Dashboard")}
                  className={`text-sm font-medium transition-colors ${
                    isDash ? "text-blue-600" : "text-slate-600 hover:text-blue-600"
                  }`}
                >
                  Dashboard
                </Link>

                <Link
                  to={createPageUrl("Documentation")}
                  className={`text-sm font-medium transition-colors ${
                    isDocs ? "text-blue-600" : "text-slate-600 hover:text-blue-600"
                  }`}
                >
                  Documentation
                </Link>
              </nav>

              <a
                href="https://github.com/tdkayy/my-app"
                target="_blank"
                rel="noreferrer"
                className="shrink-0 inline-flex items-center gap-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg px-3 py-2 hover:from-blue-700 hover:to-blue-800"
              >
                <Github className="w-4 h-4" />
                View Code
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1">{children}</main>

      {/* Sticky Footer (kept from my version; responsive wrap) */}
      <footer className="mt-auto bg-white/90 backdrop-blur border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="text-sm text-slate-600 text-center md:text-left">
            "The best time to plant a tree was 20 years ago. The second best time is now."
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <span className="whitespace-nowrap">Technologies: React, PHP, Expensify API</span>
            <span className="inline-flex items-center gap-1">
              <ExternalLink className="w-4 h-4" />
              Live Demo
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}