import React, { useState } from 'react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <span className="ml-3 text-xl font-bold text-gray-900">FinanceAI</span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a href="#features" className="text-gray-600 hover:text-primary-600 transition-colors">Features</a>
            <a href="#about" className="text-gray-600 hover:text-primary-600 transition-colors">About</a>
            <a href="#timeline" className="text-gray-600 hover:text-primary-600 transition-colors">Roadmap</a>
            <a href="#contact" className="text-gray-600 hover:text-primary-600 transition-colors">Contact</a>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="text-primary-600 hover:text-primary-700 font-medium transition-colors">
              Sign In
            </button>
            <button className="btn-primary">
              Get Started
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
              <a href="#features" className="block px-3 py-2 text-gray-600 hover:text-primary-600">Features</a>
              <a href="#about" className="block px-3 py-2 text-gray-600 hover:text-primary-600">About</a>
              <a href="#timeline" className="block px-3 py-2 text-gray-600 hover:text-primary-600">Roadmap</a>
              <a href="#contact" className="block px-3 py-2 text-gray-600 hover:text-primary-600">Contact</a>
              <div className="pt-4 pb-2 border-t border-gray-200">
                <button className="block w-full text-left px-3 py-2 text-primary-600 font-medium">Sign In</button>
                <button className="block w-full mt-2 btn-primary">Get Started</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
