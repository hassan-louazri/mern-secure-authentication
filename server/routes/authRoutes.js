import express from 'express';
import { login, logout, register, sendOTPVerification, verifyEmail } from '../controllers/authController.js';
import userAuth from '../middlewares/authMiddleware.js';

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.post("/send-verification-code", userAuth, sendOTPVerification);
authRouter.post("/verify-account", userAuth, verifyEmail);

export default authRouter;