import React from 'react';
import { useNavigate } from 'react-router-dom';

interface LandingProps {
  isAuthenticated: boolean;
}

const Landing: React.FC<LandingProps> = ({ isAuthenticated }) => {
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="min-h-[100vh] flex items-center px-4 sm:px-8 lg:px-12 relative overflow-hidden bg-theme-bg transition-colors duration-300">
        {/* Decorative Glow */}
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-theme-accent/10 rounded-full blur-[120px] -translate-y-1/2"></div>

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
          <div className="space-y-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-theme-text">
              From Incident to Insight — <span className="text-theme-accent">Instantly.</span>
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-theme-text opacity-80 font-medium max-w-lg uppercase tracking-widest leading-relaxed">
              AI-driven incident analysis for faster resolution and smarter prevention.
            </p>

            {/* ONLY GET STARTED BUTTON */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')}
                className="px-8 py-4 bg-navy text-white font-bold rounded-md hover:bg-orange transition-all text-sm uppercase shadow-lg shadow-navy/20"
              >
                Get Started
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <div className="w-full max-w-md bg-theme-card border border-theme-border p-8 rounded-2xl shadow-2xl backdrop-blur-xl group hover:border-theme-accent/50 transition-all duration-500">
              <div className="inline-block px-3 py-1 bg-navy text-[10px] font-bold rounded-full mb-6 tracking-widest text-white shadow-lg shadow-navy/20 uppercase">
                AI CORE ACTIVE
              </div>
              <h3 className="text-2xl font-bold mb-4 text-theme-text group-hover:text-theme-accent transition-colors">
                Automated Synthesis
              </h3>
              <p className="text-theme-dim leading-relaxed text-sm">
                ResolveX correlates telemetry data and logs to draft blameless reviews in seconds, identifying patterns that humans might miss in the heat of an outage.
              </p>
              <div className="mt-8 pt-8 border-t border-theme-border flex items-center justify-between">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-theme-bg border border-theme-border flex items-center justify-center text-[10px] text-theme-text">
                    <i className="fas fa-server"></i>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-theme-bg/80 border border-theme-border flex items-center justify-center text-[10px] text-theme-text">
                    <i className="fas fa-database"></i>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-theme-accent/20 border border-theme-border flex items-center justify-center text-[10px] text-theme-accent">
                    <i className="fas fa-cloud"></i>
                  </div>
                </div>
                <span className="text-theme-accent text-xs font-bold uppercase tracking-widest">
                  Active Monitoring
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Middle Section with Gradient */}
      <section className="py-16 sm:py-24 lg:py-32 px-4 sm:px-8 lg:px-12 bg-gradient-to-b from-theme-bg via-theme-card to-theme-bg transition-colors duration-300">
        <div className="max-w-7xl mx-auto text-center space-y-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-theme-text">
            The Intelligence Behind the Resolve
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-theme-card border border-theme-border rounded-xl hover:border-theme-accent transition-all shadow-sm">
              <i className="fas fa-bolt text-3xl text-theme-accent mb-6"></i>
              <h4 className="text-xl font-bold mb-2 text-theme-text">Instant Drafting</h4>
              <p className="text-theme-dim text-sm">
                Draft postmortems in real-time as the incident unfolds, capturing every critical detail.
              </p>
            </div>
            <div className="p-8 bg-theme-card border border-theme-border rounded-xl hover:border-theme-accent transition-all shadow-sm">
              <i className="fas fa-brain text-3xl text-theme-accent mb-6"></i>
              <h4 className="text-xl font-bold mb-2 text-theme-text">Sentiment Analysis</h4>
              <p className="text-theme-dim text-sm">
                Monitor team comms to identify fatigue and ensure a blameless, healthy culture.
              </p>
            </div>
            <div className="p-8 bg-theme-card border border-theme-border rounded-xl hover:border-theme-accent transition-all shadow-sm">
              <i className="fas fa-shield-alt text-3xl text-theme-accent mb-6"></i>
              <h4 className="text-xl font-bold mb-2 text-theme-text">Predictive Safety</h4>
              <p className="text-theme-dim text-sm">
                AI correlates past incidents to predict potential failures before they happen.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;