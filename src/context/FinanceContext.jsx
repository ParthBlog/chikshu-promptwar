import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { getArray, getObject, setItem, KEYS } from '../utils/storage';

const FinanceContext = createContext(null);

const initialState = {
  expenses: [],
  budgets: {},      // { 'YYYY-MM': { Food: 2000, Transport: 500, ... } }
  savingsGoals: [],
};

function financeReducer(state, action) {
  switch (action.type) {
    case 'LOAD_DATA':
      return { ...state, ...action.payload };

    // Expenses
    case 'ADD_EXPENSE': {
      const expenses = [action.payload, ...state.expenses];
      return { ...state, expenses };
    }
    case 'DELETE_EXPENSE': {
      const expenses = state.expenses.filter(e => e.id !== action.payload);
      return { ...state, expenses };
    }

    // Budgets
    case 'SET_BUDGET': {
      const { month, category, amount } = action.payload;
      const budgets = {
        ...state.budgets,
        [month]: { ...(state.budgets[month] || {}), [category]: amount },
      };
      return { ...state, budgets };
    }
    case 'SET_MONTH_BUDGET': {
      const { month, budgetMap } = action.payload;
      const budgets = { ...state.budgets, [month]: budgetMap };
      return { ...state, budgets };
    }

    // Savings
    case 'ADD_SAVINGS_GOAL': {
      const savingsGoals = [...state.savingsGoals, action.payload];
      return { ...state, savingsGoals };
    }
    case 'UPDATE_SAVINGS_GOAL': {
      const savingsGoals = state.savingsGoals.map(g =>
        g.id === action.payload.id ? { ...g, ...action.payload } : g
      );
      return { ...state, savingsGoals };
    }
    case 'DELETE_SAVINGS_GOAL': {
      const savingsGoals = state.savingsGoals.filter(g => g.id !== action.payload);
      return { ...state, savingsGoals };
    }
    case 'CONTRIBUTE_TO_GOAL': {
      const { goalId, amount } = action.payload;
      const savingsGoals = state.savingsGoals.map(g => {
        if (g.id !== goalId) return g;
        const newSaved = Math.min(g.targetAmount, (g.savedAmount || 0) + amount);
        return { ...g, savedAmount: newSaved, completed: newSaved >= g.targetAmount };
      });
      return { ...state, savingsGoals };
    }

    default:
      return state;
  }
}

export function FinanceProvider({ children }) {
  const [state, dispatch] = useReducer(financeReducer, initialState);

  // Load from localStorage on mount
  useEffect(() => {
    const expenses = getArray(KEYS.EXPENSES);
    const budgets = getObject(KEYS.BUDGETS, {});
    const savingsGoals = getArray(KEYS.SAVINGS_GOALS);
    dispatch({ type: 'LOAD_DATA', payload: { expenses, budgets, savingsGoals } });
  }, []);

  // Persist expenses
  useEffect(() => {
    if (state.expenses !== initialState.expenses) {
      setItem(KEYS.EXPENSES, state.expenses);
    }
  }, [state.expenses]);

  // Persist budgets
  useEffect(() => {
    if (state.budgets !== initialState.budgets) {
      setItem(KEYS.BUDGETS, state.budgets);
    }
  }, [state.budgets]);

  // Persist savings goals
  useEffect(() => {
    if (state.savingsGoals !== initialState.savingsGoals) {
      setItem(KEYS.SAVINGS_GOALS, state.savingsGoals);
    }
  }, [state.savingsGoals]);

  // Helpers
  function getMonthExpenses(month) {
    // month: 'YYYY-MM'
    return state.expenses.filter(e => e.date && e.date.startsWith(month));
  }

  function getMonthTotal(month) {
    return getMonthExpenses(month).reduce((sum, e) => sum + e.amount, 0);
  }

  function getMonthBudget(month) {
    return state.budgets[month] || {};
  }

  function getTotalBudget(month) {
    const budget = getMonthBudget(month);
    return Object.values(budget).reduce((sum, v) => sum + (v || 0), 0);
  }

  function getCategorySpending(month) {
    const expenses = getMonthExpenses(month);
    const result = {};
    expenses.forEach(e => {
      result[e.category] = (result[e.category] || 0) + e.amount;
    });
    return result;
  }

  return (
    <FinanceContext.Provider value={{
      ...state,
      dispatch,
      getMonthExpenses,
      getMonthTotal,
      getMonthBudget,
      getTotalBudget,
      getCategorySpending,
    }}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  return useContext(FinanceContext);
}

export const CATEGORIES = ['Food', 'Transport', 'Books', 'Rent', 'Entertainment', 'Health', 'Other'];
