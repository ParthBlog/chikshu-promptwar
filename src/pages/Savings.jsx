import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { validateAmount, validateText } from '../utils/security';
import { Plus, Trash2, Target, X, PiggyBank, Sparkles, Calendar, CheckCircle2, TrendingUp, Award } from 'lucide-react';
import { EmptyGraphic } from '../components/Graphics';

function formatCurrency(n) {
  return '₹' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function daysUntil(dateStr) {
  const target = new Date(dateStr);
  const now = new Date();
  const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
  return diff;
}

function projectedDate(goal) {
  const { savedAmount = 0, targetAmount, contributions = [] } = goal;
  if (contributions.length < 2) return null;
  const avg = contributions.slice(-3).reduce((s, c) => s + c.amount, 0) / Math.min(3, contributions.length);
  if (avg <= 0) return null;
  const remaining = targetAmount - savedAmount;
  const months = Math.ceil(remaining / avg);
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
}

export default function Savings() {
  const { savingsGoals, dispatch } = useFinance();

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', targetAmount: '', deadline: '', priority: 'Medium' });
  const [formError, setFormError] = useState('');

  const [contributeGoalId, setContributeGoalId] = useState(null);
  const [contributeAmt, setContributeAmt] = useState('');
  const [contributeError, setContributeError] = useState('');

  function handleAdd(e) {
    e.preventDefault();
    const nameResult = validateText(form.name, { maxLength: 80, fieldName: 'Goal name' });
    if (!nameResult.valid) { setFormError(nameResult.error); return; }
    const amtResult = validateAmount(form.targetAmount);
    if (!amtResult.valid) { setFormError(amtResult.error); return; }
    if (!form.deadline) { setFormError('Please set a target completion date.'); return; }

    dispatch({
      type: 'ADD_SAVINGS_GOAL',
      payload: {
        id: Date.now().toString(),
        name: nameResult.value,
        targetAmount: amtResult.value,
        savedAmount: 0,
        deadline: form.deadline,
        priority: form.priority,
        contributions: [],
        completed: false,
      }
    });

    setShowAdd(false);
    setForm({ name: '', targetAmount: '', deadline: '', priority: 'Medium' });
    setFormError('');
  }

  function handleContribute(e) {
    e.preventDefault();
    const amtResult = validateAmount(contributeAmt);
    if (!amtResult.valid) { setContributeError(amtResult.error); return; }

    dispatch({
      type: 'CONTRIBUTE_TO_GOAL',
      payload: { goalId: contributeGoalId, amount: amtResult.value }
    });

    setContributeGoalId(null);
    setContributeAmt('');
    setContributeError('');
  }

  function handleDelete(id) {
    if (window.confirm('Delete this savings goal?')) {
      dispatch({ type: 'DELETE_SAVINGS_GOAL', payload: id });
    }
  }

  const totalSaved = savingsGoals.reduce((s, g) => s + (g.savedAmount || 0), 0);
  const totalTarget = savingsGoals.reduce((s, g) => s + (g.targetAmount || 0), 0);
  const completedGoals = savingsGoals.filter(g => g.completed).length;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 p-8 rounded-3xl text-white shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold uppercase tracking-wider mb-2">
            <PiggyBank className="w-3.5 h-3.5" />
            Milestone Vault
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Student Savings Goals</h1>
          <p className="mt-1 text-emerald-100 text-xs sm:text-sm">
            Save systematically for coding laptops, semester fees, emergency cushions, or college trips.
          </p>
        </div>

        <button
          onClick={() => setShowAdd(true)}
          className="px-5 py-2.5 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-emerald-600" />
          Create New Goal
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Funds Accumulated</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{formatCurrency(totalSaved)}</p>
          <p className="text-xs text-slate-500 mt-1">Across all active funds</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Cumulative Target</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(totalTarget)}</p>
          <p className="text-xs text-slate-500 mt-1">
            {totalTarget > 0 ? `${((totalSaved / totalTarget) * 100).toFixed(0)}% overall funded` : 'Set targets'}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Milestones Unlocked</span>
          <p className="text-2xl font-black text-indigo-600 mt-1">{completedGoals} of {savingsGoals.length}</p>
          <p className="text-xs text-slate-500 mt-1">100% completed goals</p>
        </div>
      </div>

      {/* Goals Grid */}
      {savingsGoals.length === 0 ? (
        <EmptyGraphic
          title="No savings goals yet"
          message="Create your first goal like 'Laptop Fund' or 'Exam Emergency Buffer' to begin tracking progress!"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {savingsGoals.map((goal) => {
            const saved = goal.savedAmount || 0;
            const target = goal.targetAmount || 1;
            const pct = Math.min(100, Math.round((saved / target) * 100));
            const days = daysUntil(goal.deadline);
            const projection = projectedDate(goal);

            return (
              <div
                key={goal.id}
                className={`bg-white rounded-2xl border p-6 shadow-xs flex flex-col justify-between transition-all hover:shadow-md ${
                  goal.completed
                    ? 'border-emerald-300 bg-emerald-50/20 ring-2 ring-emerald-100'
                    : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                      goal.priority === 'High'
                        ? 'bg-rose-100 text-rose-800'
                        : goal.priority === 'Medium'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {goal.priority} Priority
                    </span>

                    <button
                      onClick={() => handleDelete(goal.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-base leading-snug">{goal.name}</h3>

                  <div className="mt-4 flex items-baseline justify-between">
                    <div>
                      <span className="text-2xl font-black text-slate-900">{formatCurrency(saved)}</span>
                      <span className="text-xs text-slate-400 font-semibold ml-1">/ {formatCurrency(target)}</span>
                    </div>
                    <span className="text-sm font-extrabold text-emerald-600">{pct}%</span>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden my-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-700 ${
                        goal.completed
                          ? 'bg-emerald-500'
                          : pct > 60
                          ? 'bg-teal-500'
                          : 'bg-indigo-600'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-slate-400" /> Deadline</span>
                      <span className={`font-semibold ${days < 14 && !goal.completed ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>
                        {days > 0 ? `${days} days remaining` : 'Target reached/past'}
                      </span>
                    </div>
                    {projection && !goal.completed && (
                      <div className="flex items-center justify-between text-indigo-600">
                        <span>Projected Date:</span>
                        <span className="font-bold">{projection}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  {goal.completed ? (
                    <div className="w-full py-2 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Goal Accomplished!
                    </div>
                  ) : (
                    <button
                      onClick={() => setContributeGoalId(goal.id)}
                      className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      Add Savings
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Contribute Modal */}
      {contributeGoalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">Add Funds to Goal</h3>
              <button onClick={() => setContributeGoalId(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {contributeError && (
              <div className="mb-3 p-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-semibold">
                {contributeError}
              </div>
            )}

            <form onSubmit={handleContribute} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Amount to Add (₹)</label>
                <input
                  type="number"
                  value={contributeAmt}
                  onChange={(e) => setContributeAmt(e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  autoFocus
                />
              </div>

              {/* Quick Presets */}
              <div className="flex gap-2">
                {[100, 500, 1000, 2000].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setContributeAmt(amt.toString())}
                    className="flex-1 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 rounded-lg text-xs font-bold border border-slate-200 transition-colors"
                  >
                    +₹{amt}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setContributeGoalId(null)}
                  className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  Deposit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Goal Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">Create New Savings Goal</h3>
              <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-3 p-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Goal Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Coding Laptop, Semester Books..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Amount (₹)</label>
                <input
                  type="number"
                  value={form.targetAmount}
                  onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
                  placeholder="e.g. 50000"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Deadline</label>
                <input
                  type="date"
                  value={form.deadline}
                  onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="High">High Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="Low">Low Priority</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
