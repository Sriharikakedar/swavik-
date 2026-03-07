import React, { useState, useEffect } from 'react';
import { db } from "../firebase/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import { CardSkeleton } from '../components/Skeleton';

interface Report {
  id: string;
  title: string;
  date: string;
  severity: string;
  report: string;
  status?: string;
  assignee?: string;
  priority?: string;
}

const Search: React.FC = () => {
  const [query, setQuery] = useState('');
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const snapshot = await getDocs(collection(db, "reports"));
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Report[];
        setReports(data);
      } catch (err) {
        console.error("Error fetching reports:", err);
      }
      setLoading(false);
    };

    fetchReports();
  }, []);

  const filteredReports = reports.filter(r =>
    r.title?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto px-12 py-12 text-theme-text">
      <div className="mb-12">
        <h1 className="text-4xl font-black mb-8 text-theme-text">Search Reports</h1>
        <div className="relative group">
          <i className="fas fa-search absolute left-6 top-1/2 -translate-y-1/2 text-theme-dim group-focus-within:text-theme-accent transition-colors"></i>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-theme-card border border-theme-border rounded-2xl px-16 py-6 text-lg font-bold text-theme-text focus:outline-none focus:border-theme-accent transition-all shadow-xl"
            placeholder="Search by title, system, or incident ID..."
          />
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
          </div>
        ) : filteredReports.length > 0 ? (
          filteredReports.map((report) => (
            <div
              key={report.id}
              onClick={() => navigate("/view-report", { state: { ...report } })}
              className="flex items-center justify-between p-6 bg-theme-card border border-theme-border rounded-xl hover:border-theme-accent/50 hover:-translate-y-1 transition-all cursor-pointer group shadow-sm"
            >
              <div className="flex items-center gap-6">
                <div className={`w-12 h-12 flex items-center justify-center rounded-lg bg-theme-bg border border-theme-border group-hover:bg-theme-bg/80 transition-colors`}>
                  <i className="fas fa-file-alt text-theme-dim"></i>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-theme-text">{report.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-theme-dim font-bold uppercase tracking-widest mt-1">
                    <span>{report.date}</span>
                    <span className="w-1 h-1 rounded-full bg-theme-border"></span>
                    <span className={report.severity?.includes('Critical') ? 'text-red-500' : 'text-theme-accent'}>{report.severity}</span>
                  </div>
                </div>
              </div>
              <button className="text-theme-dim group-hover:text-theme-accent transition-colors">
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          ))
        ) : (
          <EmptyState
            title="No reports found"
            description={`We couldn't find any results for "${query}". Try adjusting your keywords or clearing the search.`}
            icon="fa-search"
          />
        )}
      </div>
    </div>
  );
};

export default Search;
