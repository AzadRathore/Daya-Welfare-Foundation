import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getAdminSecret, readSubmissions, writeSubmissions } from "./server-utils";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "DELETE") {
    res.status(405).json({ message: "Method Not Allowed" });
    return;
  }

  const adminSecret = req.headers["x-admin-secret"] as string | undefined;
  if (!adminSecret || adminSecret !== getAdminSecret()) {
    res.status(403).json({ message: "Forbidden" });
    return;
  }

  const submissionId = req.query.id as string;
  try {
    const existingData = await readSubmissions();
    const filteredData = existingData.filter((item: { id: string }) => item.id !== submissionId);

    if (filteredData.length === existingData.length) {
      res.status(404).json({ message: "Submission not found" });
      return;
    }

    await writeSubmissions(filteredData);
    res.status(200).json({ message: "Submission deleted successfully" });
  } catch (error) {
    console.error("Delete submission error:", error);
    res.status(500).json({ message: "Failed to delete submission" });
  }
}
