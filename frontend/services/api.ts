const BASE_URL = import.meta.env.VITE_API_URL;

/* ---------- GENERATE POSTMORTEM ---------- */

export const generatePostmortem = async (logs: string, metadata: any = {}) => {
  const res = await fetch(`${BASE_URL}/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ logs, ...metadata }),
  });

  if (!res.ok) {
    throw new Error("Failed to generate report");
  }

  return res.json();
};

/* ---------- SEND EMAIL NOTIFICATION ---------- */

export const sendEmail = async (emailData: { to: string; subject: string; text?: string; html?: string }) => {
  const res = await fetch(`${BASE_URL}/api/send-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(emailData),
  });

  if (!res.ok) {
    throw new Error("Failed to send email");
  }

  return res.json();
};