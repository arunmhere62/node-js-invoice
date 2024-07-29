
import express from 'express';
import { permissions } from '../services/enums.js';
import { checkPermission } from '../services/utils/permissionsCheck.js';
import { dashboardReports } from '../controllers/dashboard/dashboard.js';

const router = express.Router();

router.post('', checkPermission(permissions.DASHBOARD_VIEW), dashboardReports);

export default router;