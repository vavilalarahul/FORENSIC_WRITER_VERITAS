const ReportVault = require('../models/ReportVault');
const fs = require('fs');
const path = require('path');

// @desc    Get all reports for current user from vault
// @route   GET /api/report-vault
// @access  Private
const getReportVault = async (req, res) => {
    try {
        const userId = req.user._id;
        const reports = await ReportVault.find({ userId })
            .sort('-createdAt');
        
        res.json({ 
            success: true, 
            reports: reports.map(report => ({
                _id: report._id,
                fileName: report.fileName,
                caseId: report.caseId,
                caseName: report.caseName,
                fileSize: report.fileSize,
                createdAt: report.createdAt,
                downloadUrl: `/api/report-vault/download/${report._id}`
            }))
        });
    } catch (error) {
        console.error('Get report vault error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Download specific report from vault
// @route   GET /api/report-vault/download/:id
// @access  Private
const downloadReport = async (req, res) => {
    try {
        const userId = req.user._id;
        const reportId = req.params.id;
        
        const report = await ReportVault.findOne({ _id: reportId, userId });
        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        const filePath = path.join(__dirname, '../uploads', 'reports', report.fileName);
        
        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'File not found on server' });
        }

        // Set headers for file download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${report.fileName}"`);
        
        // Stream file to client
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
        
        // Update download count or last accessed
        await ReportVault.findByIdAndUpdate(reportId, {
            lastAccessedAt: new Date()
        });
        
    } catch (error) {
        console.error('Download report error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete report from vault
// @route   DELETE /api/report-vault/:id
// @access  Private
const deleteReport = async (req, res) => {
    try {
        const userId = req.user._id;
        const reportId = req.params.id;
        
        const report = await ReportVault.findOne({ _id: reportId, userId });
        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        // Delete file from filesystem
        const filePath = path.join(__dirname, '../uploads', 'reports', report.fileName);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Delete from database
        await ReportVault.findByIdAndDelete(reportId);
        
        res.json({ 
            success: true, 
            message: 'Report deleted successfully' 
        });
        
    } catch (error) {
        console.error('Delete report error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getReportVault,
    downloadReport,
    deleteReport
};
