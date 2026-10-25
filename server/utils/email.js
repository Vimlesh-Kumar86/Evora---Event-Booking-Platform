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








// const nodemailer = require("nodemailer");
// require("dotenv").config();

// const EMAIL_USER = process.env.EMAIL_USER;
// const EMAIL_PASS = process.env.EMAIL_PASS;

// if (!EMAIL_USER || !EMAIL_PASS) {
//   console.error(
//     "Email configuration missing: EMAIL_USER or EMAIL_PASS"
//   );
// }

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: EMAIL_USER,
//     pass: EMAIL_PASS,
//   },
//   connectionTimeout: 15000,
//   greetingTimeout: 10000,
//   socketTimeout: 20000,
// });

// const sendOTPEmail = async (
//   userEmail,
//   otp,
//   type = "account_verification"
// ) => {
//   if (!EMAIL_USER || !EMAIL_PASS) {
//     throw new Error(
//       "EMAIL_USER or EMAIL_PASS is missing"
//     );
//   }

//   if (!userEmail || !otp) {
//     throw new Error("Recipient email and OTP are required");
//   }

//   const isBooking = type === "event_booking";

//   const subject = isBooking
//     ? "Evora Event Booking Verification"
//     : "Verify Your Evora Account";

//   const purpose = isBooking
//     ? "Use this OTP to verify your event booking."
//     : "Use this OTP to verify your Evora account.";

//   const safeOTP = String(otp).replace(/\D/g, "");

//   if (!/^\d{6}$/.test(safeOTP)) {
//     throw new Error("OTP must contain exactly six digits");
//   }

//   try {
//     const info = await transporter.sendMail({
//       from: `"Evora" <${EMAIL_USER}>`,
//       to: userEmail,
//       subject,
//       text: `${purpose}\nYour OTP is ${safeOTP}\nThis code expires in 5 minutes.`,
//       html: `
//         <div style="font-family:Arial,sans-serif;
//                     max-width:500px;margin:auto;padding:24px;">
//           <h2>Welcome to Evora</h2>
//           <p>${purpose}</p>
//           <div style="padding:20px;background:#f1f5f9;
//                       text-align:center;font-size:30px;
//                       font-weight:bold;letter-spacing:8px;">
//             ${safeOTP}
//           </div>
//           <p>This OTP is valid for 5 minutes.</p>
//           <p>If you did not request this code, ignore this email.</p>
//           <p>Evora Team</p>
//         </div>
//       `,
//     });

//     console.log("OTP email accepted by SMTP:", {
//       messageId: info.messageId,
//       recipient: userEmail,
//       type,
//     });

//     return info;
//   } catch (error) {
//     console.error("OTP email sending failed:", {
//       message: error.message,
//       code: error.code,
//       responseCode: error.responseCode,
//       command: error.command,
//     });

//     throw error;
//   }
// };

// const sendBookingEmail = async (
//   userEmail,
//   userName,
//   eventTitle
// ) => {
//   if (!EMAIL_USER || !EMAIL_PASS) {
//     throw new Error("Email credentials are missing");
//   }

//   try {
//     const info = await transporter.sendMail({
//       from: `"Evora" <${EMAIL_USER}>`,
//       to: userEmail,
//       subject: `Booking Confirmed: ${eventTitle}`,
//       text: `Hi ${userName}, your booking for ${eventTitle} is confirmed. Thank you for choosing Evora.`,
//       html: `
//         <div style="font-family:Arial,sans-serif;padding:24px;">
//           <h2>Hi ${String(userName || "there")}</h2>
//           <p>Your booking for
//             <strong>${String(eventTitle || "your event")}</strong>
//             is confirmed.
//           </p>
//           <p>Thank you for choosing Evora.</p>
//         </div>
//       `,
//     });

//     console.log("Booking email accepted by SMTP:", info.messageId);
//     return info;
//   } catch (error) {
//     console.error("Booking email sending failed:", {
//       message: error.message,
//       code: error.code,
//       responseCode: error.responseCode,
//     });
//     throw error;
//   }
// };

// module.exports = {
//   sendOTPEmail,
//   sendBookingEmail,
// };















require("dotenv").config();

const sendEmail = async ({ to, subject, text, html }) => {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    throw new Error(
      "RESEND_API_KEY or EMAIL_FROM is missing"
    );
  }

  const response = await fetch(
    "https://api.resend.com/emails",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        text,
        html,
      }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    console.error("Resend API failed:", {
      status: response.status,
      message: result.message,
      name: result.name,
    });

    throw new Error(
      result.message || "Email delivery request failed"
    );
  }

  console.log("Email accepted by Resend:", {
    id: result.id,
    recipient: to,
  });

  return result;
};

const sendOTPEmail = async (
  userEmail,
  otp,
  type = "account_verification"
) => {
  if (!userEmail || !otp) {
    throw new Error("Recipient email and OTP are required");
  }

  const code = String(otp);

  if (!/^\d{6}$/.test(code)) {
    throw new Error("OTP must be six digits");
  }

  const isBooking = type === "event_booking";

  const purpose = isBooking
    ? "verify your event booking"
    : "verify your Evora account";

  return sendEmail({
    to: userEmail,
    subject: isBooking
      ? "Evora Event Booking OTP"
      : "Evora Account Verification OTP",
    text: `Your OTP to ${purpose} is ${code}. It expires in 5 minutes.`,
    html: `
      <div style="font-family:Arial,sans-serif;padding:24px">
        <h2>Evora Verification</h2>
        <p>Use this code to ${purpose}.</p>
        <h1 style="letter-spacing:8px">${code}</h1>
        <p>This OTP expires in 5 minutes.</p>
        <p>If you did not request this code, ignore this email.</p>
      </div>
    `,
  });
};

const sendBookingEmail = async (
  userEmail,
  userName,
  eventTitle
) => {
  return sendEmail({
    to: userEmail,
    subject: `Booking Confirmed: ${eventTitle}`,
    text: `Hi ${userName}, your booking for ${eventTitle} is confirmed.`,
    html: `
      <div style="font-family:Arial,sans-serif;padding:24px">
        <h2>Booking Confirmed</h2>
        <p>Hi ${userName},</p>
        <p>Your booking for <strong>${eventTitle}</strong> is confirmed.</p>
      </div>
    `,
  });
};

module.exports = {
  sendOTPEmail,
  sendBookingEmail,
};
