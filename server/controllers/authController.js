import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import transporter from "../config/nodemailer.js";

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
            text: `Welcome ${name}, your account has been created with email ${email}. Have fun.`
        }

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

        const isMatch = bcrypt.compare(password, user.password);
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
        res.clearCookie('authToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === "prod",
            sameSite: process.env.NODE_ENV === "prod" ? "none" : "strict",
        });

        return res.json({ success: true, message: "Logged out." });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

export const sendOTPVerification = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await User.findById(userId);
        if (user.isAccountVerified) {
            return res.json({ success: false, message: "Account already verified." });
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));

        user.emailVerificationOTP = otp;
        user.emailVerificationOTPExpiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes

        await user.save();


        // Send verification email
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Please verify your account',
            text: `Please enter the code ${otp} where you were asked to. Code expires in 15 minutes after receiving this email.`
        }

        await transporter.sendMail(mailOptions);

        res.json({ success: true, message: "Account verification email was sent." });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

export const verifyEmail = async (req, res) => {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
        return res.json({ success: false, message: "Cannot process request because of missing user id or otp." });
    }

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        if (user.emailVerificationOTP === '' || user.emailVerificationOTP !== otp) {
            return res.json({ success: false, message: "Invalid code. Please ask for a new verification code to be sent to your email." });
        }

        if (user.emailVerificationOTPExpiresAt < Date.now()) {
            return res.json({ success: false, message: "Verification code has expired." });
        }

        user.isAccountVerified = true;
        user.emailVerificationOTP = '';
        user.emailVerificationOTPExpiresAt = 0;

        await user.save();

        return res.json({ success: true, message: "Email verified successfully." });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}