import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AddExpenseModal from './AddExpenseModal';
import ExpenseList from './ExpenseList';
import ExpenseStats from './ExpenseStats';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    getProfile();
    loadExpenses();
  }, []);

  const getProfile = async () => {
    try {
      // Get profile from localStorage
      const savedProfile = localStorage.getItem('expenseai_profile');
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadExpenses = () => {
    try {
      const savedExpenses = localStorage.getItem('expenseai_expenses');
      if (savedExpenses) {
        setExpenses(JSON.parse(savedExpenses));
      }
    } catch (error) {
      console.error('Error loading expenses:', error);
    }
  };

  // Save expenses to localStorage whenever expenses change
  useEffect(() => {
    localStorage.setItem('expenseai_expenses', JSON.stringify(expenses));
  }, [expenses]);

  const addExpense = (newExpense) => {
    const expense = {
      id: Date.now().toString(),
      ...newExpense,
      createdAt: new Date().toISOString()
    };
    setExpenses(prev => [expense, ...prev]);
    setShowAddExpense(false);
  };

  const deleteExpense = (expenseId) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      setExpenses(prev => prev.filter(expense => expense.id !== expenseId));
    }
  };

  const editExpense = (expenseId, updatedExpense) => {
    setExpenses(prev =>
      prev.map(expense =>
        expense.id === expenseId
          ? { ...expense, ...updatedExpense, updatedAt: new Date().toISOString() }
          : expense
      )
    );
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="ml-3 text-2xl font-bold text-gray-900">ExpenseAI</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.fullName || user?.email}</span>
              <button
                onClick={handleSignOut}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-8 text-white mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome to your Financial Dashboard!</h1>
          <p className="text-green-100">
            {profile ? 
              `Great! We've set up your profile with ${profile.household_members} household members and your financial goals.` :
              "Let's get started with tracking your expenses and managing your budget."
            }
          </p>
        </div>

        {/* Profile Summary */}
        {profile && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Household Members</p>
                  <p className="text-2xl font-bold text-gray-900">{profile.household_members}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Monthly Income</p>
                  <p className="text-2xl font-bold text-gray-900">${profile.monthly_income?.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Debt Status</p>
                  <p className="text-2xl font-bold text-gray-900">{profile.has_debt ? 'Yes' : 'None'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Experience Level</p>
                  <p className="text-lg font-bold text-gray-900 capitalize">{profile.budgeting_experience}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Expense</h3>
            <p className="text-gray-600 mb-4">Record a new expense transaction</p>
            <button
              onClick={() => setShowAddExpense(true)}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Add Expense
            </button>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">View Budget</h3>
            <p className="text-gray-600 mb-4">Check your monthly budget status</p>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors">
              View Budget
            </button>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Goals</h3>
            <p className="text-gray-600 mb-4">Track your savings and goals</p>
            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors">
              View Goals
            </button>
          </div>
        </div>

        {/* Expense Statistics */}
        <ExpenseStats expenses={expenses} />

        {/* Expense List */}
        <ExpenseList
          expenses={expenses}
          onDelete={deleteExpense}
          onEdit={editExpense}
        />

        {/* Coming Soon Features */}
        <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Coming Soon</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Expense Analytics</h3>
              <p className="text-gray-600">Detailed insights into your spending patterns with AI-powered recommendations.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Bill Reminders</h3>
              <p className="text-gray-600">Never miss a payment with intelligent bill tracking and notifications.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Bank Integration</h3>
              <p className="text-gray-600">Connect your bank accounts for automatic transaction import.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Family Sharing</h3>
              <p className="text-gray-600">Share budgets and expenses with family members securely.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Add Expense Modal */}
      {showAddExpense && (
        <AddExpenseModal
          onClose={() => setShowAddExpense(false)}
          onAdd={addExpense}
        />
      )}
    </div>
  );
};

export default Dashboard;
