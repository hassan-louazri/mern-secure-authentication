import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import transporter from "../config/nodemailer.js";
import { EMAIL_VERIFY_TEMPLATE, PASSWORD_RESET_TEMPLATE } from "../config/emailTemplates.js";

const SALT = 12;
export const register = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.json({ success: false, message: "Missing credentials." });
    }

    const userAlreadyExists = await User.findOne({ email });

    if (userAlreadyExists) {
        return res.json({ success: false, message: "User already exists." });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, SALT);

        const user = new User({ name, email, password: hashedPassword });
        await user.save();

        // Create authentication token and store it in cookie
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        res.cookie("authToken", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "prod",
            sameSite: process.env.NODE_ENV === "prod" ? "none" : "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        // Sending welcome email
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: "Account created",
            text: `Welcome ${name}, your account has been created with email ${email}. Have fun.`,
        };

        await transporter.sendMail(mailOptions);

        // Send HTTP response
        return res.json({ success: true });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password)
        return res.json({
            success: false,
            message: "Email and password are required.",
        });

    try {
        const user = await User.findOne({ email });
        if (!user)
            return res.json({
                success: false,
                message: "Invalid email, user not found.",
            });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.json({ success: false, message: "Incorrect password." });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        res.cookie("authToken", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "prod",
            sameSite: process.env.NODE_ENV === "prod" ? "none" : "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.json({ success: true });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

export const logout = async (_, res) => {
    try {
        res.clearCookie("authToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "prod",
            sameSite: process.env.NODE_ENV === "prod" ? "none" : "strict",
        });

        return res.json({ success: true, message: "Logged out." });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

export const sendOTPVerification = async (req, res) => {
    try {
        const { userId } = req.user;
        const user = await User.findById(userId);
        if (user.isAccountVerified) {
            return res.json({
                success: false,
                message: "Account already verified.",
            });
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));

        user.emailVerificationOTP = otp;
        user.emailVerificationOTPExpiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes

        await user.save();

        // Send verification email
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "Please verify your account",
            // text: `Please enter the code ${otp} where you were asked to. Code expires in 15 minutes after receiving this email.`,
            html: EMAIL_VERIFY_TEMPLATE.replace('{{otp}}', otp).replace('{{email}}', user.email)
        };

        await transporter.sendMail(mailOptions);

        res.json({
            success: true,
            message: "Account verification email was sent.",
        });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

export const verifyEmail = async (req, res) => {
    const userId = req.user.userId;
    const { otp } = req.body;

    if (!userId || !otp) {
        return res.json({
            success: false,
            message:
                "Cannot process request because of missing user id or otp.",
        });
    }

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        if (
            user.emailVerificationOTP === "" ||
            user.emailVerificationOTP !== otp
        ) {
            return res.json({
                success: false,
                message:
                    "Invalid code. Please ask for a new verification code to be sent to your email.",
            });
        }

        if (user.emailVerificationOTPExpiresAt < Date.now()) {
            return res.json({
                success: false,
                message: "Verification code has expired.",
            });
        }

        user.isAccountVerified = true;
        user.emailVerificationOTP = "";
        user.emailVerificationOTPExpiresAt = 0;

        await user.save();

        return res.json({
            success: true,
            message: "Email verified successfully.",
        });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

export const isAuthenticated = (_, res) => {
    try {
        return res.json({ success: true, message: "User is authenticated." });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const sendPasswordResetOTP = async (req, res) => {
    const { email } = req.body;

    if (!email)
        return res.json({ success: false, message: "Email is required." });

    try {
        const user = await User.findOne({ email });

        if (!user)
            return res.json({
                success: false,
                message: `User with email ${email} not found`,
            });

        const otp = String(Math.floor(100000 + Math.random() * 900000));

        user.passwordResetOTP = otp;
        user.passwordResetOTPExpiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes

        await user.save();

        // Send verification email
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "Verify your account before password reset",
            // text: `You have asked to reset your password. Please enter the code ${otp} where you were asked to. Code expires in 15 minutes after receiving this email.`,
            html: PASSWORD_RESET_TEMPLATE.replace('{{otp}}', otp).replace('{{email}}', user.email)
        };

        await transporter.sendMail(mailOptions);

        return res.json({
            success: true,
            message: "A one-time passkey has been send to your email account.",
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword)
        return res.json({
            success: false,
            message: "All fields (email, otp and newPassword) are required.",
        });

    try {
        const user = await User.findOne({ email });
        if (!user)
            return res.json({
                success: false,
                message: `User with email ${email} not found.`,
            });

        if (user.passwordResetOTP === "" || user.passwordResetOTP !== otp)
            return res.json({
                success: false,
                message: "The one-time passkey you entered is incompatible.",
            });

        if (user.passwordResetOTPExpiresAt < Date.now())
            return res.json({
                success: false,
                message:
                    "The one-time passkey has expired. Please request a new one.",
            });

        const hashedPassword = await bcrypt.hash(newPassword, SALT);
        user.password = hashedPassword;
        user.passwordResetOTP = "";
        user.passwordResetOTPExpiresAt = 0;

        await user.save();

        res.json({
            success: true,
            message: "New password has been set successfully.",
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
