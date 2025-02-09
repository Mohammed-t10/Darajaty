import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/db.js';

import authRoutes from './routes/auth.routes.js';
import courseRoutes from './routes/course.routes.js';
import userRoutes from './routes/user.routes.js';
import activityRoutes from './routes/activity.routes.js';
import assignmentRoutes from './routes/assignment.routes.js';
import aiRoutes from './routes/ai.routes.js';

import { setCSRFToken, verifyCSRFToken } from './middleware/csrf.middleware.js';
import { apiRateLimiter, authRateLimiter } from './middleware/limiter.middleware.js';

dotenv.config({ path: '../.env' });

const app = express();
const __dirname = path.resolve();

// Security
app.use(helmet());

// Cors
const CORS_URL = process.env.NODE_ENV === "development" ? "http://localhost:5173" : "https://darajaty.onrender.com";
app.use(cors({ origin: CORS_URL, credentials: true }));


// Middleware
app.use(express.json()); // For parsing req.body
app.use(cookieParser()); // For parsing cookies
app.use(setCSRFToken); // Apply CSRF generation globally
app.use(verifyCSRFToken); // Verify CSRF validity for Non-GET requests
app.use('/api/', apiRateLimiter); // Apply rate limiter only to API routes

// Apply more restriction to this endpoint (Email service integrated)
app.use('/api/auth/send-new-password', authRateLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', activityRoutes);
app.use('/api/courses', assignmentRoutes);
app.use('/api/chat', aiRoutes);

const PORT = process.env.PORT || 3000;

// Serve the frontend
if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "/frontend/dist")));

    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
    });
}

// Catch-all route for 404
app.use((req, res, next) => {
    res.status(404).json({ success: false, message: 'The requested resource could not be found.' });
});

// Global error handler (catches all errors)
app.use((err, req, res, next) => {
    console.log(err);
    res.status(500).json({
        success: false,
        message: "Something went wrong.",
    });
});

app.listen(PORT, () => {
    connectDB();
    console.log("Server is running on port: ", PORT);
});
