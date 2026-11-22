// Category color palettes, icons, and badge styling
import { Utensils, Bus, BookOpen, Home, Film, HeartPulse, MoreHorizontal } from 'lucide-react';

export const CATEGORY_THEMES = {
  Food: {
    name: 'Food',
    icon: Utensils,
    color: '#f59e0b',
    bgLight: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-800 border-amber-300',
    gradient: 'from-amber-500 to-orange-500',
  },
  Transport: {
    name: 'Transport',
    icon: Bus,
    color: '#0284c7',
    bgLight: 'bg-sky-50',
    text: 'text-sky-700',
    border: 'border-sky-200',
    badge: 'bg-sky-100 text-sky-800 border-sky-300',
    gradient: 'from-sky-500 to-blue-600',
  },
  Books: {
    name: 'Books',
    icon: BookOpen,
    color: '#6366f1',
    bgLight: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    badge: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    gradient: 'from-indigo-500 to-purple-600',
  },
  Rent: {
    name: 'Rent',
    icon: Home,
    color: '#e11d48',
    bgLight: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    badge: 'bg-rose-100 text-rose-800 border-rose-300',
    gradient: 'from-rose-500 to-pink-600',
  },
  Entertainment: {
    name: 'Entertainment',
    icon: Film,
    color: '#9333ea',
    bgLight: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    badge: 'bg-purple-100 text-purple-800 border-purple-300',
    gradient: 'from-purple-500 to-fuchsia-600',
  },
  Health: {
    name: 'Health',
    icon: HeartPulse,
    color: '#059669',
    bgLight: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    gradient: 'from-emerald-500 to-teal-600',
  },
  Other: {
    name: 'Other',
    icon: MoreHorizontal,
    color: '#64748b',
    bgLight: 'bg-slate-50',
    text: 'text-slate-700',
    border: 'border-slate-200',
    badge: 'bg-slate-100 text-slate-800 border-slate-300',
    gradient: 'from-slate-500 to-zinc-600',
  },
};

export function getCategoryTheme(cat) {
  return CATEGORY_THEMES[cat] || CATEGORY_THEMES.Other;
}
