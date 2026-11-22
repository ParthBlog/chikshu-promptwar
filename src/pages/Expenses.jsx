import React, { useState, useMemo } from 'react';
import { useFinance, CATEGORIES } from '../context/FinanceContext';
import { validateAmount, validateText } from '../utils/security';
import { Plus, Trash2, Download, Search, X, Filter } from 'lucide-react';

function formatCurrency(n) {
  return '₹' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function exportCSV(expenses) {
  const headers = ['Date', 'Category', 'Description', 'Amount'];
  const rows = expenses.map(e => [e.date, e.category, `"${e.description}"`, e.amount]);
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `studypocket-expenses-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Expenses() {
  const { expenses, dispatch } = useFinance();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    amount: '', category: 'Food', description: '',
    date: new Date().toISOString().slice(0, 10),
  });
  const [formError, setFormError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [filterMinAmt, setFilterMinAmt] = useState('');
  const [filterMaxAmt, setFilterMaxAmt] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return expenses.filter(e => {
      if (search && !e.description.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterCat && e.category !== filterCat) return false;
      if (filterFrom && e.date < filterFrom) return false;
      if (filterTo && e.date > filterTo) return false;
      if (filterMinAmt && e.amount < parseFloat(filterMinAmt)) return false;
      if (filterMaxAmt && e.amount > parseFloat(filterMaxAmt)) return false;
      return true;
    });
  }, [expenses, search, filterCat, filterFrom, filterTo, filterMinAmt, filterMaxAmt]);

  const total = filtered.reduce((s, e) => s + e.amount, 0);

  function handleAdd(ev) {
    ev.preventDefault();
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
    setForm({ amount: '', category: 'Food', description: '', date: new Date().toISOString().slice(0, 10) });
    setShowForm(false);
    setFormError('');
  }

  function handleDelete(id) {
    if (!confirm('Delete this expense?')) return;
    dispatch({ type: 'DELETE_EXPENSE', payload: id });
  }

  function clearFilters() {
    setSearch(''); setFilterCat(''); setFilterFrom(''); setFilterTo('');
    setFilterMinAmt(''); setFilterMaxAmt('');
  }

  const hasFilters = search || filterCat || filterFrom || filterTo || filterMinAmt || filterMaxAmt;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Expenses</h1>
          <p className="text-gray-500 text-sm mt-0.5">Track and manage your spending</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => exportCSV(filtered)}
            className="flex items-center gap-2 px-4 py-2 border border-black rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-900"
          >
            <Plus className="w-4 h-4" /> Add Expense
          </button>
        </div>
      </div>

      {/* Search + Filter bar */}
      <div className="border border-black rounded-xl p-4 mb-5">
        <div className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by description..."
              className="w-full pl-9 pr-3 py-2 border border-black rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <button
            onClick={() => setShowFilters(v => !v)}
            className={`flex items-center gap-2 px-3 py-2 border border-black rounded-lg text-sm font-medium ${showFilters ? 'bg-black text-white' : 'hover:bg-gray-50'}`}
          >
            <Filter className="w-4 h-4" /> Filters
          </button>
          {hasFilters && (
            <button onClick={clearFilters} className="px-3 py-2 border border-black rounded-lg text-sm flex items-center gap-1 hover:bg-gray-50">
              <X className="w-4 h-4" /> Clear
            </button>
          )}
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-3 border-t border-gray-200">
            <div>
              <label className="text-xs font-medium block mb-1">Category</label>
              <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="w-full border border-black rounded-lg px-2 py-1.5 text-sm focus:outline-none">
                <option value="">All</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">From Date</label>
              <input type="date" value={filterFrom} onChange={e => setFilterFrom(e.target.value)} className="w-full border border-black rounded-lg px-2 py-1.5 text-sm focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">To Date</label>
              <input type="date" value={filterTo} onChange={e => setFilterTo(e.target.value)} className="w-full border border-black rounded-lg px-2 py-1.5 text-sm focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">Min Amount (₹)</label>
              <input type="number" value={filterMinAmt} onChange={e => setFilterMinAmt(e.target.value)} className="w-full border border-black rounded-lg px-2 py-1.5 text-sm focus:outline-none" placeholder="0" />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">Max Amount (₹)</label>
              <input type="number" value={filterMaxAmt} onChange={e => setFilterMaxAmt(e.target.value)} className="w-full border border-black rounded-lg px-2 py-1.5 text-sm focus:outline-none" placeholder="Any" />
            </div>
          </div>
        )}
      </div>

      {/* Running total */}
      <div className="flex items-center justify-between mb-3 px-1">
        <p className="text-sm text-gray-500">{filtered.length} transaction{filtered.length !== 1 ? 's' : ''}</p>
        <p className="font-bold">Total: {formatCurrency(total)}</p>
      </div>

      {/* Expense list */}
      {filtered.length === 0 ? (
        <div className="border border-black rounded-xl p-10 text-center">
          <p className="text-gray-400 text-sm">No expenses found. {hasFilters ? 'Try clearing your filters.' : 'Add your first expense!'}</p>
        </div>
      ) : (
        <div className="border border-black rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-black text-white">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Date</th>
                <th className="text-left px-4 py-3 font-medium">Description</th>
                <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Category</th>
                <th className="text-right px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((exp, i) => (
                <tr key={exp.id} className={`border-t border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="px-4 py-3 text-gray-500">{exp.date}</td>
                  <td className="px-4 py-3 font-medium">{exp.description}</td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="px-2 py-0.5 border border-black rounded-full text-xs">{exp.category}</span>
                  </td>
                  <td className="px-4 py-3 text-right font-bold">{formatCurrency(exp.amount)}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDelete(exp.id)} className="text-gray-400 hover:text-black transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Expense Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-black rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg">Add Expense</h3>
              <button onClick={() => { setShowForm(false); setFormError(''); }}><X className="w-5 h-5" /></button>
            </div>
            {formError && <p className="text-sm bg-gray-100 border border-black p-2 rounded mb-3">{formError}</p>}
            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="text-sm font-medium block mb-1">Amount (₹) *</label>
                <input type="number" min="0.01" step="0.01" value={form.amount}
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  className="w-full border border-black rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="0.00" required />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Category *</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full border border-black rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black">
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Description *</label>
                <input type="text" value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full border border-black rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="e.g. Lunch at canteen" maxLength={100} required />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Date *</label>
                <input type="date" value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  className="w-full border border-black rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  required />
              </div>
              <button type="submit" className="w-full bg-black text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-900 transition-colors">
                Add Expense
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
