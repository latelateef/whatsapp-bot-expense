import expenseModel from "../models/expense-model";

// 📊 Process User Queries
async function processQuery(query) {
    if (query.toLowerCase().includes("total expense")) {
      const totalExpense = await expenseModel.aggregate([
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);
      return `💰 Your total expenses so far are ₹${totalExpense[0]?.total || 0}.`;
    }
  
    if (query.toLowerCase().includes("spent on")) {
      const category = query.split("spent on ")[1]?.trim();
      console.log(category);
      if (!category) return "❌ Please specify a category.";
  
      const expenses = await expenseModel.find({ category });
      const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  
      let response = `🛒 *Total spent on ${category}:* ₹${total}\n`;
      expenses.forEach((e) => {
        response += `- ₹${e.amount}: ${
          e.description
        } (${e.date.toDateString()})\n`;
      });
  
      return response;
    }
  
    return "🤖 I couldn't understand your query. Try asking about total expenses or spending on a category.";
  }

export { processQuery };