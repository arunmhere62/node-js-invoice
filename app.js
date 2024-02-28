import express from "express";
import mongoose from "mongoose";
import userRouter from './routes/users.js';
import productRouter from "./routes/product.js";
const app = express();
const PORT = 4000;
// Middleware to parse JSON bodies
app.use(express.json());

app.use("/user", userRouter)
app.use("/product", productRouter)


mongoose
  .connect("mongodb+srv://arun1234:arun1234@cluster0.ykqmtot.mongodb.net/?retryWrites=true&w=majority")
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error(`MongoDB connection error: ${error.message}`);
  });

mongoose.connection.on("connected", () => {
  console.log("Connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("Disconnected from MongoDB");
});
