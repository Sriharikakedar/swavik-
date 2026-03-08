import React, { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import { db } from '../firebase/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';

const Settings: React.FC = () => {
  const {
    aiDetection, setAiDetection,
    autoParsing, setAutoParsing,
    incidentAlerts, setIncidentAlerts,
    alertEmail, setAlertEmail,
    theme, setTheme
  } = useSettings();

  const [bulkData, setBulkData] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const handleBulkImport = async () => {
    if (!bulkData.trim()) return toast.error("Please enter user data");

    setIsImporting(true);
    const lines = bulkData.split('\n').filter(line => line.trim());
    let successCount = 0;
    let failCount = 0;

    for (const line of lines) {
      try {
        // Expected format: Name, Email
        const [name, email] = line.split(',').map(s => s.trim());
        if (!name || !email) {
          failCount++;
          continue;
        }

        // Generate a pseudo-UID for bulk users or just use email as ID
        const userId = `bulk_${btoa(email).replace(/=/g, '')}`;
        await setDoc(doc(db, "users", userId), {
          name,
          email,
          uid: userId,
          role: "SRE",
          isBulkImported: true,
          createdAt: serverTimestamp()
        });
        successCount++;
      } catch (err) {
        console.error("Bulk Import Error line:", line, err);
        failCount++;
      }
    }

    setIsImporting(false);
    setBulkData('');
    toast.success(`Import complete! ${successCount} added, ${failCount} failed.`);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/upload-users`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.users) {
        // Create user entries in Firestore
        let successCount = 0;
        for (const user of data.users) {
          const name = user.name || user.Name;
          const email = user.email || user.Email;
          if (!name || !email) continue;

          const userId = `bulk_${btoa(email).replace(/=/g, '')}`;
          await setDoc(doc(db, "users", userId), {
            name,
            email,
            uid: userId,
            role: user.role || user.Role || "SRE",
            isBulkImported: true,
            createdAt: serverTimestamp()
          });
          successCount++;
        }
        toast.success(`Successfully imported ${successCount} users!`);
      } else {
        toast.error(data.error || "Failed to parse CSV");
      }
    } catch (err) {
      console.error("Upload Error:", err);
      toast.error("Failed to connect to backend for CSV upload");
    } finally {
      setIsImporting(false);
      // Clear file input
      e.target.value = '';
    }
  };

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

            {incidentAlerts && (
              <div className="ml-14 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-[10px] font-black text-navy/40 dark:text-white/40 uppercase tracking-widest mb-2">Notification Endpoint (Email)</label>
                <input
                  type="email"
                  value={alertEmail}
                  onChange={(e) => setAlertEmail(e.target.value)}
                  placeholder="admin@company.com"
                  className="w-full max-w-md bg-theme-bg dark:bg-slate-900 border border-theme-border dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-theme-accent transition-all"
                />
              </div>
            )}
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

        {/* Bulk User Management */}
        <div className="mt-8 bg-white dark:bg-slate-800 border border-navy/10 dark:border-white/10 rounded-2xl overflow-hidden shadow-2xl transition-colors duration-300">
          <div className="px-8 py-6 border-b border-navy/10 dark:border-white/10 flex items-center gap-3 bg-cream/30 dark:bg-slate-900/50">
            <i className="fas fa-users-medical text-orange"></i>
            <h2 className="text-lg font-bold tracking-widest uppercase dark:text-slate-100">BULK USER IMPORT</h2>
          </div>
          <div className="p-8">
            <div className="mb-6">
              <h3 className="font-bold text-lg mb-1 dark:text-slate-100">Add Team Members</h3>
              <p className="text-sm text-charcoal/60 dark:text-slate-400 font-medium italic">Enter users in "Name, Email" format (one per line)</p>
            </div>

            <textarea
              value={bulkData}
              onChange={(e) => setBulkData(e.target.value)}
              placeholder={"John Doe, john@company.com\nJane Smith, jane@company.com"}
              className="w-full h-40 bg-theme-bg dark:bg-slate-900 border border-theme-border dark:border-white/10 rounded-xl px-6 py-4 text-sm font-mono focus:outline-none focus:border-theme-accent transition-all mb-4"
            />

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleBulkImport}
                disabled={isImporting || !bulkData.trim()}
                className="px-8 py-4 bg-navy hover:bg-navy-light disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg flex items-center gap-3 flex-grow justify-center"
              >
                {isImporting ? <i className="fas fa-circle-notch animate-spin"></i> : <i className="fas fa-file-import"></i>}
                {isImporting ? 'IMPORTING...' : 'START BULK IMPORT'}
              </button>

              <label className="px-8 py-4 bg-cream dark:bg-slate-700 hover:bg-orange/10 dark:hover:bg-slate-600 text-navy dark:text-white font-bold rounded-xl border border-navy/10 dark:border-white/10 cursor-pointer transition-all flex items-center gap-3 justify-center">
                <i className="fas fa-cloud-upload"></i>
                UPLOAD CSV
                <input type="file" accept=".csv,.txt" className="hidden" onChange={handleFileUpload} />
              </label>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;
