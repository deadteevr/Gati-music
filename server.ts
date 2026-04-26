import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

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
