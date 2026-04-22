const Case = require('../models/Case');
const Report = require('../models/Report');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendNotificationToRole } = require('../config/socket');

// @desc    Create a new case
// @route   POST /api/cases
// @access  Private
const createCase = async (req, res) => {
    try {
        console.log("Route hit:", req.originalUrl);
        const { caseName, caseId, investigatorName, date, notes } = req.body;

        const caseExists = await Case.findOne({ caseId });
        if (caseExists) {
            return res.status(400).json({ message: 'Case ID already exists' });
        }

        // Enforce authenticated user ID
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ message: 'Authentication required to create a case' });
        }

        const newCase = await Case.create({
            caseName,
            caseId,
            investigatorName,
            date,
            notes,
            createdBy: userId
        });

        // Populate evidence before returning
        await newCase.populate('evidence');
        
        console.log(`[CASE] New case created: ${caseId}`);

        // Simplified notification (temporarily disabled)
        // TODO: Re-enable when auth system is fully implemented

        res.status(201).json(newCase);
    } catch (error) {
        console.error("ERROR:", error.message);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

// @desc    Get all cases for the logged in user
// @route   GET /api/cases
// @access  Private
const getCases = async (req, res) => {
    try {
        console.log("Route hit:", req.originalUrl);
        // Temporarily remove user filter to get all cases
        const cases = await Case.find({})
            .populate('evidence')
            .sort('-createdAt');
        res.json(cases);
    } catch (error) {
        console.error("ERROR:", error.message);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

// @desc    Get dashboard stats
// @route   GET /api/cases/stats
// @access  Private
const getStats = async (req, res) => {
    try {
        console.log("Route hit:", req.originalUrl);
        const total = await Case.countDocuments();

        return res.json({
            totalCases: total,
            completed: 0,
            pending: 0
        });
    } catch (error) {
        console.error("ERROR:", error.message);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

// @desc    Delete a case and associated reports
// @route   DELETE /api/cases/:id
// @access  Private
const deleteCase = async (req, res) => {
    try {
        console.log("Route hit:", req.originalUrl);
        const forensicCase = await Case.findById(req.params.id);

        if (!forensicCase) {
            return res.status(404).json({ message: 'Case not found' });
        }

        // Temporarily skip ownership check
        // TODO: Re-enable when auth system is fully implemented

        // Cascading delete: Reports
        await Report.deleteMany({ caseRef: req.params.id });

        // Delete Case
        await forensicCase.deleteOne();

        res.json({ message: 'Case and associated reports purged successfully' });
    } catch (error) {
        console.error("ERROR:", error.message);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

module.exports = { createCase, getCases, getStats, deleteCase };
