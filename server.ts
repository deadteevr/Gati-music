import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import nodemailer from "nodemailer";
import crypto from "crypto";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

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
    const requestId = crypto.randomUUID().slice(0, 8);
    console.log(`[Cloudinary][${requestId}] Signature request received`);
    
    try {
      const { params_to_sign } = req.body;
      const apiSecret = process.env.CLOUDINARY_API_SECRET;
      const apiKey = process.env.CLOUDINARY_API_KEY;
      const cloudName = process.env.VITE_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;

      if (!params_to_sign || typeof params_to_sign !== 'object') {
        console.error(`[Cloudinary][${requestId}] Error: Missing or invalid params_to_sign. Received:`, params_to_sign);
        return res.status(400).json({ 
          error: "Missing params_to_sign in request body.",
          details: "The request must include a params_to_sign object containing at least a timestamp."
        });
      }

      const missingVars = [];
      if (!apiSecret) missingVars.push("CLOUDINARY_API_SECRET");
      if (!apiKey) missingVars.push("CLOUDINARY_API_KEY");
      if (!cloudName) missingVars.push("VITE_CLOUDINARY_CLOUD_NAME/CLOUDINARY_CLOUD_NAME");

      if (missingVars.length > 0) {
        console.error(`[Cloudinary][${requestId}] Error: Missing environment variables: ${missingVars.join(", ")}`);
        return res.status(500).json({ 
          error: "Cloudinary configuration missing on server.",
          details: `The following environment variables are not configured: ${missingVars.join(", ")}. Please check your production environment settings.`,
          requestId
        });
      }

      console.log(`[Cloudinary][${requestId}] Validating params:`, JSON.stringify(params_to_sign));

      // Sort params alphabetically and join with &
      // Cloudinary signature doesn't want the api_key, cloud_name, signature or file in the string to sign
      const disallowedParams = ['api_key', 'cloud_name', 'signature', 'file', 'resource_type'];
      const sortedParams = Object.keys(params_to_sign)
        .filter(key => !disallowedParams.includes(key))
        .sort()
        .map(key => {
          const value = params_to_sign[key];
          return `${key}=${value}`;
        })
        .join("&");

      console.log(`[Cloudinary][${requestId}] String to sign: ${sortedParams}[API_SECRET_HIDDEN]`);

      const signature = crypto
        .createHash("sha1")
        .update(sortedParams + apiSecret)
        .digest("hex");

      console.log(`[Cloudinary][${requestId}] Signature generated successfully`);

      res.json({ 
        signature, 
        apiKey, 
        cloudName,
        timestamp: params_to_sign.timestamp,
        requestId
      });
    } catch (error) {
      console.error(`[Cloudinary][${requestId}] Unexpected error:`, error);
      res.status(500).json({ 
        error: "Failed to generate signature", 
        details: error instanceof Error ? error.message : String(error),
        requestId
      });
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
