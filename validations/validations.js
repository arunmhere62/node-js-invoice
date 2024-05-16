import * as Yup from 'yup';

const paymentTermsValidation = Yup.object().shape({
    termName: Yup.string().required('Term name is required').min(2, 'Term name must be at least 2 characters long').max(50, 'Term name cannot exceed 50 characters'),
    totalDays: Yup.number().required('totalDays is required'),
});


const invoiceValidation = Yup.object().shape({
    invoiceType: Yup.string().required(),
    invoiceNumber: Yup.string().required(),
    customerName: Yup.string().required(),
    gstType: Yup.string().required(),
    gstPercentage: Yup.number().required(),
    gstInNumber: Yup.string().required(),
    paymentTerms: Yup.string().required(),
    startDate: Yup.string().required(),
    dueDate: Yup.string().required(),
    invoiceStatus: Yup.string().required(),
    discountPercentage: Yup.number().required(),
    taxAmount: Yup.object().shape({
        tds: Yup.string().default('FRT121')
    }),
    servicesList: Yup.array().of(
        Yup.object().shape({
            serviceAccountingCode: Yup.string().required(),
            serviceDescription: Yup.string(),
            quantity: Yup.number().required(),
            price: Yup.number().required(),
            serviceAmount: Yup.number().required()
        })
    )
});

const customerValidation = Yup.object().shape({
    // customerName: Yup.string().required('Customer name is required').min(2, 'Customer name must be at least 2 characters long').max(50, 'Customer name cannot exceed 50 characters'),
    // customerType: Yup.string().required('Customer type is required'),
    // companyName: Yup.string().required('Company name is required'),
    // customerEmail: Yup.string().required('Customer email is required').email('Invalid email format'),
    // customerPhone: Yup.string().required('Customer phone is required').matches(/^[0-9]+$/, 'Customer phone must be a valid number').min(10, 'Customer phone must be at least 10 digits'),
    // paymentTerms: Yup.array().of(paymentTermsValidation),
    // country: Yup.string().required('Country is required'),
    // address: Yup.string().required('Address is required'),
    // city: Yup.string().required('City is required'),
    // state: Yup.string().required('State is required'),
    // pinCode: Yup.string().required('Pin code is required').matches(/^[0-9]+$/, 'Pin code must be a valid number'),
});
export { paymentTermsValidation, invoiceValidation, customerValidation };

