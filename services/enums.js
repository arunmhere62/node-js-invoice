export const ROLE = {
    ADMIN: 'ADMIN',
    SUPERADMIN: 'SUPERADMIN',
    APPROVER: 'APPROVER',
    STANDARDUSER: 'STANDARDUSER',
};

Object.freeze(ROLE); // Optional: This ensures the enum object is immutable

export const permissions = {
    // dashboard 
    DASHBOARD_VIEW: 'dashboardView',
    // company
    COMPANY_CREATE: 'companyCreate',
    COMPANY_EDIT: 'companyEdit',
    COMPANY_DELETE: 'companyDelete',
    COMPANY_LIST: 'companyList',
    COMPANY_DETAILS_VIEW: 'companyDetailsView',

    // user
    USER_CREATE: 'userCreate',
    USER_EDIT: 'userEdit',
    USER_DELETE: 'userDelete',
    USER_LIST: 'userList',
    USER_DETAILS_VIEW: 'userView',

    // customer
    CUSTOMER_CREATE: 'customerCreate',
    CUSTOMER_EDIT: 'customerEdit',
    CUSTOMER_DELETE: 'customerDelete',
    CUSTOMER_LIST: 'customerList',
    CUSTOMER_DETAILS_VIEW: 'customerView',

    // services
    SERVICE_CREATE: 'serviceCreate',
    SERVICE_EDIT: 'serviceEdit',
    SERVICE_DELETE: 'serviceDelete',
    SERVICE_LIST: 'serviceList',
    SERVICE_DETAILS_VIEW: 'serviceView',

    // tds tax
    TDS_TAX_CREATE: 'tdsTaxCreate',
    TDS_TAX_EDIT: 'tdsTaxEdit',
    TDS_TAX_DELETE: 'tdsTaxDelete',
    TDS_TAX_LIST: 'tdsTaxList',
    TDS_TAX_DETAILS_VIEW: 'tdsTaxView',

    // paymentTerms 
    PAYMENT_TERMS_CREATE: 'paymentTermsCreate',
    PAYMENT_TERMS_EDIT: 'paymentTermsEdit',
    PAYMENT_TERMS_DELETE: 'paymentTermsDelete',
    PAYMENT_TERMS_LIST: 'paymentTermsList',
    PAYMENT_TERMS_DETAILS_VIEW: 'paymentTermsView',

    // gstType 
    GST_TYPE_CREATE: 'gstTypeCreate',
    GST_TYPE_EDIT: 'gstTypeEdit',
    GST_TYPE_DELETE: 'gstTypeDelete',
    GST_TYPE_LIST: 'gstTypeList',
    GST_TYPE_DETAILS_VIEW: 'gstTypeView',

    // invoice
    INVOICE_CREATE: 'invoiceCreate',
    INVOICE_EDIT: 'invoiceEdit',
    INVOICE_DELETE: 'invoiceDelete',
    INVOICE_LIST: 'invoiceList',
    INVOICE_DETAILS_VIEW: 'invoiceView',
    INVOICE_AGING_REPORT: 'invoiceAgingReport',



};

