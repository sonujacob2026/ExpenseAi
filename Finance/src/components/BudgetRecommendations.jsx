import React from 'react';

const BudgetRecommendations = ({ profile }) => {
  if (!profile || !profile.monthlyIncome) {
    return null;
  }

  const monthlyIncome = parseInt(profile.monthlyIncome) || 0;
  const hasDebt = profile.hasDebt === 'yes';
  const debtAmount = parseInt(profile.debtAmount) || 0;

  // Calculate recommended budget using 50/30/20 rule (adjusted for debt)
  const calculateBudget = () => {
    let needs = monthlyIncome * 0.5; // 50% for needs
    let wants = monthlyIncome * 0.3; // 30% for wants
    let savings = monthlyIncome * 0.2; // 20% for savings

    // Adjust if there's debt
    if (hasDebt && debtAmount > 0) {
      const monthlyDebtPayment = Math.min(debtAmount / 24, monthlyIncome * 0.15); // Max 15% for debt
      wants = Math.max(wants - monthlyDebtPayment, monthlyIncome * 0.15); // Reduce wants, minimum 15%
      savings = monthlyIncome - needs - wants - monthlyDebtPayment;
    }

    return {
      needs: Math.round(needs),
      wants: Math.round(wants),
      savings: Math.round(savings),
      debt: hasDebt ? Math.round(Math.min(debtAmount / 24, monthlyIncome * 0.15)) : 0
    };
  };

  const budget = calculateBudget();

  // Get category recommendations based on primary expenses
  const getCategoryRecommendations = () => {
    const categories = [];
    
    if (profile.primaryExpenses?.includes('Groceries')) {
      categories.push({
        name: 'Groceries',
        recommended: Math.round(budget.needs * 0.3),
        tip: 'Plan meals and buy in bulk to save money'
      });
    }
    
    if (profile.primaryExpenses?.includes('Rent/Mortgage')) {
      categories.push({
        name: 'Housing',
        recommended: Math.round(budget.needs * 0.6),
        tip: 'Housing should not exceed 30% of total income'
      });
    }
    
    if (profile.primaryExpenses?.includes('Transportation')) {
      categories.push({
        name: 'Transportation',
        recommended: Math.round(budget.needs * 0.15),
        tip: 'Consider public transport or carpooling to reduce costs'
      });
    }
    
    if (profile.primaryExpenses?.includes('Entertainment')) {
      categories.push({
        name: 'Entertainment',
        recommended: Math.round(budget.wants * 0.4),
        tip: 'Look for free or low-cost entertainment options'
      });
    }

    return categories;
  };

  const categoryRecommendations = getCategoryRecommendations();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Recommended Monthly Budget
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            ₹{budget.needs.toLocaleString()}
          </div>
          <div className="text-sm text-blue-800 font-medium">Needs (50%)</div>
          <div className="text-xs text-blue-600 mt-1">
            Rent, groceries, utilities
          </div>
        </div>
        
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            ₹{budget.wants.toLocaleString()}
          </div>
          <div className="text-sm text-green-800 font-medium">Wants (30%)</div>
          <div className="text-xs text-green-600 mt-1">
            Entertainment, dining out
          </div>
        </div>
        
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            ₹{budget.savings.toLocaleString()}
          </div>
          <div className="text-sm text-purple-800 font-medium">Savings (20%)</div>
          <div className="text-xs text-purple-600 mt-1">
            Emergency fund, investments
          </div>
        </div>
        
        {budget.debt > 0 && (
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              ₹{budget.debt.toLocaleString()}
            </div>
            <div className="text-sm text-red-800 font-medium">Debt Payment</div>
            <div className="text-xs text-red-600 mt-1">
              Extra debt payments
            </div>
          </div>
        )}
      </div>

      {categoryRecommendations.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Category Breakdown</h4>
          <div className="space-y-3">
            {categoryRecommendations.map((category, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{category.name}</div>
                  <div className="text-xs text-gray-600">{category.tip}</div>
                </div>
                <div className="text-lg font-semibold text-gray-900">
                  ₹{category.recommended.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="text-sm text-yellow-800">
          <strong>💡 Tip:</strong> This budget is based on your questionnaire responses. 
          You can adjust these amounts based on your actual spending patterns.
        </div>
      </div>
    </div>
  );
};

export default BudgetRecommendations;
