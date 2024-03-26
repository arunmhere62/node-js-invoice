import express from "express";
import mongoose from "mongoose";
import userRouter from './routes/users.js';
import productRouter from "./routes/product.js";
import clientRouter from "./routes/customer.js";
import serviceRouter from "./routes/services.js";
import invoiceRouter from "./routes/invoice.js";
import cors from "cors";
const app = express();
const PORT = 4000;
// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors());
app.use("/user", userRouter)
app.use("/product", productRouter)
app.use("/customer", clientRouter);
app.use("/service", serviceRouter);
app.use("/invoice", invoiceRouter);


mongoose
  .connect("mongodb+srv://arun1234:invoice@cluster0.ykqmtot.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
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
