import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFinance } from '../context/FinanceContext';
import {
  LayoutDashboard, Receipt, Wallet, PiggyBank,
  GraduationCap, Briefcase, BarChart3, LogOut, Menu, X, BookOpen,
  Sparkles, Users, ShieldCheck, RefreshCw
} from 'lucide-react';
import SecurityModal from './SecurityModal';
import { seedDemoData } from '../utils/demoData';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/ai-copilot', label: 'AI Copilot', icon: Sparkles, badge: 'AI' },
  { to: '/expenses', label: 'Expenses', icon: Receipt },
  { to: '/budget', label: 'Budget Planner', icon: Wallet },
  { to: '/savings', label: 'Savings Goals', icon: PiggyBank },
  { to: '/scholarships', label: 'Scholarships', icon: GraduationCap },
  { to: '/parttime', label: 'Part-Time Jobs', icon: Briefcase },
  { to: '/splitbill', label: 'Split Roommate Bill', icon: Users, badge: 'Hostel' },
  { to: '/insights', label: 'Insights & Charts', icon: BarChart3 },
];

export default function Layout({ children }) {
  const { logout, userName } = useAuth();
  const { dispatch, getMonthTotal, getTotalBudget } = useFinance();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [securityModalOpen, setSecurityModalOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  function handleResetDemo() {
    const demo = seedDemoData();
    dispatch({
      type: 'LOAD_DATA',
      payload: {
        expenses: demo.expenses,
        budgets: demo.budgets,
        savingsGoals: demo.savingsGoals,
      }
    });
    alert('✓ Preloaded realistic student demo dataset successfully!');
  }

  const currentMonth = new Date().toISOString().slice(0, 7);
  const spent = getMonthTotal(currentMonth);
  const budget = getTotalBudget(currentMonth);
  const healthPercent = budget > 0 ? Math.max(30, Math.min(98, Math.round(100 - (spent / budget) * 40))) : 86;

  return (
    <div className="min-h-screen flex bg-[#0D1117] font-sans text-[#94A3B8]">
      <SecurityModal isOpen={securityModalOpen} onClose={() => setSecurityModalOpen(false)} />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Midnight Slate Surface with subtle border */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-[#161B22] text-[#F8FAFC] flex flex-col
        border-r border-[#30363D]
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#30363D]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#8B5CF6] via-[#7C3AED] to-[#06B6D4] flex items-center justify-center shadow-lg shadow-[#8B5CF6]/30">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-tight text-[#F8FAFC]">StudyPocket</span>
                <span className="px-1.5 py-0.2 text-[10px] font-black rounded bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white uppercase">AI</span>
              </div>
              <p className="text-[11px] text-[#94A3B8] font-medium">Student Financial OS</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-[#94A3B8] hover:text-[#F8FAFC]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="px-5 py-4 border-b border-[#30363D] bg-[#0D1117]/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#8B5CF6] to-[#06B6D4] text-white font-bold flex items-center justify-center text-xs shadow-md">
              {(userName || 'S')[0].toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-[#94A3B8] font-medium">Active Student</p>
              <p className="text-sm font-bold text-[#F8FAFC] truncate">{userName || 'Aryan Sharma'}</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ to, label, icon: Icon, badge }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all group
                ${isActive
                  ? 'bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-[#F8FAFC] shadow-lg shadow-[#8B5CF6]/30'
                  : 'text-[#94A3B8] hover:bg-[#1F242C] hover:text-[#F8FAFC]'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110" />
                <span>{label}</span>
              </div>
              {badge && (
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-[#06B6D4]/20 text-[#06B6D4] border border-[#06B6D4]/40">
                  {badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer Controls */}
        <div className="p-4 border-t border-[#30363D] space-y-2">
          {/* Security Status Pill */}
          <button
            onClick={() => setSecurityModalOpen(true)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#0D1117] hover:bg-[#1F242C] border border-[#30363D] text-xs font-semibold text-emerald-400 transition-colors"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Security Vault</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">256-bit</span>
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#94A3B8] hover:bg-rose-950/40 hover:text-rose-400 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Lock & Exit Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden bg-[#0D1117]">
        {/* Top Navbar */}
        <header className="bg-[#161B22]/90 backdrop-blur-md border-b border-[#30363D] sticky top-0 z-20 px-6 py-3.5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-[#30363D] text-[#94A3B8] hover:bg-[#1F242C]"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs font-bold text-[#94A3B8]">FINANCIAL HEALTH:</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#06B6D4]/15 text-[#06B6D4] border border-[#06B6D4]/30 text-xs font-extrabold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#06B6D4] animate-pulse"></span>
                {healthPercent}/100 Resilient
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setSecurityModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs font-bold hover:bg-emerald-500/20 transition-all"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Security Audit A+</span>
            </button>

            <button
              onClick={handleResetDemo}
              title="Reload Sample Student Data for testing"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#8B5CF6]/40 bg-[#8B5CF6]/15 text-[#8B5CF6] text-xs font-bold hover:bg-[#8B5CF6]/25 transition-all shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#8B5CF6]" />
              <span>⚡ Reset Demo Data</span>
            </button>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 bg-[#0D1117] text-[#94A3B8]">
          {children}
        </main>
      </div>
    </div>
  );
}
