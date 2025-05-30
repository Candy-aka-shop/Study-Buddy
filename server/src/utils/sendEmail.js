require('dotenv').config();
const nodemailer = require('nodemailer');

async function sendVerificationEmail(to, verificationLink) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Noble Auth" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Verify your email',
    html: `
      <h2>Verify your email</h2>
      <p>Click the link below to verify your email:</p>
      <a href="${verificationLink}">Verify Email</a>
    `,
  };

  await transporter.sendMail(mailOptions);
  console.log(`Verification email sent to ${to}`);
}

module.exports = { sendVerificationEmail };