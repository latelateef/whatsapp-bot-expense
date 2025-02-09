# 💰 WhatsApp Expense Tracker Bot 🚀

A smart, AI-powered WhatsApp bot built using **Node.js, Express, MongoDB, and Twilio** that helps you effortlessly track your expenses. Just send a message like **"Spent 500rs on food"**, and it will log your expense, categorize it, and even alert you when you exceed your budget! ⚡

## ✨ Features

✅ **Expense Logging:** Just message your expense (e.g., _"Spent 500rs on groceries"_), and it will be recorded automatically. 📊

🔎 **Smart NLP Understanding:** Powered by **Gemini AI**, it intelligently understands and processes your queries. 🤖

📅 **Date-wise Tracking:** Ask about expenses from _yesterday_, a specific _date_, or for a _category_. 🗂️

🚨 **Budget Alerts:** Set a **monthly limit**, and the bot will notify you when you exceed it. 💸

📜 **Expense Summary:** Get an overview of your total spending across different categories. 📉

## 🛠️ Tech Stack

- **Node.js** + **Express.js** - Backend API 🚀
- **MongoDB** - Database for storing expenses 📂
- **Twilio** - For WhatsApp message integration 📲
- **Gemini AI** - NLP for smart query processing 🧠

## ⚙️ How It Works

1️⃣ **Send a Message** to the bot on WhatsApp (e.g., "Spent 200rs on travel").

2️⃣ The bot **categorizes and saves** the expense in the database. 📊

3️⃣ If you exceed your budget, it **alerts you immediately**. 🚨

4️⃣ You can query past expenses like:

- "How much did I spend yesterday?"
- "Total spent on food last week?"
- "What was my expense on 5th Feb?"

## 🚀 Setup Instructions

### 1️⃣ Clone the Repository

```bash
 git clone https://github.com/yourusername/whatsapp-expense-bot.git
 cd whatsapp-expense-bot
```

### 2️⃣ Install Dependencies

```bash
 npm install
```

### 3️⃣ Start the Server

```bash
 npm run dev
```

## 💬 WhatsApp Integration

To connect your WhatsApp bot:

1. Get a **Twilio Sandbox for WhatsApp** account.
2. Link your **Twilio number** with the bot.
3. Start chatting and tracking expenses instantly! ⚡

## 📌 Example Usage

```bash
You: "Spent 800rs on shopping"
Bot: "✅ Expense Recorded: ₹800 (Shopping)"

You: "How much did I spend yesterday?"
Bot: "💰 You spent ₹1200 yesterday across all categories."

You: "Total spent on food last week?"
Bot: "-🍽️ You spent ₹2300 on Food last week.
      -🛒 You spent ₹800 on Shopping last week."

You: "Spent 2000rs on rent"
Bot: "⚠️ Budget Alert! You've spent ₹7000, exceeding your ₹5000 limit."
```

## 🌟 Contributing

Feel free to fork the repo and submit pull requests to improve the bot! Contributions are always welcome. 🤝

## 📜 License

This project is **open-source** under the MIT License. 📝

🚀 **Start tracking your expenses with ease!** 💰📲
