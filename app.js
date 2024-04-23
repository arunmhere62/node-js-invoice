import express from "express";
import mongoose from "mongoose";
import userRouter from './routes/users.js';
import productRouter from "./routes/product.js";
import clientRouter from "./routes/customer.js";
import serviceRouter from "./routes/services.js";
import invoiceRouter from "./routes/invoice.js";
import cors from "cors";
import dotenv from "dotenv";
import verifyJWT from "./middleware/verifyJWT.js";
import handleRefreshToken from "./controllers/refreshToken.js";

dotenv.config();

const app = express();
const PORT = 4000;

// Allow requests from all origins, you can configure it according to your requirements
app.use(cors({
  origin: true,
  credentials: true,
}));
// Middleware to parse JSON bodies
app.use(express.json());

// Define routes
app.use("/user", userRouter);
app.get("/refresh", handleRefreshToken);
app.use(verifyJWT); // Applying middleware globally
app.use("/product", productRouter);
app.use("/customer", clientRouter);
app.use("/service", serviceRouter);
app.use("/invoice", invoiceRouter);

// Connect to MongoDB
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

// MongoDB event listeners
mongoose.connection.on("connected", () => {
  console.log("Connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("Disconnected from MongoDB");
});
