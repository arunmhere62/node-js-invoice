import * as Yup from 'yup';

const paymentTermsValidation = Yup.object().shape({
    termName: Yup.string().required('Term name is required').min(2, 'Term name must be at least 2 characters long').max(50, 'Term name cannot exceed 50 characters'),
    startDate: Yup.date().required('Start date is required'),
    dueDate: Yup.date().required('Due date is required').min(Yup.ref('startDate'), 'Due date must be after start date'),
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


export { paymentTermsValidation, invoiceValidation };

