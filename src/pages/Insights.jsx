import React, { useMemo } from 'react';
import { useFinance, CATEGORIES } from '../context/FinanceContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';
import { Lightbulb } from 'lucide-react';

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

const GRAYS = ['#000000', '#333333', '#555555', '#777777', '#999999', '#bbbbbb', '#dddddd'];

function generateTips(expenses, budget) {
  const tips = [];
  if (!expenses || expenses.length === 0) {
    return ['Add your first expense to get personalised spending tips!'];
  }

  const now = new Date();
  const thisMonth = getMonthKey(now);
  const monthExpenses = expenses.filter(e => e.date && e.date.startsWith(thisMonth));
  const monthTotal = monthExpenses.reduce((s, e) => s + e.amount, 0);

  // Category analysis
  const catSpend = {};
  monthExpenses.forEach(e => { catSpend[e.category] = (catSpend[e.category] || 0) + e.amount; });
  const topCat = Object.entries(catSpend).sort((a, b) => b[1] - a[1])[0];

  if (topCat) {
    if (topCat[0] === 'Entertainment' && topCat[1] > monthTotal * 0.3) {
      tips.push(`🎬 Entertainment takes ${((topCat[1] / monthTotal) * 100).toFixed(0)}% of your spending this month. Try free alternatives like library events or college clubs.`);
    }
    if (topCat[0] === 'Food' && topCat[1] > monthTotal * 0.4) {
      tips.push(`🍱 Food is your biggest expense (${((topCat[1] / monthTotal) * 100).toFixed(0)}%). Meal prepping or using college canteens can cut this by 30%.`);
    }
    tips.push(`📊 Your highest spend this month is ${topCat[0]} (${formatCurrency(topCat[1])}). Consider setting a budget limit for this category.`);
  }

  // Budget tips
  const monthBudget = budget[thisMonth];
  if (monthBudget) {
    const totalBudget = Object.values(monthBudget).reduce((s, v) => s + v, 0);
    if (monthTotal > totalBudget * 0.9) {
      tips.push(`⚠️ You've used ${((monthTotal / totalBudget) * 100).toFixed(0)}% of your monthly budget. Try to reduce discretionary spending for the rest of the month.`);
    }
  }

  // General tips
  tips.push('📱 Use UPI cashback offers from PhonePe, GPay, and BHIM to save 1-5% on everyday purchases.');
  tips.push('📚 Check your college library for textbooks before buying. It can save ₹500–₹5,000 per semester.');
  tips.push('🎓 Apply for at least one scholarship each month. Even small amounts add up over a year.');
  tips.push('💰 Follow the 50/30/20 rule: 50% needs, 30% wants, 20% savings.');

  if (expenses.length > 10) {
    const transport = catSpend['Transport'] || 0;
    if (transport > 2000) tips.push('🚌 Consider using public transport or carpooling to cut transport costs.');
  }

  return tips.slice(0, 5);
}

export default function Insights() {
  const { expenses, budgets, getMonthTotal, getCategorySpending } = useFinance();

  const now = new Date();
  const thisMonth = getMonthKey(now);

  // Last 6 months trend
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
    return CATEGORIES.map(cat => ({ name: cat, amount: catSpend[cat] || 0 }))
      .filter(d => d.amount > 0)
      .sort((a, b) => b.amount - a.amount);
  }, [catSpend]);

  // Budget allocation pie
  const monthBudget = budgets[thisMonth] || {};
  const pieData = useMemo(() => {
    return CATEGORIES
      .map(cat => ({ name: cat, value: monthBudget[cat] || 0 }))
      .filter(d => d.value > 0);
  }, [monthBudget]);

  // Savings rate trend
  const savingsData = useMemo(() => {
    return trendData.map(d => {
      const budget = budgets[d.month] || {};
      const totalBudget = Object.values(budget).reduce((s, v) => s + v, 0);
      const rate = totalBudget > 0 ? Math.max(0, ((totalBudget - d.total) / totalBudget) * 100) : 0;
      return { name: d.name, rate: parseFloat(rate.toFixed(1)) };
    });
  }, [trendData, budgets]);

  const tips = useMemo(() => generateTips(expenses, budgets), [expenses, budgets]);

  const hasData = expenses.length > 0;
  const SAMPLE_BAR = [
    { name: 'Food', amount: 3200 },
    { name: 'Transport', amount: 800 },
    { name: 'Books', amount: 1500 },
    { name: 'Entertainment', amount: 600 },
    { name: 'Health', amount: 400 },
  ];
  const SAMPLE_LINE = [
    { name: 'Jun', total: 7200 },
    { name: 'Jul', total: 8100 },
    { name: 'Aug', total: 6500 },
    { name: 'Sep', total: 9200 },
    { name: 'Oct', total: 7800 },
    { name: 'Nov', total: 8500 },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Spending Insights</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          {hasData ? 'Analytics based on your data' : 'Sample data shown — add expenses to see your analytics'}
        </p>
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Bar chart: spending by category */}
        <div className="border border-black rounded-xl p-5">
          <h2 className="font-bold mb-1">Spending by Category</h2>
          <p className="text-xs text-gray-500 mb-4">This month</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={catData.length > 0 ? catData : SAMPLE_BAR} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
              <Tooltip formatter={v => formatCurrency(v)} />
              <Bar dataKey="amount" fill="#000000" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Line chart: monthly trend */}
        <div className="border border-black rounded-xl p-5">
          <h2 className="font-bold mb-1">Monthly Spending Trend</h2>
          <p className="text-xs text-gray-500 mb-4">Last 6 months</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={hasData ? trendData : SAMPLE_LINE} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
              <Tooltip formatter={v => formatCurrency(v)} />
              <Line type="monotone" dataKey="total" stroke="#000000" strokeWidth={2.5} dot={{ fill: '#000', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart: budget allocation */}
        <div className="border border-black rounded-xl p-5">
          <h2 className="font-bold mb-1">Budget Allocation</h2>
          <p className="text-xs text-gray-500 mb-4">This month's budget breakdown</p>
          {pieData.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-gray-400 text-sm">
              Set monthly budgets to see allocation chart
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                  fontSize={11}
                >
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={GRAYS[index % GRAYS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={v => formatCurrency(v)} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Line chart: savings rate */}
        <div className="border border-black rounded-xl p-5">
          <h2 className="font-bold mb-1">Savings Rate Trend</h2>
          <p className="text-xs text-gray-500 mb-4">% of budget saved per month</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={savingsData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} domain={[0, 100]} />
              <Tooltip formatter={v => `${v}%`} />
              <Line type="monotone" dataKey="rate" stroke="#000000" strokeWidth={2.5} dot={{ fill: '#000', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Smart Tips */}
      <div className="border border-black rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5" />
          <h2 className="font-bold text-lg">Smart Money Tips</h2>
        </div>
        <div className="space-y-3">
          {tips.map((tip, i) => (
            <div key={i} className={`p-4 rounded-xl border border-black ${i === 0 ? 'bg-black text-white' : 'bg-white'}`}>
              <p className="text-sm leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
