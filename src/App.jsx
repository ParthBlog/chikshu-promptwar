import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { FinanceProvider } from './context/FinanceContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Budget from './pages/Budget';
import Savings from './pages/Savings';
import Scholarships from './pages/Scholarships';
import PartTime from './pages/PartTime';
import Insights from './pages/Insights';
import AICopilot from './pages/AICopilot';
import SplitBill from './pages/SplitBill';

export default function App() {
  return (
    <AuthProvider>
      <FinanceProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/ai-copilot" element={<AICopilot />} />
                      <Route path="/expenses" element={<Expenses />} />
                      <Route path="/budget" element={<Budget />} />
                      <Route path="/savings" element={<Savings />} />
                      <Route path="/scholarships" element={<Scholarships />} />
                      <Route path="/parttime" element={<PartTime />} />
                      <Route path="/splitbill" element={<SplitBill />} />
                      <Route path="/insights" element={<Insights />} />
                      <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </FinanceProvider>
    </AuthProvider>
  );
}
