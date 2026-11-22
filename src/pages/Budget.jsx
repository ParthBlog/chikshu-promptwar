import React, { useState } from 'react';
import { useFinance, CATEGORIES } from '../context/FinanceContext';
import { validateAmount } from '../utils/security';
import { ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';

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

  const budget = getMonthBudget(month);
  const spending = getCategorySpending(month);
  const prevMonthData = getMonthBudget(prevMonth(month));

  function handleBudgetChange(cat, value) {
    setEditing(e => ({ ...e, [cat]: value }));
    setErrors(e => ({ ...e, [cat]: '' }));
  }

  function handleSave(cat) {
    const val = editing[cat] !== undefined ? editing[cat] : (budget[cat] || 0);
    if (val === '' || val === undefined) {
      // Remove budget for this category
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

  const totalBudget = Object.values(budget).reduce((s, v) => s + (v || 0), 0);
  const totalSpent = Object.values(spending).reduce((s, v) => s + (v || 0), 0);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header + Month selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Budget Manager</h1>
          <p className="text-gray-500 text-sm mt-0.5">Set and track monthly spending limits</p>
        </div>
        <div className="flex items-center gap-2 border border-black rounded-xl px-4 py-2">
          <button onClick={() => setMonth(prevMonth(month))} className="hover:bg-gray-100 rounded p-1">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-semibold text-sm min-w-32 text-center">{getMonthLabel(month)}</span>
          <button onClick={() => setMonth(nextMonth(month))} className="hover:bg-gray-100 rounded p-1">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="border border-black rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Budget</p>
          <p className="text-xl font-bold">{formatCurrency(totalBudget)}</p>
        </div>
        <div className="border border-black rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Spent</p>
          <p className="text-xl font-bold">{formatCurrency(totalSpent)}</p>
        </div>
        <div className={`border border-black rounded-xl p-4 col-span-2 md:col-span-1 ${totalBudget > 0 && totalSpent > totalBudget ? 'bg-black text-white' : ''}`}>
          <p className={`text-xs uppercase tracking-wide mb-1 ${totalBudget > 0 && totalSpent > totalBudget ? 'text-gray-400' : 'text-gray-500'}`}>Remaining</p>
          <p className="text-xl font-bold">{formatCurrency(Math.max(0, totalBudget - totalSpent))}</p>
          {totalBudget > 0 && totalSpent > totalBudget && (
            <p className="text-xs text-red-300 mt-0.5 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Over by {formatCurrency(totalSpent - totalBudget)}
            </p>
          )}
        </div>
      </div>

      {/* Category cards */}
      <div className="space-y-4">
        {CATEGORIES.map(cat => {
          const budgetAmt = budget[cat] || 0;
          const spentAmt = spending[cat] || 0;
          const prevBudget = prevMonthData[cat] || 0;
          const pct = budgetAmt > 0 ? Math.min(100, (spentAmt / budgetAmt) * 100) : 0;
          const isOver = budgetAmt > 0 && spentAmt > budgetAmt;
          const editVal = editing[cat] !== undefined ? editing[cat] : (budgetAmt || '');

          return (
            <div key={cat} className={`border ${isOver ? 'border-black' : 'border-black'} rounded-xl p-5`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <h3 className="font-bold">{cat}</h3>
                  {isOver && (
                    <span className="flex items-center gap-1 text-xs bg-black text-white px-2 py-0.5 rounded-full">
                      <AlertTriangle className="w-3 h-3" /> Over budget
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={editVal}
                    onChange={e => handleBudgetChange(cat, e.target.value)}
                    onBlur={() => handleSave(cat)}
                    onKeyDown={e => e.key === 'Enter' && handleSave(cat)}
                    placeholder="Set budget"
                    className="w-32 border border-black rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-black text-right"
                  />
                  <span className="text-xs text-gray-400">₹</span>
                </div>
              </div>

              {errors[cat] && <p className="text-xs text-black mb-2">{errors[cat]}</p>}

              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div
                  className={`h-3 rounded-full transition-all ${isOver ? 'bg-black' : 'bg-black'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className="flex justify-between text-xs text-gray-500">
                <span>Spent: {formatCurrency(spentAmt)} {budgetAmt > 0 ? `(${pct.toFixed(0)}%)` : ''}</span>
                <div className="flex items-center gap-3">
                  {prevBudget > 0 && (
                    <span className="text-gray-400">Last month: {formatCurrency(prevBudget)}</span>
                  )}
                  {budgetAmt > 0 && <span>Limit: {formatCurrency(budgetAmt)}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-gray-400 text-center mt-6">
        Click on the amount field to set or update a budget limit. Press Enter or click away to save.
      </p>
    </div>
  );
}
