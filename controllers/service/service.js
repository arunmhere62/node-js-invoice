import mongoose from "mongoose";
import { getDynamicServiceModel } from "../../models/services.js";
import { CollectionNames, tokenReqValueEnums } from "../../services/enums.js";
import { getDynamicModelNameGenerator } from "../../services/utils/ModelNameGenerator.js";

const serviceCreate = async (req, res) => {
    try {
        const ServiceModel = getDynamicModelNameGenerator(req, CollectionNames.SERVICE)
        const { serviceAccountingCode, serviceDescription, serviceAmount } = req.body;
        const companyId = req[tokenReqValueEnums.COMPANY_ID];
        const createdBy = req[tokenReqValueEnums.USER_NAME];

        if (!companyId || !createdBy) {
            return res.status(400).json({ message: 'companyId and createdBy is missing ' })
        }
        const serviceModal = {
            serviceAccountingCode,
            serviceDescription,
            serviceAmount,
            companyId,
            createdBy,
        };
        const newService = new ServiceModel(serviceModal);
        const saveService = await newService.save();
        res.status(201).json(saveService);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const servicesList = async (req, res) => {
    try {
        const ServiceModel = getDynamicModelNameGenerator(req, CollectionNames.SERVICE)
        const services = await ServiceModel.find();
        res.status(200).json(services);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const serviceUpdate = async (req, res) => {
    try {
        const ServiceModel = getDynamicModelNameGenerator(req, CollectionNames.SERVICE)
        const { id } = req.params;
        const { serviceAccountingCode, serviceDescription, serviceAmount } = req.body;
        const updatedBy = req.userName || null;
        if (!updatedBy) {
            return res.status(400).json({ message: 'updatedBy is missing ' })
        }
        const serviceModal = {
            serviceAccountingCode,
            serviceDescription,
            serviceAmount,
            updatedBy,
        };
        const result = await ServiceModel.findByIdAndUpdate(id, serviceModal, { new: true });
        if (!result) {
            return res.status(404).json({ message: "service not found" })
        }
        res.status(200).json(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" })
    }
};

const getServiceById = async (req, res) => {
    try {
        const ServiceModel = getDynamicModelNameGenerator(req, CollectionNames.SERVICE)
        const { id } = req.params;
        // Validate ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid service ID" });
        }
        // Find service by ID
        const service = await ServiceModel.findById(id);
        // Check if service exists
        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }
        // Return the service
        res.status(200).json(service);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const serviceDelete = async (req, res) => {
    try {
        const ServiceModel = getDynamicModelNameGenerator(req, CollectionNames.SERVICE);
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid service ID" });
        }
        const deletedService = await ServiceModel.findByIdAndDelete(id);

        if (!deletedService) {
            return res.status(404).json({ message: "service is not found" });
        }
        res.status(200).json({ message: "services deleted successfully", deletedService });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export { serviceCreate, servicesList, serviceUpdate, serviceDelete, getServiceById };
