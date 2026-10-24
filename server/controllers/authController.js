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










const User = require('../models/User');
const OTP = require('../models/OTP');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendOTPEmail } = require('../utils/email');

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const generateToken = (id, role) => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not configured');
    }

    return jwt.sign(
        { id, role },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    );
};

// REGISTER USER
exports.register = async (req, res) => {
    let createdUser;
    let createdOTP;

    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: 'Name, email and password are required'
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            return res.status(400).json({
                message: 'Please enter a valid email address'
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: 'Password must be at least 8 characters long'
            });
        }

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            if (!existingUser.isVerified &&
                existingUser.role !== 'admin') {
                return res.status(409).json({
                    message:
                        'Account already exists but is not verified. Please log in to request a new OTP.',
                    needsVerification: true,
                    email: normalizedEmail
                });
            }

            return res.status(409).json({
                message: 'User already exists'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Never accept a role supplied by the frontend.
        createdUser = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role: 'user',
            isVerified: false
        });

        const otp = generateOTP();

        createdOTP = await OTP.create({
            email: normalizedEmail,
            otp,
            action: 'account_verification'
        });

        // This function must throw when SMTP delivery fails.
        await sendOTPEmail(
            normalizedEmail,
            otp,
            'account_verification'
        );

        return res.status(201).json({
            message: 'OTP sent to email. Please verify your account.',
            email: normalizedEmail,
            needsVerification: true
        });

    } catch (error) {
        console.error('Registration error:', error.message);

        // Remove only the OTP created by this request.
        // Keep the unverified user so that OTP can be resent via login.
        if (createdOTP) {
            try {
                await OTP.deleteOne({ _id: createdOTP._id });
            } catch (cleanupError) {
                console.error(
                    'OTP cleanup failed:',
                    cleanupError.message
                );
            }
        }

        if (error.code === 11000) {
            return res.status(409).json({
                message: 'An account with this email already exists'
            });
        }

        if (createdUser) {
            return res.status(502).json({
                message:
                    'Account was created, but OTP email delivery failed. Please log in to request another OTP.',
                needsVerification: true,
                email: createdUser.email
            });
        }

        return res.status(500).json({
            message: 'Registration failed. Please try again.'
        });
    }
};


// LOGIN USER
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: 'Email and password are required'
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await User.findOne({
            email: normalizedEmail
        });

        if (!user) {
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }

        if (!user.isVerified && user.role !== 'admin') {
            // Remove the previous verification OTP.
            await OTP.deleteMany({
                email: user.email,
                action: 'account_verification'
            });

            const otp = generateOTP();

            await OTP.create({
                email: user.email,
                otp,
                action: 'account_verification'
            });

            try {
                await sendOTPEmail(
                    user.email,
                    otp,
                    'account_verification'
                );
            } catch (emailError) {
                console.error(
                    'Login OTP delivery failed:',
                    emailError.message
                );

                await OTP.deleteMany({
                    email: user.email,
                    action: 'account_verification'
                });

                return res.status(502).json({
                    message:
                        'Your account is not verified and OTP delivery failed. Please try again later.',
                    needsVerification: true,
                    email: user.email
                });
            }

            return res.status(403).json({
                message:
                    'Your account is not verified. A new OTP has been sent to your email.',
                needsVerification: true,
                email: user.email
            });
        }

        return res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id, user.role)
        });

    } catch (error) {
        console.error('Login error:', error.message);

        return res.status(500).json({
            message: 'Login failed. Please try again.'
        });
    }
};


// VERIFY OTP
exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                message: 'Email and OTP are required'
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await User.findOne({
            email: normalizedEmail
        });

        if (!user) {
            return res.status(404).json({
                message: 'Account not found'
            });
        }

        if (user.isVerified) {
            return res.status(400).json({
                message: 'Account is already verified'
            });
        }

        const validOTP = await OTP.findOne({
            email: normalizedEmail,
            otp: String(otp).trim(),
            action: 'account_verification'
        });

        if (!validOTP) {
            return res.status(400).json({
                message: 'Invalid or expired OTP'
            });
        }

        user.isVerified = true;
        await user.save();

        await OTP.deleteMany({
            email: normalizedEmail,
            action: 'account_verification'
        });

        return res.status(200).json({
            message: 'Account verified successfully',
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id, user.role)
        });

    } catch (error) {
        console.error('OTP verification error:', error.message);

        return res.status(500).json({
            message: 'OTP verification failed. Please try again.'
        });
    }
};
