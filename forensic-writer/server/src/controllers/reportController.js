const Report = require('../models/Report');
const Case = require('../models/Case');
const Evidence = require('../models/Evidence');
const ForensicAnalysisEngine = require('../utils/forensicAnalysisEngine');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// @desc    Create/Save a forensic report
// @route   POST /api/reports
// @access  Private
const saveReport = async (req, res) => {
    try {
        console.log("DEBUG: Saving Report Payload:", JSON.stringify(req.body, null, 2));

        if (!req.user) {
            console.error("DEBUG: Req.user is missing");
            return res.status(401).json({ message: 'Not authorized' });
        }

        const { caseId, caseName, summary, introduction, evidence_summary, timeline, observations, conclusions, anomalies, confidence, reportId, caseRef } = req.body;

        const report = await Report.create({
            caseId,
            caseName,
            summary,
            introduction,
            evidence_summary,
            timeline,
            observations,
            conclusions,
            anomalies: parseInt(anomalies) || 0,
            confidence,
            reportId,
            caseRef,
            generatedBy: req.user._id
        });

        // Update case status to 'Completed' when report is generated
        await Case.findByIdAndUpdate(caseRef, { status: 'Completed' });

        res.status(201).json(report);
    } catch (error) {
        console.error("DEBUG: Save Report Error:", error);
        res.status(500).json({ message: 'Server Error', error: error.message, details: error.toString() });
    }
};

// @desc    Get all reports for the logged in user
// @route   GET /api/reports
// @access  Private
const getReports = async (req, res) => {
    try {
        const reports = await Report.find({ generatedBy: req.user._id }).sort('-createdAt');
        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Delete a report
// @route   DELETE /api/reports/:id
// @access  Private
const deleteReport = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);
        if (!report) return res.status(404).json({ message: 'Report not found' });
        if (report.generatedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        await Report.findByIdAndDelete(req.params.id);
        res.json({ message: 'Report deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Generate AI-powered forensic report with PDF
// @route   POST /api/reports/generate
// @access  Private
const generateForensicReport = async (req, res) => {
    try {
        console.log('[FORENSIC] Starting AI-powered report generation');
        
        const { caseId, caseName, investigatorName } = req.body;
        
        if (!caseId) {
            return res.status(400).json({ message: 'Case ID is required' });
        }

        // Get case and evidence
        const forensicCase = await Case.findById(caseId).populate('evidence');
        if (!forensicCase) {
            return res.status(404).json({ message: 'Case not found' });
        }

        if (forensicCase.generatedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to access this case' });
        }

        console.log(`[FORENSIC] Processing case: ${forensicCase.caseName}`);
        console.log(`[FORENSIC] Evidence files: ${forensicCase.evidence.length}`);

        if (forensicCase.evidence.length === 0) {
            return res.status(400).json({ message: 'No evidence files found for this case' });
        }

        // Initialize forensic analysis engine
        const analysisEngine = new ForensicAnalysisEngine();
        
        // Prepare case info
        const caseInfo = {
            caseId: forensicCase.caseId || `CASE-${Date.now()}`,
            caseName: forensicCase.caseName,
            investigatorName: investigatorName || req.user.name || 'Forensic Analyst',
            generatedAt: new Date().toISOString()
        };

        // Analyze evidence
        console.log('[FORENSIC] Starting evidence analysis...');
        const analysisResults = await analysisEngine.analyzeEvidence(forensicCase.evidence, caseInfo);
        
        console.log(`[FORENSIC] Analysis complete:`);
        console.log(`  - Evidence processed: ${analysisResults.evidence.length}`);
        console.log(`  - Patterns detected: ${analysisResults.patterns.length}`);
        console.log(`  - Anomalies found: ${analysisResults.anomalies.length}`);
        console.log(`  - Critical findings: ${analysisResults.criticalFindings.length}`);

        // Generate PDF report
        const reportGenerator = new ForensicReportGenerator();
        const reportId = `FORENSIC-${uuidv4()}`;
        const pdfFileName = `${reportId}.pdf`;
        const pdfPath = path.join(__dirname, '../../uploads', pdfFileName);

        console.log(`[FORENSIC] Generating PDF report: ${pdfFileName}`);
        await reportGenerator.generateReport(analysisResults, caseInfo, pdfPath);

        // Save report to database
        const report = await Report.create({
            caseId: forensicCase._id,
            caseName: forensicCase.caseName,
            reportId,
            summary: `AI-powered forensic analysis of ${forensicCase.evidence.length} evidence files`,
            introduction: `This report presents the findings from an AI-powered forensic investigation conducted on ${new Date().toLocaleDateString()}.`,
            evidence_summary: `${forensicCase.evidence.length} evidence files were analyzed using advanced pattern detection and anomaly identification algorithms.`,
            timeline: `${analysisResults.timeline.length} events were identified and chronologically ordered.`,
            observations: `${analysisResults.patterns.length} patterns and ${analysisResults.anomalies.length} anomalies were detected during analysis.`,
            conclusions: this.generateConclusions(analysisResults),
            anomalies: analysisResults.criticalFindings.length,
            confidence: this.calculateConfidence(analysisResults),
            caseRef: forensicCase._id,
            generatedBy: req.user._id,
            pdfUrl: `/uploads/${pdfFileName}`,
            analysisResults: analysisResults
        });

        // Update case status
        await Case.findByIdAndUpdate(forensicCase._id, { 
            status: 'Completed',
            completedAt: new Date()
        });

        console.log(`[FORENSIC] Report generated successfully: ${report._id}`);

        res.status(201).json({
            message: 'AI-powered forensic report generated successfully',
            report,
            pdfUrl: `/uploads/${pdfFileName}`,
            analysisSummary: {
                evidenceCount: analysisResults.evidence.length,
                patternsDetected: analysisResults.patterns.length,
                anomaliesFound: analysisResults.anomalies.length,
                criticalFindings: analysisResults.criticalFindings.length,
                insightsGenerated: analysisResults.insights.length
            }
        });

    } catch (error) {
        console.error('[FORENSIC] Error generating report:', error);
        res.status(500).json({ 
            message: 'Error generating forensic report', 
            error: error.message 
        });
    }
};

// @desc    Download forensic report PDF
// @route   GET /api/reports/:id/download
// @access  Private
const downloadReport = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);
        
        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        if (report.generatedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to access this report' });
        }

        if (!report.reportUrl) {
            return res.status(404).json({ message: 'PDF file not found' });
        }

        const pdfPath = path.join(__dirname, '../../..', report.reportUrl);
        
        if (!fs.existsSync(pdfPath)) {
            return res.status(404).json({ message: 'PDF file not found on server' });
        }

        res.download(pdfPath, `Forensic-Report-${report.caseName}-${report.reportId}.pdf`);

    } catch (error) {
        console.error('[FORENSIC] Error downloading report:', error);
        res.status(500).json({ message: 'Error downloading report', error: error.message });
    }
};

// @desc    Get detailed analysis results for a report
// @route   GET /api/reports/:id/analysis
// @access  Private
const getReportAnalysis = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);
        
        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        if (report.generatedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to access this report' });
        }

        res.json({
            report: {
                id: report._id,
                caseName: report.caseName,
                reportId: report.reportId,
                generatedAt: report.createdAt,
                confidence: report.confidence
            },
            analysis: report.analysisResults || null
        });

    } catch (error) {
        console.error('[FORENSIC] Error fetching analysis:', error);
        res.status(500).json({ message: 'Error fetching analysis', error: error.message });
    }
};

