import React, { useState } from 'react';
import { useFinance, CATEGORIES } from '../context/FinanceContext';
import { validateAmount } from '../utils/security';
import { getCategoryTheme } from '../utils/categoryTheme';
import { ChevronLeft, ChevronRight, AlertTriangle, Wallet, Sparkles, Check, ArrowRight, ShieldAlert } from 'lucide-react';

function formatCurrency(n) {
  return '₹' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function getMonthLabel(ym) {
  const [y, m] = ym.split('-');
  return new Date(parseInt(y), parseInt(m) - 1, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

function prevMonth(ym) {
  const [y, m] = ym.split('-').map(Number);
  const d = new Date(y, m - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function nextMonth(ym) {
  const [y, m] = ym.split('-').map(Number);
  const d = new Date(y, m, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export default function Budget() {
  const { dispatch, getMonthBudget, getCategorySpending } = useFinance();
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [editing, setEditing] = useState({});
  const [errors, setErrors] = useState({});
  const [appliedAI, setAppliedAI] = useState(false);

  const budget = getMonthBudget(month);
  const spending = getCategorySpending(month);
  const prevMonthKey = prevMonth(month);
  const prevMonthBudgetData = getMonthBudget(prevMonthKey);
  const prevMonthSpending = getCategorySpending(prevMonthKey);

  function handleBudgetChange(cat, value) {
    setEditing(e => ({ ...e, [cat]: value }));
    setErrors(e => ({ ...e, [cat]: '' }));
  }

  function handleSave(cat) {
    const val = editing[cat] !== undefined ? editing[cat] : (budget[cat] || 0);
    if (val === '' || val === undefined) {
      dispatch({ type: 'SET_BUDGET', payload: { month, category: cat, amount: 0 } });
      return;
    }
    const result = validateAmount(val);
    if (!result.valid) {
      setErrors(e => ({ ...e, [cat]: result.error }));
      return;
    }
    dispatch({ type: 'SET_BUDGET', payload: { month, category: cat, amount: result.value } });
    setEditing(e => { const n = { ...e }; delete n[cat]; return n; });
  }

  function handleApplyAIBudget() {
    const totalCurrent = Object.values(budget).reduce((s, v) => s + (v || 0), 0) || 10000;
    const newBudget = {
      Rent: Math.round(totalCurrent * 0.35),
      Food: Math.round(totalCurrent * 0.25),
      Transport: Math.round(totalCurrent * 0.12),
      Books: Math.round(totalCurrent * 0.10),
      Entertainment: Math.round(totalCurrent * 0.08),
      Health: Math.round(totalCurrent * 0.05),
      Other: Math.round(totalCurrent * 0.05),
    };
    dispatch({
      type: 'SET_MONTH_BUDGET',
      payload: { month, budgetMap: newBudget }
    });
    setAppliedAI(true);
    setTimeout(() => setAppliedAI(false), 2500);
  }

  const totalBudget = Object.values(budget).reduce((s, v) => s + (v || 0), 0);
  const totalSpent = Object.values(spending).reduce((s, v) => s + (v || 0), 0);
  const remaining = totalBudget - totalSpent;
  const overallPercent = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-indigo-700 via-blue-700 to-teal-700 p-8 rounded-3xl text-white shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold uppercase tracking-wider mb-2">
            <Wallet className="w-3.5 h-3.5" />
            Budget Guardian
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Monthly Budget Planner</h1>
          <p className="mt-1 text-indigo-100 text-xs sm:text-sm">
            Control limits per category, track real-time burn rate, and prevent end-of-semester broke situations.
          </p>
        </div>

        {/* Month Selector */}
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 self-start sm:self-auto">
          <button
            onClick={() => setMonth(prevMonth(month))}
            className="p-2 rounded-xl hover:bg-white/20 text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-extrabold text-sm px-3 text-white whitespace-nowrap">
            {getMonthLabel(month)}
          </span>
          <button
            onClick={() => setMonth(nextMonth(month))}
            className="p-2 rounded-xl hover:bg-white/20 text-white transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Allocated Budget</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(totalBudget)}</p>
          <button
            onClick={handleApplyAIBudget}
            className="mt-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            {appliedAI ? '✓ 50/30/20 Applied!' : 'Auto-Optimize with AI 50/30/20'}
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Spent So Far</span>
          <p className="text-2xl font-black text-rose-600 mt-1">{formatCurrency(totalSpent)}</p>
          <p className="text-xs text-slate-500 mt-2">
            {overallPercent.toFixed(0)}% of total allowance consumed
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Available Runway</span>
          <p className={`text-2xl font-black mt-1 ${remaining < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
            {formatCurrency(remaining)}
          </p>
          <p className="text-xs text-slate-500 mt-2">
            {remaining < 0 ? '⚠ Over budget by ' + formatCurrency(Math.abs(remaining)) : 'Safe to spend remainder'}
          </p>
        </div>
      </div>

      {/* Category Budgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CATEGORIES.map((cat) => {
          const theme = getCategoryTheme(cat);
          const Icon = theme.icon;
          const bVal = budget[cat] || 0;
          const sVal = spending[cat] || 0;
          const isOver = sVal > bVal && bVal > 0;
          const pct = bVal > 0 ? Math.min(150, Math.round((sVal / bVal) * 100)) : 0;
          const isEdit = editing[cat] !== undefined;

          return (
            <div
              key={cat}
              className={`bg-white rounded-2xl border p-5 shadow-xs transition-all ${
                isOver ? 'border-rose-300 ring-2 ring-rose-100' : 'border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${theme.bgLight} ${theme.text} border ${theme.border}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{cat}</h3>
                    <p className="text-xs text-slate-400">
                      Spent {formatCurrency(sVal)} of {formatCurrency(bVal)}
                    </p>
                  </div>
                </div>

                {isOver && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                    <AlertTriangle className="w-3 h-3 text-rose-600" />
                    Over by {formatCurrency(sVal - bVal)}
                  </span>
                )}
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden my-3">
                <div
                  className={`h-2.5 rounded-full transition-all duration-500 ${
                    pct > 100
                      ? 'bg-rose-500'
                      : pct > 80
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                <span>{pct}% utilized</span>
                <span>{bVal > 0 ? (bVal - sVal >= 0 ? `${formatCurrency(bVal - sVal)} remaining` : 'Exceeded') : 'No budget set'}</span>
              </div>

              {/* Edit Budget Input */}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-2 text-xs text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    value={isEdit ? editing[cat] : (bVal || '')}
                    onChange={(e) => handleBudgetChange(cat, e.target.value)}
                    placeholder="Set budget limit..."
                    className="w-full pl-7 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <button
                  onClick={() => handleSave(cat)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
                >
                  Save
                </button>
              </div>

              {errors[cat] && (
                <p className="text-[11px] text-rose-600 font-semibold mt-1">{errors[cat]}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
