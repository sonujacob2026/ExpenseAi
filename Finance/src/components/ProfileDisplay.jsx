import React from 'react';
import { useProfile } from '../context/ProfileContext';

const ProfileDisplay = () => {
  const { profile, loading, onboardingCompleted } = useProfile();

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
        <p className="text-gray-600">No profile data available. Please complete the questionnaire.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Profile</h3>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Household Members</label>
            <p className="mt-1 text-sm text-gray-900">
              {profile.household_members || 'Not specified'}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Monthly Income</label>
            <p className="mt-1 text-sm text-gray-900">
              {profile.monthly_income ? `₹${profile.monthly_income.toLocaleString()}` : 'Not specified'}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Has Debt</label>
            <p className="mt-1 text-sm text-gray-900">
              {profile.has_debt ? 'Yes' : 'No'}
              {profile.has_debt && profile.debt_amount && (
                <span className="ml-2 text-gray-600">
                  (₹{profile.debt_amount.toLocaleString()})
                </span>
              )}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Budgeting Experience</label>
            <p className="mt-1 text-sm text-gray-900 capitalize">
              {profile.budgeting_experience || 'Not specified'}
            </p>
          </div>
        </div>
        
        {profile.primary_expenses && profile.primary_expenses.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Primary Expenses</label>
            <div className="mt-1 flex flex-wrap gap-2">
              {profile.primary_expenses.map((expense, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                >
                  {expense}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {profile.financial_goals && profile.financial_goals.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Financial Goals</label>
            <div className="mt-1 flex flex-wrap gap-2">
              {profile.financial_goals.map((goal, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {goal}
                </span>
              ))}
            </div>
          </div>
        )}
        
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Onboarding Status</span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              onboardingCompleted 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {onboardingCompleted ? 'Completed' : 'Pending'}
            </span>
          </div>
          
          {profile.profile_updated_at && (
            <p className="mt-2 text-xs text-gray-500">
              Last updated: {new Date(profile.profile_updated_at).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileDisplay;