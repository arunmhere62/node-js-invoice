import { rolePermissions } from "../enums.js";

export const checkPermission = (requiredPermission) => {
    return (req, res, next) => {
        const userRole = req.userRole;
        const permissions = rolePermissions[userRole];

        if (!permissions || !permissions.includes(requiredPermission)) {
            return res.status(403).json({ message: 'Forbidden. You do not have permission to perform this action.' });
        }
        next();
    };
};
