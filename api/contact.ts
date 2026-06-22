import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createTransporter, getAdminEmail, getFromEmail, readSubmissions, writeSubmissions } from "./server-utils";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method Not Allowed" });
    return;
  }

  const { name, email, phone, course, message } = req.body;

  if (!name || !email || !phone || !message) {
    res.status(400).json({ message: "Please fill all required fields (name, email, phone, message)" });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ message: "Invalid email address" });
    return;
  }

  const submission = {
    id: Date.now().toString(),
    name,
    email,
    phone,
    course: course || "",
    message,
    submittedAt: new Date().toISOString(),
  };

  try {
    const existingData = await readSubmissions();
    existingData.push(submission);
    await writeSubmissions(existingData);

    const transporter = await createTransporter();
    await transporter.sendMail({
      from: getFromEmail(),
      to: getAdminEmail(),
      subject: `Counseling Enquiry from ${name}`,
      html: `
        <h2>New Counseling Enquiry</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Course/Country of Interest:</strong> ${course || "Not specified"}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
      `,
    });

    res.status(200).json({ message: "Enquiry sent successfully!" });
  } catch (error) {
    console.error("Contact form error:", error);
    res.status(500).json({ message: "Failed to send enquiry. Please try again later.", error: (error as Error).message });
  }
}
