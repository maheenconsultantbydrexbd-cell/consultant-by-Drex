import React, { useState } from 'react';
import { BrandLogo } from '../components/BrandLogo';
import { User } from '../types';
import { isSupabaseConfigured, supabaseSignIn, supabaseSignUp } from '../lib/supabase';
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  LogIn,
  Mail,
  ShieldCheck,
  Sparkles,
  UserPlus
} from 'lucide-react';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('sanjidtalukder2020@gmail.com');
  const [password, setPassword] = useState('drex2026');
  const [role, setRole] = useState<'admin' | 'manager' | 'staff'>('staff');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setInfoMessage(null);

    if (isSignUpMode) {
      if (!name.trim()) {
        setError('Please enter your full name.');
        setIsLoading(false);
        return;
      }

      const { user, error: signUpError } = await supabaseSignUp(
        email.trim(),
        password,
        name.trim(),
        role
      );

      setIsLoading(false);

      if (signUpError) {
        setError(signUpError);
      } else if (user) {
        onLogin(user);
      }
    } else {
      const { user, error: signInError } = await supabaseSignIn(email.trim(), password);
      setIsLoading(false);

      if (signInError) {
        setError(signInError);
      } else if (user) {
        onLogin(user);
      }
    }
  };

  const handleForgotPassword = () => {
    if (!email) {
      setError('Please enter your work email first.');
      return;
    }
    setInfoMessage(`Password reset request sent for ${email}. Check your inbox.`);
  };

  return (
    <div className="min-h-screen w-full bg-white text-slate-900 flex flex-col lg:flex-row overflow-x-hidden">
      {/* ========================================================================= */}
      {/* LEFT PANEL: Professional Brand & Suite Presentation (Full Height) */}
      {/* ========================================================================= */}
      <div className="w-full lg:w-1/2 xl:w-[46%] bg-[#0F3B2C] text-white p-6 sm:p-10 lg:p-12 xl:p-16 flex flex-col justify-between relative overflow-hidden select-none min-h-[480px] lg:min-h-screen">
        {/* Subtle Halftone / Dot Matrix Grid Effect */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#ffffff 1.5px, transparent 1.5px)',
            backgroundSize: '20px 20px',
          }}
        />

        {/* Left Top Brand Header */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#7EA64B] flex items-center justify-center text-white font-black shadow-sm">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <span className="font-extrabold text-xl text-white tracking-tight font-display block leading-none">
                Consultant By D'Rex
              </span>
              <span className="text-[11px] text-emerald-300 tracking-wider font-semibold uppercase mt-1 block">
                Office Management Suite
              </span>
            </div>
          </div>

          <span className="hidden sm:inline-block px-3 py-1 bg-white/10 text-emerald-200 text-xs font-semibold rounded-full border border-white/15">
            Office Portal
          </span>
        </div>

        {/* Centerpiece Vector Illustration */}
        <div className="relative z-10 my-8 lg:my-auto flex flex-col items-center justify-center">
          <div className="w-full max-w-[340px] sm:max-w-[400px] aspect-[4/3] relative flex items-center justify-center">
              <svg
                viewBox="0 0 400 320"
                className="w-full h-full drop-shadow-md"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Background Halftone Pattern Card Accent */}
                <rect x="30" y="40" width="140" height="150" rx="16" fill="#17523F" fillOpacity="0.5" />
                
                {/* Desk / Base Line */}
                <rect x="20" y="270" width="360" height="6" rx="3" fill="#1A5E48" />

                {/* Floating Invoice Document (Back right) */}
                <g transform="translate(180, 25)">
                  <rect x="0" y="0" width="150" height="200" rx="10" fill="#FFFFFF" />
                  {/* Invoice Header Stripe */}
                  <rect x="0" y="0" width="150" height="28" rx="10" fill="#EBF2ED" />
                  <rect x="0" y="18" width="150" height="10" fill="#EBF2ED" />
                  <rect x="15" y="10" width="40" height="8" rx="2" fill="#0F3B2C" />
                  <rect x="105" y="10" width="30" height="6" rx="2" fill="#7EA64B" />

                  {/* Invoice Table Rows */}
                  <rect x="15" y="44" width="120" height="18" rx="3" fill="#F4F7F5" />
                  <rect x="20" y="50" width="45" height="6" rx="2" fill="#CBD5E1" />
                  <rect x="105" y="50" width="25" height="6" rx="2" fill="#94A3B8" />

                  <rect x="15" y="68" width="120" height="18" rx="3" fill="#FFFFFF" />
                  <rect x="20" y="74" width="55" height="6" rx="2" fill="#E2E8F0" />
                  <rect x="105" y="74" width="25" height="6" rx="2" fill="#CBD5E1" />

                  <rect x="15" y="92" width="120" height="18" rx="3" fill="#F4F7F5" />
                  <rect x="20" y="98" width="50" height="6" rx="2" fill="#CBD5E1" />
                  <rect x="105" y="98" width="25" height="6" rx="2" fill="#94A3B8" />

                  <rect x="15" y="116" width="120" height="18" rx="3" fill="#FFFFFF" />
                  <rect x="20" y="122" width="40" height="6" rx="2" fill="#E2E8F0" />
                  <rect x="105" y="122" width="25" height="6" rx="2" fill="#CBD5E1" />

                  {/* Total & Signature */}
                  <line x1="15" y1="145" x2="135" y2="145" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="3 3" />
                  <rect x="20" y="156" width="35" height="6" rx="2" fill="#0F3B2C" />
                  <rect x="95" y="153" width="35" height="12" rx="3" fill="#7EA64B" />
                  
                  {/* Authorized Stamp / Signature mark */}
                  <path d="M20 182 Q 35 174, 50 182 T 80 180" stroke="#0F3B2C" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6" />
                </g>

                {/* Verified / Paid Checkmark Speech Bubble */}
                <g transform="translate(142, 65)">
                  <circle cx="22" cy="22" r="22" fill="#FFFFFF" />
                  <circle cx="22" cy="22" r="18" fill="#7EA64B" />
                  <path d="M15 22 L20 27 L29 17" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  {/* Bubble tail */}
                  <path d="M8 32 L3 38 L16 33 Z" fill="#FFFFFF" />
                </g>

                {/* Office Character (Inspired by reference art) */}
                <g transform="translate(50, 80)">
                  {/* Hair back */}
                  <path d="M60 40 C 35 35, 20 85, 25 140 C 40 135, 55 130, 70 130 Z" fill="#0A1F17" />

                  {/* Body / Blouse */}
                  <path d="M40 140 C 25 160, 15 200, 15 220 L 155 220 C 155 200, 140 160, 125 140 Z" fill="#7EA64B" />
                  {/* Shirt collar */}
                  <polygon points="85,140 70,165 85,160" fill="#FFFFFF" />
                  <polygon points="85,140 100,165 85,160" fill="#FFFFFF" />

                  {/* Neck */}
                  <rect x="75" y="115" width="20" height="25" fill="#E6A887" />

                  {/* Head / Face */}
                  <path d="M60 70 C 60 45, 110 45, 110 70 C 110 100, 95 120, 85 120 C 75 120, 60 100, 60 70 Z" fill="#F4BA97" />

                  {/* Hair Front / Bangs */}
                  <path d="M55 60 C 65 35, 115 35, 115 65 C 105 55, 80 50, 65 65 Z" fill="#0A1F17" />
                  <path d="M105 60 C 115 70, 115 110, 105 135 C 112 120, 115 85, 112 70 Z" fill="#0A1F17" />

                  {/* Spectacles / Glasses */}
                  <circle cx="75" cy="78" r="10" stroke="#0F3B2C" strokeWidth="2.5" fill="none" />
                  <circle cx="95" cy="78" r="10" stroke="#0F3B2C" strokeWidth="2.5" fill="none" />
                  <line x1="85" y1="78" x2="85" y2="78" stroke="#0F3B2C" strokeWidth="2.5" />
                  
                  {/* Facial Features */}
                  <path d="M72 88 Q 85 96, 96 88" stroke="#A75F3B" strokeWidth="2" strokeLinecap="round" fill="none" />

                  {/* Hand holding glasses */}
                  <path d="M50 82 C 45 75, 48 65, 58 65 C 64 65, 68 70, 68 78 Z" fill="#F4BA97" />

                  {/* Left Hand Holding Invoice Scroll */}
                  <path d="M125 155 C 135 150, 150 160, 145 175 C 140 185, 130 190, 120 185 Z" fill="#F4BA97" />
                  
                  {/* Paper roll in hand */}
                  <path d="M120 140 L 155 135 L 140 220 L 115 220 Z" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />
                  <line x1="124" y1="155" x2="148" y2="152" stroke="#94A3B8" strokeWidth="2" />
                  <line x1="122" y1="170" x2="142" y2="167" stroke="#94A3B8" strokeWidth="2" />
                  <line x1="120" y1="185" x2="138" y2="182" stroke="#94A3B8" strokeWidth="2" />
                </g>

                {/* Desk Items: Calculator & Pencil */}
                <g transform="translate(60, 235)">
                  {/* Calculator Body */}
                  <rect x="0" y="0" width="55" height="35" rx="5" fill="#E2E8F0" />
                  <rect x="5" y="4" width="45" height="9" rx="2" fill="#0F3B2C" />
                  <rect x="8" y="6" width="20" height="5" rx="1" fill="#7EA64B" />

                  {/* Calculator Keys */}
                  <rect x="6" y="16" width="8" height="6" rx="1.5" fill="#CBD5E1" />
                  <rect x="18" y="16" width="8" height="6" rx="1.5" fill="#CBD5E1" />
                  <rect x="30" y="16" width="8" height="6" rx="1.5" fill="#CBD5E1" />
                  <rect x="42" y="16" width="8" height="6" rx="1.5" fill="#7EA64B" />

                  <rect x="6" y="24" width="8" height="6" rx="1.5" fill="#CBD5E1" />
                  <rect x="18" y="24" width="8" height="6" rx="1.5" fill="#CBD5E1" />
                  <rect x="30" y="24" width="8" height="6" rx="1.5" fill="#CBD5E1" />
                  <rect x="42" y="24" width="8" height="6" rx="1.5" fill="#0F3B2C" />
                </g>

                {/* Pencil on Desk */}
                <g transform="translate(130, 252)">
                  <rect x="0" y="0" width="42" height="6" rx="2" fill="#E2E8F0" />
                  <polygon points="42,0 48,3 42,6" fill="#F4BA97" />
                  <polygon points="46,2 48,3 46,4" fill="#0F3B2C" />
                  <rect x="0" y="0" width="7" height="6" rx="1" fill="#7EA64B" />
                </g>

                {/* Small Plant Pot */}
                <g transform="translate(290, 220)">
                  <polygon points="10,25 35,25 30,50 15,50" fill="#FFFFFF" />
                  <path d="M12 25 Q 5 0, 18 10 Q 15 25, 20 25" fill="#7EA64B" />
                  <path d="M22 25 Q 25 -5, 30 8 Q 28 25, 25 25" fill="#8EBA55" />
                  <path d="M28 25 Q 40 5, 34 16 Q 30 25, 28 25" fill="#587932" />
                </g>
              </svg>
            </div>
          </div>

          {/* Left Footer Summary Text */}
          <div className="relative z-10 pt-2 border-t border-emerald-800/60">
            <h3 className="text-base sm:text-lg font-bold text-white font-display">
              Streamlined Office Invoicing
            </h3>
            <p className="text-xs text-emerald-100/80 mt-1 leading-relaxed">
              Real-time multi-user PostgreSQL database, A4 print rendering, and instant payment tracking for your team.
            </p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT PANEL: Login Form (Clean, Modern, Full-Height Setup) */}
        {/* ========================================================================= */}
        <div className="w-full lg:w-1/2 xl:w-[54%] p-6 sm:p-10 lg:p-12 xl:p-16 flex flex-col justify-between bg-white min-h-screen overflow-y-auto">
          <div className="w-full max-w-md mx-auto my-auto py-6">
            {/* Top Right Logo Header */}
            <div className="flex items-center justify-between mb-8">
              <BrandLogo variant="dark" size="md" showSubtitle={false} />
              
              <div className="w-10 h-10 rounded-xl bg-[#0F3B2C]/5 border border-[#0F3B2C]/10 flex items-center justify-center text-[#0F3B2C]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>

            {/* Title & Subtitle Matching Reference */}
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
                {isSignUpMode ? 'Register New Staff' : 'Log in to Invoice'}
              </h1>
              <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                {isSignUpMode
                  ? 'Create an authorized employee account for the office suite.'
                  : 'Glad to have you back! Please log in to your account.'}
              </p>
            </div>

            {/* Error Notification Banner */}
            {error && (
              <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
                <span className="font-medium leading-relaxed">{error}</span>
              </div>
            )}

            {/* Info / Reset Notification Banner */}
            {infoMessage && (
              <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600" />
                <span className="font-medium leading-relaxed">{infoMessage}</span>
              </div>
            )}

            {/* Interactive Authentication Form */}
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {isSignUpMode && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Sanjid Talukder"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7EA64B] focus:border-transparent focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Assigned Office Role *
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as any)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#7EA64B] focus:border-transparent focus:bg-white transition-all"
                    >
                      <option value="staff">Staff (Create & View Invoices, Record Payments)</option>
                      <option value="manager">Manager (Manage Invoices, Customers & Payments)</option>
                      <option value="admin">Admin (Full System & Company Settings Access)</option>
                    </select>
                  </div>
                </>
              )}

              {/* Email / Username Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Email / Username
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7EA64B] focus:border-transparent focus:bg-white transition-all"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-3.5 pointer-events-none" />
                </div>
              </div>

              {/* Password Input with Eye / Show-Hide Toggle */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7EA64B] focus:border-transparent focus:bg-white transition-all"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-3.5 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-700 p-0.5 rounded transition-colors"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox & Forgot Password */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-[#0F3B2C] focus:ring-[#7EA64B] cursor-pointer"
                  />
                  <span className="text-xs font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
                    Remember Me
                  </span>
                </label>

                {!isSignUpMode && (
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xs font-bold text-[#0F3B2C] hover:text-[#7EA64B] transition-colors"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>

              {/* Primary Action Button (App Brand Solid Colors: #0F3B2C & #7EA64B) */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-5 bg-[#0F3B2C] hover:bg-[#154d3a] active:bg-[#0a271d] text-white font-bold rounded-xl text-sm shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none disabled:shadow-none"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{isSignUpMode ? 'Register Account' : 'Log In'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Bottom Register Switcher Link */}
            <div className="mt-6 text-center">
              <p className="text-xs text-slate-500">
                {isSignUpMode ? (
                  <>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUpMode(false);
                        setError(null);
                        setInfoMessage(null);
                      }}
                      className="font-bold text-[#0F3B2C] hover:text-[#7EA64B] underline transition-colors ml-1"
                    >
                      Sign In here
                    </button>
                  </>
                ) : (
                  <>
                    Haven't joined yet?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUpMode(true);
                        setError(null);
                        setInfoMessage(null);
                      }}
                      className="font-bold text-[#0F3B2C] hover:text-[#7EA64B] underline transition-colors ml-1"
                    >
                      Register now!
                    </button>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
    </div>
  );
};
