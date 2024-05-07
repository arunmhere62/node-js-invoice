import mongoose from "mongoose";

const TdsTax = mongoose.Schema({
    taxName: {
        required: true,
        type: String
    },
    taxPercentage: {
        required: true,
        type: Number
    }
})

const TdsSchema = mongoose.model("TdsType", TdsTax);
export { TdsSchema } 
