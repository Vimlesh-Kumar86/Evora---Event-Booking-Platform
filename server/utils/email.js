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













const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

// Configure Gmail SMTP
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
    },
    connectionTimeout: 15000,
    greetingTimeout: 10000,
    socketTimeout: 20000
});

// Common email sender
const sendEmail = async (mailOptions) => {
    if (!EMAIL_USER || !EMAIL_PASS) {
        throw new Error(
            'EMAIL_USER or EMAIL_PASS is missing from environment variables'
        );
    }

    try {
        const info = await transporter.sendMail({
            from: `"Evora" <${EMAIL_USER}>`,
            ...mailOptions
        });

        console.log('Email accepted by SMTP:', info.messageId);

        return info;
    } catch (error) {
        console.error('Email delivery error:', {
            message: error.message,
            code: error.code,
            responseCode: error.responseCode,
            command: error.command
        });

        // Important: pass the error to authController.js
        throw error;
    }
};

// Booking confirmation email
const sendBookingEmail = async (userEmail, userName, eventTitle) => {
    return sendEmail({
        to: userEmail,
        subject: `Booking Confirmed: ${eventTitle}`,
        text: `Hi ${userName}, your booking for ${eventTitle} is confirmed. Thank you for choosing Evora.`,
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>Hi ${escapeHtml(userName)}!</h2>
                <p>Your booking for the event
                    <strong>${escapeHtml(eventTitle)}</strong>
                    is successfully confirmed.
                </p>
                <p>Thank you for choosing Evora.</p>
            </div>
        `
    });
};

// OTP verification email
const sendOTPEmail = async (userEmail, otp, type) => {
    const isVerification = type === 'account_verification';

    const title = isVerification
        ? 'Verify your Evora Account'
        : 'Evora Booking Verification';

    const message = isVerification
        ? 'Use the following OTP to verify your Evora account.'
        : 'Use the following OTP to verify your event booking.';

    return sendEmail({
        to: userEmail,
        subject: title,
        text: `${message}\nYour OTP is: ${otp}\nThis code expires in 5 minutes.`,
        html: `
            <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
                <h2 style="color: #111;">${title}</h2>
                <p style="color: #555; font-size: 16px;">
                    ${message}
                </p>
                <div style="margin: 20px auto; padding: 15px;
                    font-size: 28px; font-weight: bold;
                    background: #f4f4f4; letter-spacing: 5px;">
                    ${escapeHtml(otp)}
                </div>
                <p style="color: #999; font-size: 12px;">
                    If you did not request this code, please ignore this email.
                </p>
            </div>
        `
    });
};

// Escape dynamic text before inserting into HTML
function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => {
        const entities = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        };

        return entities[char];
    });
}

module.exports = {
    sendBookingEmail,
    sendOTPEmail
};
