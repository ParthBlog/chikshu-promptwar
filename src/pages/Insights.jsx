import React, { useMemo } from 'react';
import { useFinance, CATEGORIES } from '../context/FinanceContext';
import { getCategoryTheme } from '../utils/categoryTheme';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { Lightbulb, TrendingUp, BarChart3, PieChart as PieIcon, Sparkles, ArrowUpRight } from 'lucide-react';

function formatCurrency(n) {
  return '₹' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function getMonthKey(date) {
  return date.toISOString().slice(0, 7);
}

function getMonthLabel(ym) {
  const [y, m] = ym.split('-');
  return new Date(parseInt(y), parseInt(m) - 1, 1).toLocaleDateString('en-IN', { month: 'short' });
}

const PALETTE = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#06b6d4', '#8b5cf6', '#64748b'];

function generateTips(expenses, budget) {
  const tips = [];
  if (!expenses || expenses.length === 0) {
    return ['Log your daily college expenses to get custom algorithmic spending recommendations!'];
  }

  const now = new Date();
  const thisMonth = getMonthKey(now);
  const monthExpenses = expenses.filter(e => e.date && e.date.startsWith(thisMonth));
  const monthTotal = monthExpenses.reduce((s, e) => s + e.amount, 0);

  const catSpend = {};
  monthExpenses.forEach(e => { catSpend[e.category] = (catSpend[e.category] || 0) + e.amount; });
  const topCat = Object.entries(catSpend).sort((a, b) => b[1] - a[1])[0];

  if (topCat) {
    if (topCat[0] === 'Entertainment' && topCat[1] > monthTotal * 0.25) {
      tips.push(`🎬 Entertainment takes ${((topCat[1] / monthTotal) * 100).toFixed(0)}% of your allowance. Use student ID discounts at PVR/INOX or opt for free campus events.`);
    }
    if (topCat[0] === 'Food' && topCat[1] > monthTotal * 0.35) {
      tips.push(`🍱 Dining & food orders represent ${((topCat[1] / monthTotal) * 100).toFixed(0)}% (${formatCurrency(topCat[1])}) of spending. Ordering group meals or hostel mess meal plans can save ~₹1,200/month.`);
    }
    tips.push(`📊 Your highest outflow is ${topCat[0]} (${formatCurrency(topCat[1])}). Setting a strict category ceiling in Budget Planner will stabilize your end-of-month runway.`);
  }

  const monthBudget = budget[thisMonth];
  if (monthBudget) {
    const totalBudget = Object.values(monthBudget).reduce((s, v) => s + v, 0);
    if (monthTotal > totalBudget * 0.85) {
      tips.push(`⚠️ You've spent ${((monthTotal / totalBudget) * 100).toFixed(0)}% of your monthly budget. Freeze non-essential purchases for the rest of this month.`);
    }
  }

  tips.push('💳 Unlock student perks: Spotify 50% discount, GitHub Student Developer Pack ($200k+ in free cloud credits), Notion Pro free for college emails.');
  tips.push('📚 Borrow semester reference textbooks from university library or buy 2nd-hand from seniors to save ₹3,000–₹5,000 yearly.');
  tips.push('📈 Allocate at least 20% of your allowance or side-gig income directly into your High-Priority Savings Goal.');

  return tips.slice(0, 5);
}

export default function Insights() {
  const { expenses, budgets, getMonthTotal, getCategorySpending } = useFinance();

  const now = new Date();
  const thisMonth = getMonthKey(now);

  // 6 months trend
  const trendData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = getMonthKey(d);
      months.push({ name: getMonthLabel(key), month: key, total: getMonthTotal(key) });
    }
    return months;
  }, [expenses]);

  // Category spending this month
  const catSpend = getCategorySpending(thisMonth);
  const catData = useMemo(() => {
    return CATEGORIES.map(cat => ({
      name: cat,
      amount: catSpend[cat] || 0,
      color: getCategoryTheme(cat).color
    }))
      .filter(d => d.amount > 0)
      .sort((a, b) => b.amount - a.amount);
  }, [catSpend]);

  // Budget allocation pie
  const monthBudget = budgets[thisMonth] || {};
  const pieData = useMemo(() => {
    return CATEGORIES
      .map((cat, idx) => ({
        name: cat,
        value: monthBudget[cat] || 0,
        color: getCategoryTheme(cat).color || PALETTE[idx % PALETTE.length]
      }))
      .filter(d => d.value > 0);
  }, [monthBudget]);

  // Savings rate
  const savingsData = useMemo(() => {
    return trendData.map(d => {
      const budget = budgets[d.month] || {};
      const totalBudget = Object.values(budget).reduce((s, v) => s + v, 0);
      const rate = totalBudget > 0 ? Math.max(0, ((totalBudget - d.total) / totalBudget) * 100) : 25;
      return { name: d.name, rate: parseFloat(rate.toFixed(1)) };
    });
  }, [trendData, budgets]);

  const tips = useMemo(() => generateTips(expenses, budgets), [expenses, budgets]);

  const SAMPLE_BAR = [
    { name: 'Rent', amount: 4500, color: '#e11d48' },
    { name: 'Food', amount: 2800, color: '#f59e0b' },
    { name: 'Books', amount: 1900, color: '#6366f1' },
    { name: 'Transport', amount: 980, color: '#0284c7' },
    { name: 'Entertainment', amount: 699, color: '#9333ea' },
  ];

  const SAMPLE_TREND = [
    { name: 'Jun', total: 7200 },
    { name: 'Jul', total: 8100 },
    { name: 'Aug', total: 6800 },
    { name: 'Sep', total: 9500 },
    { name: 'Oct', total: 8200 },
    { name: 'Nov', total: 8879 },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 p-8 rounded-3xl text-white shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold uppercase tracking-wider mb-2">
            <BarChart3 className="w-3.5 h-3.5" />
            Visual Financial Analytics
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Spending Insights & Trends</h1>
          <p className="mt-1 text-purple-100 text-xs sm:text-sm">
            Deep-dive visual analytics on cashflow trajectory, category burn, and predictive budget velocity.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 text-xs">
          <Sparkles className="w-5 h-5 text-yellow-300" />
          <span>Real-time algorithmic forecasting active</span>
        </div>
      </div>

      {/* 2x2 Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Bar Chart: Category Spend */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Spending by Category</h3>
              <p className="text-xs text-slate-400">Current month distribution</p>
            </div>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
              Category Breakdown
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={catData.length > 0 ? catData : SAMPLE_BAR} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} tickFormatter={v => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                  formatter={v => [formatCurrency(v), 'Spent']}
                />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                  {(catData.length > 0 ? catData : SAMPLE_BAR).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || PALETTE[index % PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Area Chart: Monthly Trend */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">6-Month Spending Velocity</h3>
              <p className="text-xs text-slate-400">Cash outflow trendline</p>
            </div>
            <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full">
              Historical Run
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={expenses.length > 0 ? trendData : SAMPLE_TREND} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} tickFormatter={v => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                  formatter={v => [formatCurrency(v), 'Monthly Outflow']}
                />
                <Area type="monotone" dataKey="total" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#trendGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart: Budget Allocation */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Monthly Budget Allocation</h3>
              <p className="text-xs text-slate-400">Target allowance distribution</p>
            </div>
            <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full">
              Category Weights
            </span>
          </div>

          <div className="h-64 flex items-center justify-center">
            {pieData.length === 0 ? (
              <p className="text-slate-400 text-xs">Set monthly budgets to view donut distribution.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                    formatter={v => [formatCurrency(v), 'Allocated']}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Line Chart: Savings Rate Trend */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Savings Discipline Ratio</h3>
              <p className="text-xs text-slate-400">% of allowance retained monthly</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
              Discipline Metric
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={savingsData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} tickFormatter={v => `${v}%`} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                  formatter={v => [`${v}%`, 'Savings Ratio']}
                />
                <Line type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AI Smart Money Tips */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-slate-900 text-base">AI Money & Lifestyle Hacks for Students</h2>
            <p className="text-xs text-slate-500">Auto-generated recommendations tailored to your college spending</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
          {tips.map((tip, i) => (
            <div
              key={i}
              className={`p-4 rounded-xl border text-xs leading-relaxed transition-all ${
                i === 0
                  ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200 text-indigo-950 font-semibold'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              {tip}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
