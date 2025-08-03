import React, { useState } from 'react';

const WalnutHeader = ({ onGetStarted }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <span className="ml-3 text-2xl font-bold text-gray-900">ExpenseAI</span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a href="#features" className="text-gray-600 hover:text-green-600 transition-colors font-medium">Features</a>
            <a href="#how-it-works" className="text-gray-600 hover:text-green-600 transition-colors font-medium">How it Works</a>
            <a href="#about" className="text-gray-600 hover:text-green-600 transition-colors font-medium">About</a>
            <a href="#contact" className="text-gray-600 hover:text-green-600 transition-colors font-medium">Contact</a>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={onGetStarted}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Sign In
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-gray-900 focus:outline-none focus:text-gray-900"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
              <a href="#features" className="block px-3 py-2 text-gray-600 hover:text-green-600 font-medium">Features</a>
              <a href="#how-it-works" className="block px-3 py-2 text-gray-600 hover:text-green-600 font-medium">How it Works</a>
              <a href="#about" className="block px-3 py-2 text-gray-600 hover:text-green-600 font-medium">About</a>
              <a href="#contact" className="block px-3 py-2 text-gray-600 hover:text-green-600 font-medium">Contact</a>
              <div className="pt-4 pb-2 border-t border-gray-200">
                <button
                  onClick={onGetStarted}
                  className="block w-full bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-all duration-200"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default WalnutHeader;
