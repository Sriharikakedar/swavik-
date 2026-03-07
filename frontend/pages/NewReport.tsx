import React, { useState } from "react";
import { generatePostmortem } from "../services/api";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase/firebase";
import { collection, addDoc } from "firebase/firestore";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/datepicker-custom.css";
import { useSettings } from "../context/SettingsContext";
import toast from "react-hot-toast";

const NewReport: React.FC = () => {

  const [logs, setLogs] = useState("");
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [severity, setSeverity] = useState("P0 - Critical");
  const [loading, setLoading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [fileName, setFileName] = useState("");
  const [assignee, setAssignee] = useState("");
  const [priority, setPriority] = useState("High");

  const { aiDetection, autoParsing } = useSettings();
  const navigate = useNavigate();

  const handleFileUpload = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();

    reader.onload = (event: any) => {
      if (autoParsing) {
        setIsParsing(true);
        setTimeout(() => {
          setLogs(event.target.result);
          setIsParsing(false);
        }, 1500); // Simulate parsing
      } else {
        setLogs(event.target.result);
      }
    };

    reader.readAsText(file);
  };

  const removeFile = () => {
    setFileName("");
    setLogs("");
  };

  const handleSaveDraft = async () => {
    if (!title) {
      alert("Please enter an incident title to save a draft.");
      return;
    }

    try {
      setLoading(true);
      await addDoc(collection(db, "reports"), {
        title,
        date: startDate ? startDate.toISOString().split('T')[0] : "",
        severity,
        report: "DRAFT: Logs uploaded: " + fileName,
        logs: logs,
        logFileName: fileName,
        status: "draft",
        assignee,
        priority,
        createdAt: new Date()
      });
      toast.success("Draft Saved Successfully ✅");
      navigate("/dashboard");
    } catch (err) {
      console.error("Save Draft Error:", err);
      toast.error("Error saving draft");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!logs) {
      toast.error("Please upload a log file first");
      return;
    }

    try {

      setLoading(true);

      const data = await generatePostmortem(logs);

      const docRef = await addDoc(collection(db, "reports"), {
        title,
        date: startDate ? startDate.toISOString().split('T')[0] : "",
        severity,
        report: data.report,
        timeline: data.timeline || [], // Save AI timeline
        logs: logs,
        logFileName: fileName,
        status: "generated",
        assignee,
        priority,
        createdAt: new Date()
      });

      toast.success("Postmortem Generated! 🤖");
      navigate("/report-view", {
        state: {
          report: data.report,
          id: docRef.id,
          title,
          date: startDate ? startDate.toISOString().split('T')[0] : "",
          severity,
          assignee,
          priority,
          timeline: data.timeline || [] // Pass timeline for immediate view
        }
      });

    }
    catch (err: any) {
      console.error("Report generation error:", err);
      if (err.message === "Failed to fetch" || err.message?.includes("NetworkError")) {
        toast.error("Backend server unreachable");
      } else {
        toast.error("Generation failed: " + (err.message || "Unknown error"));
      }
    }

    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-8 py-12">
      <div className="mb-12">
        <h1 className="text-5xl font-black mb-4 text-theme-text">Create New Report</h1>
        <p className="text-theme-dim text-lg font-medium">Provide the incident details and upload logs for AI synthesis.</p>
      </div>

      <div className="bg-theme-card border border-theme-border p-12 rounded-3xl shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-theme-accent to-transparent opacity-50"></div>

        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
          <div className="space-y-2">
            <label className="text-xs font-bold text-theme-dim uppercase tracking-widest ml-1">Incident Title</label>
            <input
              placeholder="e.g., Database Connection Pool Exhaustion"
              className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-4 text-theme-text font-bold focus:outline-none focus:border-theme-accent transition-all text-lg"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-bold text-theme-dim uppercase tracking-widest ml-1">Incident Date</label>
              <div className="relative border border-theme-border rounded-xl">
                <DatePicker
                  selected={startDate}
                  onChange={(date: Date | null) => setStartDate(date)}
                  className="w-full bg-theme-bg rounded-xl px-4 py-4 text-theme-text font-bold focus:outline-none focus:border-theme-accent transition-all cursor-pointer"
                  dateFormat="MMMM d, yyyy"
                  placeholderText="Select incident date"
                />
                <i className="fas fa-calendar-alt absolute right-4 top-1/2 -translate-y-1/2 text-theme-dim pointer-events-none"></i>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-theme-dim uppercase tracking-widest ml-1">Severity</label>
              <select
                className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-4 text-theme-text font-bold focus:outline-none focus:border-theme-accent transition-all appearance-none cursor-pointer"
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
              >
                <option>P0 - Critical</option>
                <option>P1 - High</option>
                <option>P2 - Medium</option>
                <option>P3 - Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-bold text-theme-dim uppercase tracking-widest ml-1">Assignee (Team/SRE)</label>
              <input
                placeholder="e.g., SRE-Global-Oncall"
                className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-4 text-theme-text font-bold focus:outline-none focus:border-theme-accent transition-all"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-theme-dim uppercase tracking-widest ml-1">Response Priority</label>
              <select
                className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-4 text-theme-text font-bold focus:outline-none focus:border-theme-accent transition-all appearance-none cursor-pointer"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option>Critical</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-theme-accent ml-1">Logs Entry Upload</p>

            {!fileName ? (
              <label
                className="block w-full p-12 bg-theme-bg border-2 border-dashed border-theme-border rounded-2xl text-center cursor-pointer hover:border-theme-accent hover:bg-theme-accent/5 transition-all group/upload shadow-inner"
              >
                <input
                  type="file"
                  accept=".csv,.txt,.json,.log"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="flex flex-col items-center">
                  <i className="fas fa-cloud-upload-alt text-4xl text-theme-dim group-hover/upload:text-theme-accent transition-colors mb-4"></i>
                  <p className="text-theme-dim text-lg font-bold">Click or drag log files here to analyze</p>
                  <p className="text-[10px] text-theme-dim mt-2 uppercase tracking-widest font-extrabold">Accepted: .CSV .TXT .JSON .LOG</p>
                </div>
              </label>
            ) : (
              <div className="flex items-center gap-6 bg-theme-bg border border-theme-accent/30 rounded-2xl p-6 shadow-lg shadow-theme-accent/10 animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 flex items-center justify-center rounded-xl bg-theme-accent/10 border border-theme-accent/20">
                  <i className="fas fa-file-alt text-2xl text-theme-accent"></i>
                </div>
                <div className="flex-grow min-w-0">
                  <p className="text-lg font-bold text-theme-text truncate">{fileName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {isParsing ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-theme-accent animate-ping"></span>
                        <span className="text-[10px] text-theme-accent font-black uppercase tracking-[0.2em]">Analyzing Logs...</span>
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-[10px] text-green-500 font-black uppercase tracking-[0.2em]">Ready for Analysis</span>
                      </>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-theme-card text-theme-dim hover:text-white hover:bg-red-500 transition-all border border-theme-border shadow-sm"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={loading}
              className="w-full sm:w-auto px-10 py-4 bg-theme-card hover:bg-theme-bg text-theme-text font-bold rounded-xl border border-theme-border transition-all disabled:opacity-50 tracking-wider text-sm shadow-sm"
            >
              SAVE DRAFT
            </button>
            <div className="w-full sm:w-auto relative group/btn">
              {!aiDetection && (
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-navy border border-orange/20 px-4 py-2 rounded text-[10px] font-bold text-white uppercase tracking-widest opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-xl">
                  AI Detection is disabled in settings
                </div>
              )}
              <button
                type="submit"
                className="w-full h-full px-12 py-4 bg-theme-accent hover:bg-orange-dark text-white font-black rounded-xl transition-all disabled:opacity-50 shadow-xl shadow-orange/20 tracking-wider text-sm"
                disabled={loading || !aiDetection || isParsing}
              >
                {loading ? (
                  <span className="flex items-center gap-2 justify-center">
                    <i className="fas fa-circle-notch animate-spin"></i>
                    GENERATING...
                  </span>
                ) : "GENERATE POSTMORTEM"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewReport;