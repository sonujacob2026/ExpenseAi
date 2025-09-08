import React from 'react';
import { useNavigate } from 'react-router-dom';

const FinancialInsights = ({ profile }) => {
  const navigate = useNavigate();
  if (!profile) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">
          Complete Your Profile
        </h3>
        <p className="text-blue-600 mb-4">
          Complete the questionnaire to get personalized financial insights and recommendations.
        </p>
        <button
          onClick={() => navigate('/questionnaire')}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
          Start Questionnaire
        </button>
      </div>
    );
  }

  // Generate insights based on profile data
  const generateInsights = () => {
    const insights = [];
    const monthlyIncome = parseInt(profile.monthlyIncome) || 0;
    const householdSize = parseInt(profile.householdMembers) || 1;
    const hasDebt = profile.hasDebt === 'yes';
    const debtAmount = parseInt(profile.debtAmount) || 0;

    // Income-based insights
    if (monthlyIncome > 0) {
      const perPersonIncome = monthlyIncome / householdSize;
      if (perPersonIncome < 25000) {
        insights.push({
          type: 'warning',
          title: 'Budget Optimization',
          message: `With ₹${monthlyIncome.toLocaleString()} monthly income for ${householdSize} ${householdSize === 1 ? 'person' : 'people'}, focus on essential expenses and look for income opportunities.`,
          action: 'Track every expense carefully'
        });
      } else if (perPersonIncome > 50000) {
        insights.push({
          type: 'success',
          title: 'Investment Opportunity',
          message: `Great income level! Consider investing 20-30% of your ₹${monthlyIncome.toLocaleString()} monthly income.`,
          action: 'Explore investment options'
        });
      }
    }

    // Debt-based insights
    if (hasDebt && debtAmount > 0) {
      const debtToIncomeRatio = (debtAmount / (monthlyIncome * 12)) * 100;
      if (debtToIncomeRatio > 30) {
        insights.push({
          type: 'danger',
          title: 'Debt Management Priority',
          message: `Your debt of ₹${debtAmount.toLocaleString()} is ${debtToIncomeRatio.toFixed(1)}% of annual income. Focus on debt reduction.`,
          action: 'Create a debt payoff plan'
        });
      } else {
        insights.push({
          type: 'info',
          title: 'Manageable Debt',
          message: `Your debt level is manageable. Consider the debt avalanche method to pay it off efficiently.`,
          action: 'Optimize debt payments'
        });
      }
    }

    // Goals-based insights
    if (profile.financialGoals?.includes('Build Emergency Fund')) {
      const emergencyFundTarget = monthlyIncome * 6;
      insights.push({
        type: 'info',
        title: 'Emergency Fund Goal',
        message: `Target: ₹${emergencyFundTarget.toLocaleString()} (6 months of expenses)`,
        action: 'Save ₹' + Math.round(emergencyFundTarget / 12).toLocaleString() + ' monthly'
      });
    }

    if (profile.financialGoals?.includes('Retirement Planning')) {
      const retirementSaving = Math.round(monthlyIncome * 0.15);
      insights.push({
        type: 'success',
        title: 'Retirement Planning',
        message: `Start with 15% of income for retirement`,
        action: 'Save ₹' + retirementSaving.toLocaleString() + ' monthly'
      });
    }

    return insights;
  };

  const insights = generateInsights();

  const getInsightStyle = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'danger':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'danger':
        return '🚨';
      case 'info':
      default:
        return '💡';
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Your Personalized Financial Insights
      </h3>
      
      {insights.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <p className="text-gray-600">
            Complete more questionnaire details to get personalized insights.
          </p>
        </div>
      ) : (
        insights.map((insight, index) => (
          <div
            key={index}
            className={`border rounded-lg p-4 ${getInsightStyle(insight.type)}`}
          >
            <div className="flex items-start space-x-3">
              <span className="text-xl">{getIconForType(insight.type)}</span>
              <div className="flex-1">
                <h4 className="font-semibold mb-1">{insight.title}</h4>
                <p className="text-sm mb-2">{insight.message}</p>
                <div className="text-xs font-medium opacity-75">
                  💡 Action: {insight.action}
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default FinancialInsights;
