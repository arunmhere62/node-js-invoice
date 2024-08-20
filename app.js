import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import cors from "cors";
import dotenv from "dotenv";
import verifyJWT from "./middleware/verifyJWT.js";
import handleRefreshToken from "./controllers/refreshToken.js";
import { userLogin } from "./controllers/user.js";
import dashboardRouter from './routes/dashboard.js';
import companyRouter from './routes/company.js';
import userRouter from './routes/users.js';
import clientRouter from "./routes/customer.js";
import serviceRouter from "./routes/services.js";
import invoiceRouter from "./routes/invoice.js";
import tdsTaxRouter from "./routes/taxes/tdsTax.js";
import gstType from "./routes/taxes/gstType.js";
import paymentTerms from "./routes/paymentTerms.js";
import { sendMail } from "./controllers/invoice/invoiceMail.js";
dotenv.config();

const app = express();
const PORT = 4000;

// Middleware for form-data
const upload = multer({ storage: multer.memoryStorage() });
// Middleware to parse JSON bodies
app.use(express.json());

// Allow requests from all origins, you can configure it according to your requirements
app.use(cors({
  origin: true,
  credentials: true,
}));

// Routes that don't require JWT verification
app.get("/refresh", handleRefreshToken);
app.post("/login", userLogin);

// Protecting specific routes with JWT middleware
app.use(verifyJWT);

// Protected Routes

// Middleware for form-data
app.use('/sendMail', upload.fields([{ name: 'pdfFile', maxCount: 1 }]), sendMail);
app.use("/user", userRouter);
app.use("/dashboard", dashboardRouter);
app.use("/company", companyRouter);
app.use("/customer", clientRouter);
app.use("/service", serviceRouter);
app.use("/invoice", invoiceRouter);
app.use("/tdsTax", tdsTaxRouter);
app.use("/gstType", gstType);
app.use("/paymentTerms", paymentTerms);

// Connect to MongoDB
mongoose.connect("mongodb+srv://arun1234:invoice@cluster0.ykqmtot.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
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
