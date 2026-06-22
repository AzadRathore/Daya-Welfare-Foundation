import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getAdminSecret, readSubmissions } from "./server-utils";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ message: "Method Not Allowed" });
    return;
  }

  const adminSecret = req.headers["x-admin-secret"] as string | undefined;
  if (!adminSecret || adminSecret !== getAdminSecret()) {
    res.status(403).json({ message: "Forbidden" });
    return;
  }

  try {
    const submissions = await readSubmissions();
    res.status(200).json({ submissions });
  } catch (error) {
    console.error("Read submissions error:", error);
    res.status(500).json({ message: "Failed to load submissions" });
  }
}
