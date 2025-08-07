import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import 'dotenv/config';
import connectDB from "./config/mongodb.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import logger from "./middlewares/loggerMiddleware.js";

const app = express();
const port = process.env.PORT || 3001;
// Database connection
connectDB();

// Configuration
app.use(express.json());
app.use(cookieParser());
app.use(logger);
app.use(cors({ origin: ['http://localhost:5173'], credentials: true }));


// Endpoints
app.get("/", (_, res) => res.send("Server running correctly.\n"));
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);

app.listen(port, () => console.log(`Listening on :${port}`));