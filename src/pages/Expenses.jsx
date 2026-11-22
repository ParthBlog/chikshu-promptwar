import React, { useState, useMemo } from 'react';
import { useFinance, CATEGORIES, AD_TAGS } from '../context/FinanceContext';
import { validateAmount, validateText } from '../utils/security';
import { getCategoryTheme } from '../utils/categoryTheme';
import { Plus, Trash2, Download, Search, X, Filter, Calendar, Tag, ArrowUpDown, Receipt } from 'lucide-react';
import { EmptyGraphic } from '../components/Graphics';

function formatCurrency(n) {
  return '₹' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function exportCSV(expenses) {
  const headers = ['Date', 'Category', 'Description', 'Amount'];
  const rows = expenses.map(e => [e.date, e.category, `"${e.description.replace(/"/g, '""')}"`, e.amount]);
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
    amount: '',
    category: 'Food',
    description: '',
    date: new Date().toISOString().slice(0, 10),
  });
  const [formError, setFormError] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);

  // Filters
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [filterMinAmt, setFilterMinAmt] = useState('');
  const [filterTags, setFilterTags] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return expenses.filter(e => {
      if (search && !e.description.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterCat && e.category !== filterCat) return false;
      if (filterFrom && e.date < filterFrom) return false;
      if (filterTo && e.date > filterTo) return false;
      if (filterMinAmt && e.amount < parseFloat(filterMinAmt)) return false;
      if (filterMaxAmt && e.amount > parseFloat(filterMaxAmt)) return false;
      if (filterTags.length > 0 && (!e.tags || !filterTags.some(t => e.tags.includes(t)))) return false;
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
        tags: selectedTags,
      }
    });

    setShowForm(false);
    setForm({ amount: '', category: 'Food', description: '', date: new Date().toISOString().slice(0, 10) });
    setSelectedTags([]);
  }

  function handleDelete(id) {
    if (window.confirm('Delete this expense?')) {
      dispatch({ type: 'DELETE_EXPENSE', payload: id });
    }
  }

  function resetFilters() {
    setSearch('');
    setFilterCat('');
    setFilterFrom('');
    setFilterTo('');
    setFilterMinAmt('');
    setFilterMaxAmt('');
  }

  const hasActiveFilters = search || filterCat || filterFrom || filterTo || filterMinAmt || filterMaxAmt;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-rose-600 via-pink-600 to-indigo-700 p-8 rounded-3xl text-white shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold uppercase tracking-wider mb-2">
            <Receipt className="w-3.5 h-3.5" />
            Financial Ledger
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Student Expense Tracker</h1>
          <p className="mt-1 text-rose-100 text-xs sm:text-sm">
            Categorize campus, mess, stationery, and hostel expenses with instant search & CSV exports.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => exportCSV(filtered)}
            disabled={filtered.length === 0}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="px-5 py-2.5 rounded-xl bg-white text-rose-700 hover:bg-rose-50 font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-rose-600" />
            Add Expense
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Filtered Spend</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(total)}</p>
            <p className="text-xs text-slate-500 mt-0.5">{filtered.length} transactions shown</p>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
            <Receipt className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Average Per Item</p>
            <p className="text-2xl font-black text-slate-900 mt-1">
              {filtered.length > 0 ? formatCurrency(total / filtered.length) : '₹0'}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">Discipline metric</p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <ArrowUpDown className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Categories</p>
            <p className="text-2xl font-black text-slate-900 mt-1">
              {new Set(filtered.map(e => e.category)).size} of {CATEGORIES.length}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">Spread across campus life</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <Tag className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by description (e.g. canteen, metro, books)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={filterCat}
              onChange={(e) => setFilterCat(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                showFilters || hasActiveFilters
                  ? 'bg-rose-50 border-rose-300 text-rose-700'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              Filters
              {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-rose-600" />}
            </button>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Quick Ad-Tags Filter Pills (Family, College, Hostel) */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#30363D]">
          <span className="text-xs font-bold text-[#94A3B8] flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-[#06B6D4]" />
            Tags:
          </span>
          {AD_TAGS.map(tag => {
            const isSelected = filterTags.includes(tag);
            return (
              <button
                type="button"
                key={tag}
                onClick={() => {
                  if (isSelected) setFilterTags(filterTags.filter(t => t !== tag));
                  else setFilterTags([...filterTags, tag]);
                }}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all border cursor-pointer ${
                  isSelected
                    ? 'bg-[#8B5CF6] text-white border-[#8B5CF6] shadow-sm shadow-[#8B5CF6]/40'
                    : 'bg-[#0D1117] text-[#94A3B8] border-[#30363D] hover:border-[#8B5CF6]/60 hover:text-[#F8FAFC]'
                }`}
              >
                #{tag}
              </button>
            );
          })}
          {filterTags.length > 0 && (
            <button
              type="button"
              onClick={() => setFilterTags([])}
              className="text-xs text-[#06B6D4] hover:underline font-bold ml-1 cursor-pointer"
            >
              Clear tags ({filterTags.length})
            </button>
          )}
        </div>

        {/* Extended Filter Drawer */}
        {showFilters && (
          <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-slate-500 font-semibold mb-1">From Date</label>
              <input
                type="date"
                value={filterFrom}
                onChange={(e) => setFilterFrom(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-semibold mb-1">To Date</label>
              <input
                type="date"
                value={filterTo}
                onChange={(e) => setFilterTo(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Min Amount (₹)</label>
              <input
                type="number"
                value={filterMinAmt}
                onChange={(e) => setFilterMinAmt(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Max Amount (₹)</label>
              <input
                type="number"
                value={filterMaxAmt}
                onChange={(e) => setFilterMaxAmt(e.target.value)}
                placeholder="5000"
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
          </div>
        )}
      </div>

      {/* Expenses List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyGraphic
            title="No expenses match your search"
            message="Try clearing your filters or click 'Add Expense' to log a new purchase."
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((e) => {
              const theme = getCategoryTheme(e.category);
              const Icon = theme.icon;
              return (
                <div
                  key={e.id}
                  className="p-4 sm:px-6 flex items-center justify-between hover:bg-slate-50/80 transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`p-2.5 rounded-xl ${theme.bgLight} ${theme.text} border ${theme.border}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{e.description}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-0.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${theme.badge}`}>
                          {e.category}
                        </span>
                        {e.tags && e.tags.map(t => (
                          <span key={t} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/40">
                            #{t}
                          </span>
                        ))}
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {e.date}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-base font-black text-slate-900">
                      -{formatCurrency(e.amount)}
                    </span>
                    <button
                      onClick={() => handleDelete(e.id)}
                      title="Delete expense"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">Add New Expense</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="e.g. 250"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
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
                            ? `${theme.bgLight} ${theme.text} border-rose-500 ring-2 ring-rose-500/20`
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
                <div className="mt-2">
  <label className="block text-xs font-semibold text-slate-600 mb-1">Tags</label>
  <div className="flex flex-wrap gap-2">
    {AD_TAGS.map(tag => (
      <label key={tag} className="inline-flex items-center space-x-1">
        <input
          type="checkbox"
          checked={selectedTags.includes(tag)}
          onChange={e => {
            if (e.target.checked) {
              setSelectedTags([...selectedTags, tag]);
            } else {
              setSelectedTags(selectedTags.filter(t => t !== tag));
            }
          }}
          className="form-checkbox h-4 w-4 text-primary"
        />
        <span className="text-xs text-slate-700">{tag}</span>
      </label>
    ))}
  </div>
</div>
<label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="e.g. Books, Swiggy order, bus recharge..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
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
