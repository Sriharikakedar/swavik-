import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { useSettings } from "../context/SettingsContext";
import { CardSkeleton } from "../components/Skeleton";
import EmptyState from "../components/EmptyState";

interface Report {
  id: string;
  title: string;
  date: string;
  severity: string;
  report: string;
  createdAt: any;
  status?: string;
}

const Dashboard: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const { incidentAlerts } = useSettings();
  const navigate = useNavigate();

  const hasP0 = reports.some(r => r.severity.includes("P0"));

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const q = query(collection(db, "reports"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);

        const data: Report[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Report[];

        setReports(data);
      } catch (err) {
        console.error("Error fetching reports:", err);
      }
      setLoading(false);
    };

    fetchReports();
  }, []);

  const getSeverityColor = (severity: string) => {
    if (severity.includes("P0")) return "text-red-400 bg-red-400/10 border-red-400/30";
    if (severity.includes("P1")) return "text-orange-400 bg-orange-400/10 border-orange-400/30";
    if (severity.includes("P2")) return "text-yellow-400 bg-yellow-400/10 border-yellow-400/30";
    return "text-green-400 bg-green-400/10 border-green-400/30";
  };

  const filteredReports = reports.filter(r => {
    if (filter === "critical") return r.severity.includes("P0");
    if (filter === "resolved") return r.status === "resolved";
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-12 py-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-black text-theme-text mb-2">Dashboard</h1>
          <p className="text-theme-dim text-xs font-bold uppercase tracking-widest">Manage and track system incidents</p>
        </div>
        <button
          onClick={() => navigate("/new-report")}
          className="bg-theme-accent hover:bg-orange-dark text-white px-6 py-3 rounded-lg font-bold transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-orange/20"
        >
          + New Report
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-8 bg-theme-bg/50 p-1 rounded-xl w-fit border border-theme-border">
        {["all", "critical", "resolved"].map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${filter === t
              ? "bg-theme-card text-theme-accent shadow-sm border border-theme-border"
              : "text-theme-dim hover:text-theme-text"
              }`}
          >
            {t}
          </button>
        ))}
      </div>

      {incidentAlerts && hasP0 && filter !== "resolved" && (
        <div className="mb-8 bg-red-500/10 border border-red-500/30 rounded-2xl p-6 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
              <i className="fas fa-exclamation-triangle text-red-500 text-xl"></i>
            </div>
            <div>
              <h2 className="text-red-500 font-black uppercase tracking-widest text-sm">Critical Incident Alert</h2>
              <p className="text-zinc-400 text-xs mt-1">Directly impacting production systems. Immediate response required.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            <span className="text-[10px] text-red-500 font-black uppercase tracking-tighter">Active P0 Detected</span>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : filteredReports.length === 0 ? (
        <EmptyState
          title={`No ${filter === 'all' ? '' : filter} reports found`}
          description={filter === 'all'
            ? "Your dashboard is currently quiet. Start by analyzing a log stream to generate your first intelligence report."
            : "No incidents currently match this filter. Everything looks stable in this category."}
          icon={filter === 'critical' ? 'fa-shield-check' : 'fa-folder-open'}
          actionLabel={filter === 'all' ? "Analyze Your First Log" : undefined}
          onAction={filter === 'all' ? () => navigate("/new-report") : undefined}
        />
      ) : (
        <div className="space-y-4">
          {filteredReports.map((r, idx) => (
            <div
              key={r.id}
              style={{ animationDelay: `${idx * 50}ms` }}
              className="bg-theme-card border border-theme-border rounded-xl p-6 flex items-center justify-between hover:border-theme-accent/50 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out"
              onClick={() => navigate("/view-report", { state: { report: r.report, id: r.id } })}
            >
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-theme-text truncate group-hover:text-theme-accent transition-colors">
                  {r.title || "Untitled Report"}
                </h2>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-sm text-theme-dim flex items-center gap-2">
                    <i className="far fa-calendar-alt text-[10px]"></i>
                    {r.date || "No date"}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded border font-bold ${getSeverityColor(r.severity)}`}
                  >
                    {r.severity}
                  </span>
                  {r.status === "draft" && (
                    <span className="text-[10px] bg-theme-bg text-theme-text px-2 py-1 rounded font-bold uppercase tracking-widest border border-theme-border">
                      Draft
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="hidden md:block text-right mr-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-[10px] font-black text-theme-accent uppercase tracking-tighter">View Detailed RCA</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-theme-bg flex items-center justify-center text-theme-dim group-hover:bg-theme-accent group-hover:text-white transition-all shadow-inner">
                  <i className="fas fa-chevron-right text-xs"></i>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;