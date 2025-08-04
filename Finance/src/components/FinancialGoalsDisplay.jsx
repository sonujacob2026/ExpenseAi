import React from 'react';

const FinancialGoalsDisplay = ({ profile }) => {
  if (!profile || !profile.financialGoals || profile.financialGoals.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Financial Goals</h3>
        <p className="text-gray-600">Complete the questionnaire to set your financial goals.</p>
      </div>
    );
  }

  const getGoalIcon = (goal) => {
    switch (goal) {
      case 'Build Emergency Fund':
        return '🛡️';
      case 'Pay Off Debt':
        return '💳';
      case 'Save for Vacation':
        return '✈️';
      case 'Buy a Home':
        return '🏠';
      case 'Retirement Planning':
        return '👴';
      case 'Investment Growth':
        return '📈';
      case 'Education Fund':
        return '🎓';
      case 'Start a Business':
        return '💼';
      default:
        return '🎯';
    }
  };

  const getGoalProgress = (goal) => {
    // This would be calculated based on actual savings/progress
    // For now, return a random progress for demonstration
    const progressMap = {
      'Build Emergency Fund': 25,
      'Pay Off Debt': 60,
      'Save for Vacation': 40,
      'Buy a Home': 15,
      'Retirement Planning': 30,
      'Investment Growth': 45,
      'Education Fund': 20,
      'Start a Business': 10
    };
    return progressMap[goal] || 0;
  };

  const getGoalColor = (progress) => {
    if (progress >= 75) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 25) return 'bg-yellow-500';
    return 'bg-gray-300';
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Financial Goals</h3>
      
      <div className="space-y-4">
        {profile.financialGoals.map((goal, index) => {
          const progress = getGoalProgress(goal);
          return (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getGoalIcon(goal)}</span>
                  <span className="font-medium text-gray-900">{goal}</span>
                </div>
                <span className="text-sm font-medium text-gray-600">{progress}%</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getGoalColor(progress)}`}
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              
              <div className="mt-2 text-xs text-gray-500">
                {progress === 0 && "Just getting started! 🚀"}
                {progress > 0 && progress < 25 && "Making progress! Keep going! 💪"}
                {progress >= 25 && progress < 50 && "Quarter way there! Great job! 🎉"}
                {progress >= 50 && progress < 75 && "More than halfway! Excellent! ⭐"}
                {progress >= 75 && "Almost there! You're doing amazing! 🏆"}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="text-sm text-blue-800">
          <strong>💡 Tip:</strong> Set specific amounts and deadlines for each goal to track progress more effectively.
        </div>
      </div>
    </div>
  );
};

export default FinancialGoalsDisplay;
