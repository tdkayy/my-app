import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Code2, ExternalLink, Github, Briefcase } from "lucide-react";

export default function Layout({ children }) {
  const location = useLocation();
  const isActive = (path) =>
    location.pathname === path
      ? "text-blue-600"
      : "text-slate-600 hover:text-blue-600";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/20 bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-blue-700">
                  <Code2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="bg-gradient-to-tr from-slate-800 to-blue-600 bg-clip-text text-lg font-bold text-transparent">
                    Adesanya Banking
                  </h1>
                  <p className="text-xs text-slate-500">Portfolio Project</p>
                </div>
              </div>
            </div>

            <nav className="flex items-center space-x-6">
              <Link
                to="/dashboard"
                className={`text-sm font-medium transition-colors ${isActive("/dashboard")}`}
              >
                Dashboard
              </Link>
              <Link
                to="/documentation"
                className={`text-sm font-medium transition-colors ${isActive("/documentation")}`}
              >
                Documentation
              </Link>
              <a
                href="#"
                className="inline-flex items-center rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 text-sm font-medium text-white transition-all hover:from-blue-700 hover:to-blue-800"
              >
                <Github className="mr-2 h-4 w-4" />
                View Code
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/20 bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center space-x-2">
              <Briefcase className="h-5 w-5 text-blue-600" />
              <span className="text-sm text-slate-600">
                Built as a technical challenge demonstration
              </span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-slate-500">
              <span>Technologies: React, PHP, Expensify API</span>
              <div className="flex items-center space-x-1">
                <ExternalLink className="h-4 w-4" />
                <span>Live Demo</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
