import * as Yup from 'yup';

const paymentTermsValidation = Yup.object().shape({
    termName: Yup.string().required('Term name is required').min(2, 'Term name must be at least 2 characters long').max(50, 'Term name cannot exceed 50 characters'),
    startDate: Yup.date().required('Start date is required'),
    dueDate: Yup.date().required('Due date is required').min(Yup.ref('startDate'), 'Due date must be after start date'),
});

export { paymentTermsValidation };