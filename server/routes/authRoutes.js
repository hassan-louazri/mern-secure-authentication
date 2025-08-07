import express from 'express';
import { isAuthenticated, login, logout, register, resetPassword, sendOTPVerification, sendPasswordResetOTP, verifyEmail } from '../controllers/authController.js';
import userAuth from '../middlewares/authMiddleware.js';

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.post("/send-verification-code", userAuth, sendOTPVerification);
authRouter.post("/verify-account", userAuth, verifyEmail);
authRouter.post("/send-password-reset-otp", sendPasswordResetOTP);
authRouter.post("/set-new-password", resetPassword);
authRouter.get("/is-authenticated", userAuth, isAuthenticated);


export default authRouter;