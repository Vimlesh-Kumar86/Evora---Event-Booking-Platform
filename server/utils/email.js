// const nodemailer = require('nodemailer');
// const dotenv = require('dotenv');

// dotenv.config();

// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS
//     }
// });

// const sendBookingEmail = async (userEmail, userName, eventTitle) => {
//     try {
//         const mailOptions = {
//             from: process.env.EMAIL_USER,
//             to: userEmail,
//             subject: `Booking Confirmed: ${eventTitle}`,
//             html: `
//         <h2>Hi ${userName}!</h2>
//         <p>Your booking for the event <strong>${eventTitle}</strong> is successfully confirmed.</p>
//         <p>Thank you for choosing Evora.</p>
//       `
//         };
//         await transporter.sendMail(mailOptions);
//         console.log('Email sent successfully to', userEmail);
//     } catch (error) {
//         console.error('Error sending email:', error);
//     }
// };

// const sendOTPEmail = async (userEmail, otp, type) => {
//     try {
//         const title = type === 'account_verification' ? 'Verify your Evora Account' : 'Evora Booking Verification';
//         const msg = type === 'account_verification'
//             ? 'Please use the following OTP to verify your new Evora account.'
//             : 'Please use the following OTP to verify and confirm your event booking.';

//         const mailOptions = {
//             from: process.env.EMAIL_USER,
//             to: userEmail,
//             subject: title,
//             html: `
//                 <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
//                     <h2 style="color: #111;">${title}</h2>
//                     <p style="color: #555; font-size: 16px;">${msg}</p>
//                     <div style="margin: 20px auto; padding: 15px; font-size: 24px; font-weight: bold; background: #f4f4f4; width: max-content; letter-spacing: 5px;">
//                         ${otp}
//                     </div>
//                     <p style="color: #999; font-size: 12px;">This code expires in 5 minutes. If you didn't request this, please ignore this email.</p>
//                 </div>
//             `
//         };
//         await transporter.sendMail(mailOptions);
//         console.log(`OTP sent to ${userEmail} for ${type}`);
//     } catch (error) {
//         console.error('Error sending OTP email:', error);
//     }
// };

// module.exports = { sendBookingEmail, sendOTPEmail };













// const nodemailer = require('nodemailer');
// const dotenv = require('dotenv');

// dotenv.config();

// const EMAIL_USER = process.env.EMAIL_USER;
// const EMAIL_PASS = process.env.EMAIL_PASS;

// // Configure Gmail SMTP
// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: EMAIL_USER,
//         pass: EMAIL_PASS
//     },
//     connectionTimeout: 15000,
//     greetingTimeout: 10000,
//     socketTimeout: 20000
// });

// // Common email sender
// const sendEmail = async (mailOptions) => {
//     if (!EMAIL_USER || !EMAIL_PASS) {
//         throw new Error(
//             'EMAIL_USER or EMAIL_PASS is missing from environment variables'
//         );
//     }

//     try {
//         const info = await transporter.sendMail({
//             from: `"Evora" <${EMAIL_USER}>`,
//             ...mailOptions
//         });

//         console.log('Email accepted by SMTP:', info.messageId);

//         return info;
//     } catch (error) {
//         console.error('Email delivery error:', {
//             message: error.message,
//             code: error.code,
//             responseCode: error.responseCode,
//             command: error.command
//         });

//         // Important: pass the error to authController.js
//         throw error;
//     }
// };

// // Booking confirmation email
// const sendBookingEmail = async (userEmail, userName, eventTitle) => {
//     return sendEmail({
//         to: userEmail,
//         subject: `Booking Confirmed: ${eventTitle}`,
//         text: `Hi ${userName}, your booking for ${eventTitle} is confirmed. Thank you for choosing Evora.`,
//         html: `
//             <div style="font-family: Arial, sans-serif; padding: 20px;">
//                 <h2>Hi ${escapeHtml(userName)}!</h2>
//                 <p>Your booking for the event
//                     <strong>${escapeHtml(eventTitle)}</strong>
//                     is successfully confirmed.
//                 </p>
//                 <p>Thank you for choosing Evora.</p>
//             </div>
//         `
//     });
// };

// // OTP verification email
// const sendOTPEmail = async (userEmail, otp, type) => {
//     const isVerification = type === 'account_verification';

//     const title = isVerification
//         ? 'Verify your Evora Account'
//         : 'Evora Booking Verification';

//     const message = isVerification
//         ? 'Use the following OTP to verify your Evora account.'
//         : 'Use the following OTP to verify your event booking.';

//     return sendEmail({
//         to: userEmail,
//         subject: title,
//         text: `${message}\nYour OTP is: ${otp}\nThis code expires in 5 minutes.`,
//         html: `
//             <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
//                 <h2 style="color: #111;">${title}</h2>
//                 <p style="color: #555; font-size: 16px;">
//                     ${message}
//                 </p>
//                 <div style="margin: 20px auto; padding: 15px;
//                     font-size: 28px; font-weight: bold;
//                     background: #f4f4f4; letter-spacing: 5px;">
//                     ${escapeHtml(otp)}
//                 </div>
//                 <p style="color: #999; font-size: 12px;">
//                     If you did not request this code, please ignore this email.
//                 </p>
//             </div>
//         `
//     });
// };

// // Escape dynamic text before inserting into HTML
// function escapeHtml(value) {
//     return String(value).replace(/[&<>"']/g, (char) => {
//         const entities = {
//             '&': '&amp;',
//             '<': '&lt;',
//             '>': '&gt;',
//             '"': '&quot;',
//             "'": '&#39;'
//         };

