require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
app.use(cors()); // Allow all origins (adjust if needed)
app.use(express.json());

// Nodemailer transporter using Gmail
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // SSL
  auth: {
    user: process.env.CLIENT_EMAIL,
    pass: process.env.CLIENT_APP_PASSWORD
  }
});

// POST endpoint for form submissions
app.post("/submit-form", async (req, res) => {
  const formData = req.body;

  // Validate that at least one field exists
  if (!formData || Object.keys(formData).length === 0) {
    return res.status(400).json({ success: false, error: "Form is empty." });
  }

  // Build email HTML dynamically
  let htmlContent = "<h3>New Form Submission</h3>";
  for (const [key, value] of Object.entries(formData)) {
    htmlContent += `<p><b>${key}:</b> ${value}</p>`;
  }

  const mailOptions = {
    from: `"Website Form" <${process.env.CLIENT_EMAIL}>`,
    to: process.env.CLIENT_EMAIL,
    subject: "New Form Submission",
    html: htmlContent
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true }); // frontend receives success
  } catch (err) {
    console.error("Error sending email:", err);
    res.status(500).json({ success: false, error: "Failed to send email." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
