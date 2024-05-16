import mongoose from "mongoose";
import { PaymentTermsSchema } from "../models/paymentTerms.js";
import { paymentTermsValidation } from "../validations/validations.js";
import * as Yup from 'yup';

const createPaymentTerms = async (req, res) => {
    try {
        const { termName, totalDays } = req.body;
        // Validate the request data against the yup schema
        await paymentTermsValidation.validate({ termName, totalDays }, { abortEarly: false });
        const newData = new PaymentTermsSchema({ termName, totalDays });
        const savedData = await newData.save();
        res.status(201).json(savedData);
    } catch (error) {
        if (error instanceof Yup.ValidationError) {
            const validationErrors = error.inner.map(err => ({
                field: err.path,
                message: err.message
            }));
            return res.status(400).json({ errors: validationErrors });
        }
        console.error("Error creating new terms:", error)
        res.status(500).json({ message: "Internal server error" });
    }
}

const getAllPaymentTerms = async (req, res) => {
    try {
        const paymentTerms = await PaymentTermsSchema.aggregate([
            {
                $project: {
                    id: "$_id",
                    _id: 0,
                    termName: 1,
                    totalDays: 1
                }
            }
        ]);
        res.status(200).json(paymentTerms);
    } catch (error) {
        console.error("Error fetching payment terms:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getPaymentTermById = async (req, res) => {
    try {
        const { id } = req.params;
        const paymentTerm = await PaymentTermsSchema.findById(id);
        if (!paymentTerm) {
            return res.status(404).json({ message: "Payment term not found" });
        }

        // Destructuring and renaming _id to id
        const { _id, ...paymentTermWithoutId } = paymentTerm.toObject();
        const updatedPaymentTerm = { id: _id, ...paymentTermWithoutId };

        res.status(200).json(updatedPaymentTerm);
    } catch (error) {
        console.error("Error fetching payment term by ID:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const updatePaymentTermById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid id format" });
        }

        const { termName, totalDays } = req.body;
        const updatedPaymentTerm = await PaymentTermsSchema.findByIdAndUpdate(
            id,
            { termName, totalDays },
            { new: true }
        );
        if (!updatedPaymentTerm) {
            return res.status(404).json({ message: "Payment term not found" });
        }
        res.status(200).json(updatedPaymentTerm);
    } catch (error) {
        console.error("Error updating payment term by ID:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const deletePaymentTermById = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedPaymentTerm = await PaymentTermsSchema.findByIdAndDelete(id);
        if (!deletedPaymentTerm) {
            return res.status(404).json({ message: "Payment term not found" });
        }
        res.status(200).json(deletedPaymentTerm);
    } catch (error) {
        console.error("Error deleting payment term by ID:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export { createPaymentTerms, deletePaymentTermById, getAllPaymentTerms, getPaymentTermById, updatePaymentTermById };