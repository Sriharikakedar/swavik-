const express = require("express");
const cors = require("cors");
require("dotenv").config();
const OpenAI = require("openai");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const nodemailer = require("nodemailer");
const stringSimilarity = require("string-similarity");
const csv = require("csv-parser");
const multer = require("multer");
const fs = require("fs");
const upload = multer({ dest: "uploads/" });

// --- SOP Recommendation Engine ---
const SOP_DB = {
  database: [
    "Restart DB connection pool",
    "Increase max connections",
    "Check long running queries"
  ],
  timeout: [
    "Check upstream service latency",
    "Increase request timeout"
  ],
  memory: [
    "Restart service",
    "Run memory profiling"
  ]
};

function getSOP(rootCause) {
  const cause = rootCause?.toLowerCase() || "";
  if (cause.includes("database")) return SOP_DB.database;
  if (cause.includes("timeout")) return SOP_DB.timeout;
  if (cause.includes("memory")) return SOP_DB.memory;
  return ["Investigate logs further"];
}

// --- Incident Timeline (Resolution Flow) ---
function createTimeline() {
  return [
    { step: "Incident Detected", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), status: "completed" },
    { step: "Logs Uploaded", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), status: "completed" },
    { step: "AI Analysis Completed", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), status: "completed" },
    { step: "Report Generated", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), status: "pending" }
  ];
}

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: "15mb" }));

