import React from 'react';
import { ActiveTab, CompanySettings, User } from '../types';
import { BrandLogo } from './BrandLogo';
import {
  FilePlus,
  FileText,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Users,
  X,
  UserCheck,
  FileCheck2,
} from 'lucide-react';
import { INITIAL_USERS } from '../data/initialData';

interface NavigationProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currentUser: User;
  onSwitchUser: (user: User) => void;
  onLogout: () => void;
  settings: CompanySettings;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  invoiceCount: number;
  passportReceiptCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onSwitchUser,
  onLogout,
  mobileMenuOpen,
  setMobileMenuOpen,
  invoiceCount,
  passportReceiptCount = 0,
}) => {
  const [showUserDropdown, setShowUserDropdown] = React.useState(false);

  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'create-invoice' as ActiveTab,
      label: 'Create Invoice',
      icon: FilePlus,
      highlight: true,
    },
    {
      id: 'invoices' as ActiveTab,
      label: 'Invoice History',
      icon: History,
      badge: invoiceCount > 0 ? String(invoiceCount) : undefined,
    },
    {
      id: 'passport-receipts' as ActiveTab,
      label: 'Passport Receipts',
      icon: FileCheck2,
      badge: passportReceiptCount > 0 ? String(passportReceiptCount) : undefined,
    },
    {
      id: 'customers' as ActiveTab,
      label: 'Customers',
      icon: Users,
    },
    {
      id: 'settings' as ActiveTab,
      label: 'Company Settings',
      icon: Settings,
    },
  ];

  const handleNavClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Top Header */}
      <header className="lg:hidden bg-[#0F3B2C] text-white px-4 py-3.5 flex items-center justify-between shadow-md sticky top-0 z-40 no-print">
        <BrandLogo variant="light" size="sm" showSubtitle={false} />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('create-invoice')}
            className="px-2.5 py-1.5 bg-[#7EA64B] hover:bg-[#6f9440] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm"
          >
            <FilePlus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-200 hover:text-white hover:bg-white/10"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 no-print"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation (Desktop Fixed & Mobile Drawer) */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen z-50 lg:z-30 w-72 bg-[#0F3B2C] text-slate-100 flex flex-col justify-between shadow-xl transition-transform duration-300 ease-in-out no-print ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Logo & Brand Header */}
          <div className="p-6 border-b border-emerald-800/60 flex items-center justify-between">
            <BrandLogo variant="light" size="md" />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden text-slate-300 hover:text-white p-1 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Create Invoice Action Button */}
          <div className="px-4 pt-5 pb-2">
            <button
              type="button"
              onClick={() => handleNavClick('create-invoice')}
              className="w-full py-3 px-4 bg-[#7EA64B] hover:bg-[#8bb454] active:bg-[#6f9440] text-white font-bold rounded-xl text-sm shadow-md flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <FilePlus className="w-4 h-4" />
              <span>Create New Invoice</span>
            </button>
          </div>

          {/* Main Navigation Links */}
          <nav className="p-4 space-y-1.5">
            <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-300/70">
              Navigation
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-white text-[#0F3B2C] shadow-sm font-bold'
                      : 'text-slate-200 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#0F3B2C]' : 'text-emerald-300'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        isActive ? 'bg-emerald-100 text-[#0F3B2C]' : 'bg-emerald-900/80 text-emerald-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Bar & Multi-User Switcher */}
        <div className="p-4 border-t border-emerald-800/60 bg-emerald-950/40 relative">
          <div className="flex items-center justify-between">
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => setShowUserDropdown(!showUserDropdown)}
            >
              <div className="w-9 h-9 rounded-xl bg-white text-[#0F3B2C] font-extrabold flex items-center justify-center text-sm shadow-sm">
                {currentUser.avatar || currentUser.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="overflow-hidden max-w-[120px]">
                <p className="text-xs font-bold text-white truncate group-hover:text-emerald-300">
                  {currentUser.name}
                </p>
                <p className="text-[10px] text-emerald-300 uppercase tracking-wider font-semibold">
                  {currentUser.role}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                title="Switch User"
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <UserCheck className="w-4 h-4" />
              </button>
              <button
                type="button"
                title="Log out"
                onClick={onLogout}
                className="p-1.5 text-slate-300 hover:text-rose-300 hover:bg-white/10 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* User Switcher Dropdown (Multi-user concurrency support) */}
          {showUserDropdown && (
            <div className="absolute bottom-16 left-4 right-4 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 text-xs">
              <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 mb-1">
                Active Staff Profiles (4-5 Users)
              </div>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {INITIAL_USERS.map((usr) => (
                  <button
                    key={usr.id}
                    type="button"
                    onClick={() => {
                      onSwitchUser(usr);
                      setShowUserDropdown(false);
                    }}
                    className={`w-full flex items-center gap-2 p-2 rounded-lg text-left transition-colors ${
                      currentUser.id === usr.id
                        ? 'bg-[#0F3B2C] text-white font-bold'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="w-6 h-6 rounded bg-slate-700 text-[10px] flex items-center justify-center font-bold">
                      {usr.avatar}
                    </div>
                    <div className="overflow-hidden flex-1">
                      <p className="truncate font-semibold">{usr.name}</p>
                      <p className="text-[10px] text-slate-400 capitalize">{usr.role}</p>
                    </div>
                    {currentUser.id === usr.id && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
