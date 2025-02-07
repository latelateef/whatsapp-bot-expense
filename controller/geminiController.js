import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Classify Message Using Gemini AI
async function classifyMessage(message) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `Determine if the following message is about adding an expense or querying expenses. Reply with only "expense" or "query": "${message}"`;
  const response = await model.generateContent(prompt);
  return response.response.candidates[0].content.parts[0].text
    .toLowerCase()
    .includes("expense");
}

// Extract Expense Details Using Gemini AI
async function extractExpenseDetails(message) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `Extract details from this expense message: "${message}".
      Provide output in JSON format like:
      { "category": "Food", "amount": 500, "description": "Cappuccino at Starbucks" }`;
  const response = await model.generateContent(prompt);
  let ai_content = response.response.candidates[0].content.parts[0].text;
  if (ai_content.startsWith("```json")) {
    ai_content = ai_content.replace("```json", "").replace("```", "").trim();
  }
  ai_content = JSON.parse(ai_content);
  let { category, amount, description } = ai_content;
  description = description.toLowerCase();
  category = category.toLowerCase();

  return { category, amount, description };
}

export { classifyMessage, extractExpenseDetails };