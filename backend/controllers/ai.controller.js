import { getModel } from "../config/gemini.js";

const chatSessions = {}; // Store chat history per user session

export const chatHandler = async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ success: false, message: "Prompt is required" });
  }

  // Initialize model session if not existing
  if (!chatSessions[req.userId]) {
    chatSessions[req.userId] = getModel().startChat({ history: [] });
  }

  try {
    const chat = chatSessions[req.userId];
    const response = await chat.sendMessage(prompt);
    return res.json({ success: true, reply: response.response.text() });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
