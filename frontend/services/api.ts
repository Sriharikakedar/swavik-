const BASE_URL = "http://localhost:5000";

/* ---------- GENERATE POSTMORTEM ---------- */

export const generatePostmortem = async (logs: string) => {
  const res = await fetch(`${BASE_URL}/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ logs }),
  });

  if (!res.ok) {
    throw new Error("Failed to generate report");
  }

  return res.json();
};