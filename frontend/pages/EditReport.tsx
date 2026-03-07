import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../firebase/firebase";
import { doc, updateDoc } from "firebase/firestore";
import toast from "react-hot-toast";

const EditReport: React.FC = () => {

  const location = useLocation();
  const navigate = useNavigate();

  const { report, id } = location.state || {};

  const [text, setText] = useState(report);

  const handleSave = async () => {
    try {
      await updateDoc(doc(db, "reports", id), {
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

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={20}
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