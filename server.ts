import express from "express";
import path from "path";
import fs from "fs";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import cors from "cors";

export async function createExpressApp() {
  const app = express();
  
  // Load environment variables if they haven't been loaded
  dotenv.config();
  
  // Enable CORS for production domains and local development
  app.use(cors({
    origin: [
      "https://gatimusic.in", 
      "https://www.gatimusic.in", 
      "http://localhost:3000", 
      "http://localhost:5173",
      /\.ais-.*\.run\.app$/
    ],
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true
  }));

  app.use(express.json());

  // Health check / Debug endpoint
  app.get(["/api/health", "/health"], (req, res) => {
    try {
      const envStatus = {
        VITE_CLOUDINARY_CLOUD_NAME: !!process.env.VITE_CLOUDINARY_CLOUD_NAME,
        VITE_CLOUDINARY_UPLOAD_PRESET: !!process.env.VITE_CLOUDINARY_UPLOAD_PRESET,
        EMAIL_USER: !!process.env.EMAIL_USER,
        NODE_ENV: process.env.NODE_ENV
      };
      res.json({ 
        status: "ok", 
        envStatus, 
        timestamp: new Date().toISOString(),
        message: "Gati Music API is online (Unsigned Upload Mode)"
      });
    } catch (err) {
      res.status(500).json({ status: "error", error: String(err) });
    }
  });

  // Email Transport Setup - Lazy load
  const getTransporter = () => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return null;
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || "465"),
      secure: process.env.EMAIL_PORT === "465",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  };

  // API Route for sending notifications - support both with and without /api prefix
  app.post(["/api/send-email", "/send-email"], async (req, res) => {
    const { to, subject, html, text } = req.body;

    if (!to || !subject || (!html && !text)) {
      return res.status(400).json({ error: "Missing required fields: to, subject, and either html or text" });
    }

    try {
      const transporter = getTransporter();
      if (transporter) {
        await transporter.sendMail({
          from: process.env.EMAIL_FROM || '"Gati Music" <notifications@gatimusic.in>',
          to,
          subject,
          text,
          html,
        });
        res.json({ success: true, message: "Email sent successfully" });
      } else {
        console.warn("SMTP credentials not configured.");
        res.json({ success: true, message: "Email logged (SMTP not configured)" });
      }
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ error: "Failed to send email", details: String(error) });
    }
  });

  // API Route for release submission
  app.post(["/api/submit-release", "/submit-release"], async (req, res) => {
    try {
      res.json({ success: true, message: "Release received" });
    } catch (err) {
      res.status(500).json({ error: "Failed to submit release", details: String(err) });
    }
  });

  return app;
}
