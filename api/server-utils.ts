import fs from "fs/promises";
import path from "path";
import os from "os";
import nodemailer from "nodemailer";

const rootSubmissionsPath = path.resolve(process.cwd(), "submissions.json");
const runtimeSubmissionsPath = path.join(os.tmpdir(), "daya-welfare-submissions.json");

async function ensureSubmissionsFile() {
  try {
    await fs.access(runtimeSubmissionsPath);
  } catch {
    try {
      const content = await fs.readFile(rootSubmissionsPath, "utf8");
      await fs.writeFile(runtimeSubmissionsPath, content, "utf8");
    } catch {
      await fs.writeFile(runtimeSubmissionsPath, "[]", "utf8");
    }
  }
}

export async function readSubmissions() {
  await ensureSubmissionsFile();
  const content = await fs.readFile(runtimeSubmissionsPath, "utf8");
  return JSON.parse(content || "[]");
}

export async function writeSubmissions(submissions: unknown[]) {
  await ensureSubmissionsFile();
  await fs.writeFile(runtimeSubmissionsPath, JSON.stringify(submissions, null, 2), "utf8");
}

export async function createTransporter() {
  const useEthereal = process.env.USE_ETHEREAL === "true" || process.env.NODE_ENV !== "production";

  if (useEthereal) {
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

export function getAdminSecret() {
  return process.env.ADMIN_SECRET || "admin-secret";
}

export function getAdminEmail() {
  return process.env.ADMIN_EMAIL || "omeducation1001@gmail.com";
}

export function getFromEmail() {
  return process.env.EMAIL_USER || "no-reply@example.com";
}
