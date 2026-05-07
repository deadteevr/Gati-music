import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { Resend } from "resend";
import { getVerificationTemplate, getPasswordResetTemplate, getWelcomeTemplate } from "./src/lib/emailTemplates.js";
import admin from "firebase-admin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const firebaseConfig = JSON.parse(fs.readFileSync(path.join(process.cwd(), "firebase-applet-config.json"), "utf8"));

admin.initializeApp({
  projectId: firebaseConfig.projectId,
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Resend
  const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
  const emailFrom = process.env.EMAIL_FROM || "Gati Music <support@gatimusic.in>";

  // API Route for sending general emails
  app.post("/api/send-email", async (req, res) => {
    const { to, subject, html, text } = req.body;

    if (!to || !subject || (!html && !text)) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      if (resend) {
        const { data, error } = await resend.emails.send({
          from: emailFrom,
          to,
          subject,
          html: html || text,
        });

        if (error) {
          console.error("Resend error:", error);
          return res.status(400).json({ error: error.message });
        }

        console.log(`Email sent to ${to}: ${subject}`);
        res.json({ success: true, data });
      } else {
        console.warn("Resend API key not configured. Logging email instead.");
        console.log(`[SIMULATED EMAIL] To: ${to}, Subject: ${subject}`);
        res.json({ success: true, message: "Simulated" });
      }
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ error: "Failed to send email" });
    }
  });

  // Branded Auth Emails (Verification / Password Reset)
  app.post("/api/auth-email", async (req, res) => {
    const { type, to, name } = req.body;
    let { oobCode } = req.body;
    
    if (!to || !type) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      const email = to;
      const domain = process.env.NODE_ENV === "production" ? "https://gatimusic.in" : "http://localhost:3000";
      const actionCodeSettings = { url: domain };
      
      // Generate oobCode if not provided
      if (!oobCode) {
        if (type === "verify") {
          const link = await admin.auth().generateEmailVerificationLink(email, actionCodeSettings);
          oobCode = new URL(link).searchParams.get("oobCode");
        } else if (type === "reset") {
          const link = await admin.auth().generatePasswordResetLink(email, actionCodeSettings);
          oobCode = new URL(link).searchParams.get("oobCode");
        }
      }

      let html = "";
      let subject = "";

      if (type === "verify") {
        const url = `${domain}/auth-action?mode=verifyEmail&oobCode=${oobCode}`;
        html = getVerificationTemplate(name || "Artist", url);
        subject = "Verify Your Gati Music Account ⚡️";
      } else if (type === "reset") {
        const url = `${domain}/auth-action?mode=resetPassword&oobCode=${oobCode}`;
        html = getPasswordResetTemplate(name || "Artist", url);
        subject = "Reset Your Gati Music Password 🔒";
      } else if (type === "welcome") {
        html = getWelcomeTemplate(name || "Artist");
        subject = "Artist Account Approved 🚀";
      } else {
        return res.status(400).json({ error: "Invalid email type" });
      }

      if (resend) {
        await resend.emails.send({ from: emailFrom, to, subject, html });
        res.json({ success: true });
      } else {
        console.log(`[SIMULATED AUTH EMAIL] To: ${to}, Type: ${type}, Code: ${oobCode}`);
        res.json({ success: true, simulated: true });
      }
    } catch (err: any) {
      console.error("Auth email error:", err);
      res.status(500).json({ error: err.message || "Failed to send auth email" });
    }
  });

  // Serve static files from the public directory explicitly
  const publicPath = path.join(process.cwd(), "public");

  // Custom route for sitemap.xml to ensure correct headers
  app.get("/sitemap.xml", (req, res) => {
    const sitemapPath = path.join(publicPath, "sitemap.xml");
    if (fs.existsSync(sitemapPath)) {
      res.header("Content-Type", "application/xml");
      res.status(200).sendFile(sitemapPath);
    } else {
      res.status(404).send("Sitemap not found");
    }
  });

  // Custom route for robots.txt
  app.get("/robots.txt", (req, res) => {
    const robotsPath = path.join(publicPath, "robots.txt");
    if (fs.existsSync(robotsPath)) {
      res.header("Content-Type", "text/plain");
      res.status(200).sendFile(robotsPath);
    } else {
      res.status(404).send("Robots.txt not found");
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
