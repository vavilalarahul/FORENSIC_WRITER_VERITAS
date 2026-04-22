const express = require('express');
const router = express.Router();
const { processAICommand } = require('../services/aiCommandParser');

// Mock AI analysis endpoint - matches client call: /api/ai/analyze/:caseId
router.post('/analyze/:caseId', async (req, res) => {
    try {
        const { caseId } = req.params;
        const { evidenceIds, evidenceData } = req.body;

        console.log(`Mock AI Analysis for Case: ${caseId}`);
        console.log(`Evidence IDs: ${evidenceIds?.join(', ') || 'None'}`);

        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 3000));

        let fileNamesStr = '';
        let evidenceAnomalies = [];

        if (evidenceData && evidenceData.length > 0) {
            fileNamesStr = evidenceData.map(e => e.fileName).join(', ');
            evidenceAnomalies = evidenceData.map(e => ({
                type: "Deep Neural Pattern Extract",
                description: `Neural scanning of ${e.fileName} indicated significant deviation in structural hashing and metadata anomalies`,
                confidence: Number((0.85 + (Math.random() * 0.1)).toFixed(2)),
                evidence: [e.fileName]
            }));
            evidenceAnomalies.push({
                type: "Cross-Reference Analysis",
                description: `Correlated temporal timestamps across ${evidenceData.length} uploaded files`,
                confidence: 0.95,
                evidence: ["Cross-artifact"]
            });
        } else {
            fileNamesStr = "call_records.csv, call_records.xlsx, chat_messages.db, device_photo.jpg";
            evidenceAnomalies = [
                {
                    type: "Communication Pattern Analysis",
                    description: "Detected unusual temporal patterns in call records indicating potential coordinated activity",
                    confidence: 0.92,
                    evidence: ["call_records.csv", "call_records.xlsx"]
                }
            ];
        }

        // Return mock analysis result
        const mockAnalysis = {
            caseId: caseId,
            analysisId: `AI-${Date.now()}`,
            timestamp: new Date().toISOString(),
            summary: "Comprehensive forensic neural analysis completed successfully",
            introduction: `This forensic analysis was conducted using advanced AI techniques including neural pattern recognition and cross-referencing algorithms. The investigation focused on identifying anomalies within the user's uploaded case files.`,
            evidence_summary: `The neural engine analyzed the following evidence artifacts: ${fileNamesStr}. Each source was processed using specialized extraction protocols customized to the file signature.`,
            timeline: `Metadata timestamps extracted from [ ${fileNamesStr} ] indicate activity concentrated between 09:00-17:00 with unusual communication spikes corresponding to key events.`,
            observations: `Neural analysis reveals structural discrepancies and potential manipulation in the uploaded assets. Encrypted communication artifacts and deleted fragments were recovered from within the file allocations.`,
            conclusions: `The evidence suggests organized activity with attempts to conceal footprints across the analyzed artifacts. High confidence in cross-referencing temporal correlations. Immediate follow-up recommended.`,
            anomalies: evidenceData ? evidenceData.length * 2 : 7,
            confidence: 0.94,
            findings: evidenceAnomalies,
            riskLevel: "High",
            recommendations: [
                "Immediate follow-up required on structural anomalies",
                "Verify file integrity across the recovered fragments",
                "Cross-reference temporal data with external databases"
            ],
            evidenceProcessed: evidenceIds?.length || 4,
            processingTime: "3.0s",
            neuralNetworks: ["BERT", "CNN", "LSTM", "Graph Neural Networks"],
            confidenceScore: 0.88
        };

        res.json({
            success: true,
            analysis: mockAnalysis,
            evidenceAnalyzed: evidenceIds?.length || 4
        });

    } catch (error) {
        console.error('AI Analysis Error:', error);
        res.status(500).json({
            success: false,
            error: 'AI Analysis failed',
            message: error.message
        });
    }
});

// Mock evidence check endpoint
router.get('/case/:caseId/evidence', async (req, res) => {
    try {
        const { caseId } = req.params;

        // Return mock evidence data
        const mockEvidence = [
            {
                id: '1',
                fileName: 'call_records.csv',
                fileType: 'text/csv',
                fileSize: 167,
                fileUrl: 'uploads/call_records.csv',
                hash: 'abc123'
            },
            {
                id: '2',
                fileName: 'call_records.xlsx',
                fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                fileSize: 4989,
                fileUrl: 'uploads/call_records.xlsx',
                hash: 'def456'
            },
            {
                id: '3',
                fileName: 'chat_messages.db',
                fileType: 'application/x-sqlite3',
                fileSize: 8192,
                fileUrl: 'uploads/chat_messages.db',
                hash: 'ghi789'
            },
            {
                id: '4',
                fileName: 'device_photo.jpg',
                fileType: 'image/jpeg',
                fileSize: 6018,
                fileUrl: 'uploads/device_photo.jpg',
                hash: 'jkl012'
            }
        ];

        res.json({
            caseId: caseId,
            caseName: 'Mock Case',
            status: 'active',
            evidenceCount: mockEvidence.length,
            evidence: mockEvidence
        });

    } catch (error) {
        console.error('Evidence Check Error:', error);
        res.status(500).json({
            success: false,
            error: 'Evidence check failed',
            message: error.message
        });
    }
});

// Real Neural Assistant chat endpoint using HuggingFace
router.post('/chat', async (req, res) => {
    try {
        const { query, role } = req.body;
        console.log(`AI Neural Link Query: "${query}" from Role: ${role}`);

        const user = req.user || { role: role || 'investigator' };
        
        if (!query) {
            return res.status(400).json({ text: "Empty query provided." });
        }
        
        const aiResponse = await processAICommand(query, user);
        return res.json(aiResponse);

    } catch (error) {
        console.error('Neural Link Error:', error);
        res.status(500).json({
            text: 'Neural Link failed: ' + error.message
        });
    }
});

module.exports = router;
