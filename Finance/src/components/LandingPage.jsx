import React from 'react';
import { useNavigate } from 'react-router-dom';
import WalnutHeader from './WalnutHeader';
import WalnutHero from './WalnutHero';
import WalnutFeatures from './WalnutFeatures';
import WalnutAbout from './WalnutAbout';
import WalnutFooter from './WalnutFooter';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-white">
      <WalnutHeader onGetStarted={handleGetStarted} />
      <WalnutHero onGetStarted={handleGetStarted} />
      <WalnutFeatures />
      <WalnutAbout />
      <WalnutFooter />
    </div>
  );
};

export default LandingPage;
