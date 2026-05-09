import { createExpressApp } from "../server";

let cachedApp: any = null;

export default async function handler(req: any, res: any) {
  try {
    if (!cachedApp) {
      console.log("[Vercel] Initializing Express app...");
      cachedApp = await createExpressApp();
    }
    return cachedApp(req, res);
  } catch (error) {
    console.error("[Vercel] Critical function crash:", error);
    res.status(500).json({ 
      error: "Internal Server Error", 
      details: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    });
  }
}
