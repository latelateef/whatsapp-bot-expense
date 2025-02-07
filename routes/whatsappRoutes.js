import { Router } from 'express';
import dotenv from 'dotenv';
import twilio from 'twilio';
import { classifyMessage, extractExpenseDetails } from '../utils/gemini-ai';
import userModel from '../models/user-model';
import expenseModel from '../models/expense-model';
import { processQuery } from '../utils/query-processor';

const router = Router();

dotenv.config();

// 🔥 Handle Incoming WhatsApp Messages
router.post("/whatsapp", async (req, res) => {
    const parsedMsg = req.body;
    console.log(parsedMsg);
    const from = parsedMsg.From;
    const accountSid = parsedMsg.AccountSid;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    let responseMessage = "";
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
        await new expenseModel({
          category,
          amount,
          description,
          user_phone: from,
        }).save();

        // Check Budget Alert
        const totalExpense = await expenseModel.aggregate([
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
        to: from,
      })
      .then((message) => console.log(message.sid))
      .catch((err) => console.log(err));
    res.status(200).end();
});

export default router;