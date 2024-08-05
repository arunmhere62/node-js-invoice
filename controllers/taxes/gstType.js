import { CollectionNames } from '../../services/enums.js';
import { getDynamicModelNameGenerator } from '../../services/utils/ModelNameGenerator.js';

const createGstType = async (req, res) => {
    try {
        const GstTypeSchema = getDynamicModelNameGenerator(req, CollectionNames.GST_TYPE);
        const { gstName, gstPercentage } = req.body;
        const companyId = req.companyId || null;
        const createdBy = req.userName || null;
        // Ensure companyId is provided
        if (!companyId || !createdBy) {
            return res.status(400).json({ message: 'companyId or createdBy is required' });
        }

        const newGstType = new GstTypeSchema({
            gstName,
            gstPercentage,
            companyId,
            createdBy,
        });

        const savedGstType = await newGstType.save();
        res.status(201).json(savedGstType);
    } catch (error) {
        console.error('Error creating gstType:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getGstTypeList = async (req, res) => {
    try {
        const GstTypeSchema = getDynamicModelNameGenerator(req, CollectionNames.GST_TYPE);
        const gstTypeList = await GstTypeSchema.find();
        res.status(200).json(gstTypeList);
    } catch (error) {
        console.error("Error Fetching gstTypes List :", error);
        res.status(500).json({ message: "Internal Server Error " });
    }
}

const getGstTypeById = async (req, res) => {
    try {
        const GstTypeSchema = getDynamicModelNameGenerator(req, CollectionNames.GST_TYPE);
        const { id } = req.params;
        const gstType = await GstTypeSchema.findById(id);
        res.status(200).json(gstType);
    } catch (error) {
        console.error("Error Fetching gstType by ID :", error);
        res.status(500).json({ message: " Internal server error" })
    }
}

const updateGstTypeById = async (req, res) => {
    try {
        const GstTypeSchema = getDynamicModelNameGenerator(req, CollectionNames.GST_TYPE);
        const { id } = req.params;
        const updatedBy = req.userName || null;
        const { gstName, gstPercentage } = req.body;
        const gstTypeModal = {
            gstName,
            gstPercentage,
            updatedBy
        }
        const updateTds = await GstTypeSchema.findByIdAndUpdate(id, gstTypeModal, { new: true });
        if (!updateTds) {
            return res.status(404).json({ message: "gstType not found" })
        }
        res.status(200).json(updateTds)
    } catch (error) {
        console.error("Error updating gstType by id :", error);
        res.status(500).json({ message: "Internal server error" })
    }
}

const deleteGstTypeById = async (req, res) => {
    try {
        const GstTypeSchema = getDynamicModelNameGenerator(req, CollectionNames.GST_TYPE);
        const { id } = req.params;
        const deletedGstType = await GstTypeSchema.findByIdAndDelete(id);
        if (!deletedGstType) {
            return res.status(404).json({ message: "Gst type not found" })
        }
        res.status(200).json(deletedGstType)
    } catch (error) {
        console.error("Error deleting Gst type by id", error)
        res.status(500).json({ message: "Internal server error" })
    }
}

export { createGstType, getGstTypeList, getGstTypeById, updateGstTypeById, deleteGstTypeById }