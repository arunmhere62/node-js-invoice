import { GstTypeSchema } from "../../models/taxes/gstType.js";

const createGstType = async (req, res) => {
    try {
        const { gstName, gstPercentage } = req.body;
        const newData = new GstTypeSchema({ gstName, gstPercentage })
        const savedData = await newData.save();
        res.status(201).json(savedData);
    } catch (error) {
        console.error('Error creating gstType:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const getGstTypeList = async (req, res) => {
    try {
        const gstTypesList = await GstTypeSchema.aggregate([
            {
                $project: {
                    _id: 0, // Exclude the _id field
                    id: "$_id",
                    gstName: 1,
                    gstPercentage: 1
                }
            }
        ]);
        res.status(200).json(gstTypesList);
    } catch (error) {
        console.error("Error Fetching gstTypes List :", error);
        res.status(500).json({ message: "Internal Server Error " });
    }
}

const getGstTypeById = async (req, res) => {
    try {
        const { id } = req.params;
        const gstType = await GstTypeSchema.findById(id);
        if (!gstType) {
            return res.status(404).json({ message: "gstType Not Found" })
        }

        // Modify the _id field to id
        const { _id, ...modifiedGstType } = gstType.toObject();
        modifiedGstType.id = _id;
        delete modifiedGstType._id;

        res.status(200).json(modifiedGstType);
    } catch (error) {
        console.error("Error Fetching gstType by ID :", error);
        res.status(500).json({ message: " Internal server error" })
    }
}

const updateGstTypeById = async (req, res) => {
    try {
        const { id } = req.body;
        console.log(id);
        const { gstName, gstPercentage } = req.body;
        const updateTds = await GstTypeSchema.findByIdAndUpdate(id, { gstName, gstPercentage }, { new: true });
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