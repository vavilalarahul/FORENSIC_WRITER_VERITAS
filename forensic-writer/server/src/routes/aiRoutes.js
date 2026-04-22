const express = require('express');
const router = express.Router();
const { analyzeCase, checkCaseEvidence } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');
const { requireAIAccess } = require('../utils/rbac');
const { processAICommand } = require('../services/aiCommandParser');

// AI routes restricted to forensic_investigator and admin only
router.get('/analyze/:caseId', protect, requireAIAccess, analyzeCase);
router.post('/analyze/:caseId', protect, requireAIAccess, analyzeCase);
router.get('/check/:caseId', protect, requireAIAccess, checkCaseEvidence);

// Real-time Chatbot Command endpoint - restricted to forensic_investigator and admin only
router.post('/chat', protect, requireAIAccess, async (req, res) => {
    try {
        const user = req.user;
        
        if (!user) {
            return res.status(401).json({ text: "User not authenticated" });
        }
        
        const { query, message } = req.body;
        const finalQuery = query || message;
        
        if (!finalQuery) {
            return res.status(400).json({ text: "Empty query provided." });
        }
        
        const aiResponse = await processAICommand(finalQuery, user);
        return res.json(aiResponse);

    } catch (error) {
        console.error("Chat Endpoint Error:", error);
        res.status(500).json({ text: "Internal server error connecting to AI." });
    }
});

module.exports = router;
