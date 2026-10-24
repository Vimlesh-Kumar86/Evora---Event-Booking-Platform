// const User = require('../models/User');
// const OTP = require('../models/OTP');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const { sendOTPEmail } = require('../utils/email');

// const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// const generateToken = (id, role) => {
//     return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
// };

// exports.register = async (req, res) => {
//     try {
//         const { name, email, password, role } = req.body;
//         let user = await User.findOne({ email });
//         if (user) return res.status(400).json({ message: 'User already exists' });

//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(password, salt);

//         user = await User.create({
//             name,
//             email,
//             password: hashedPassword,
//             role: 'user', // Hardcoded to prevent frontend passing role
//             isVerified: false
//         });

//         const otp = generateOTP();
//         await OTP.create({ email, otp, action: 'account_verification' });
//         await sendOTPEmail(email, otp, 'account_verification');

//         res.status(201).json({
//             message: 'OTP sent to email. Please verify.',
//             email: user.email
//         });
//     } catch (error) {
//         res.status(500).json({ message: 'Server Error', error: error.message });
//     }
// };

// exports.login = async (req, res) => {
//     try {
//         const { email, password } = req.body;
//         const user = await User.findOne({ email });
//         if (!user) return res.status(400).json({ message: 'Invalid credentials' });

//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

//         if (!user.isVerified && user.role !== 'admin') {
//             const otp = generateOTP();
//             await OTP.findOneAndDelete({ email: user.email, action: 'account_verification' });
//             await OTP.create({ email: user.email, otp, action: 'account_verification' });
//             await sendOTPEmail(user.email, otp, 'account_verification');
//             return res.status(403).json({ message: 'Account not verified', needsVerification: true, email: user.email });
//         }

//         res.json({
//             _id: user.id,
//             name: user.name,
//             email: user.email,
//             role: user.role,
//             token: generateToken(user.id, user.role)
//         });
//     } catch (error) {
//         res.status(500).json({ message: 'Server Error', error: error.message });
//     }
// };

// exports.verifyOTP = async (req, res) => {
//     try {
//         const { email, otp } = req.body;
//         const validOTP = await OTP.findOne({ email, otp, action: 'account_verification' });

//         if (!validOTP) {
//             return res.status(400).json({ message: 'Invalid or expired OTP' });
//         }

//         const user = await User.findOneAndUpdate({ email }, { isVerified: true }, { new: true });
//         await OTP.deleteOne({ _id: validOTP._id }); // Delete OTP after usage

//         res.json({
//             _id: user.id,
//             name: user.name,
//             email: user.email,
//             role: user.role,
//             token: generateToken(user.id, user.role)
//         });
//     } catch (error) {
//         res.status(500).json({ message: 'Server Error' });
//     }
// };






const User = require("../models/User");
const OTP = require("../models/OTP");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { randomInt } = require("crypto");
const { sendOTPEmail } = require("../utils/email");

const normalizeEmail = (email) =>
  typeof email === "string" ? email.trim().toLowerCase() : "";

const generateOTP = () => randomInt(100000, 1000000).toString();

const generateToken = (id, role) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(
    { id: String(id), role },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );
};

// Create and email a new verification OTP.
const createVerificationOTP = async (email) => {
  const otp = generateOTP();

  // Remove older verification OTPs for this email.
  await OTP.deleteMany({
    email,
    action: "account_verification",
  });

  const savedOTP = await OTP.create({
    email,
    otp,
    action: "account_verification",
  });

  try {
    await sendOTPEmail(email, otp);
    console.log("Verification email request completed for:", email);
  } catch (error) {
    await OTP.deleteOne({ _id: savedOTP._id }).catch((cleanupError) => {
      console.error("OTP cleanup failed:", cleanupError.message);
    });

    // Preserve the original provider error for the controller and logs.
    throw error;
  }
};

// REGISTER
exports.register = async (req, res) => {
  try {
    const body = req.body || {};
    const name = body.name;
    const password = body.password;
    const email = normalizeEmail(body.email);

    if (
      typeof name !== "string" ||
      !name.trim() ||
      !email ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        message: "Name, email and password are required.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters.",
      });
    }

    let user = await User.findOne({ email });

    // If the account exists but is not verified, resend the OTP.
    if (user) {
      if (!user.isVerified && user.role !== "admin") {
        try {
          await createVerificationOTP(email);

          return res.status(200).json({
            message: "A new verification OTP has been sent to your email.",
            email,
            needsVerification: true,
          });
        } catch (error) {
          console.error("Registration OTP resend failed:", {
            message: error.message,
            code: error.code,
            statusCode: error.statusCode || error.status,
            response: error.response,
          });

          return res.status(502).json({
            message:
              "Your account exists, but the verification email could not be sent. Please try again later.",
            needsVerification: true,
            email,
          });
        }
      }

      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user = await User.create({
      name: name.trim(),
      email,
      password: hashedPassword,
      role: "user",
      isVerified: false,
    });

    try {
      await createVerificationOTP(email);

      return res.status(201).json({
        message: "OTP sent to email. Please verify your account.",
        email,
        needsVerification: true,
      });
    } catch (error) {
      console.error("Registration OTP failed:", {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode || error.status,
        response: error.response,
      });

      // The account is saved; a subsequent registration attempt
      // will retry sending an OTP for this unverified account.
      return res.status(502).json({
        message:
          "Your account was created, but the verification email could not be sent. Please try again.",
        needsVerification: true,
        email,
      });
    }
  } catch (error) {
    console.error("Registration error:", {
      message: error.message,
      code: error.code,
    });

    if (error.code === 11000) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    return res.status(500).json({
      message: "Registration failed. Please try again.",
    });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const body = req.body || {};
    const email = normalizeEmail(body.email);
    const password = body.password;

    if (!email || typeof password !== "string") {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    if (!user.isVerified && user.role !== "admin") {
      try {
        await createVerificationOTP(user.email);
      } catch (error) {
        console.error("Login OTP resend failed:", {
          message: error.message,
          code: error.code,
          statusCode: error.statusCode || error.status,
          response: error.response,
        });

        return res.status(502).json({
          message:
            "Your account is not verified, but the verification email could not be sent. Please try again later.",
          needsVerification: true,
          email: user.email,
        });
      }

      return res.status(403).json({
        message: "Account not verified. A new OTP has been sent.",
        needsVerification: true,
        email: user.email,
      });
    }

    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      message: "Login failed. Please try again.",
    });
  }
};

// VERIFY OTP
exports.verifyOTP = async (req, res) => {
  try {
    const body = req.body || {};
    const email = normalizeEmail(body.email);
    const otp = String(body.otp || "").trim();

    if (!email || !/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        message: "A valid email and six-digit OTP are required.",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "Account not found.",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        message: "Account is already verified.",
      });
    }

    const validOTP = await OTP.findOne({
      email,
      otp,
      action: "account_verification",
    });

    if (!validOTP) {
      return res.status(400).json({
        message: "Invalid or expired OTP.",
      });
    }

    user.isVerified = true;
    await user.save();

    await OTP.deleteMany({
      email,
      action: "account_verification",
    });

    return res.status(200).json({
      message: "Account verified successfully.",
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    console.error("OTP verification error:", error.message);

    return res.status(500).json({
      message: "OTP verification failed. Please try again.",
    });
  }
};
