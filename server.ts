import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import nodemailer from "nodemailer";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Email Transport Setup
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || "465"),
    secure: process.env.EMAIL_PORT === "465",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // API Route for sending notifications
  app.post("/api/send-email", async (req, res) => {
    const { to, subject, html, text } = req.body;

    if (!to || !subject || (!html && !text)) {
      return res.status(400).json({ error: "Missing required fields: to, subject, and either html or text" });
    }

    try {
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        await transporter.sendMail({
          from: process.env.EMAIL_FROM || '"Gati Music" <notifications@gatimusic.in>',
          to,
          subject,
          text,
          html,
        });
        console.log(`Email sent to ${to}: ${subject}`);
        res.json({ success: true, message: "Email sent successfully" });
      } else {
        console.warn("SMTP credentials not configured. Logging email content instead:");
        console.log("-------------------");
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log(`Content: ${text || html}`);
        console.log("-------------------");
        res.json({ success: true, message: "Email logged to console (SMTP not configured)" });
      }
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ error: "Failed to send email" });
    }
  });

  // Cloudinary Signing Endpoint
  app.post("/api/cloudinary-signature", (req, res) => {
    try {
      const { params_to_sign } = req.body;
      const apiSecret = process.env.CLOUDINARY_API_SECRET;
      const apiKey = process.env.CLOUDINARY_API_KEY;

      if (!apiSecret || !apiKey) {
        return res.status(500).json({ error: "Cloudinary credentials not configured on server." });
      }

      // Sort params alphabetically and join with &
      const sortedParams = Object.keys(params_to_sign)
        .sort()
        .map(key => `${key}=${params_to_sign[key]}`)
        .join("&");

      const signature = crypto
        .createHash("sha1")
        .update(sortedParams + apiSecret)
        .digest("hex");

      res.json({ signature, apiKey });
    } catch (error) {
      console.error("Cloudinary signature error:", error);
      res.status(500).json({ error: "Failed to generate signature" });
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
