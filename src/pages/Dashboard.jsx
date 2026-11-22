import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFinance, CATEGORIES, AD_TAGS } from '../context/FinanceContext';
import { validateAmount, validateText } from '../utils/security';
import { getCategoryTheme } from '../utils/categoryTheme';
import {
  TrendingUp, TrendingDown, Wallet, PiggyBank, Plus, X,
  Sparkles, ArrowRight, ShieldCheck, Users, GraduationCap,
  Briefcase, CheckCircle2, AlertCircle, ArrowUpRight
} from 'lucide-react';
import { FinancialHealthGauge } from '../components/Graphics';

function getCurrentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function formatCurrency(n) {
  return '₹' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function StatCard({ label, value, sub, icon: Icon, gradient, badgeText, badgeColor }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</span>
        <div className={`p-2.5 rounded-xl bg-gradient-to-tr ${gradient} text-white shadow-sm`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="mt-4">
        <p className="text-2xl font-black text-slate-900 tracking-tight">{value}</p>
        <div className="flex items-center gap-2 mt-1">
          {badgeText && (
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${badgeColor}`}>
              {badgeText}
            </span>
          )}
          <span className="text-xs text-slate-500">{sub}</span>
        </div>
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
  const budgetRatio = totalBudget > 0 ? (monthTotal / totalBudget) * 100 : 0;
  const totalSaved = savingsGoals.reduce((s, g) => s + (g.savedAmount || 0), 0);
  const totalSavingsTarget = savingsGoals.reduce((s, g) => s + (g.targetAmount || 0), 0);

  const recent = expenses.slice(0, 5);

  // Quick add modal
  const [showAdd, setShowAdd] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [form, setForm] = useState({
    amount: '',
    category: 'Food',
    description: '',
    date: new Date().toISOString().slice(0, 10),
  });
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
        tags: selectedTags,
      }
    });
    setShowAdd(false);
    setForm({ amount: '', category: 'Food', description: '', date: new Date().toISOString().slice(0, 10) });
    setSelectedTags([]);
    setFormError('');
  }

  const catSpend = getCategorySpending(month);
  const topCategory = Object.entries(catSpend).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Semester Financial Snapshot
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome back, {userName || 'Aryan'}! 👋
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Quick Launch Buttons */}
        <div className="relative z-10 flex flex-wrap gap-2.5">
          <button
            onClick={() => navigate('/ai-copilot')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            AI Copilot
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="px-4 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-indigo-600" />
            Log Expense
          </button>
        </div>
      </div>

      {/* 4 Key Stat Cards with Vibrant Gradients */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Spent"
          value={formatCurrency(monthTotal)}
          sub="This month"
          icon={TrendingDown}
          gradient="from-rose-500 to-pink-600"
          badgeText={topCategory ? `Top: ${topCategory[0]}` : null}
          badgeColor="bg-rose-100 text-rose-800"
        />
        <StatCard
          label="Remaining Budget"
          value={formatCurrency(Math.max(0, remaining))}
          sub={remaining < 0 ? 'Over budget by ' + formatCurrency(Math.abs(remaining)) : 'Available safe spend'}
          icon={Wallet}
          gradient="from-emerald-500 to-teal-600"
          badgeText={remaining < 0 ? 'Exceeded' : 'On Track'}
          badgeColor={remaining < 0 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}
        />
        <StatCard
          label="Total Saved"
          value={formatCurrency(totalSaved)}
          sub={`Across ${savingsGoals.length} goals`}
          icon={PiggyBank}
          gradient="from-indigo-600 to-violet-600"
          badgeText={totalSavingsTarget > 0 ? `${((totalSaved / totalSavingsTarget) * 100).toFixed(0)}% Achieved` : null}
          badgeColor="bg-indigo-100 text-indigo-800"
        />
        <StatCard
          label="Budget Health"
          value={totalBudget > 0 ? `${Math.min(100, Math.round(budgetRatio))}%` : 'Not Set'}
          sub={totalBudget > 0 ? `of ${formatCurrency(totalBudget)} consumed` : 'Define budget'}
          icon={TrendingUp}
          gradient="from-amber-500 to-orange-500"
          badgeText={budgetRatio > 90 ? 'High' : 'Healthy'}
          badgeColor={budgetRatio > 90 ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}
        />
      </div>

      {/* Budget Runway Progress Bar */}
      {totalBudget > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
              Monthly Budget Consumption
            </span>
            <span>{formatCurrency(monthTotal)} / {formatCurrency(totalBudget)}</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <div
              className={`h-3 rounded-full transition-all duration-700 ${
                budgetRatio > 100
                  ? 'bg-rose-600'
                  : budgetRatio > 80
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, budgetRatio)}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500">
            <span>{remaining >= 0 ? `${formatCurrency(remaining)} remaining` : '⚠ Budget exceeded'}</span>
            <button
              onClick={() => navigate('/budget')}
              className="text-indigo-600 font-bold hover:underline flex items-center gap-1"
            >
              Adjust Allocations <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Grid: Recent Activity & Student Life Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Student Transactions</h2>
              <p className="text-xs text-slate-500">Latest expenses logged on your device</p>
            </div>
            <button
              onClick={() => navigate('/expenses')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              View All ({expenses.length}) <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recent.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No transactions logged yet. Click "Log Expense" above to add your first!
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recent.map((e) => {
                const theme = getCategoryTheme(e.category);
                const Icon = theme.icon;
                return (
                  <div key={e.id} className="py-3 flex items-center justify-between hover:bg-slate-50/80 rounded-xl px-2 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${theme.bgLight} ${theme.text} border ${theme.border}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{e.description}</p>
                        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                          <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full border ${theme.badge}`}>
                            {e.category}
                          </span>
                          {e.tags && e.tags.map(t => (
                            <span key={t} className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/30">
                              #{t}
                            </span>
                          ))}
                          <span className="text-[11px] text-slate-400">{e.date}</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-sm font-black text-slate-900">
                      -{formatCurrency(e.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Student Quick Tools (1 col) */}
        <div className="space-y-4">
          {/* AI Banner Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 text-white shadow-md">
            <div className="flex items-center gap-2 text-yellow-300 text-xs font-bold mb-2">
              <Sparkles className="w-4 h-4" />
              AI Student Financial Tip
            </div>
            <p className="text-xs leading-relaxed text-indigo-100 font-normal">
              {topCategory
                ? `Your top expense is ${topCategory[0]} (${formatCurrency(topCategory[1])}). College mess coupons or carpooling can cut this down by ~25%.`
                : 'Maintain an emergency fund of at least ₹5,000 for unexpected semester exam fees or books!'}
            </p>
            <button
              onClick={() => navigate('/ai-copilot')}
              className="mt-4 w-full py-2 bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              Open AI Copilot <ArrowRight className="w-3.5 h-3.5 text-indigo-600" />
            </button>
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Student Life Hub</h3>
            
            <button
              onClick={() => navigate('/scholarships')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-sky-50 text-slate-700 hover:text-sky-800 border border-slate-200/80 transition-all text-xs font-semibold text-left"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-sky-100 text-sky-700">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold">16+ Indian Scholarships</div>
                  <div className="text-[10px] text-slate-400 font-normal">NSP, Inspire, PMSS & more</div>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={() => navigate('/parttime')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200/80 transition-all text-xs font-semibold text-left"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold">Part-Time Jobs & Gigs</div>
                  <div className="text-[10px] text-slate-400 font-normal">Tutoring, freelancing & campus jobs</div>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={() => navigate('/splitbill')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-purple-50 text-slate-700 hover:text-purple-800 border border-slate-200/80 transition-all text-xs font-semibold text-left"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-purple-100 text-purple-700">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold">Split Hostel Bill</div>
                  <div className="text-[10px] text-slate-400 font-normal">Mess food & auto-share calculator</div>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Add Expense Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">Add New Expense</h3>
              <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleQuickAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="e.g. 150"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {CATEGORIES.map((cat) => {
                    const theme = getCategoryTheme(cat);
                    const Icon = theme.icon;
                    const selected = form.category === cat;
                    return (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => setForm({ ...form, category: cat })}
                        className={`p-2 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                          selected
                            ? `${theme.bgLight} ${theme.text} border-indigo-500 ring-2 ring-indigo-500/20`
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-[10px]">{cat}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Ad-Tags (Campus Context)</label>
                <div className="flex flex-wrap gap-2">
                  {AD_TAGS.map(tag => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => {
                          if (isSelected) setSelectedTags(selectedTags.filter(t => t !== tag));
                          else setSelectedTags([...selectedTags, tag]);
                        }}
                        className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#8B5CF6] text-white border-[#8B5CF6]'
                            : 'bg-[#0D1117] text-[#94A3B8] border-[#30363D] hover:border-[#8B5CF6]/50'
                        }`}
                      >
                        #{tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="e.g. Canteen lunch, metro recharge..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
