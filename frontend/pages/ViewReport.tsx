import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom"
import jsPDF from "jspdf"
import { db } from "../firebase/firebase"
import { deleteDoc, doc, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore"
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";
// @ts-ignore
import { marked } from "marked"
import toast from "react-hot-toast";

interface Comment {
  id: string;
  text: string;
  author: string;
  createdAt: any;
}

const ViewReport: React.FC = () => {

  const location = useLocation()
  const navigate = useNavigate()

  const { report, id, title, date, severity, assignee, priority } = location.state

  const [comments, setComments] = React.useState<Comment[]>([]);
  const [newComment, setNewComment] = React.useState("");

  React.useEffect(() => {
    if (!id) return;
    const q = query(
      collection(db, "reports", id, "comments"),
      orderBy("createdAt", "asc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Comment[];
      setComments(data);
    });
    return () => unsubscribe();
  }, [id]);

  const handleSendComment = async () => {
    if (!newComment.trim()) return;
    try {
      await addDoc(collection(db, "reports", id, "comments"), {
        text: newComment,
        author: "Team Member", // In a real app, this would be from auth
        createdAt: serverTimestamp()
      });
      setNewComment("");
    } catch (err) {
      toast.error("Failed to send comment");
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    let y = 35; // Start lower to accommodate header

    // Styling Tokens
    const titleSize = 22;
    const sectionSize = 14;
    const bodySize = 10;
    const decorationColor = [26, 43, 76]; // #1A2B4C (Navy)
    const accentColor = [209, 96, 61]; // #D1603D (Orange)

    const addDecorations = () => {
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);

        // --- HEADER ---
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text("RESOLVEX INCIDENT INTELLIGENCE", margin, 15);

        doc.setFontSize(8);
        doc.text(new Date().toLocaleDateString(), pageWidth - margin, 15, { align: "right" });

        // Header Line
        doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
        doc.setLineWidth(0.5);
        doc.line(margin, 18, pageWidth - margin, 18);

        // --- FOOTER ---
        doc.setDrawColor(230, 230, 230);
        doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text("THIS IS AN AI GENERATED REPORT. PLEASE REVIEW IT.", margin, pageHeight - 10);
        doc.text(`PAGE ${i} OF ${pageCount}`, pageWidth - margin, pageHeight - 10, { align: "right" });
      }
    };

    // Add Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(titleSize);
    doc.setTextColor(0, 0, 0);
    doc.text("Incident Report", margin, 32);
    y = 42;

    // Add Timeline to PDF
    if (report.timeline && report.timeline.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.text("Incident Timeline", margin, y);
      y += 8;

      report.timeline.forEach((item: any) => {
        if (y > pageHeight - 20) { doc.addPage(); y = 30; }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        doc.text(item.time, margin, y);

        doc.setFont("helvetica", "normal");
        doc.text(`- ${item.event}`, margin + 15, y);
        y += 6;
      });
      y += 6;
    }

    // Split report into sections and clean markdown
    const lines = report.split('\n');

    lines.forEach((line: string) => {
      let text = line.trim();
      let isHeader = false;

      if (text.startsWith('## ')) {
        text = text.replace('## ', '');
        isHeader = true;
      } else if (text.startsWith('- ')) {
        text = "• " + text.replace('- ', '');
      }

      if (!text) {
        y += 5;
        return;
      }

      if (isHeader) {
        if (y > pageHeight - 40) { doc.addPage(); y = 35; }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(sectionSize);
        doc.setTextColor(decorationColor[0], decorationColor[1], decorationColor[2]);
        doc.text(text, margin, y);
        y += 8;
        doc.setTextColor(0, 0, 0);
      } else {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(bodySize);
        doc.setTextColor(60, 60, 60);

        const splitText = doc.splitTextToSize(text, contentWidth);
        splitText.forEach((pLine: string) => {
          if (y > pageHeight - 25) { doc.addPage(); y = 35; }
          doc.text(pLine, margin, y);
          y += 6;
        });
      }
    });

    addDecorations();
    doc.save(`ResolveX-Report-${new Date().getTime()}.pdf`);
    toast.success("PDF saved to downloads");
  };

  const deleteReport = async () => {

    await deleteDoc(doc(db, "reports", id))

    toast.success("Report deleted")

    navigate("/dashboard")

  }

  return (

    <div className="max-w-4xl mx-auto px-8 py-12">

      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-black tracking-tight text-theme-text">{title || "Incident Report"}</h1>
          <button
            onClick={exportPDF}
            className="px-5 py-2.5 bg-theme-card hover:bg-theme-bg border border-theme-border text-[10px] font-black uppercase tracking-[0.2em] text-theme-dim hover:text-theme-text rounded-xl transition-all flex items-center gap-2 shadow-sm"
          >
            <i className="fas fa-download"></i>
            Export PDF
          </button>
        </div>

        {/* Metadata Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-6 border-b border-theme-border">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-theme-dim uppercase tracking-widest">Severity</p>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${severity?.includes('P0') ? 'bg-red-500' : 'bg-theme-accent'}`}></span>
              <p className="text-sm font-bold text-theme-text">{severity || "N/A"}</p>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black text-theme-dim uppercase tracking-widest">Priority</p>
            <p className="text-sm font-bold text-theme-accent">{priority || "High"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black text-theme-dim uppercase tracking-widest">Assignee</p>
            <p className="text-sm font-bold text-theme-text">{assignee || "Unassigned"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black text-theme-dim uppercase tracking-widest">Incident Date</p>
            <p className="text-sm font-bold text-theme-text">{date || "Unknown"}</p>
          </div>
        </div>
      </div>

      {/* Incident Timeline Section */}
      {report.timeline && report.timeline.length > 0 && (
        <div className="mb-20">
          <div className="mb-8">
            <h2 className="text-2xl font-black text-theme-text flex items-center gap-3">
              <i className="fas fa-history text-theme-accent"></i>
              Incident Timeline
            </h2>
            <p className="text-theme-dim text-[10px] font-black uppercase tracking-widest mt-1">AI-reconstructed sequence of events</p>
          </div>

          <VerticalTimeline layout="1-column-left" lineColor="#1A2B4C20">
            {report.timeline.map((item: any, index: number) => (
              <VerticalTimelineElement
                key={index}
                date={item.time}
                contentStyle={{ background: '#F8F3ED', color: '#1A2B4C', border: '1px solid #1A2B4C10', borderRadius: '1.5rem', boxShadow: 'none' }}
                contentArrowStyle={{ borderRight: '7px solid #F8F3ED' }}
                iconStyle={{ background: '#D1603D', color: '#fff' }}
                icon={<i className="fas fa-bolt text-[10px] flex items-center justify-center h-full"></i>}
              >
                <h3 className="text-sm font-black text-theme-text uppercase tracking-wide">{item.event}</h3>
              </VerticalTimelineElement>
            ))}
          </VerticalTimeline>
        </div>
      )}

      <div className="bg-theme-card border border-theme-border p-12 rounded-[2.5rem] mb-10 shadow-2xl overflow-hidden relative group max-w-full">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-theme-accent to-transparent opacity-50"></div>
        <div
          className="prose-resolve break-words whitespace-pre-wrap text-theme-text"
          dangerouslySetInnerHTML={{ __html: marked.parse(report) as string }}
        />
      </div>

      <div className="flex gap-4 mb-20">
        <button
          onClick={() => navigate("/edit-report", { state: { report, id } })}
          className="bg-navy hover:bg-navy-light text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-navy/20"
        >
          Edit
        </button>
        <button
          onClick={exportPDF}
          className="bg-theme-accent hover:bg-orange-dark text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-orange/20"
        >
          Export PDF
        </button>
        <button
          onClick={deleteReport}
          className="bg-theme-card hover:bg-red-50 text-red-500 border border-red-500/20 px-8 py-3 rounded-xl font-bold transition-all shadow-sm"
        >
          Delete
        </button>
      </div>

      {/* Collaboration Section */}
      <div className="border-t border-theme-border pt-12">
        <div className="mb-8">
          <h2 className="text-2xl font-black text-theme-text flex items-center gap-3">
            <i className="fas fa-comments text-theme-accent"></i>
            Notes & Comments
          </h2>
          <p className="text-theme-dim text-xs font-bold uppercase tracking-widest mt-1">Collaborate with the incident response team</p>
        </div>

        <div className="space-y-6 mb-10">
          {comments.length === 0 ? (
            <div className="bg-theme-bg/50 border border-dashed border-theme-border p-8 rounded-2xl text-center">
              <p className="text-theme-dim text-sm font-medium italic">No comments yet. Start the discussion.</p>
            </div>
          ) : (
            comments.map(c => (
              <div key={c.id} className="flex gap-4 group">
                <div className="w-10 h-10 rounded-full bg-navy flex items-center justify-center text-white text-[10px] font-black shrink-0">
                  {c.author.charAt(0)}
                </div>
                <div className="bg-theme-card border border-theme-border p-5 rounded-2xl shadow-sm flex-grow">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-black text-theme-text uppercase tracking-widest">{c.author}</p>
                    <p className="text-[10px] text-theme-dim">
                      {c.createdAt?.toDate ? c.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                    </p>
                  </div>
                  <p className="text-sm text-theme-text leading-relaxed">{c.text}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="bg-theme-card border border-theme-border p-6 rounded-3xl shadow-xl flex items-center gap-4">
          <input
            type="text"
            placeholder="Type a team update or finding..."
            className="flex-grow bg-theme-bg border border-theme-border px-6 py-4 rounded-xl text-theme-text font-bold focus:outline-none focus:border-theme-accent transition-all text-sm"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
          />
          <button
            onClick={handleSendComment}
            className="bg-theme-accent text-white w-12 h-12 rounded-xl flex items-center justify-center hover:bg-orange-dark transition-all shadow-lg shadow-orange/20"
          >
            <i className="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>

    </div>

  )

}

export default ViewReport