/**
 * Helper function to generate conclusions based on analysis
 */
function generateConclusions(analysisResults) {
    const totalEvidence = analysisResults.evidence.length;
    const criticalFindings = analysisResults.criticalFindings.length;
    const highSeverityAnomalies = analysisResults.anomalies.filter(a => a.severity === 'high').length;
    
    let conclusion = `AI-powered forensic analysis of ${totalEvidence} evidence files `;
    
    if (criticalFindings > 0 || highSeverityAnomalies > 0) {
        conclusion += `identified ${criticalFindings + highSeverityAnomalies} critical security issues requiring immediate attention. `;
        conclusion += `The evidence suggests potential security threats that warrant further investigation.`;
    } else if (analysisResults.anomalies.length > 0) {
        conclusion += `detected ${analysisResults.anomalies.length} anomalies that should be reviewed. `;
        conclusion += `While no critical threats were identified, the detected patterns suggest areas requiring monitoring.`;
    } else {
        conclusion += `found no critical security threats. The analyzed evidence shows normal operational patterns.`;
    }
    
    return conclusion;
}

/**
 * Helper function to calculate confidence score
 */
function calculateConfidence(analysisResults) {
    let confidence = 75; // Base confidence
    
    // Increase confidence based on evidence quality
    if (analysisResults.evidence.length > 5) confidence += 10;
    if (analysisResults.timeline.length > 20) confidence += 5;
    
    // Increase confidence based on patterns found
    if (analysisResults.patterns.length > 0) confidence += 5;
    
    // Adjust based on anomalies
    if (analysisResults.anomalies.length > 0) confidence += 10;
    
    return Math.min(confidence, 95); // Cap at 95%
}

module.exports = { 
    saveReport, 
    getReports, 
    deleteReport, 
    generateForensicReport, 
    downloadReport, 
    getReportAnalysis 
};
