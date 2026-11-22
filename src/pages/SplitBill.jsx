import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Users, Plus, Trash2, Copy, Check, ArrowRight, Share2, Calculator, Receipt } from 'lucide-react';
import { validateAmount } from '../utils/security';

function formatCurrency(n) {
  return '₹' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function SplitBill() {
  const { dispatch } = useFinance();

  const [billTitle, setBillTitle] = useState('Hostel Roommates Dinner');
  const [totalAmount, setTotalAmount] = useState('1200');
  const [payer, setPayer] = useState('You');
  const [friends, setFriends] = useState(['You', 'Rohan', 'Sneha', 'Aman']);
  const [newFriend, setNewFriend] = useState('');
  const [copied, setCopied] = useState(false);
  const [addedToExpenses, setAddedToExpenses] = useState(false);

  function handleAddFriend(e) {
    e.preventDefault();
    if (!newFriend.trim()) return;
    if (friends.includes(newFriend.trim())) return;
    setFriends([...friends, newFriend.trim()]);
    setNewFriend('');
  }

  function handleRemoveFriend(name) {
    if (friends.length <= 2) return;
    setFriends(friends.filter(f => f !== name));
    if (payer === name) setPayer('You');
  }

  const numPeople = friends.length || 1;
  const total = parseFloat(totalAmount) || 0;
  const perPersonShare = total / numPeople;

  // New state for per‑friend shares
  const [showShareEditor, setShowShareEditor] = useState(false);
  const [shares, setShares] = useState({});

  // Initialize equal shares when total or friends change
  useEffect(() => {
    const equal = Math.round(total / numPeople);
    const init = {};
    friends.forEach(f => { init[f] = equal; });
    setShares(init);
  }, [total, friends]);

  function handleShareChange(name, value) {
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0) {
      setShares(prev => ({ ...prev, [name]: num }));
    }
  }

  function distributeEvenly() {
    const equal = Math.round(total / friends.length);
    const even = {};
    friends.forEach(f => { even[f] = equal; });
    setShares(even);
  }

  // Updated copy to WhatsApp summary using per‑friend amounts
  function copyWhatsAppSummary() {
    const lines = [
      `🧾 *Bill Split: ${billTitle}*`,
      `💰 *Total Amount:* ${formatCurrency(total)}`,
      `👥 *Shares:*`,
      ...friends.map(f => `  • ${f}: ${formatCurrency(shares[f] || perPersonShare)}`),
      `\n💳 *Paid by:* ${payer}`,
      payer === 'You'
        ? `👉 Please send your share (${formatCurrency(shares[payer] || perPersonShare)}) via UPI!`
        : `👉 You need to send ${formatCurrency(shares[payer] || perPersonShare)} to ${payer}!`,
      `\n_Generated via StudyPocket AI Student Finance_`
    ];
    const text = lines.join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  // Add each friend share as a separate expense entry
  function addShareToExpenses() {
    if (addedToExpenses) return;
    friends.forEach(f => {
      const amt = Math.round(shares[f] || perPersonShare);
      dispatch({
        type: 'ADD_EXPENSE',
        payload: {
          id: Date.now().toString() + f,
          amount: amt,
          category: 'Food',
          description: `Split: ${billTitle} – ${f}`,
          date: new Date().toISOString().slice(0, 10),
          tags: [],
        }
      });
    });
    setAddedToExpenses(true);
    setTimeout(() => setAddedToExpenses(false), 3000);
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 p-8 text-white shadow-xl">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold uppercase tracking-wider mb-3">
            <Users className="w-3.5 h-3.5" />
            Campus Daily Life Tool
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Hostel & Roommate Bill Splitter</h1>
          <p className="mt-2 text-sky-100 text-sm leading-relaxed max-w-2xl">
            Effortlessly split mess food, weekend dinners, flat rent, or auto fares. Auto-calculate per-person dues and generate instant WhatsApp receipts!
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Bill Settings Form */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-blue-600" />
            Bill & Member Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Expense Title</label>
              <input
                type="text"
                value={billTitle}
                onChange={(e) => setBillTitle(e.target.value)}
                placeholder="e.g. Swiggy Pizza / Flat Wi-Fi"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Total Amount (₹)</label>
              <input
                type="number"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                placeholder="1200"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Who paid the upfront bill?</label>
            <select
              value={payer}
              onChange={(e) => setPayer(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {friends.map(f => (
                <option key={f} value={f}>{f} {f === 'You' ? '(Logged in user)' : ''}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">Roommates / Friends in this split</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {friends.map((f) => (
                <span
                  key={f}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-medium border border-slate-200"
                >
                  {f}
                  {friends.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveFriend(f)}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      ×
                    </button>
                  )}
                </span>
              ))}
            </div>

            <form onSubmit={handleAddFriend} className="flex gap-2">
              <input
                type="text"
                value={newFriend}
                onChange={(e) => setNewFriend(e.target.value)}
                placeholder="Add another person name..."
                className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold hover:bg-slate-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Person
              </button>
            </form>
          </div>
        </div>

        {/* Calculated Breakdown Card */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">Share Breakdown</span>
            <div className="mt-3">
              <span className="text-3xl font-extrabold text-white">{formatCurrency(perPersonShare)}</span>
              <span className="text-xs text-indigo-200 ml-2">/ person</span>
            </div>
            <p className="text-xs text-slate-300 mt-1">Split across {numPeople} members</p>

            <div className="mt-6 pt-6 border-t border-indigo-800/60 space-y-2.5 text-xs">
              <div className="flex justify-between text-indigo-200">
                <span>Total Bill</span>
                <span className="font-semibold text-white">{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between text-indigo-200">
                <span>Paid by</span>
                <span className="font-semibold text-emerald-400">{payer}</span>
              </div>
              <div className="flex justify-between text-indigo-200">
                <span>Your Individual Share</span>
                <span className="font-semibold text-yellow-300">{formatCurrency(perPersonShare)}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <button
              onClick={copyWhatsAppSummary}
              className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied WhatsApp Text!' : 'Copy WhatsApp Bill Text'}
            </button>

            <button
              onClick={addShareToExpenses}
              disabled={addedToExpenses}
              className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition-all border border-white/20 flex items-center justify-center gap-2"
            >
              <Receipt className="w-4 h-4" />
              {addedToExpenses ? '✓ Added to Your Expenses' : 'Log My Share into Expenses'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
