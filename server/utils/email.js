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














// // require('dotenv').config();

// // const sendEmail = async ({ to, subject, html, text }) => {
// //   const apiKey = process.env.RESEND_API_KEY;
// //   const from = process.env.EMAIL_FROM;

// //   if (!apiKey || !from) {
// //     throw new Error(
// //       'Missing RESEND_API_KEY or EMAIL_FROM environment variable.'
// //     );
// //   }

// //   const response = await fetch('https://api.resend.com/emails', {
// //     method: 'POST',
// //     headers: {
// //       Authorization: `Bearer ${apiKey}`,
// //       'Content-Type': 'application/json',
// //     },
// //     body: JSON.stringify({
// //       from,
// //       to: [to],
// //       subject,
// //       html,
// //       text,
// //     }),
// //     signal: AbortSignal.timeout(15000),
// //   });

// //   const result = await response.json();

// //   if (!response.ok) {
// //     throw new Error(
// //       result.message ||
// //       result.error ||
// //       `Email API failed with status ${response.status}`
// //     );
// //   }

// //   console.log('Email API accepted message:', result.id);
// //   return result;
// // };

// // const sendBookingEmail = async (userEmail, userName, eventTitle) => {
// //   return sendEmail({
// //     to: userEmail,
// //     subject: `Booking Confirmed: ${eventTitle}`,
// //     text: `Hi ${userName}, your booking for ${eventTitle} is confirmed. Thank you for choosing Evora.`,
// //     html: `
// //       <div style="font-family: Arial, sans-serif;">
// //         <h2>Hi ${userName}!</h2>
// //         <p>Your booking for <strong>${eventTitle}</strong> is confirmed.</p>
// //         <p>Thank you for choosing Evora.</p>
// //       </div>
// //     `,
// //   });
// // };

// // const sendOTPEmail = async (userEmail, otp, type) => {
// //   const isAccountVerification = type === 'account_verification';

// //   const subject = isAccountVerification
// //     ? 'Verify your Evora Account'
// //     : 'Evora Booking Verification';

// //   const message = isAccountVerification
// //     ? 'Use this OTP to verify your Evora account.'
// //     : 'Use this OTP to verify your event booking.';

// //   return sendEmail({
// //     to: userEmail,
// //     subject,
// //     text: `${message} Your OTP is ${otp}. Do not share it with anyone.`,
// //     html: `
// //       <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
// //         <h2>${subject}</h2>
// //         <p>${message}</p>
// //         <div style="font-size: 28px; font-weight: bold; letter-spacing: 5px; padding: 15px;">
// //           ${otp}
// //         </div>
// //         <p>Do not share this OTP with anyone.</p>
// //       </div>
// //     `,
// //   });
// // };

// // module.exports = {
// //   sendBookingEmail,
// //   sendOTPEmail,
// // };











const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    connectionTimeout: 15000,
    greetingTimeout: 10000,
    socketTimeout: 20000
});

const sendOTPEmail = async (userEmail, otp, type) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        throw new Error('Email credentials are missing');
    }

    const title =
        type === 'account_verification'
            ? 'Verify your Evora Account'
            : 'Evora Booking Verification';

    const msg =
        type === 'account_verification'
            ? 'Use this OTP to verify your Evora account.'
            : 'Use this OTP to verify your event booking.';

    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: title,
            text: `${msg}\nYour OTP is: ${otp}\nThis code expires in 5 minutes.`,
            html: `
                <div style="font-family: Arial, sans-serif; text-align: center;">
                    <h2>${title}</h2>
                    <p>${msg}</p>
                    <h1>${otp}</h1>
                    <p>This code expires in 5 minutes.</p>
                </div>
            `
        });

        console.log('OTP email accepted by SMTP:', info.messageId);
        return info;
    } catch (error) {
        console.error('OTP email failed:', error.message);
        throw error;
    }
};

module.exports = { sendOTPEmail };
