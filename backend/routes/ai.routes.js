import express from "express";
import { chatHandler } from "../controllers/ai.controller.js";
import { authenticateUser } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authenticateUser);

// Chat endpoint
router.post("/", chatHandler);

export default router;
