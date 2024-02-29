import mongoose from "mongoose";

const ClientSchema = mongoose.Schema({
    primaryContact: {
        type: String,
        required: false,
    },
    type: {
        type: String,
        required: false,
    },
    companyName: {
        type: String,
        required: false,
    },
    email: {
        type: String,
        required: false,
    },
    phoneNumber: {
        type: Number,
        required: false,
    }
});

const Client = mongoose.model("client", ClientSchema);
export { Client };