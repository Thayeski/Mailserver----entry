require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
app.use(cors()); // Allow all origins
app.use(express.json());

// Nodemailer transporter
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
  console.log("Received form data:", req.body); // Log incoming data

  const formData = req.body;

  if (!formData || Object.keys(formData).length === 0) {
    return res.status(400).json({ success: false, error: "Form is empty." });
  }

  // Build email content dynamically
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
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.response);
    res.json({ success: true, message: "Email sent successfully" });
  } catch (err) {
    console.error("Error sending email:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
