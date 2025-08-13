// Layout.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Code2, ExternalLink, Github } from "lucide-react";

export default function Layout({ children }) {
  const location = useLocation();

  const navLink = (to, label) => (
    <Link
      to={to}
      className={[
        "text-sm font-medium transition-colors",
        location.pathname === to ? "text-blue-600" : "text-slate-600 hover:text-blue-600",
      ].join(" ")}
    >
      {label}
    </Link>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50 text-slate-900 selection:bg-blue-200/60">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Flex that wraps on small screens */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3 py-3">
            {/* Brand */}
            <Link
              to={createPageUrl("Dashboard")}
              className="flex items-center gap-2 min-w-0"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 grid place-items-center flex-none">
                <Code2 className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="text-base font-bold leading-tight truncate">
                  Adesanya Banking
                </div>
                <div className="text-[11px] text-slate-500 -mt-0.5 truncate">
                  The Future of Expense Management
                </div>
              </div>
            </Link>

            {/* Nav links – get their own row on xs, inline on sm+ */}
            <nav className="order-3 w-full sm:w-auto sm:order-2 flex items-center gap-6">
              {navLink(createPageUrl("Dashboard"), "Dashboard")}
              {navLink(createPageUrl("Documentation"), "Documentation")}
            </nav>

            {/* View Code button – stays at far right when space allows */}
            <a
              href="https://github.com/tdkayy/my-app"
              target="_blank"
              rel="noreferrer"
              className="ml-auto order-2 sm:order-3 inline-flex items-center gap-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg px-3 py-2 hover:from-blue-700 hover:to-blue-800"
            >
              <Github className="w-4 h-4" />
              <span className="hidden xs:inline">View Code</span>
              <span className="xs:hidden">Code</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main
         - Provide gentle page gutters on mobile so content isn’t glued to edges.
         - Children can still have their own containers; this simply ensures padding on tiny screens. */}
      <main className="flex-1 w-full">
        <div className="mx-auto w-full px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      {/* Sticky Footer */}
      <footer className="mt-auto bg-white/90 backdrop-blur border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 md:py-6 pb-[env(safe-area-inset-bottom)]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
            <div className="text-sm md:text-base text-slate-600">
              “The best time to plant a tree was 20 years ago. The second best time is now.”
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6 text-sm text-slate-500">
              <span>Technologies: React, PHP, Expensify API</span>
              <span className="inline-flex items-center gap-1">
                <ExternalLink className="w-4 h-4" /> <span>Live Demo</span>
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
