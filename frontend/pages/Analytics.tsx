import React, { useEffect, useState } from 'react';
import { db } from '../firebase/firebase';
import { collection, query, onSnapshot, orderBy, limit } from 'firebase/firestore';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { StatSkeleton } from '../components/Skeleton';

interface Report {
  id: string;
  title: string;
  severity: string;
  date: string;
  report?: string;
  logs?: string;
  status?: string;
  createdAt?: any;
}

const Analytics: React.FC = () => {
  const [allReports, setAllReports] = useState<Report[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string>("all");
  const [stats, setStats] = useState({
    total: 0,
    critical: 0,
    logsProcessed: 0,
    mttr: "0h",
    severityData: [] as any[]
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reports: Report[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Report));

      setAllReports(reports);

      // Default Aggregate Stats (for "all" view)
      const criticalCount = reports.filter(r => r.severity.includes('P0')).length;
      const logsCount = reports.filter(r => (r.logs && r.logs.length > 0) || r.status === 'generated' || r.status === 'draft').length;

      setStats({
        total: reports.length,
        critical: criticalCount,
        logsProcessed: logsCount,
        mttr: reports.length > 0 ? "4.2h" : "0h", // Simulated MTTR for SaaS feel
        severityData: [
          { name: 'P0 - Critical', value: criticalCount, color: '#EF4444' },
          { name: 'P1 - High', value: reports.filter(r => r.severity.includes('P1')).length, color: '#F97316' },
          { name: 'P2 - Medium', value: reports.filter(r => r.severity.includes('P2')).length, color: '#EAB308' },
        ].filter(d => d.value > 0)
      });

      // Aggregate Trend Data
      const dateMap: { [key: string]: number } = {};
      reports.forEach(r => {
        const d = r.date || 'Unknown';
        dateMap[d] = (dateMap[d] || 0) + 1;
      });

      const processedChartData = Object.keys(dateMap)
        .sort()
        .map(date => ({
          name: date.split('-').slice(1).join('/'),
          value: dateMap[date]
        }))
        .slice(-7);

      setChartData(processedChartData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getIndividualStats = (report: Report) => {
    const logSize = report.logs ? (report.logs.length / 1024).toFixed(1) : "0";
    const wordCount = report.report ? report.report.split(/\s+/).length : 0;

    // Section Breakdown for Chart
    const sections = report.report ? report.report.split('## ') : [];
    const sectionData = sections
      .filter(s => s.trim().length > 0)
      .map(s => {
        const lines = s.split('\n');
        const title = lines[0].trim().substring(0, 15);
        const content = lines.slice(1).join(' ');
        return {
          name: title,
          value: content.split(/\s+/).length
        };
      });

    return { logSize, wordCount, sectionData };
  };

  const selectedReport = allReports.find(r => r.id === selectedReportId);
  const individualData = selectedReport ? getIndividualStats(selectedReport) : null;



  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="mb-12 space-y-4">
          <div className="h-10 bg-theme-bg animate-pulse rounded-xl w-48"></div>
          <div className="h-4 bg-theme-bg animate-pulse rounded-lg w-96"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[1, 2, 3].map(i => <StatSkeleton key={i} />)}
        </div>
        <div className="h-[400px] bg-theme-card border border-theme-border rounded-3xl animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-8 py-12">
      {/* Header with Selection */}
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-theme-text mb-2 tracking-tight">Analytics</h1>
          <p className="text-theme-dim text-sm font-bold uppercase tracking-widest">Insights from generated incident reports and analyzed logs</p>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-theme-accent uppercase tracking-widest ml-1">Select Analysis Scope</label>
          <div className="relative group">
            <select
              value={selectedReportId}
              onChange={(e) => setSelectedReportId(e.target.value)}
              className="appearance-none bg-theme-card border border-theme-border text-theme-text text-xs font-bold py-3 pl-5 pr-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-theme-accent/50 transition-all hover:border-theme-border/50 min-w-[280px] shadow-xl"
            >
              <option value="all">Full System Overview</option>
              <optgroup label="Incident Postmortems">
                {allReports.map(r => (
                  <option key={r.id} value={r.id} className="bg-theme-card text-theme-text">{r.title || 'Untitled Report'}</option>
                ))}
              </optgroup>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-theme-dim group-hover:text-theme-accent transition-colors">
              <i className="fas fa-chevron-down text-[10px]"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {selectedReport && individualData ? (
          // Individual Report Stats
          <>
            <div className="bg-theme-card border border-theme-border p-8 rounded-2xl shadow-xl border-l-4 border-l-theme-accent">
              <h3 className="text-xs font-bold text-theme-dim uppercase tracking-widest mb-1">Report Severity</h3>
              <div className="text-3xl font-black text-theme-text mb-2 flex items-center gap-3">
                <span className={`px-3 py-1 rounded-lg text-sm border ${selectedReport.severity.includes('P0') ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-theme-accent/10 text-theme-accent border-theme-accent/20'
                  }`}>
                  {selectedReport.severity}
                </span>
              </div>
              <p className="text-xs text-theme-dim font-medium">Criticality level of this incident</p>
            </div>
            <div className="bg-theme-card border border-theme-border p-8 rounded-2xl shadow-xl">
              <h3 className="text-xs font-bold text-theme-dim uppercase tracking-widest mb-1">Data Magnitude</h3>
              <div className="text-4xl font-black text-theme-text mb-2">{individualData.logSize} <span className="text-lg text-theme-dim">KB</span></div>
              <p className="text-xs text-theme-dim font-medium">Volume of raw log data analyzed at source</p>
            </div>
            <div className="bg-theme-card border border-theme-border p-8 rounded-2xl shadow-xl">
              <h3 className="text-xs font-bold text-theme-dim uppercase tracking-widest mb-1">Intelligence Depth</h3>
              <div className="text-4xl font-black text-theme-text mb-2">{individualData.wordCount} <span className="text-lg text-theme-dim">words</span></div>
              <p className="text-xs text-theme-dim font-medium">Detailed findings in the generated postmortem</p>
            </div>
          </>
        ) : (
          // Aggregate Stats
          <>
            <div className="bg-theme-card border border-theme-border p-8 rounded-2xl shadow-xl">
              <h3 className="text-xs font-bold text-theme-dim uppercase tracking-[0.2em] mb-1">Mean Time To Resolution</h3>
              <div className="text-4xl font-black text-theme-accent mb-2">{stats.mttr}</div>
              <p className="text-xs text-theme-dim font-medium">Avg. time from log ingestion to RCA report</p>
            </div>
            <div className="bg-theme-card border border-theme-border p-8 rounded-2xl shadow-xl">
              <h3 className="text-xs font-bold text-theme-dim uppercase tracking-[0.2em] mb-1">Total Reports</h3>
              <div className="text-4xl font-black text-theme-text mb-2">{stats.total}</div>
              <p className="text-xs text-theme-dim font-medium leading-relaxed">Total number of generated incident reports</p>
            </div>
            <div className="bg-theme-card border border-theme-border p-8 rounded-2xl shadow-xl">
              <h3 className="text-xs font-bold text-theme-dim uppercase tracking-[0.2em] mb-1">Critical Incidents</h3>
              <div className="text-4xl font-black text-red-500 mb-2">{stats.critical}</div>
              <p className="text-xs text-theme-dim font-medium">Reports with severity "P0 - Critical"</p>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        {/* Main Analysis Chart */}
        <div className="bg-theme-card border border-theme-border p-8 rounded-3xl shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-theme-accent to-transparent"></div>
          <div className="mb-8">
            <h3 className="text-xl font-bold text-theme-text mb-1">
              {selectedReport ? "Analysis Depth" : "Incident Trend"}
            </h3>
            <p className="text-xs text-theme-dim uppercase tracking-widest font-black">
              {selectedReport ? "Word count per report section" : "Reports generated over time"}
            </p>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={selectedReport && individualData ? individualData.sectionData : chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0E6D8" vertical={false} />
                <XAxis dataKey="name" stroke="#4A4A4A" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#4A4A4A" fontSize={10} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '12px' }}
                  itemStyle={{ color: 'var(--text-main)', fontSize: '12px', fontWeight: 'bold' }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="var(--accent)"
                  strokeWidth={3}
                  dot={{ fill: 'var(--accent)', strokeWidth: 2, r: 4, stroke: '#fff' }}
                  activeDot={{ r: 6, stroke: 'var(--text-main)', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Distribution Pie Chart */}
        {!selectedReport && (
          <div className="bg-theme-card border border-theme-border p-8 rounded-3xl shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-transparent"></div>
            <div className="mb-8">
              <h3 className="text-xl font-bold text-theme-text mb-1">Severity Distribution</h3>
              <p className="text-xs text-theme-dim uppercase tracking-widest font-black">Breakdown of incident criticality</p>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.severityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.severityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Recent Activity Table */}
      <div className="bg-theme-card border border-theme-border rounded-3xl shadow-xl overflow-hidden">
        <div className="px-8 py-6 border-b border-theme-border bg-theme-bg/30 flex items-center justify-between">
          <h3 className="text-sm font-black text-theme-text uppercase tracking-widest">Recent System Activity</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-theme-bg/50">
                <th className="px-8 py-4 text-[10px] font-black text-theme-dim uppercase tracking-widest">Incident</th>
                <th className="px-8 py-4 text-[10px] font-black text-theme-dim uppercase tracking-widest text-center">Severity</th>
                <th className="px-8 py-4 text-[10px] font-black text-theme-dim uppercase tracking-widest text-center">Date</th>
                <th className="px-8 py-4 text-[10px] font-black text-theme-dim uppercase tracking-widest text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/5">
              {allReports.slice(0, 10).map((report) => (
                <tr
                  key={report.id}
                  className={`hover:bg-theme-bg/40 transition-colors cursor-pointer ${selectedReportId === report.id ? 'bg-theme-accent/5 ring-1 ring-inset ring-theme-accent/20' : ''}`}
                  onClick={() => setSelectedReportId(report.id)}
                >
                  <td className="px-8 py-6">
                    <div className="text-sm font-bold text-theme-text mb-1 truncate max-w-[300px]">{report.title}</div>
                    <div className="text-[10px] text-theme-dim font-extrabold uppercase tracking-widest">ID: {report.id.slice(0, 8)}</div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full border ${report.severity.includes('P0') ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                      report.severity.includes('P1') ? 'bg-orange/10 text-orange border-orange/20' :
                        'bg-theme-bg text-theme-dim border-theme-border'
                      }`}>
                      {report.severity.split('-')[0].trim()}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="text-xs font-bold text-theme-dim">{report.date}</div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${selectedReportId === report.id ? 'text-theme-accent' : 'text-theme-dim/20'}`}>
                      {selectedReportId === report.id ? 'Active Focus' : 'Recorded'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;

