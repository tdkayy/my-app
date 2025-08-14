import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { DollarSign, ExternalLink, Github, Menu, X } from "lucide-react";

export default function Layout({ children }) {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = open ? "hidden" : prev || "";
    return () => (document.body.style.overflow = prev || "");
  }, [open]);

  const is = (page) => location.pathname === createPageUrl(page);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50 text-slate-900 selection:bg-blue-200/60">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand */}
          <Link to={createPageUrl("Dashboard")} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 grid place-items-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-base font-bold leading-tight">Adesanya Banking</div>
              <div className="text-[11px] text-slate-500 -mt-0.5">The Future of Expense Management</div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to={createPageUrl("Dashboard")}
              className={`text-sm font-medium transition-colors ${
                is("Dashboard") ? "text-blue-600" : "text-slate-600 hover:text-blue-600"
              }`}
            >
              Dashboard
            </Link>
            <Link
              to={createPageUrl("Documentation")}
              className={`text-sm font-medium transition-colors ${
                is("Documentation") ? "text-blue-600" : "text-slate-600 hover:text-blue-600"
              }`}
            >
              Documentation
            </Link>

            <a
              href="https://github.com/tdkayy/my-app"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg px-3 py-2 hover:from-blue-700 hover:to-blue-800"
            >
              <Github className="w-4 h-4" />
              View Code
            </a>
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden inline-flex items-center justify-center rounded-lg p-2 hover:bg-slate-100"
            aria-label="Open menu"
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <Menu className="w-6 h-6 text-slate-700" />
          </button>
        </div>
      </header>

      {/* Mobile full-screen menu */}
      {open && (
        <div
          className="fixed inset-0 z-[60] bg-black/95 text-white"
          role="dialog"
          aria-modal="true"
        >
          <div className="mx-auto h-full w-full px-6 pt-6 pb-10 flex flex-col">
            {/* Top row: brand + close */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 grid place-items-center">
                  <Code2 className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold">Adesanya Banking</span>
              </div>
              <button
                className="rounded-lg p-2 hover:bg-white/10"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
              >
                <X className="w-7 h-7" />
              </button>
            </div>

            {/* Links */}
            <div className="mt-10 space-y-8 text-3xl font-semibold">
              <Link
                to={createPageUrl("Dashboard")}
                onClick={() => setOpen(false)}
                className={`block ${is("Dashboard") ? "text-blue-300" : "text-white hover:text-blue-300"}`}
              >
                Dashboard
              </Link>
              <Link
                to={createPageUrl("Documentation")}
                onClick={() => setOpen(false)}
                className={`block ${is("Documentation") ? "text-blue-300" : "text-white hover:text-blue-300"}`}
              >
                Documentation
              </Link>
            </div>

            {/* Bottom actions */}
            <div className="mt-auto">
              <a
                href="https://github.com/tdkayy/my-app"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-base font-medium text-black bg-white rounded-xl px-4 py-3 hover:bg-slate-100"
              >
                <Github className="w-5 h-5" />
                View Code
              </a>

              <div className="mt-6 flex items-center gap-2 text-sm text-slate-300">
                <ExternalLink className="w-4 h-4" />
                <span>Coming soon</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main */}
      <main className="flex-1">{children}</main>

      {/* Footer (unchanged) */}
      <footer className="mt-auto bg-white/90 backdrop-blur border-t border-slate-200">
        <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="text-sm text-slate-600">
            "The best time to plant a tree was 20 years ago. The second best time is now."
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-500">
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
