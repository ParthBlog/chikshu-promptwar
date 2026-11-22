import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { validateAmount, validateText } from '../utils/security';
import { Plus, Trash2, Target, X, PlusCircle } from 'lucide-react';

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
  // average monthly contribution from last 2
  const avg = contributions.slice(-3).reduce((s, c) => s + c.amount, 0) / Math.min(3, contributions.length);
  if (avg <= 0) return null;
  const remaining = targetAmount - savedAmount;
  const months = Math.ceil(remaining / avg);
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
}

const PRIORITIES = ['High', 'Medium', 'Low'];

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
    if (!form.deadline) { setFormError('Please set a deadline.'); return; }
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
        createdAt: new Date().toISOString(),
      }
    });
    setForm({ name: '', targetAmount: '', deadline: '', priority: 'Medium' });
    setShowAdd(false);
    setFormError('');
  }

  function handleContribute(e) {
    e.preventDefault();
    const result = validateAmount(contributeAmt);
    if (!result.valid) { setContributeError(result.error); return; }
    const goal = savingsGoals.find(g => g.id === contributeGoalId);
    if (!goal) return;
    const newContrib = { amount: result.value, date: new Date().toISOString().slice(0, 10) };
    dispatch({
      type: 'UPDATE_SAVINGS_GOAL',
      payload: {
        id: contributeGoalId,
        savedAmount: Math.min(goal.targetAmount, (goal.savedAmount || 0) + result.value),
        contributions: [...(goal.contributions || []), newContrib],
        completed: (goal.savedAmount || 0) + result.value >= goal.targetAmount,
      }
    });
    setContributeGoalId(null);
    setContributeAmt('');
    setContributeError('');
  }

  function handleDelete(id) {
    if (!confirm('Delete this savings goal?')) return;
    dispatch({ type: 'DELETE_SAVINGS_GOAL', payload: id });
  }

  const active = savingsGoals.filter(g => !g.completed);
  const completed = savingsGoals.filter(g => g.completed);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Savings Goals</h1>
          <p className="text-gray-500 text-sm mt-0.5">Track your financial targets</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-900"
        >
          <Plus className="w-4 h-4" /> New Goal
        </button>
      </div>

      {/* Summary */}
      {savingsGoals.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="border border-black rounded-xl p-4 text-center">
            <p className="text-2xl font-bold">{active.length}</p>
            <p className="text-xs text-gray-500 mt-1">Active Goals</p>
          </div>
          <div className="border border-black rounded-xl p-4 text-center">
            <p className="text-2xl font-bold">{completed.length}</p>
            <p className="text-xs text-gray-500 mt-1">Completed</p>
          </div>
          <div className="border border-black rounded-xl p-4 text-center">
            <p className="text-2xl font-bold">{formatCurrency(savingsGoals.reduce((s, g) => s + (g.savedAmount || 0), 0))}</p>
            <p className="text-xs text-gray-500 mt-1">Total Saved</p>
          </div>
        </div>
      )}

      {/* Active goals */}
      {active.length === 0 && completed.length === 0 ? (
        <div className="border border-black rounded-xl p-12 text-center">
          <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="font-semibold text-lg mb-2">No savings goals yet</p>
          <p className="text-gray-500 text-sm mb-4">Set a goal and start tracking your progress!</p>
          <button onClick={() => setShowAdd(true)} className="bg-black text-white px-6 py-2 rounded-lg text-sm font-medium">
            Create First Goal
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {[...active, ...completed].sort((a, b) => {
            const pOrd = { High: 0, Medium: 1, Low: 2 };
            return (pOrd[a.priority] ?? 2) - (pOrd[b.priority] ?? 2);
          }).map(goal => {
            const pct = goal.targetAmount > 0 ? Math.min(100, ((goal.savedAmount || 0) / goal.targetAmount) * 100) : 0;
            const days = daysUntil(goal.deadline);
            const proj = projectedDate(goal);

            return (
              <div key={goal.id} className={`border border-black rounded-xl p-5 ${goal.completed ? 'bg-gray-50' : ''}`}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-lg">{goal.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full border border-black ${
                        goal.priority === 'High' ? 'bg-black text-white' : 'bg-white text-black'
                      }`}>{goal.priority}</span>
                      {goal.completed && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-black text-white">✓ Completed</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Deadline: {goal.deadline} {!goal.completed && days > 0 ? `(${days} days left)` : days <= 0 ? '(overdue)' : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!goal.completed && (
                      <button
                        onClick={() => { setContributeGoalId(goal.id); setContributeAmt(''); setContributeError(''); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-black rounded-lg text-xs font-medium hover:bg-black hover:text-white transition-colors"
                      >
                        <PlusCircle className="w-3.5 h-3.5" /> Add Funds
                      </button>
                    )}
                    <button onClick={() => handleDelete(goal.id)} className="text-gray-400 hover:text-black">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium">{formatCurrency(goal.savedAmount || 0)} saved</span>
                    <span className="text-gray-500">Target: {formatCurrency(goal.targetAmount)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="h-4 rounded-full bg-black transition-all duration-500 flex items-center justify-end pr-2"
                      style={{ width: `${pct}%`, minWidth: pct > 5 ? undefined : 0 }}
                    >
                      {pct > 10 && <span className="text-white text-xs font-bold">{pct.toFixed(0)}%</span>}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 text-right">{pct.toFixed(1)}% complete</p>
                </div>

                {proj && !goal.completed && (
                  <p className="text-xs text-gray-500">📅 Projected completion: <strong>{proj}</strong></p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Goal Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-black rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg">New Savings Goal</h3>
              <button onClick={() => { setShowAdd(false); setFormError(''); }}><X className="w-5 h-5" /></button>
            </div>
            {formError && <p className="text-sm bg-gray-100 border border-black p-2 rounded mb-3">{formError}</p>}
            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="text-sm font-medium block mb-1">Goal Name *</label>
                <input type="text" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full border border-black rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="e.g. New Laptop" maxLength={80} required />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Target Amount (₹) *</label>
                <input type="number" min="1" step="100" value={form.targetAmount}
                  onChange={e => setForm(f => ({ ...f, targetAmount: e.target.value }))}
                  className="w-full border border-black rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="e.g. 50000" required />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Deadline *</label>
                <input type="date" value={form.deadline}
                  onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
                  className="w-full border border-black rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  min={new Date().toISOString().slice(0, 10)} required />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Priority</label>
                <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                  className="w-full border border-black rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black">
                  {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <button type="submit" className="w-full bg-black text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-900">
                Create Goal
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Contribute Modal */}
      {contributeGoalId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-black rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg">Add Contribution</h3>
              <button onClick={() => setContributeGoalId(null)}><X className="w-5 h-5" /></button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Goal: <strong>{savingsGoals.find(g => g.id === contributeGoalId)?.name}</strong>
            </p>
            {contributeError && <p className="text-sm bg-gray-100 border border-black p-2 rounded mb-3">{contributeError}</p>}
            <form onSubmit={handleContribute} className="space-y-3">
              <div>
                <label className="text-sm font-medium block mb-1">Amount (₹) *</label>
                <input type="number" min="1" step="100" value={contributeAmt}
                  onChange={e => setContributeAmt(e.target.value)}
                  className="w-full border border-black rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="e.g. 1000" required />
              </div>
              <button type="submit" className="w-full bg-black text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-900">
                Add Funds
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
