import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Code2, ExternalLink, Github, DollarSign } from "lucide-react";

export default function Layout({ children }) {
  const location = useLocation();
  const shell = "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8";

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50 text-slate-900 selection:bg-blue-200/60 overflow-x-hidden">
      {" "}
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-200 mb-8">
        <div className={shell}>
          <div className="h-16 flex items-center justify-between gap-4 flex-wrap">
            {" "}
            {/* Brand (keeps from shrinking too small) */}
            <Link
              to={createPageUrl("Dashboard")}
              className="flex items-center gap-2 min-w-0 flex-shrink"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 grid place-items-center flex-shrink-0">
                <DollarSign className="w-5 h-5 text-white" />
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
            {/* Nav — wraps under brand on narrow widths */}
            <nav className="flex items-center gap-4 sm:gap-6 flex-wrap">
              <Link
                to={createPageUrl("Dashboard")}
                className={`text-sm font-medium transition-colors ${
                  location.pathname === createPageUrl("Dashboard")
                    ? "text-blue-600"
                    : "text-slate-600 hover:text-blue-600"
                }`}
              >
                Dashboard
              </Link>
              <Link
                to={createPageUrl("Documentation")}
                className={`text-sm font-medium transition-colors ${
                  location.pathname === createPageUrl("Documentation")
                    ? "text-blue-600"
                    : "text-slate-600 hover:text-blue-600"
                }`}
              >
                Documentation
              </Link>

              <a
                href="https://github.com/tdkayy/my-app"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg px-3 py-2 hover:from-blue-700 hover:to-blue-800 whitespace-nowrap"
              >
                <Github className="w-4 h-4" />
                View Code
              </a>
            </nav>
          </div>
        </div>
      </header>
      {/* Main (little breathing room on the sides for mobile) */}
      <main className={shell + " flex-1"}>{children}</main> {/* Footer */}
      <footer className="mt-auto bg-white/90 backdrop-blur border-t border-slate-200">
        <div
          className={
            shell +
            " py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left"
          }
        >
          {" "}
          <div className="text-sm text-slate-600">
            "The best time to plant a tree was 20 years ago. The second best
            time is now."
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-500 flex-wrap justify-center">
            <span>Technologies: React, PHP, Expensify API</span>
            <span className="inline-flex items-center gap-1">
              <ExternalLink className="w-4 h-4" /> Coming soon
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
