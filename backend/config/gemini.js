import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const getModel = (model = "gemini-1.5-flash", systemInstruction = "You are ‘Darajaty AI’, in Arabic ‘درجاتي AI’") => {
  return genAI.getGenerativeModel({
    model,
    systemInstruction,
  });
};
