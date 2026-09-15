import React, { useState } from 'react';
import { isSupabaseConfigured } from '../lib/supabase';
import {
  CheckCircle2,
  Copy,
  Database,
  ExternalLink,
  Info,
  Server,
  Sparkles,
  Wifi,
  X
} from 'lucide-react';

export const SupabaseSetupBanner: React.FC = () => {
  const isConfigured = isSupabaseConfigured();
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyEnvSnippet = () => {
    const snippet = `VITE_SUPABASE_URL="https://YOUR-PROJECT.supabase.co"\nVITE_SUPABASE_ANON_KEY="YOUR-ANON-KEY"`;
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <>
      <div className="bg-slate-900 text-slate-200 text-xs px-4 py-2 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 no-print">
        <div className="flex items-center gap-2">
          {isConfigured ? (
            <>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5" />
                <span>Supabase PostgreSQL Central DB: Active</span>
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400 hidden sm:inline flex items-center gap-1">
                <Wifi className="w-3 h-3 text-emerald-400" />
                Multi-User Live Sync Enabled
              </span>
            </>
          ) : (
            <>
              <span className="flex h-2 w-2 rounded-full bg-amber-400"></span>
              <span className="font-semibold text-amber-300 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5" />
                <span>Central Database Ready for Supabase Connection</span>
              </span>
              <span className="text-slate-500 hidden sm:inline">•</span>
              <span className="text-slate-400 hidden md:inline">
                Add <code className="text-emerald-300 font-mono">VITE_SUPABASE_URL</code> to activate cloud sync
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="text-[11px] font-bold text-[#7EA64B] hover:text-emerald-300 underline underline-offset-2 flex items-center gap-1"
          >
            <span>Supabase Setup & SQL Schema</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-white text-slate-900 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#0F3B2C] flex items-center justify-center">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Connect Free Supabase PostgreSQL
                  </h3>
                  <p className="text-xs text-slate-500">
                    One-time setup for multi-user office synchronization
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-600">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900">
                <p className="font-bold mb-1">How it works for your office:</p>
                <p>
                  1. Go to{' '}
                  <a
                    href="https://supabase.com"
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold underline text-[#0F3B2C]"
                  >
                    Supabase.com
                  </a>{' '}
                  and create a 100% free project.
                  <br />
                  2. Open the <strong>SQL Editor</strong> in Supabase and paste the contents of{' '}
                  <code className="bg-white/80 px-1 py-0.5 rounded font-mono font-bold text-slate-900">
                    supabase/schema.sql
                  </code>{' '}
                  (already generated in your project). Click <strong>RUN</strong>.
                  <br />
                  3. In Project Settings &gt; API, copy your <strong>Project URL</strong> and{' '}
                  <strong>Anon Public Key</strong>.
                  <br />
                  4. Add them to your environment variables or Vercel settings.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Environment Variables for Vercel / .env:
                </label>
                <div className="relative">
                  <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl font-mono text-[11px] overflow-x-auto">
                    VITE_SUPABASE_URL="https://YOUR_PROJECT_ID.supabase.co"
                    <br />
                    VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6Ikp..."
                  </pre>
                  <button
                    type="button"
                    onClick={copyEnvSnippet}
                    className="absolute right-2.5 top-2.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-[10px] font-bold flex items-center gap-1 border border-slate-700"
                  >
                    {copied ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <p className="font-bold text-slate-800">✨ Built-in Concurrency & Security Features:</p>
                <ul className="list-disc pl-4 space-y-0.5 text-slate-600">
                  <li>Atomic PostgreSQL sequence prevents two users getting the same invoice number.</li>
                  <li>Row Level Security (RLS) protects data at the database level.</li>
                  <li>Realtime channel automatically updates all employees' screens upon new invoices.</li>
                </ul>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-[#0F3B2C] hover:bg-[#154d3a] text-white text-xs font-bold rounded-xl"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
