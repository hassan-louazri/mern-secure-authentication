import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";

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
