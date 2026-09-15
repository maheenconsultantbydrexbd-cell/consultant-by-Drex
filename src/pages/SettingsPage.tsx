import React, { useState } from 'react';
import { CompanySettings, User } from '../types';
import { BrandLogo } from '../components/BrandLogo';
import {
  AlertTriangle,
  Check,
  Database,
  HelpCircle,
  Lock,
  RefreshCw,
  Save,
  ShieldCheck,
  Sliders
} from 'lucide-react';

interface SettingsPageProps {
  settings: CompanySettings;
  currentUser: User;
  onSaveSettings: (newSettings: CompanySettings) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  settings,
  currentUser,
  onSaveSettings,
}) => {
  const [formData, setFormData] = useState<CompanySettings>(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const isAdmin = currentUser.role === 'admin';

  const handleChange = (field: keyof CompanySettings, value: any) => {
    if (!isAdmin) return;
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSavedSuccess(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    onSaveSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Role Notice if not Admin */}
      {!isAdmin && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl flex items-center gap-3 text-xs">
          <Lock className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div>
            <p className="font-bold">Settings Locked for Role: {currentUser.role.toUpperCase()}</p>
            <p className="text-amber-700">
              Only employees with the <strong>Admin</strong> role can modify company identity, invoice prefixes, and bank credentials.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0F3B2C] bg-emerald-50 px-2 py-0.5 rounded">
              Configuration
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">
              Access level: <strong className="capitalize text-slate-700">{currentUser.role}</strong>
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-display mt-1">
            Company & Invoice Settings
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure company branding, contact information, sequential numbering, and defaults
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2.5 bg-[#0F3B2C] hover:bg-[#154d3a] text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all self-start md:self-auto"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Saved Successfully</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Official Reference Company Branding */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 font-display">
                Company Brand & Visual Identity
              </h2>
              <p className="text-xs text-slate-500">
                Matches the reference invoice layout and company visiting card
              </p>
            </div>
            <BrandLogo variant="dark" size="sm" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Company Name
              </label>
              <input
                type="text"
                disabled={!isAdmin}
                value={formData.company_name}
                onChange={(e) => handleChange('company_name', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F3B2C] disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Sub-Title / Byline
              </label>
              <input
                type="text"
                disabled={!isAdmin}
                value={formData.tagline}
                onChange={(e) => handleChange('tagline', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F3B2C] disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Official Head Office Address
              </label>
              <input
                type="text"
                disabled={!isAdmin}
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F3B2C] disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Official Phone Number
              </label>
              <input
                type="text"
                disabled={!isAdmin}
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F3B2C] disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Official Email
              </label>
              <input
                type="email"
                disabled={!isAdmin}
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F3B2C] disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>
          </div>
        </div>

        {/* 2. Official Bank Credentials */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 font-display pb-3 border-b border-slate-100">
            Bank & Payment Settlement Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Bank Name
              </label>
              <input
                type="text"
                disabled={!isAdmin}
                value={formData.bank_name}
                onChange={(e) => handleChange('bank_name', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F3B2C] disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Account Name / Beneficiary
              </label>
              <input
                type="text"
                disabled={!isAdmin}
                value={formData.bank_account_name}
                onChange={(e) => handleChange('bank_account_name', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F3B2C] disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Bank Account Number
              </label>
              <input
                type="text"
                disabled={!isAdmin}
                value={formData.bank_account_number}
                onChange={(e) => handleChange('bank_account_number', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F3B2C] disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Branch / Routing Info
              </label>
              <input
                type="text"
                disabled={!isAdmin}
                value={formData.bank_branch}
                onChange={(e) => handleChange('bank_branch', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F3B2C] disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>
          </div>
        </div>

        {/* 3. Invoice Header Design & Branding (Ink Efficiency) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 font-display">
                Invoice Header Design (Ink Saver)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Choose the header appearance when printing invoices and generating PDFs.
              </p>
            </div>
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 text-[11px] font-bold rounded-full border border-emerald-200">
              Save Ink & Printing Costs
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
            {/* Option 1: Classic Minimal (Pure White Ink Saver) */}
            <label
              className={`relative flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${
                formData.invoice_theme === 'classic_minimal' || !formData.invoice_theme
                  ? 'border-[#0F3B2C] bg-emerald-50/40 shadow-sm ring-1 ring-[#0F3B2C]'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <input
                type="radio"
                name="invoice_theme"
                value="classic_minimal"
                disabled={!isAdmin}
                checked={formData.invoice_theme === 'classic_minimal' || !formData.invoice_theme}
                onChange={() => handleChange('invoice_theme', 'classic_minimal')}
                className="sr-only"
              />
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-slate-900">Classic Minimal</span>
                <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-[#0F3B2C]">
                  95% Ink Saved
                </span>
              </div>
              {/* Visual preview thumbnail */}
              <div className="h-16 w-full rounded border border-slate-200 bg-white p-2 mb-2 flex flex-col justify-between overflow-hidden">
                <div className="h-1 bg-[#0F3B2C] w-full rounded-full" />
                <div className="flex justify-between items-center text-[8px] font-bold text-slate-800">
                  <span>CONSULTANT <span className="font-normal text-[6px]">by D&apos;Rex</span></span>
                  <span className="text-[#0F3B2C] font-black">INVOICE</span>
                </div>
                <div className="border-b border-slate-200" />
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Crisp white background with black logo & forest green text. Elegant, professional, and consumes almost zero excess ink.
              </p>
            </label>

            {/* Option 2: Modern Compact (Slim Accent Bar) */}
            <label
              className={`relative flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${
                formData.invoice_theme === 'modern_compact'
                  ? 'border-[#0F3B2C] bg-emerald-50/40 shadow-sm ring-1 ring-[#0F3B2C]'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <input
                type="radio"
                name="invoice_theme"
                value="modern_compact"
                disabled={!isAdmin}
                checked={formData.invoice_theme === 'modern_compact'}
                onChange={() => handleChange('invoice_theme', 'modern_compact')}
                className="sr-only"
              />
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-slate-900">Modern Compact</span>
                <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  90% Ink Saved
                </span>
              </div>
              {/* Visual preview thumbnail */}
              <div className="h-16 w-full rounded border border-slate-200 bg-white p-2 mb-2 flex flex-col justify-between overflow-hidden">
                <div className="h-1.5 bg-[#0F3B2C] w-full rounded-full" />
                <div className="flex justify-between items-center text-[8px] font-bold text-slate-800">
                  <span>CONSULTANT</span>
                  <span className="text-[#0F3B2C] font-black">INVOICE</span>
                </div>
                <div className="h-1 bg-slate-100 w-full" />
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                White header with subtle accent tint badges and clean lines. Perfect contrast and easy on printer cartridges.
              </p>
            </label>

            {/* Option 3: Full Banner (Original Deep Forest Green) */}
            <label
              className={`relative flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${
                formData.invoice_theme === 'full_banner'
                  ? 'border-[#0F3B2C] bg-emerald-50/40 shadow-sm ring-1 ring-[#0F3B2C]'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <input
                type="radio"
                name="invoice_theme"
                value="full_banner"
                disabled={!isAdmin}
                checked={formData.invoice_theme === 'full_banner'}
                onChange={() => handleChange('invoice_theme', 'full_banner')}
                className="sr-only"
              />
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-slate-900">Full Banner</span>
                <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                  High Ink
                </span>
              </div>
              {/* Visual preview thumbnail */}
              <div className="h-16 w-full rounded border border-slate-200 bg-[#0F3B2C] p-2 mb-2 flex flex-col justify-between overflow-hidden text-white">
                <div className="flex justify-between items-center text-[8px] font-bold">
                  <span>CONSULTANT</span>
                  <span className="font-black text-white">INVOICE</span>
                </div>
                <div className="text-[6px] text-white/70">Solid green header</div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                The original deep forest green solid background. Looks great digitally, but consumes high printer ink.
              </p>
            </label>
          </div>
        </div>

        {/* 4. Invoice Numbering & Currency */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 font-display pb-3 border-b border-slate-100">
            Invoice Numbering & Currency
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Invoice Number Prefix
              </label>
              <input
                type="text"
                disabled={!isAdmin}
                value={formData.invoice_prefix}
                onChange={(e) => handleChange('invoice_prefix', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F3B2C] disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Currency Symbol
              </label>
              <input
                type="text"
                disabled={!isAdmin}
                value={formData.currency_symbol}
                onChange={(e) => handleChange('currency_symbol', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F3B2C] disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>
          </div>
        </div>

        {/* 4. Signatory & Default Terms */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 font-display pb-3 border-b border-slate-100">
            Signatory & Invoice Defaults
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Signatory Name (Bottom Right)
              </label>
              <input
                type="text"
                disabled={!isAdmin}
                value={formData.account_manager_name}
                onChange={(e) => handleChange('account_manager_name', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F3B2C] disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Signatory Title
              </label>
              <input
                type="text"
                disabled={!isAdmin}
                value={formData.account_manager_title}
                onChange={(e) => handleChange('account_manager_title', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F3B2C] disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Default Terms & Conditions
              </label>
              <textarea
                rows={3}
                disabled={!isAdmin}
                value={formData.default_terms}
                onChange={(e) => handleChange('default_terms', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F3B2C] disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
