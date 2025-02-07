import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";
import twilio from "twilio";
import bodyParser from "body-parser";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const { twiml } = twilio;
const { MessagingResponse } = twiml;
// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const Expense = mongoose.model("Expense", {
  category: String,
  amount: Number,
  description: String,
  user_phone : String,
  date: { type: Date, default: Date.now },
});

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 🔥 Handle Incoming WhatsApp Messages
app.post("/whatsapp", async (req, res) => {
    const parsedMsg =req.body;
    console.log(parsedMsg);
    const from = parsedMsg.From;
    const accountSid = parsedMsg.AccountSid;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    let responseMessage ="";
  const incomingMsg = parsedMsg.Body.trim();
  if (!incomingMsg) {
    responseMessage = "❌ Please provide a message.";
    return res.send(responseMessage);
  }
  const sender = req.body?.parameters?.From;
  // Check if it's an expense or a query
  const isExpense = await classifyMessage(incomingMsg);

  if (isExpense) {
    // Extract expense details
    const { category, amount, description } = await extractExpenseDetails(
      incomingMsg
    );

    if (amount) {

      await new Expense({ category, amount, description,user_phone:from }).save();

      // Check Budget Alert
      const totalExpense = await Expense.aggregate([
        { $match: { user_phone: from } }, // Filter by user_phone (from)
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);     
      const totalSpent = totalExpense[0]?.total || 0;
      const budgetLimit = process.env.BUDGET_LIMIT;

      let budgetMessage = `✅ Expense Recorded: ₹${amount} (${category})`;
      if (totalSpent > budgetLimit) {
        budgetMessage += `\n⚠️ *Budget Alert!* You've spent ₹${totalSpent}, exceeding your ₹${budgetLimit} limit.`;
      }
      console.log(budgetMessage);
      responseMessage = budgetMessage;
    } else {
        responseMessage = "❌ Please provide a valid expense message.";
    }
  } else {
    // Handle Queries
    const response = await processQuery(incomingMsg);
    responseMessage = response;
  }
const client = new twilio(accountSid, authToken);
client.messages
    .create({
        body: responseMessage,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: from
    })
    .then(message => console.log(message.sid)).catch(err => console.log(err));
    res.status(200).end();
});

// 🧠 Classify Message Using Gemini AI
async function classifyMessage(message) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `Determine if the following message is about adding an expense or querying expenses. Reply with only "expense" or "query": "${message}"`;
  const response = await model.generateContent(prompt);
  return response.response.candidates[0].content.parts[0].text.toLowerCase().includes("expense");
}

// 💰 Extract Expense Details Using Gemini AI
async function extractExpenseDetails(message) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `Extract details from this expense message: "${message}".
    Provide output in JSON format like:
    { "category": "Food", "amount": 500, "description": "Cappuccino at Starbucks" }`;
  const  response = await model.generateContent(prompt);
  let ai_content =response.response.candidates[0].content.parts[0].text;
  if (ai_content.startsWith("```json")) {
    ai_content = ai_content.replace("```json", "").replace("```", "").trim();
}
  ai_content = JSON.parse(ai_content);
  let {category, amount, description} = ai_content;
  description  = description.toLowerCase();
  category = category.toLowerCase();

  return {category, amount, description};
}

// 📊 Process User Queries
async function processQuery(query) {
  if (query.toLowerCase().includes("total expense")) {
    const totalExpense = await Expense.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    return `💰 Your total expenses so far are ₹${totalExpense[0]?.total || 0}.`;
  }

  if (query.toLowerCase().includes("spent on")) {
    const category = query.split("spent on ")[1]?.trim();
    console.log(category);
    if (!category) return "❌ Please specify a category.";

    const expenses = await Expense.find({ category });
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);

    let response = `🛒 *Total spent on ${category}:* ₹${total}\n`;
    expenses.forEach((e) => {
      response += `- ₹${e.amount}: ${e.description} (${e.date.toDateString()})\n`;
    });

    return response;
  }

  return "🤖 I couldn't understand your query. Try asking about total expenses or spending on a category.";
}

// 🌍 Start Server
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
