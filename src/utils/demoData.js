// Realistic student demo dataset for hackathon judging and AI evaluation
import { KEYS, setItem, getItem } from './storage';

export function getSampleStudentData() {
  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7);
  const currentYear = now.getFullYear();
  const monthNum = String(now.getMonth() + 1).padStart(2, '0');
  
  // Create dates for current month
  const d = (day) => `${currentYear}-${monthNum}-${String(day).padStart(2, '0')}`;

  const demoExpenses = [
    { id: 'exp-1', amount: 120, category: 'Food', description: 'College Canteen Lunch & Chai', date: d(2) },
    { id: 'exp-2', amount: 450, category: 'Transport', description: 'Monthly Metro SmartCard Recharge', date: d(3) },
    { id: 'exp-3', amount: 1250, category: 'Books', description: 'Data Structures & Algorithms Textbook', date: d(5) },
    { id: 'exp-4', amount: 4500, category: 'Rent', description: 'Hostel / Shared PG Monthly Share', date: d(1) },
    { id: 'exp-5', amount: 280, category: 'Food', description: 'Weekend Dinner with Roommates', date: d(8) },
    { id: 'exp-6', amount: 199, category: 'Entertainment', description: 'Spotify Student Subscription', date: d(10) },
    { id: 'exp-7', amount: 350, category: 'Health', description: 'Vitamins & First-Aid Supplies', date: d(11) },
    { id: 'exp-8', amount: 180, category: 'Transport', description: 'Auto-rickshaw to Hackathon Venue', date: d(12) },
    { id: 'exp-9', amount: 650, category: 'Books', description: 'Lab Manuals & Engineering Stationery', date: d(14) },
    { id: 'exp-10', amount: 220, category: 'Food', description: 'Late Night Exam Snacks & Coffee', date: d(15) },
    { id: 'exp-11', amount: 499, category: 'Entertainment', description: 'Movie Ticket & Popcorn (Student Discount)', date: d(17) },
    { id: 'exp-12', amount: 300, category: 'Other', description: 'Laundry & Hostel Maintenance', date: d(18) },
    { id: 'exp-13', amount: 160, category: 'Food', description: 'Juice & Evening Breakfast', date: d(19) },
    { id: 'exp-14', amount: 350, category: 'Transport', description: 'Bus pass return journey', date: d(20) },
  ];

  const demoBudgets = {
    [currentMonth]: {
      Food: 3000,
      Transport: 1500,
      Books: 2500,
      Rent: 5000,
      Entertainment: 1200,
      Health: 1000,
      Other: 800,
    }
  };

  const demoSavings = [
    {
      id: 'sav-1',
      name: 'MacBook Pro / Coding Laptop',
      targetAmount: 65000,
      savedAmount: 42000,
      deadline: `${currentYear}-12-31`,
      priority: 'High',
      contributions: [
        { date: d(1), amount: 5000 },
        { date: d(10), amount: 7000 },
      ],
      completed: false,
    },
    {
      id: 'sav-2',
      name: 'Semester Exam Emergency Fund',
      targetAmount: 10000,
      savedAmount: 7500,
      deadline: `${currentYear}-11-30`,
      priority: 'High',
      contributions: [
        { date: d(2), amount: 2500 },
      ],
      completed: false,
    },
    {
      id: 'sav-3',
      name: 'Annual Tech Fest & Goa Trip',
      targetAmount: 12000,
      savedAmount: 5400,
      deadline: `${currentYear + 1}-02-28`,
      priority: 'Medium',
      contributions: [
        { date: d(5), amount: 1500 },
      ],
      completed: false,
    }
  ];

  return {
    expenses: demoExpenses,
    budgets: demoBudgets,
    savingsGoals: demoSavings,
    userName: 'Aryan Sharma',
  };
}

// Function to seed demo data
export function seedDemoData() {
  const data = getSampleStudentData();
  setItem(KEYS.EXPENSES, data.expenses);
  setItem(KEYS.BUDGETS, data.budgets);
  setItem(KEYS.SAVINGS_GOALS, data.savingsGoals);
  setItem(KEYS.USER_NAME, data.userName);
  // Default PIN '1234' hash
  // SHA-256 for '1234' is: 03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4
  setItem(KEYS.PIN_HASH, '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4');
  return data;
}

// Check if data is already initialized
export function isDataInitialized() {
  const exp = getItem(KEYS.EXPENSES);
  return !!exp && exp.length > 0;
}
