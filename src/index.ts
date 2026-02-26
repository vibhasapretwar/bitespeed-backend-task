import express from "express";
import cors from "cors";
import connectDB from "./config/db.config.js";

const app = express();

app.use(cors());
app.use(express.json());


app.get("/", (req, res) => {
  res.send("API is running.");
});

export default app;