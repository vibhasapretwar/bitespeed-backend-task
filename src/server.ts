import app from "./index.js";
import dotenv from "dotenv";
import  connectDB from "./config/db.config.js";

dotenv.config();

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  connectDB();
});