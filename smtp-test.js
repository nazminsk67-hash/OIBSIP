// smtp-test.js

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "pizzahub.team@gmail.com",
    pass: "YOUR_16_CHAR_APP_PASSWORD"
  }
});

try {
  await transporter.verify();
  console.log("SMTP OK");
} catch (err) {
  console.error(err);
}