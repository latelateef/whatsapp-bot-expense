import express from "express";
import dotenv from "dotenv";
import axios from "axios";
import twilio from "twilio";
import bodyParser from "body-parser";
import { connectDB } from "./utils/db-connection";
import whatsappRoutes from "./routes/whatsappRoutes";

connectDB();
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const { twiml } = twilio;
const { MessagingResponse } = twiml;

app.use("/whatsapp", whatsappRoutes);

// 🌍 Start Server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
