import React from 'react';
import { useSettings } from '../context/SettingsContext';

const Settings: React.FC = () => {
  const {
    aiDetection, setAiDetection,
    autoParsing, setAutoParsing,
    incidentAlerts, setIncidentAlerts,
    theme, setTheme
  } = useSettings();

  return (
    <div className="min-h-[80vh] px-8 py-12 text-navy">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-2">
            <i className="fas fa-cog text-3xl text-orange"></i>
            <h1 className="text-4xl font-black tracking-tighter">System Settings</h1>
          </div>
          <p className="text-charcoal/60 text-sm font-bold uppercase tracking-widest ml-12">Configure monitoring parameters and autonomous AI features</p>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-navy/10 dark:border-white/10 rounded-2xl overflow-hidden shadow-2xl transition-colors duration-300">
          <div className="px-8 py-6 border-b border-navy/10 dark:border-white/10 flex items-center gap-3 bg-cream/30 dark:bg-slate-900/50">
            <i className="fas fa-microchip text-orange"></i>
            <h2 className="text-lg font-bold tracking-widest uppercase dark:text-slate-100">SYSTEM SETTINGS</h2>
          </div>

          <div className="p-8 space-y-8">
            {/* AI Root Cause Detection */}
            <div className="flex items-center justify-between group">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-orange/10 border border-orange/20 flex items-center justify-center mt-1 group-hover:bg-orange/20 transition-colors">
                  <i className="fas fa-brain text-orange"></i>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1 dark:text-slate-100">AI Root Cause Detection</h3>
                  <p className="text-sm text-charcoal/60 dark:text-slate-400 font-medium">Automatically identify the origin of system failures using neural synthesis</p>
                </div>
              </div>
              <button
                onClick={() => setAiDetection(!aiDetection)}
                className={`relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-300 ${aiDetection ? 'bg-orange shadow-[0_0_15px_rgba(209,96,61,0.4)]' : 'bg-cream dark:bg-slate-700'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${aiDetection ? 'translate-x-8' : 'translate-x-1'}`} />
              </button>
            </div>


            {/* Auto Log Parsing */}
            <div className="flex items-center justify-between group">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-orange/10 border border-orange/20 flex items-center justify-center mt-1 group-hover:bg-orange/20 transition-colors">
                  <i className="fas fa-terminal text-orange"></i>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Auto Log Parsing</h3>
                  <p className="text-sm text-charcoal/60 font-medium">Real-time normalization of unstructured log data into actionable insights</p>
                </div>
              </div>
              <button
                onClick={() => setAutoParsing(!autoParsing)}
                className={`relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-300 ${autoParsing ? 'bg-orange shadow-[0_0_15px_rgba(209,96,61,0.4)]' : 'bg-cream dark:bg-slate-700'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${autoParsing ? 'translate-x-8' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="h-px bg-navy/5 w-full ml-14"></div>

            {/* Critical Incident Alerts */}
            <div className="flex items-center justify-between group">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-orange/10 border border-orange/20 flex items-center justify-center mt-1 group-hover:bg-orange/20 transition-colors">
                  <i className="fas fa-bell text-orange"></i>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1 dark:text-slate-100">Critical Incident Alerts</h3>
                  <p className="text-sm text-charcoal/60 dark:text-slate-400 font-medium">High-priority notifications for P0 and P1 infrastructure anomalies</p>
                </div>
              </div>
              <button
                onClick={() => setIncidentAlerts(!incidentAlerts)}
                className={`relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-300 ${incidentAlerts ? 'bg-orange shadow-[0_0_15px_rgba(209,96,61,0.4)]' : 'bg-cream dark:bg-slate-700'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${incidentAlerts ? 'translate-x-8' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Theme Selection */}
        <div className="mt-8 bg-white dark:bg-slate-800 border border-navy/10 dark:border-white/10 rounded-2xl overflow-hidden shadow-2xl transition-colors duration-300">
          <div className="px-8 py-6 border-b border-navy/10 dark:border-white/10 flex items-center gap-3 bg-cream/30 dark:bg-slate-900/50">
            <i className="fas fa-palette text-orange"></i>
            <h2 className="text-lg font-bold tracking-widest uppercase dark:text-slate-100">APPEARANCE</h2>
          </div>
          <div className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg mb-1 dark:text-slate-100">Interface Theme</h3>
                <p className="text-sm text-charcoal/60 dark:text-slate-400 font-medium">Customize your visual experience with light or dark mode</p>
              </div>
              <div className="flex bg-cream dark:bg-slate-900 p-1 rounded-xl border border-navy/10 dark:border-white/5">
                <button
                  onClick={() => setTheme('light')}
                  className={`px-6 py-2 rounded-lg flex items-center gap-2 text-sm font-bold transition-all ${theme === 'light' ? 'bg-white text-navy shadow-md' : 'text-charcoal/40 dark:text-slate-500 hover:text-navy dark:hover:text-slate-300'}`}
                >
                  <i className="fas fa-sun"></i>
                  Light
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`px-6 py-2 rounded-lg flex items-center gap-2 text-sm font-bold transition-all ${theme === 'dark' ? 'bg-slate-800 text-white shadow-md shadow-black/20' : 'text-charcoal/40 dark:text-slate-500 hover:text-navy dark:hover:text-slate-300'}`}
                >
                  <i className="fas fa-moon"></i>
                  Dark
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;
