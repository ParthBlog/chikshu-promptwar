import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFinance, CATEGORIES } from '../context/FinanceContext';
import { validateAmount, validateText, sanitizeText } from '../utils/security';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, Plus, X } from 'lucide-react';

function getCurrentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function formatCurrency(n) {
  return '₹' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function StatCard({ label, value, sub, icon: Icon, inverted }) {
  return (
    <div className={`border border-black rounded-xl p-5 flex items-start gap-4 ${inverted ? 'bg-black text-white' : 'bg-white'}`}>
      <div className={`p-2 rounded-lg ${inverted ? 'bg-white' : 'bg-black'}`}>
        <Icon className={`w-5 h-5 ${inverted ? 'text-black' : 'text-white'}`} />
      </div>
      <div>
        <p className={`text-xs font-medium uppercase tracking-wide ${inverted ? 'text-gray-400' : 'text-gray-500'}`}>{label}</p>
        <p className="text-2xl font-bold mt-0.5">{value}</p>
        {sub && <p className={`text-xs mt-1 ${inverted ? 'text-gray-400' : 'text-gray-500'}`}>{sub}</p>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { userName } = useAuth();
  const navigate = useNavigate();
  const { expenses, dispatch, getMonthTotal, getTotalBudget, getCategorySpending, savingsGoals } = useFinance();

  const month = getCurrentMonth();
  const monthTotal = getMonthTotal(month);
  const totalBudget = getTotalBudget(month);
  const remaining = totalBudget - monthTotal;
  const savingsRate = totalBudget > 0 ? Math.max(0, ((remaining / totalBudget) * 100)).toFixed(1) : 0;
  const totalSaved = savingsGoals.reduce((s, g) => s + (g.savedAmount || 0), 0);

  const recent = expenses.slice(0, 5);

  // Quick add modal
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ amount: '', category: 'Food', description: '', date: new Date().toISOString().slice(0, 10) });
  const [formError, setFormError] = useState('');

  function handleQuickAdd(e) {
    e.preventDefault();
    const amtResult = validateAmount(form.amount);
    if (!amtResult.valid) { setFormError(amtResult.error); return; }
    const descResult = validateText(form.description, { maxLength: 100, fieldName: 'Description' });
    if (!descResult.valid) { setFormError(descResult.error); return; }
    dispatch({
      type: 'ADD_EXPENSE',
      payload: {
        id: Date.now().toString(),
        amount: amtResult.value,
        category: form.category,
        description: descResult.value,
        date: form.date,
      }
    });
    setShowAdd(false);
    setForm({ amount: '', category: 'Food', description: '', date: new Date().toISOString().slice(0, 10) });
    setFormError('');
  }

  const catSpend = getCategorySpending(month);
  const topCategory = Object.entries(catSpend).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Welcome back, {userName || 'Student'} 👋
        </h1>
        <p className="text-gray-500 mt-1">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Spent"
          value={formatCurrency(monthTotal)}
          sub="This month"
          icon={TrendingDown}
          inverted={false}
        />
        <StatCard
          label="Remaining Budget"
          value={formatCurrency(Math.max(0, remaining))}
          sub={remaining < 0 ? '⚠ Over budget' : 'Available'}
          icon={Wallet}
          inverted={remaining < 0}
        />
        <StatCard
          label="Savings Rate"
          value={`${savingsRate}%`}
          sub="Of monthly budget"
          icon={TrendingUp}
          inverted={false}
        />
        <StatCard
          label="Total Saved"
          value={formatCurrency(totalSaved)}
          sub="Across all goals"
          icon={PiggyBank}
          inverted={false}
        />
      </div>

      {/* Budget health */}
      {totalBudget > 0 && (
        <div className="border border-black rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-lg">Budget Health</h2>
            <span className={`text-sm font-semibold px-2 py-0.5 rounded border ${remaining >= 0 ? 'border-black bg-white' : 'bg-black text-white'}`}>
              {remaining >= 0 ? 'On Track' : 'Over Budget'}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="h-3 rounded-full bg-black transition-all"
              style={{ width: `${Math.min(100, (monthTotal / totalBudget) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1.5">
            <span>Spent: {formatCurrency(monthTotal)}</span>
            <span>Budget: {formatCurrency(totalBudget)}</span>
          </div>
          {topCategory && (
            <p className="text-sm text-gray-600 mt-2">
              Highest spend: <strong>{topCategory[0]}</strong> ({formatCurrency(topCategory[1])})
            </p>
          )}
        </div>
      )}

      {/* Recent + Quick Add */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent transactions */}
        <div className="border border-black rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">Recent Transactions</h2>
            <button
              onClick={() => navigate('/expenses')}
              className="text-sm underline font-medium"
            >
              View all
            </button>
          </div>
          {recent.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-6">No expenses yet. Add your first one!</p>
          ) : (
            <ul className="space-y-3">
              {recent.map(exp => (
                <li key={exp.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium text-sm">{exp.description}</p>
                    <p className="text-xs text-gray-500">{exp.category} • {exp.date}</p>
                  </div>
                  <span className="font-bold text-sm">{formatCurrency(exp.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Quick actions */}
        <div className="border border-black rounded-xl p-5">
          <h2 className="font-bold text-lg mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button
              onClick={() => setShowAdd(true)}
              className="w-full flex items-center gap-3 p-4 border border-black rounded-xl hover:bg-black hover:text-white transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Add Expense
            </button>
            <button
              onClick={() => navigate('/budget')}
              className="w-full flex items-center gap-3 p-4 border border-black rounded-xl hover:bg-black hover:text-white transition-colors font-medium"
            >
              <Wallet className="w-5 h-5" />
              Set Budget
            </button>
            <button
              onClick={() => navigate('/savings')}
              className="w-full flex items-center gap-3 p-4 border border-black rounded-xl hover:bg-black hover:text-white transition-colors font-medium"
            >
              <PiggyBank className="w-5 h-5" />
              Add Savings Goal
            </button>
            <button
              onClick={() => navigate('/insights')}
              className="w-full flex items-center gap-3 p-4 border border-black rounded-xl hover:bg-black hover:text-white transition-colors font-medium"
            >
              <TrendingUp className="w-5 h-5" />
              View Insights
            </button>
          </div>
        </div>
      </div>

      {/* Quick Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-black rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg">Quick Add Expense</h3>
              <button onClick={() => setShowAdd(false)}><X className="w-5 h-5" /></button>
            </div>
            {formError && <p className="text-sm text-black bg-gray-100 border border-black p-2 rounded mb-3">{formError}</p>}
            <form onSubmit={handleQuickAdd} className="space-y-3">
              <div>
                <label className="text-sm font-medium block mb-1">Amount (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.amount}
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  className="w-full border border-black rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full border border-black rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                >
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Description</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full border border-black rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="e.g. Lunch at canteen"
                  maxLength={100}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  className="w-full border border-black rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-black text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-900 transition-colors"
              >
                Add Expense
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
