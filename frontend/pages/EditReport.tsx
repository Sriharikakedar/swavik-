import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../firebase/firebase";
import { doc, updateDoc, getDocs, collection, query, orderBy, getDoc } from "firebase/firestore";
import toast from "react-hot-toast";

const EditReport: React.FC = () => {

  const location = useLocation();
  const navigate = useNavigate();

  const { report, id, title: initialTitle, severity: initialSeverity, assignee: initialAssignee, priority: initialPriority } = location.state || {};

  const [text, setText] = useState(report || "");
  const [title, setTitle] = useState(initialTitle || "");
  const [severity, setSeverity] = useState(initialSeverity || "P0 - Critical");
  const [assignee, setAssignee] = useState(initialAssignee || "");
  const [priority, setPriority] = useState(initialPriority || "High");
  const [users, setUsers] = useState<{ id: string, name: string }[]>([]);

  React.useEffect(() => {
    const fetchUsers = async () => {
      try {
        const q = query(collection(db, "users"), orderBy("name", "asc"));
        const querySnapshot = await getDocs(q);
        const usersList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name
        }));
        setUsers(usersList);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    fetchUsers();
  }, []);

  const handleSave = async () => {
    try {
      await updateDoc(doc(db, "reports", id), {
        title,
        severity,
        assignee,
        priority,
        report: text
      });

      toast.success("Report updated successfully");
      navigate("/dashboard");
    } catch (err) {
      console.error("Update error:", err);
      toast.error("Failed to update report");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-12 py-12 text-theme-text">
      <h1 className="text-4xl font-black mb-8">
        Edit Report
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-theme-dim uppercase tracking-widest ml-1">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-3 text-theme-text font-bold focus:outline-none focus:border-theme-accent transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-theme-dim uppercase tracking-widest ml-1">Severity</label>
          <select
            className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-3 text-theme-text font-bold focus:outline-none focus:border-theme-accent transition-all appearance-none cursor-pointer"
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-theme-dim uppercase tracking-widest ml-1">Assignee</label>
          <select
            className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-3 text-theme-text font-bold focus:outline-none focus:border-theme-accent transition-all appearance-none cursor-pointer"
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
          >
            <option value="">Select Assignee</option>
            {users.map(u => (
              <option key={u.id} value={u.name}>{u.name}</option>
            ))}
            <option value="SRE-Global-Oncall">SRE-Global-Oncall</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-theme-dim uppercase tracking-widest ml-1">Priority</label>
          <select
            className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-3 text-theme-text font-bold focus:outline-none focus:border-theme-accent transition-all appearance-none cursor-pointer"
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

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={15}
        className="w-full bg-theme-bg border border-theme-border p-6 rounded-xl text-theme-text font-bold focus:outline-none focus:border-theme-accent transition-all shadow-inner"
      />

      <button
        onClick={handleSave}
        className="mt-6 bg-theme-accent hover:bg-orange-dark text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-orange/20"
      >
        Save Changes
      </button>

    </div>
  );
};

export default EditReport;