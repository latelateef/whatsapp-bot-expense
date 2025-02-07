import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    user_phone : String,
    limit : Number,
    expenses : [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Expense"
        }
    ]
});

const userModel = mongoose.model("User", userSchema);

export default userModel;