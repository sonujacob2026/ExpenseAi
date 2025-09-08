import React from 'react';

const WalnutAbout = () => {
  const stats = [
    { number: "50K+", label: "Active Users", description: "Families managing their finances" },
    { number: "₹2Cr+", label: "Money Saved", description: "Through smart budgeting" },
    { number: "95%", label: "User Satisfaction", description: "Love our platform" },
    { number: "24/7", label: "AI Monitoring", description: "Continuous expense tracking" }
  ];

  return (
    <section id="about" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Take control of your financial future
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Managing personal or household finances can be complex and time-consuming, often leading to overspending, poor savings habits, and financial stress. ExpenseAI simplifies financial management for individuals and families through intelligent automation and personalized insights.
            </p>
            <p className="text-lg text-gray-600 mb-8">
              Our AI-powered platform goes beyond traditional tracking tools, enabling users to make informed financial decisions, build savings, and achieve long-term financial goals without requiring deep financial expertise.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-green-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-lg text-gray-700">Real-time expense tracking and categorization</span>
              </div>
              <div className="flex items-center">
                <svg className="w-6 h-6 text-green-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-lg text-gray-700">AI-driven monthly budget planning</span>
              </div>
              <div className="flex items-center">
                <svg className="w-6 h-6 text-green-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-lg text-gray-700">Predictive analytics for future financial trends</span>
              </div>
              <div className="flex items-center">
                <svg className="w-6 h-6 text-green-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-lg text-gray-700">Smart suggestions to reduce unnecessary expenses</span>
              </div>
            </div>
          </div>

          <div className="relative">
            {/* Mock Dashboard Preview */}
            <div className="bg-white rounded-2xl shadow-2xl p-6">
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Financial Dashboard</h3>
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                </div>

                {/* Budget Overview */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Monthly Budget</span>
                    <span className="text-sm font-semibold text-green-600">On Track</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-2">₹2,340 / ₹3,000</div>
                  <div className="w-full bg-white rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{width: '78%'}}></div>
                  </div>
                </div>

                {/* Recent Transactions */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Recent Transactions</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-xs">🛒</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Grocery Store</p>
                          <p className="text-xs text-gray-500">Today</p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold">-₹85.50</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-xs">💰</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Salary Deposit</p>
                          <p className="text-xs text-gray-500">Yesterday</p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-green-600">+₹3,200</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-2xl p-8 lg:p-12 shadow-lg">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Trusted by thousands of families
            </h3>
            <p className="text-lg text-gray-600">
              Join the growing community of users who have transformed their financial lives
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">{stat.number}</div>
                <div className="text-lg font-semibold text-gray-900 mb-1">{stat.label}</div>
                <div className="text-sm text-gray-600">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WalnutAbout;
