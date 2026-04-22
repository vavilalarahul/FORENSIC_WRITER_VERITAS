const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getReportVault, downloadReport, deleteReport } = require('../controllers/reportVaultController');

// GET /api/report-vault - get all reports for current user
router.get('/', protect, getReportVault);

// GET /api/report-vault/download/:id - download specific report
router.get('/download/:id', protect, downloadReport);

// DELETE /api/report-vault/:id - delete report from vault
router.delete('/:id', protect, deleteReport);

module.exports = router;
