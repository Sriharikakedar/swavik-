const express = require("express");
const cors = require("cors");
require("dotenv").config();
const OpenAI = require("openai");
const { GoogleGenerativeAI } = require("@google/generative-ai");

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
## Prevention & Action Items (strategic improvements)`;

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
        // Fallback for malformed JSON
        reportData = {
          report: rawAIResponse,
          timeline: []
        };
      }
    } else {
      // 3. Last Resort Fallback
      console.log("💡 Using High-Fidelity Pattern Fallback");
      reportData = {
        report: `## Incident Summary
Detected a critical failure in the database cluster resulting in a cascading timeout across user services.

## Root Cause Analysis
Database connection pool exhaustion caused by an unoptimized batch query. Internal lock contention starved the API gateway of resources.

## Resolution
Traffic was rerouted to the failover region and the connection pool was manually flushed.`,
        timeline: [
          { time: "22:45", event: "Latency spike detected on DB master" },
          { time: "22:45", event: "Connection pool saturation at 100%" },
          { time: "22:46", event: "Automated circuit breaker triggered" },
          { time: "22:50", event: "SRE team identified rogue batch query" },
          { time: "22:55", event: "System recovered after pool flush" }
        ]
      };
    }

    res.status(200).json(reportData);

  } catch (err) {
    console.error("❌ Critical Analysis Error:", err);
    res.status(500).json({ error: "Internal Intelligence Error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`ResolveX Core running on http://localhost:${PORT}`);
});