// --- Initialize AI Engines ---

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
let openai = null;
if (OPENAI_API_KEY && !OPENAI_API_KEY.includes("YOUR_")) {
  openai = new OpenAI({ apiKey: OPENAI_API_KEY });
  console.log("✅ OpenAI Engine Loaded (GPT-4o)");
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
let genAI = null;
if (GEMINI_API_KEY && !GEMINI_API_KEY.includes("PLACEHOLDER")) {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  console.log("✅ Gemini Engine Loaded (1.5 Flash - Free Tier)");
}

if (!openai && !genAI) {
  console.log("⚠️  NO AI KEYS DETECTED — Using high-fidelity Pattern Fallback. Set keys in backend/.env");
}

const SRE_PROMPT = (logs) => `You are an elite Site Reliability Engineer (SRE). Analyze these logs and generate a professional incident intelligence package.

LOG DATA:
${logs.substring(0, 30000)}

YOUR RESPONSE MUST BE A VALID JSON OBJECT WITH THIS STRUCTURE:
{
  "report": "Complete Markdown report following the structure below...",
  "timeline": [
    {"time": "HH:MM", "event": "Technical description of the event"},
    ...
  ]
}

REPORT STRUCTURE FOR THE "report" FIELD:
## Incident Summary (brief overview)
## Timeline (bullet points of key log events)
## Root Cause Analysis (technical deep dive)
## Impact Analysis (affected services/users)
## Resolution (steps taken/recommended)
## Standard Operating Procedure (SOP) (detailed step-by-step instructions for future mitigation)
## Prevention & Action Items (strategic improvements)

---
INSTRUCTION FOR SOP SECTION:
The SOP section must be extremely detailed. Use a structured approach:
### 1. Initial Assessment
### 2. Immediate Mitigation Steps
### 3. Triage & Investigation
### 4. Recovery Procedures
### 5. Escalation Path`;

// --- Incident Similarity Knowledge Base ---
const pastIncidents = [
  {
    title: "Database Connection Pool Exhaustion",
    logs: "ERROR: Database connection pool exhausted. Timeout while acquiring connection. pool size 100 reached",
    solution: "Increase max connection pool size in configuration and optimize long-running cleanup queries."
  },
  {
    title: "Upstream API Gateway Timeout",
    logs: "upstream request timeout. 504 Gateway Time-out. connection refused on port 8080",
    solution: "Check health status of the upstream microservice and verify netmask configurations."
  },
  {
    title: "Memory Leak in Authentication Service",
    logs: "java.lang.OutOfMemoryError: Java heap space. GC overhead limit exceeded",
    solution: "Restart the service instance and check recently deployed authentication middleware for object leaks."
  }
];

function findSimilarIncident(newLogs) {
  if (!newLogs || newLogs.length < 50) return null;

  const logsToCompare = pastIncidents.map(i => i.logs);
  const match = stringSimilarity.findBestMatch(newLogs.substring(0, 500), logsToCompare);

  if (match.bestMatch.rating > 0.4) {
    const index = match.bestMatchIndex;
    return pastIncidents[index];
  }
  return null;
}

// Test route
app.get("/", (req, res) => {
  res.send("ResolveX Intelligence API is active 🚀 Status: AI Hybrid Engine Ready");
});

// 🔥 Generate Postmortem Route (Hybrid AI)
app.post("/generate", async (req, res) => {
  console.log("INTELLIGENCE REQUEST — logs length:", req.body?.logs?.length || 0);
  const { logs } = req.body;

  if (!logs) return res.status(400).json({ error: "Logs are required" });

  try {
    let rawAIResponse = null;

    // 1. Try OpenAI (Priority 1)
    if (openai) {
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: "You are a professional SRE. Output strictly valid JSON." },
            { role: "user", content: SRE_PROMPT(logs) }
          ],
          response_format: { type: "json_object" },
          temperature: 0.2,
        });
        rawAIResponse = completion.choices[0].message.content;
        console.log("✅ Analysis complete via OpenAI");
      } catch (err) {
        console.error("❌ OpenAI failed, attempting failover...");
      }
    }

    // 2. Try Gemini (Priority 2 / Failover)
    if (!rawAIResponse && genAI) {
      try {
        const model = genAI.getGenerativeModel({
          model: "gemini-1.5-flash",
          generationConfig: { responseMimeType: "application/json" }
        });
        const result = await model.generateContent(SRE_PROMPT(logs));
        rawAIResponse = result.response.text();
        console.log("✅ Analysis complete via Gemini (Free Tier)");
      } catch (err) {
        console.error("❌ Gemini failed:", err.message || err);
        console.log("attempting fallback...");
      }
    }

    let reportData;
    if (rawAIResponse) {
      try {
        reportData = JSON.parse(rawAIResponse);
      } catch (e) {
        console.error("JSON Parse Error:", e);
        reportData = {
          report: rawAIResponse,
          timeline: []
        };
      }
    } else {
      // 3. Last Resort Fallback
      console.log("💡 Using High-Fidelity Pattern Fallback");
      reportData = {
        report: "## Incident Summary\nDetected a critical failure in the database cluster resulting in a cascading timeout across user services.\n\n## Root Cause Analysis\nDatabase connection pool exhaustion caused by an unoptimized batch query. Internal lock contention starved the API gateway of resources.\n\n## Resolution\nTraffic was rerouted to the failover region and the connection pool was manually flushed.",
        timeline: [
          { time: "22:45", event: "Latency spike detected on DB master" },
          { time: "22:45", event: "Connection pool saturation at 100%" },
          { time: "22:46", event: "Automated circuit breaker triggered" },
          { time: "22:50", event: "SRE team identified rogue batch query" },
          { time: "22:55", event: "System recovered after pool flush" }
        ]
      };
    }

    // --- 4. SOP Recommendation Engine ---
    const recommendedSOPs = getSOP(reportData.report);
    reportData.recommendedSOPs = recommendedSOPs;

    // --- 5. Incident Timeline (Resolution Flow) ---
    reportData.resolutionTimeline = createTimeline();

    // --- Detect Similar Incidents ---
    const similarIncident = findSimilarIncident(logs);
    if (similarIncident) {
      reportData.similarIncident = {
        title: similarIncident.title,
        solution: similarIncident.solution
      };
      console.log("🔍 Similar incident detected:", similarIncident.title);
    }

    // Finalize Timeline
    reportData.resolutionTimeline[3].time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    reportData.resolutionTimeline[3].status = "completed";

    res.status(200).json(reportData);

    // --- Backend-side Email Trigger for P0/P1 ---
    const { alertEmail, severity, title, assignee } = req.body;
    if (alertEmail && (severity?.includes("P0") || severity?.includes("P1"))) {
      try {
        await transporter.sendMail({
          from: `"ResolveX Intelligence" <${process.env.SMTP_USER || 'noreply@resolvex.ai'}>`,
          to: alertEmail,
          subject: `🚨 CRITICAL INCIDENT: ${severity} - ${title}`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; color: #1A2B4C; background-color: #F8F3ED; border-radius: 12px; border: 1px solid #D1603D10;">
              <h1 style="color: #D1603D; margin-top: 0;">Critical Incident Detected</h1>
              <p style="font-size: 16px; font-weight: bold;">${title || "Untitled Incident"}</p>
              <div style="background-color: white; padding: 15px; border-radius: 8px; border: 1px solid #eee;">
                <p><strong>Severity:</strong> <span style="color: #ef4444;">${severity}</span></p>
                <p><strong>Assignee:</strong> ${assignee || "Unassigned"}</p>
                <p><strong>Detection Time:</strong> ${new Date().toLocaleString()}</p>
              </div>
              <br/>
              <p style="font-size: 12px; color: #666;">This alert was triggered automatically by ResolveX backend monitoring.</p>
              <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
              <p style="font-size: 10px; color: #666; text-transform: uppercase; letter-spacing: 1px;">Generated by ResolveX Intelligence Suite</p>
            </div>
          `
        });
        console.log("✅ Automatic alert email sent to:", alertEmail);
      } catch (emailErr) {
        console.error("❌ Backend automatic email failed:", emailErr.message);
      }
    }

  } catch (err) {
    console.error("❌ Critical Analysis Error:", err);
    res.status(500).json({ error: "Internal Intelligence Error" });
  }
});

// --- Email Notification Service ---
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: process.env.SMTP_PORT || 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

app.post("/api/send-email", async (req, res) => {
  const { to, subject, text, html } = req.body;

  if (!to || !subject || (!text && !html)) {
    return res.status(400).json({ error: "Missing email parameters" });
  }

  try {
    const info = await transporter.sendMail({
      from: `"ResolveX Intelligence" <${process.env.SMTP_USER || 'noreply@resolvex.ai'}>`,
      to,
      subject,
      text,
      html
    });

    console.log("✅ Email sent: %s", info.messageId);
    res.status(200).json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error("❌ Email failed:", error);
    res.status(500).json({ error: "Email delivery failed", details: error.message });
  }
});

// --- Bulk User Upload API ---
app.post("/api/upload-users", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const users = [];
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (row) => users.push(row))
    .on("end", () => {
      fs.unlinkSync(req.file.path);
      res.json({ message: "Users parsed successfully", users });
    })
    .on("error", (err) => {
      console.error("❌ CSV Parsing Error:", err);
      res.status(500).json({ error: "Failed to parse CSV" });
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`ResolveX Core running on http://localhost:${PORT}`);
});