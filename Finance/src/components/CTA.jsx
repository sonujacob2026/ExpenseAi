import React from 'react';

const CTA = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 gradient-bg"></div>
      
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="cta-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <circle cx="30" cy="30" r="1.5" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#cta-pattern)" />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Main CTA content */}
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your
            <span className="block bg-gradient-to-r from-accent-300 to-accent-500 bg-clip-text text-transparent">
              Financial Future?
            </span>
          </h2>
          
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
            Join thousands of users who have already started their journey to financial wellness with our AI-powered platform.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button className="btn-primary bg-white text-primary-600 hover:bg-gray-50 px-8 py-4 text-lg font-semibold">
              Start Your Free Trial
            </button>
            <button className="btn-secondary border-white text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold">
              Schedule a Demo
            </button>
          </div>

          {/* Trust indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-center text-white/80">
              <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-lg">Bank-level Security</span>
            </div>
            
            <div className="flex items-center justify-center text-white/80">
              <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-lg">30-Day Money Back</span>
            </div>
            
            <div className="flex items-center justify-center text-white/80">
              <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span className="text-lg">24/7 Support</span>
            </div>
          </div>

          {/* Additional info */}
          <div className="mt-12 text-center">
            <p className="text-white/70 text-sm">
              No credit card required • Cancel anytime • GDPR compliant
            </p>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-accent-400 rounded-full opacity-20 animate-bounce-slow"></div>
      <div className="absolute bottom-10 right-10 w-16 h-16 bg-white rounded-full opacity-20 animate-bounce-slow" style={{animationDelay: '2s'}}></div>
      <div className="absolute top-1/2 left-20 w-12 h-12 bg-accent-300 rounded-full opacity-30 animate-bounce-slow" style={{animationDelay: '1s'}}></div>
    </section>
  );
};

export default CTA;
