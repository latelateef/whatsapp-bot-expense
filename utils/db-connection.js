import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    const connectionString = process.env.MONGO_URI;

    await mongoose.connect(connectionString, {
      useNewUrlParser: true, // To avoid deprecation warnings
      useUnifiedTopology: true, // To ensure the best way of connecting
    });

    console.log("MongoDB connected successfully!");
  } catch (error) {
    console.error("MongoDB connection failed!", error);
    process.exit(1);
  }
};

export default connectDB;