//         return entities[char];
//     });
// }

// module.exports = {
//     sendBookingEmail,
//     sendOTPEmail
// };








const dotenv = require("dotenv");

dotenv.config();

/**
 * Send an email using the Resend HTTPS API.
 */
const sendEmail = async ({ to, subject, html, text }) => {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is missing from environment variables.");
  }

  if (!from) {
    throw new Error("EMAIL_FROM is missing from environment variables.");
  }

  if (!to) {
    throw new Error("Recipient email address is required.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      ...(text ? { text } : {}),
    }),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error("Resend API error:", {
      status: response.status,
      message: result.message || "Unable to send email",
      name: result.name,
    });

    throw new Error(
      result.message || `Resend email request failed (${response.status})`
    );
  }

  console.log("Email accepted by Resend:", {
    id: result.id,
    to,
    subject,
  });

  return result;
};

/**
 * Send OTP for account verification.
 *
 * Usage:
 * await sendOTPEmail(user.email, otp);
 */
const sendOTPEmail = async (email, otp) => {
  if (!email || !otp) {
    throw new Error("Email and OTP are required.");
  }

  const subject = "Verify Your Evora Account";

  const html = `
    <!DOCTYPE html>
    <html>
      <body style="margin:0;padding:24px;background:#f4f7fb;font-family:Arial,sans-serif;">
        <div style="max-width:520px;margin:auto;background:#ffffff;padding:30px;border-radius:12px;">
          <h1 style="color:#2563eb;text-align:center;">Welcome to Evora!</h1>

          <p style="font-size:16px;color:#333;">
            Thank you for creating an account with Evora Event Booking Platform.
          </p>

          <p style="font-size:16px;color:#333;">
            Use the verification code below to verify your email address:
          </p>

          <div style="margin:25px 0;padding:18px;background:#eff6ff;border-radius:8px;text-align:center;">
            <span style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#1d4ed8;">
              ${String(otp).replace(/[&<>"']/g, "")}
            </span>
          </div>

          <p style="font-size:14px;color:#555;">
            If you did not create this account, you can ignore this email.
          </p>

          <p style="font-size:14px;color:#777;">
            Regards,<br />
            <strong>Evora Team</strong>
          </p>
        </div>
      </body>
    </html>
  `;

  const text = `
Welcome to Evora!

Your account verification OTP is: ${otp}

If you did not create this account, please ignore this email.

Regards,
Evora Team
  `.trim();

  try {
    return await sendEmail({
      to: email,
      subject,
      html,
      text,
    });
  } catch (error) {
    console.error("OTP email delivery failed:", error.message);
    throw error;
  }
};

/**
 * Send a booking confirmation email.
 *
 * Usage:
 * await sendBookingEmail(email, bookingDetails);
 *
 * bookingDetails can contain:
 * { eventName, bookingId, eventDate, venue, amount }
 */
const sendBookingEmail = async (email, bookingDetails = {}) => {
  if (!email) {
    throw new Error("Recipient email is required for booking confirmation.");
  }

  const {
    eventName = "Your Event",
    bookingId = "N/A",
    eventDate = "Please check your booking details",
    venue = "Please check your booking details",
    amount = "Please check your booking details",
  } = bookingDetails || {};

  const escapeHtml = (value) =>
    String(value).replace(/[&<>"']/g, (character) => {
      const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      };

      return entities[character];
    });

  const safeEventName = escapeHtml(eventName);
  const safeBookingId = escapeHtml(bookingId);
  const safeEventDate = escapeHtml(eventDate);
  const safeVenue = escapeHtml(venue);
  const safeAmount = escapeHtml(amount);

  const subject = `Booking Confirmation - ${eventName}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <body style="margin:0;padding:24px;background:#f4f7fb;font-family:Arial,sans-serif;">
        <div style="max-width:560px;margin:auto;background:#ffffff;padding:30px;border-radius:12px;">
          <h1 style="color:#16a34a;text-align:center;">Booking Confirmed!</h1>

          <p style="font-size:16px;color:#333;">
            Thank you for booking with Evora. Here are your booking details:
          </p>

          <div style="padding:20px;background:#f0fdf4;border-radius:8px;">
            <p><strong>Event:</strong> ${safeEventName}</p>
            <p><strong>Booking ID:</strong> ${safeBookingId}</p>
            <p><strong>Date:</strong> ${safeEventDate}</p>
            <p><strong>Venue:</strong> ${safeVenue}</p>
            <p><strong>Amount:</strong> ${safeAmount}</p>
          </div>

          <p style="font-size:14px;color:#555;">
            Please keep your booking ID for future reference.
          </p>

          <p style="font-size:14px;color:#777;">
            Regards,<br />
            <strong>Evora Team</strong>
          </p>
        </div>
      </body>
    </html>
  `;

  const text = `
Booking Confirmed - Evora

Event: ${eventName}
Booking ID: ${bookingId}
Date: ${eventDate}
Venue: ${venue}
Amount: ${amount}

Thank you for booking with Evora!
  `.trim();

  try {
    return await sendEmail({
      to: email,
      subject,
      html,
      text,
    });
  } catch (error) {
    console.error("Booking confirmation email failed:", error.message);
    throw error;
  }
};

module.exports = {
  sendEmail,
  sendOTPEmail,
  sendBookingEmail,
};
