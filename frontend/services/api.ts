const BASE_URL = import.meta.env.VITE_API_URL;

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