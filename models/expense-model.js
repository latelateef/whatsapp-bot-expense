import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema({
    category: String,
    amount: Number,
    description: String,
    date: { type: Date, default: Date.now },
    user : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
});

const expenseModel = mongoose.model("Expense", expenseSchema);

export default expenseModel;