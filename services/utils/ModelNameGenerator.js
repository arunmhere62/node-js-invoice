import { getDynamicCustomerModel } from "../../models/customer.js";
import { getDynamicInvoiceModel } from "../../models/invoice.js";
import { getDynamicPaymentTermsModel } from "../../models/paymentTerms.js";
import { getDynamicServiceModel } from "../../models/services.js";
import { getDynamicGstTypeModel } from "../../models/taxes/gstType.js";
import { getDynamicTdsTaxModel } from "../../models/taxes/tdsTax.js";
import { CollectionNames, tokenReqValueEnums } from "../enums.js";

export const getDynamicModelNameGenerator = (req, collectionType) => {
    const companyName = req[tokenReqValueEnums.COMPANY_ID];
    const collectionName = `${companyName}_${collectionType}`;
    switch (collectionType) {
        case CollectionNames.SERVICE:
            return getDynamicServiceModel(collectionName);
        case CollectionNames.GST_TYPE:
            return getDynamicGstTypeModel(collectionName)
        case CollectionNames.TDS_TAX:
            return getDynamicTdsTaxModel(collectionName);
        case CollectionNames.PAYMENT_TERMS:
            return getDynamicPaymentTermsModel(collectionName);
        case CollectionNames.INVOICE:
            return getDynamicInvoiceModel(collectionName);
        case CollectionNames.CUSTOMERS:
            return getDynamicCustomerModel(collectionName);
        default:
            return null;
    }
};