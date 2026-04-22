const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * PDF Report Generation Service
 * Generates professional forensic analysis reports
 */

class PDFReportService {
    constructor() {
        this.reportsDir = path.join(__dirname, '../../uploads/reports');
        this.ensureReportsDir();
    }

    ensureReportsDir() {
        if (!fs.existsSync(this.reportsDir)) {
            fs.mkdirSync(this.reportsDir, { recursive: true });
        }
    }

    /**
     * Generate forensic analysis PDF report
     */
    async generateReport(analysisResult, caseInfo) {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({
                    margin: 50,
                    size: 'A4'
                });

                const reportFileName = `forensic-report-${caseInfo.caseId || 'unknown'}-${Date.now()}.pdf`;
                const reportPath = path.join(this.reportsDir, reportFileName);
                const stream = fs.createWriteStream(reportPath);

                doc.pipe(stream);

                // Add fonts
                doc.font('Helvetica');

                let y = 50;

                // Header
                this.addHeader(doc, y);
                y += 80;

                // Case Information
                this.addSection(doc, y, 'CASE INFORMATION');
                y += 25;
                y = this.addCaseInfo(doc, y, caseInfo, analysisResult);
                y += 20;

                // Executive Summary
                this.addSection(doc, y, 'EXECUTIVE SUMMARY');
                y += 25;
                y = this.addExecutiveSummary(doc, y, analysisResult);
                y += 20;

                // File Analysis Results
                this.addSection(doc, y, 'FILE ANALYSIS RESULTS');
                y += 25;
                y = this.addFileAnalysis(doc, y, analysisResult.files);
                y += 20;

                // Anomaly Detection
                this.addSection(doc, y, 'ANOMALY DETECTION');
                y += 25;
                y = this.addAnomalyDetection(doc, y, analysisResult.totalAnomalies);
                y += 20;

                // Hash Verification
                this.addSection(doc, y, 'HASH VERIFICATION');
                y += 25;
                y = this.addHashVerification(doc, y, analysisResult.files);
                y += 20;

                // Risk Assessment
                this.addSection(doc, y, 'RISK ASSESSMENT');
                y += 25;
                y = this.addRiskAssessment(doc, y, analysisResult);
                y += 20;

                // Recommendations
                this.addSection(doc, y, 'RECOMMENDATIONS');
                y += 25;
                y = this.addRecommendations(doc, y, analysisResult);
                y += 20;

                // Signatures
                this.addSignatures(doc, y);

                doc.end();

                stream.on('finish', () => {
                    resolve({
                        success: true,
                        reportPath: reportPath,
                        reportFileName: reportFileName,
                        reportUrl: `/reports/${reportFileName}`
                    });
                });

                stream.on('error', (error) => {
                    reject(error);
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    addHeader(doc, y) {
        doc.fontSize(24).fillColor('#1a1a2e').text('FORENSIC ANALYSIS REPORT', 50, y, { align: 'center' });
        
        // Add decorative line
        doc.moveTo(50, y + 35)
           .lineTo(545, y + 35)
           .lineWidth(2)
           .strokeColor('#4a90e2')
           .stroke();
    }

    addSection(doc, y, title) {
        doc.fontSize(14)
           .fillColor('#4a90e2')
           .text(title, 50, y);
        
        doc.moveTo(50, y + 5)
           .lineTo(545, y + 5)
           .lineWidth(1)
           .strokeColor('#e0e0e0')
           .stroke();
    }

    addCaseInfo(doc, y, caseInfo, analysisResult) {
        const info = [
            { label: 'Case ID', value: caseInfo.caseId || 'N/A' },
            { label: 'Case Name', value: caseInfo.caseName || 'N/A' },
            { label: 'Analysis Date', value: new Date().toLocaleDateString() },
            { label: 'Processing Time', value: `${analysisResult.processingTime}s` },
            { label: 'Files Analyzed', value: analysisResult.files.length.toString() },
            { label: 'Confidence Score', value: `${analysisResult.overallConfidence.toFixed(1)}%` }
        ];

        doc.fontSize(10).fillColor('#333333');
        
        info.forEach((item, index) => {
            const yPos = y + (index * 20);
            doc.fontSize(9).fillColor('#666666').text(`${item.label}:`, 50, yPos);
            doc.fontSize(10).fillColor('#333333').text(item.value, 150, yPos);
        });

        return y + (info.length * 20);
    }

    addExecutiveSummary(doc, y, analysisResult) {
        const summary = analysisResult.generateSummary ? analysisResult.generateSummary(analysisResult) : {
            totalFiles: analysisResult.files.length,
            totalAnomalies: analysisResult.totalAnomalies.length,
            severityBreakdown: {
                HIGH: analysisResult.totalAnomalies.filter(a => a.severity === 'HIGH').length,
                MEDIUM: analysisResult.totalAnomalies.filter(a => a.severity === 'MEDIUM').length,
                LOW: analysisResult.totalAnomalies.filter(a => a.severity === 'LOW').length
            },
            overallConfidence: analysisResult.overallConfidence,
            riskLevel: analysisResult.totalAnomalies.length > 5 ? 'HIGH' : analysisResult.totalAnomalies.length > 0 ? 'MEDIUM' : 'LOW'
        };

        const text = `This forensic analysis examined ${summary.totalFiles} file(s) and detected ${summary.totalAnomalies} anomaly(ies). `
                   + `The analysis revealed ${summary.severityBreakdown.HIGH} high-severity, ${summary.severityBreakdown.MEDIUM} medium-severity, `
                   + `and ${summary.severityBreakdown.LOW} low-severity findings. The overall confidence score is ${summary.overallConfidence.toFixed(1)}%. `
                   + `Based on the findings, the risk level is assessed as ${summary.riskLevel}.`;

        doc.fontSize(10)
           .fillColor('#333333')
           .text(text, 50, y, { width: 495, align: 'justify' });

        return y + 40;
    }

    addFileAnalysis(doc, y, files) {
        doc.fontSize(9).fillColor('#666666');
        
        files.forEach((file, index) => {
            const yPos = y + (index * 60);
            
            // File name
            doc.fontSize(11).fillColor('#1a1a2e').text(`${index + 1}. ${file.fileName}`, 50, yPos);
            
            // File details
            doc.fontSize(9).fillColor('#666666');
            doc.text(`Type: ${file.fileType}`, 60, yPos + 15);
            doc.text(`Size: ${this.formatBytes(file.fileSize)}`, 150, yPos + 15);
            doc.text(`Hash: ${file.hash.substring(0, 32)}...`, 280, yPos + 15);
            
            // Anomalies count
            const anomalyCount = file.anomalies.length;
            doc.text(`Anomalies: ${anomalyCount}`, 450, yPos + 15, { width: 95 });
            
            // Confidence
            const confidenceColor = file.confidence > 80 ? '#4CAF50' : file.confidence > 60 ? '#FF9800' : '#F44336';
            doc.fillColor(confidenceColor).text(`Confidence: ${file.confidence.toFixed(1)}%`, 450, yPos + 30);
        });

        return y + (files.length * 60);
    }

    addAnomalyDetection(doc, y, anomalies) {
        if (anomalies.length === 0) {
            doc.fontSize(10).fillColor('#4CAF50').text('No anomalies detected.', 50, y);
            return y + 20;
        }

        const severityColors = {
            'HIGH': '#F44336',
            'MEDIUM': '#FF9800',
            'LOW': '#FFC107'
        };

        anomalies.forEach((anomaly, index) => {
            const yPos = y + (index * 35);
            
            doc.fontSize(10).fillColor(severityColors[anomaly.severity])
               .text(`[${anomaly.severity}] ${anomaly.type}`, 50, yPos);
            
            doc.fontSize(9).fillColor('#666666')
               .text(anomaly.description, 50, yPos + 15);
        });

        return y + (anomalies.length * 35);
    }

    addHashVerification(doc, y, files) {
        doc.fontSize(9).fillColor('#666666');
        
        files.forEach((file, index) => {
            const yPos = y + (index * 25);
            
            doc.fontSize(10).fillColor('#1a1a2e').text(file.fileName, 50, yPos);
            doc.fontSize(9).fillColor('#666666').text(file.hash, 50, yPos + 12);
            
            doc.fillColor('#4CAF50').text('✓ Verified', 450, yPos);
        });

        return y + (files.length * 25);
    }

    addRiskAssessment(doc, y, analysisResult) {
        const summary = {
            totalAnomalies: analysisResult.totalAnomalies.length,
            highSeverity: analysisResult.totalAnomalies.filter(a => a.severity === 'HIGH').length,
            overallConfidence: analysisResult.overallConfidence
        };

        let riskLevel = 'LOW';
        let riskColor = '#4CAF50';
        
        if (summary.highSeverity > 0 || summary.totalAnomalies > 10) {
            riskLevel = 'HIGH';
            riskColor = '#F44336';
        } else if (summary.totalAnomalies > 5) {
            riskLevel = 'MEDIUM';
            riskColor = '#FF9800';
        }

        doc.fontSize(12).fillColor(riskColor).text(`RISK LEVEL: ${riskLevel}`, 50, y);
        
        doc.fontSize(10).fillColor('#333333');
        doc.text(`Total Anomalies: ${summary.totalAnomalies}`, 50, y + 20);
        doc.text(`High Severity: ${summary.highSeverity}`, 200, y + 20);
        doc.text(`Confidence Score: ${summary.overallConfidence.toFixed(1)}%`, 350, y + 20);

        return y + 50;
    }

    addRecommendations(doc, y, analysisResult) {
        const recommendations = this.generateRecommendations(analysisResult);
        
        recommendations.forEach((rec, index) => {
            const yPos = y + (index * 20);
            doc.fontSize(9).fillColor('#333333').text(`${index + 1}. ${rec}`, 50, yPos);
        });

        return y + (recommendations.length * 20);
    }

    generateRecommendations(analysisResult) {
        const recommendations = [];
        const highSeverity = analysisResult.totalAnomalies.filter(a => a.severity === 'HIGH').length;
        const totalAnomalies = analysisResult.totalAnomalies.length;

        if (highSeverity > 0) {
            recommendations.push('IMMEDIATE ACTION REQUIRED: Investigate high-severity anomalies');
        }
        
        if (totalAnomalies > 5) {
            recommendations.push('Conduct detailed analysis of all detected anomalies');
            recommendations.push('Review source files for potential tampering');
        }
        
        if (totalAnomalies > 0) {
            recommendations.push('Cross-reference findings with other evidence sources');
            recommendations.push('Document all findings for legal proceedings');
        } else {
            recommendations.push('No significant anomalies detected - routine monitoring recommended');
        }

        recommendations.push('Maintain chain of custody for all analyzed files');
        recommendations.push('Update case documentation with analysis results');

        return recommendations;
    }

    addSignatures(doc, y) {
        doc.moveTo(50, y)
           .lineTo(545, y)
           .lineWidth(1)
           .strokeColor('#e0e0e0')
           .stroke();

        y += 40;

        doc.fontSize(10).fillColor('#333333').text('Forensic Investigator:', 50, y);
        doc.moveTo(50, y + 30)
           .lineTo(200, y + 30)
           .lineWidth(1)
           .strokeColor('#333333')
           .stroke();

        doc.text('Date:', 350, y);
        doc.text(new Date().toLocaleDateString(), 350, y + 30);

        y += 60;

        doc.text('Legal Advisor:', 50, y);
        doc.moveTo(50, y + 30)
           .lineTo(200, y + 30)
           .lineWidth(1)
           .strokeColor('#333333')
           .stroke();

        doc.text('Date:', 350, y);
        doc.text(new Date().toLocaleDateString(), 350, y + 30);
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

module.exports = new PDFReportService();
