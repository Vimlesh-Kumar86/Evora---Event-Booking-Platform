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
const { sendOTPEmail } = require("../utils/email");

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const generateToken = (id, role) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing in environment variables");
  }

  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );
};

// REGISTER
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    let user = await User.findOne({ email: normalizedEmail });

    // Verified accounts cannot register again.
    if (user && user.isVerified) {
      return res.status(409).json({
        message: "User already exists. Please login.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (!user) {
      user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: "user",
        isVerified: false,
      });
    } else {
      // Allow an unverified account to retry registration.
      user.name = name.trim();
      user.password = hashedPassword;
      await user.save();
    }

    const otp = generateOTP();

    // Remove the previous OTP before creating a new one.
    await OTP.deleteMany({
      email: normalizedEmail,
      action: "account_verification",
    });

    await OTP.create({
      email: normalizedEmail,
      otp,
      action: "account_verification",
    });

    try {
      await sendOTPEmail(
        normalizedEmail,
        otp,
        "account_verification"
      );
    } catch (emailError) {
      console.error("Registration OTP email failed:", {
        message: emailError.message,
        code: emailError.code,
        responseCode: emailError.responseCode,
      });

      // Remove the OTP that could not be delivered.
      await OTP.deleteMany({
        email: normalizedEmail,
        action: "account_verification",
      }).catch((cleanupError) => {
        console.error("OTP cleanup failed:", cleanupError.message);
      });

      // Keep the account unverified so registration can be retried.
      return res.status(503).json({
        message:
          "Unable to send OTP email. Please try again later.",
      });
    }

    return res.status(201).json({
      message: "OTP sent to email. Please verify.",
      email: normalizedEmail,
    });
  } catch (error) {
    console.error("Registration failed:", {
      message: error.message,
      code: error.code,
    });

    if (error.code === 11000) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    return res.status(500).json({
      message: "Registration failed due to a server error.",
    });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    if (!user.isVerified && user.role !== "admin") {
      const otp = generateOTP();

      await OTP.deleteMany({
        email: normalizedEmail,
        action: "account_verification",
      });

      await OTP.create({
        email: normalizedEmail,
        otp,
        action: "account_verification",
      });

      try {
        await sendOTPEmail(
          normalizedEmail,
          otp,
          "account_verification"
        );
      } catch (emailError) {
        console.error("Login verification email failed:", {
          message: emailError.message,
          code: emailError.code,
        });

        await OTP.deleteMany({
          email: normalizedEmail,
          action: "account_verification",
        }).catch(() => {});

        return res.status(503).json({
          message:
            "Unable to send verification OTP. Please try again later.",
        });
      }

      return res.status(403).json({
        message: "Account not verified. OTP sent to your email.",
        needsVerification: true,
        email: normalizedEmail,
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
    console.error("Login failed:", error.message);

    return res.status(500).json({
      message: "Login failed due to a server error.",
    });
  }
};

// VERIFY REGISTRATION OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const validOTP = await OTP.findOne({
      email: normalizedEmail,
      otp: String(otp).trim(),
      action: "account_verification",
    });

    if (!validOTP) {
      return res.status(400).json({
        message: "Invalid or expired OTP",
      });
    }

    const user = await User.findOneAndUpdate(
      {
        email: normalizedEmail,
      },
      {
        $set: { isVerified: true },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!user) {
      await OTP.deleteOne({ _id: validOTP._id });

      return res.status(404).json({
        message: "User not found. Please register again.",
      });
    }

    await OTP.deleteOne({ _id: validOTP._id });

    return res.status(200).json({
      message: "Email verified successfully.",
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    console.error("OTP verification failed:", error.message);

    return res.status(500).json({
      message: "OTP verification failed due to a server error.",
    });
  }
};