export const rolePermissions = {
    [ROLE.SUPERADMIN]: [
        // dashboard permission 
        permissions.DASHBOARD_VIEW,
        // company permissions
        permissions.COMPANY_CREATE,
        permissions.COMPANY_EDIT,
        permissions.COMPANY_DELETE,
        permissions.COMPANY_LIST,
        permissions.COMPANY_DETAILS_VIEW,
        // users
        permissions.USER_CREATE,
        permissions.USER_EDIT,
        permissions.USER_DELETE,
        permissions.USER_LIST,
        permissions.USER_DETAILS_VIEW,
    ],
    [ROLE.ADMIN]: [
        // dashboard permission 
        permissions.DASHBOARD_VIEW,

        // users
        permissions.USER_CREATE,
        permissions.USER_EDIT,
        permissions.USER_DELETE,
        permissions.USER_LIST,
        permissions.USER_DETAILS_VIEW,

        // customer permissions
        permissions.CUSTOMER_CREATE,
        permissions.CUSTOMER_EDIT,
        permissions.CUSTOMER_DELETE,
        permissions.CUSTOMER_LIST,
        permissions.CUSTOMER_DETAILS_VIEW,

        // tdsTax permissions
        permissions.TDS_TAX_CREATE,
        permissions.TDS_TAX_EDIT,
        permissions.TDS_TAX_DELETE,
        permissions.TDS_TAX_LIST,
        permissions.TDS_TAX_DETAILS_VIEW,

        // paymentTerms permissions
        permissions.PAYMENT_TERMS_CREATE,
        permissions.PAYMENT_TERMS_EDIT,
        permissions.PAYMENT_TERMS_DELETE,
        permissions.PAYMENT_TERMS_LIST,
        permissions.PAYMENT_TERMS_DETAILS_VIEW,

        // gstType permissions
        permissions.GST_TYPE_CREATE,
        permissions.GST_TYPE_EDIT,
        permissions.GST_TYPE_DELETE,
        permissions.GST_TYPE_LIST,
        permissions.GST_TYPE_DETAILS_VIEW,

        // service permissions
        permissions.SERVICE_CREATE,
        permissions.SERVICE_EDIT,
        permissions.SERVICE_DELETE,
        permissions.SERVICE_LIST,
        permissions.SERVICE_DETAILS_VIEW,

        // invoice permissions
        permissions.INVOICE_CREATE,
        permissions.INVOICE_EDIT,
        permissions.INVOICE_DELETE,
        permissions.INVOICE_LIST,
        permissions.INVOICE_DETAILS_VIEW,
        permissions.INVOICE_AGING_REPORT,

    ],
    [ROLE.APPROVER]: [
        // dashboard permission 
        permissions.DASHBOARD_VIEW,

        // user permissions
        permissions.USER_LIST,
        permissions.USER_DETAILS_VIEW,

        // service permissions
        permissions.SERVICE_LIST,
        permissions.SERVICE_DETAILS_VIEW,

        // invoice permissions
        permissions.INVOICE_CREATE,
        permissions.INVOICE_EDIT,
        permissions.INVOICE_LIST,
        permissions.INVOICE_DETAILS_VIEW,
        permissions.INVOICE_AGING_REPORT,

        // customer List 
        permissions.CUSTOMER_LIST,

    ],
    [ROLE.STANDARDUSER]: [
        // dashboard permission 
        permissions.DASHBOARD_VIEW,

        // user permissions
        permissions.USER_LIST,
        permissions.USER_DETAILS_VIEW,

        // customer permissions
        permissions.CUSTOMER_CREATE,
        permissions.CUSTOMER_EDIT,
        permissions.CUSTOMER_DELETE,
        permissions.CUSTOMER_LIST,
        permissions.CUSTOMER_DETAILS_VIEW,

        // service permissions
        permissions.SERVICE_LIST,
        permissions.SERVICE_DETAILS_VIEW,

        // tdsTax permissions
        permissions.TDS_TAX_CREATE,
        permissions.TDS_TAX_EDIT,
        permissions.TDS_TAX_DELETE,
        permissions.TDS_TAX_LIST,
        permissions.TDS_TAX_DETAILS_VIEW,

        // paymentTerms permissions
        permissions.PAYMENT_TERMS_CREATE,
        permissions.PAYMENT_TERMS_EDIT,
        permissions.PAYMENT_TERMS_DELETE,
        permissions.PAYMENT_TERMS_LIST,
        permissions.PAYMENT_TERMS_DETAILS_VIEW,

        // gstType permissions
        permissions.GST_TYPE_CREATE,
        permissions.GST_TYPE_EDIT,
        permissions.GST_TYPE_DELETE,
        permissions.GST_TYPE_LIST,
        permissions.GST_TYPE_DETAILS_VIEW,

        // invoice permissions
        permissions.INVOICE_CREATE,
        permissions.INVOICE_EDIT,
        permissions.INVOICE_DELETE,
        permissions.INVOICE_LIST,
        permissions.INVOICE_DETAILS_VIEW,
        permissions.INVOICE_AGING_REPORT,
    ]
};
