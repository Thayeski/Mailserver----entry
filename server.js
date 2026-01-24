require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
app.use(cors()); // Allow all origins
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

// POST endpoint
app.post("/submit-form", async (req, res) => {
  const formData = req.body;
  console.log("Received form data:", formData);

  if (!formData || Object.keys(formData).length === 0) {
    return res.status(400).json({ success: false, error: "Form is empty." });
  }

  // Build HTML content
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
    // Detect common Gmail errors
    let errorMessage = err.message;

    if (err.responseCode === 535) {
      errorMessage = "Authentication failed. Check your email and app password.";
    } else if (err.responseCode === 534) {
      errorMessage = "Gmail blocked the sign-in. Check your account security settings.";
    } else if (err.code === "EAUTH") {
      errorMessage = "Email authentication error. Verify credentials and app password.";
    }

    console.error("Error sending email:", err);
    res.status(500).json({
      success: false,
      error: errorMessage,
      rawError: err.toString() // include raw error for debugging
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
