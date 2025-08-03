import React from 'react';

const Timeline = () => {
  const phases = [
    {
      phase: "Phase 1",
      title: "Core Personal Tracker",
      duration: "Months 1-3",
      status: "in-progress",
      features: [
        "Expense tracking and categorization",
        "Income management",
        "Basic analytics and reporting",
        "User authentication and security",
        "Mobile-responsive design"
      ],
      description: "Building the foundation with robust personal expense tracking capabilities, similar to popular apps like Awalnut."
    },
    {
      phase: "Phase 2", 
      title: "AI/ML Integration",
      duration: "Months 4-6",
      status: "planned",
      features: [
        "Intelligent spending pattern analysis",
        "Personalized budget recommendations",
        "Cost optimization suggestions",
        "Predictive financial modeling",
        "Sentiment analysis of spending habits"
      ],
      description: "Integrating advanced AI algorithms to provide intelligent insights and personalized financial recommendations."
    },
    {
      phase: "Phase 3",
      title: "Expert Tax Facility",
      duration: "Months 7-9",
      status: "planned",
      features: [
        "Automated tax preparation",
        "Deduction identification and optimization",
        "Expert tax professional consultation",
        "Real-time tax liability tracking",
        "Tax document management"
      ],
      description: "Comprehensive tax module developed with expert tax professionals to simplify tax preparation and optimization."
    },
    {
      phase: "Phase 4",
      title: "Mobile Application",
      duration: "Months 10-11",
      status: "planned",
      features: [
        "Native iOS and Android apps",
        "Offline functionality",
        "Push notifications",
        "Biometric authentication",
        "Cross-platform synchronization"
      ],
      description: "Launching dedicated mobile applications for seamless access across all devices with enhanced user experience."
    },
    {
      phase: "Phase 5",
      title: "Organizational Module",
      duration: "Month 12",
      status: "planned",
      features: [
        "Team expense management",
        "Budget allocation and tracking",
        "Financial reporting and analytics",
        "Approval workflows",
        "Multi-user collaboration tools"
      ],
      description: "Dedicated organizational features for businesses to manage corporate finances and team expenses effectively."
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in-progress':
        return 'bg-primary-500';
      case 'planned':
        return 'bg-gray-300';
      default:
        return 'bg-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return (
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      case 'in-progress':
        return (
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'planned':
        return (
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <section id="timeline" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            One-Year Development Roadmap
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our comprehensive development timeline showcasing the evolution from a core expense tracker to a sophisticated AI-powered financial wellness platform.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 md:left-1/2 transform md:-translate-x-px top-0 bottom-0 w-0.5 bg-gray-300"></div>

          {/* Timeline items */}
          <div className="space-y-12">
            {phases.map((phase, index) => (
              <div key={index} className={`relative flex items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                {/* Timeline dot */}
                <div className={`absolute left-8 md:left-1/2 transform md:-translate-x-1/2 w-10 h-10 rounded-full ${getStatusColor(phase.status)} flex items-center justify-center z-10`}>
                  {getStatusIcon(phase.status)}
                </div>

                {/* Content */}
                <div className={`ml-20 md:ml-0 md:w-1/2 ${index % 2 === 0 ? 'md:pr-12' : 'md:pl-12'}`}>
                  <div className="card">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-semibold text-primary-600 bg-primary-100 px-3 py-1 rounded-full">
                        {phase.phase}
                      </span>
                      <span className="text-sm text-gray-500">{phase.duration}</span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{phase.title}</h3>
                    <p className="text-gray-600 mb-4">{phase.description}</p>
                    
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-900 text-sm">Key Features:</h4>
                      <ul className="space-y-1">
                        {phase.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center text-sm text-gray-600">
                            <svg className="w-3 h-3 text-primary-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Be Part of the Journey
            </h3>
            <p className="text-gray-600 mb-6">
              Join our early access program and help shape the future of financial wellness technology.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-primary">
                Join Early Access
              </button>
              <button className="btn-secondary">
                Subscribe for Updates
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Timeline;
