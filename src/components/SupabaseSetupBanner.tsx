import React, { useState, useEffect } from 'react';
import {
  isSupabaseConfigured,
  getSupabaseConfig,
  saveSupabaseCredentials,
  clearSupabaseCredentials,
} from '../lib/supabase';
import {
  CheckCircle2,
  Copy,
  Database,
  ExternalLink,
  HelpCircle,
  KeyRound,
  Link,
  Lock,
  RefreshCw,
  Server,
  Sparkles,
  Trash2,
  Wifi,
  X,
} from 'lucide-react';

interface SupabaseSetupBannerProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const SupabaseSetupBanner: React.FC<SupabaseSetupBannerProps> = ({
  onRefresh,
  isRefreshing = false,
}) => {
  const isConfigured = isSupabaseConfigured();
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Form inputs
  const currentConfig = getSupabaseConfig();
  const [inputUrl, setInputUrl] = useState(currentConfig.url);
  const [inputKey, setInputKey] = useState(currentConfig.key);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);

  useEffect(() => {
    if (showModal) {
      const cfg = getSupabaseConfig();
      setInputUrl(cfg.url);
      setInputKey(cfg.key);
      setInputError(null);
    }
  }, [showModal]);

  const copyEnvSnippet = () => {
    const snippet = `VITE_SUPABASE_URL="${inputUrl || 'https://YOUR-PROJECT.supabase.co'}"\nVITE_SUPABASE_ANON_KEY="${inputKey || 'YOUR-ANON-KEY'}"`;
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setInputError(null);

    const cleanUrl = inputUrl.trim();
    const cleanKey = inputKey.trim();

    if (!cleanUrl) {
      setInputError('Please enter your Supabase Project URL.');
      return;
    }
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      setInputError('Project URL must start with https:// (e.g., https://xyz.supabase.co)');
      return;
    }
    if (!cleanKey) {
      setInputError('Please enter your Supabase anon/public API Key.');
      return;
    }

    setSaveSuccess(true);
    setTimeout(() => {
      saveSupabaseCredentials(cleanUrl, cleanKey);
    }, 600);
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to disconnect Supabase and return to local storage?')) {
      clearSupabaseCredentials();
    }
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
              <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span className="font-semibold text-amber-300 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5" />
                <span>Central Database Ready to Connect</span>
              </span>
              <span className="text-slate-500 hidden sm:inline">•</span>
              <span className="text-slate-400 hidden md:inline">
                Click "Connect Database" to paste URL & Key
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Sync latest data from all team members"
              className="text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 border border-slate-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
              <span>{isRefreshing ? 'Syncing...' : 'Sync Now'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowModal(true)}
            className={`text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all ${
              isConfigured
                ? 'bg-slate-800 text-emerald-400 hover:bg-slate-700 border border-slate-700'
                : 'bg-[#7EA64B] text-slate-950 hover:bg-[#8eb854] shadow-sm'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>{isConfigured ? 'Database Settings' : 'Connect Database'}</span>
          </button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-white text-slate-900 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto space-y-4">
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
                    Paste your Project URL & Key below to activate multi-user live sync
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

            {/* Visual Guide on Where to Find in Supabase */}
            <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs space-y-2">
              <p className="font-bold flex items-center gap-1.5 text-blue-950">
                <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Supabase ড্যাশবোর্ডে URL এবং Key কোথায় পাবেন?</span>
              </p>
              <div className="space-y-1.5 text-[12px] text-blue-900/90 leading-relaxed">
                <p>
                  <strong>উপায় ১ (সবচেয়ে সহজ):</strong> আপনার Supabase ড্যাশবোর্ডের একদম উপরে ডানপাশে থাকা <strong>"Connect"</strong> বাটনটিতে ক্লিক করুন। সেখানে সরাসরি <strong>URL</strong> এবং <strong>anon key</strong> পেয়ে যাবেন।
                </p>
                <p>
                  <strong>উপায় ২:</strong> বাম পাশের মেনুর সবার নিচে <strong>Project Settings (⚙️ আইকন)</strong> &gt; তারপর <strong>API</strong> (বা Data API) অপশনে ক্লিক করুন। সেখানে <strong>Project URL</strong> এবং <strong>Project API Keys (anon public)</strong> রয়েছে।
                </p>
              </div>
            </div>

            {/* Direct Connect Form */}
            <form onSubmit={handleSaveCredentials} className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  1. Project URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="https://xyzabcdefgh.supabase.co"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3B2C] font-mono bg-slate-50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  2. Project API Key (anon / public) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3B2C] font-mono bg-slate-50"
                  required
                />
              </div>

              {inputError && (
                <div className="p-2.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-medium">
                  {inputError}
                </div>
              )}

              {saveSuccess && (
                <div className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Credentials saved! Connecting and refreshing...</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                {isConfigured ? (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-1 font-semibold transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Disconnect</span>
                  </button>
                ) : <span />}

                <button
                  type="submit"
                  disabled={saveSuccess}
                  className="px-5 py-2.5 bg-[#0F3B2C] hover:bg-[#154d3a] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#7EA64B]" />
                  <span>Save &amp; Connect Live DB</span>
                </button>
              </div>
            </form>

            <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
              <button
                type="button"
                onClick={copyEnvSnippet}
                className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
              >
                {copied ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied .env format' : 'Copy as .env format for Vercel'}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-xs text-slate-500 hover:text-slate-800 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
