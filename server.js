import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRouter from "./Routes/user.js";
import adminRouter from "./Routes/admin.js";

import cors from "cors";  
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
app.use(cors());

app.use(express.json());
app.use("/api/admin", adminRouter);


app.use("/api/user", userRouter);

app.get("/", (req, res) => {
  res.json({ message: "This is home route" });
});

mongoose
  .connect(process.env.MONGO_URI, { dbName: process.env.DB_NAME })
  .then(() => console.log("db connected successfully.."))
  .catch((err) => console.log("err in db connection", err));

app.listen(port, () => {
  console.log(`server is running on ${port}`);
}); 
