const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class ForensicReportGenerator {
    constructor() {
        this.doc = null;
        this.analysisResults = null;
        this.caseInfo = null;
    }

    /**
     * Generate complete forensic PDF report
     */
    async generateReport(analysisResults, caseInfo, outputPath) {
        this.analysisResults = analysisResults;
        this.caseInfo = caseInfo;
        
        return new Promise((resolve, reject) => {
            try {
                console.log(`[PDF] Starting PDF generation: ${outputPath}`);
                
                this.doc = new PDFDocument({
                    size: 'A4',
                    margins: {
                        top: 50,
                        bottom: 50,
                        left: 50,
                        right: 50
                    }
                });

                // Ensure output path has .pdf extension
                const pdfOutputPath = outputPath.endsWith('.pdf') ? outputPath : outputPath + '.pdf';
                console.log(`[PDF] Output path: ${pdfOutputPath}`);
                
                const stream = fs.createWriteStream(pdfOutputPath);
                this.doc.pipe(stream);

                // Generate all sections
                console.log(`[PDF] Generating title page...`);
                this.generateTitlePage();
                
                console.log(`[PDF] Generating executive summary...`);
                this.generateExecutiveSummary();
                
                console.log(`[PDF] Generating evidence summary...`);
                this.generateEvidenceSummary();
                
                console.log(`[PDF] Generating detailed analysis...`);
                this.generateDetailedAnalysis();
                
                console.log(`[PDF] Generating critical findings...`);
                this.generateCriticalFindings();
                
                console.log(`[PDF] Generating AI insights...`);
                this.generateAIInsights();
                
                console.log(`[PDF] Generating final conclusion...`);
                this.generateFinalConclusion();
                
                console.log(`[PDF] Generating signature section...`);
                this.generateSignatureSection();

                console.log(`[PDF] Finalizing PDF...`);
                this.doc.end();

                stream.on('finish', () => {
                    console.log(`[PDF] PDF generation completed: ${pdfOutputPath}`);
                    
                    // Verify PDF was created correctly
                    setTimeout(() => {
                        if (fs.existsSync(pdfOutputPath)) {
                            const stats = fs.statSync(pdfOutputPath);
                            console.log(`[PDF] File size: ${stats.size} bytes`);
                            
                            // Check if it's a valid PDF
                            const buffer = fs.readFileSync(pdfOutputPath);
                            const header = buffer.toString('ascii', 0, 4);
                            
                            if (header === '%PDF') {
                                console.log(`[PDF] ✅ Valid PDF file generated`);
                                resolve(pdfOutputPath);
                            } else {
                                console.error(`[PDF] ❌ Invalid PDF file generated. Header: ${header}`);
                                reject(new Error('Invalid PDF file generated'));
                            }
                        } else {
                            console.error(`[PDF] ❌ PDF file was not created`);
                            reject(new Error('PDF file was not created'));
                        }
                    }, 1000);
                });

                stream.on('error', (error) => {
                    console.error('[PDF] Stream error:', error);
                    reject(error);
                });

            } catch (error) {
                console.error('[PDF] Generation error:', error);
                reject(error);
            }
        });
    }

    /**
     * Generate title page
     */
    generateTitlePage() {
        this.doc.addPage();
        
        // Title
        this.doc.fontSize(28)
           .font('Helvetica-Bold')
           .text('FORENSIC INVESTIGATION REPORT', { align: 'center' });
        
        this.doc.moveDown(3);
        
        // Case Information
        this.doc.fontSize(14)
           .font('Helvetica')
           .text(`Case ID: ${this.caseInfo.caseId || 'CASE-' + Date.now()}`, { align: 'center' });
        
        this.doc.moveDown(1);
        this.doc.text(`Date: ${new Date().toLocaleDateString()}`, { align: 'center' });
        
        this.doc.moveDown(1);
        this.doc.text(`Investigator: ${this.caseInfo.investigatorName || 'Forensic Analyst'}`, { align: 'center' });
        
        this.doc.moveDown(2);
        
        // Report Classification
        this.doc.fontSize(12)
           .font('Helvetica-Bold')
           .text('CLASSIFICATION: CONFIDENTIAL', { align: 'center' });
        
        this.doc.moveDown(1);
        this.doc.font('Helvetica')
           .text('This document contains sensitive forensic information', { align: 'center' });
        
        this.doc.addPage();
    }

    /**
     * Generate executive summary
     */
    generateExecutiveSummary() {
        this.doc.fontSize(18)
           .font('Helvetica-Bold')
           .text('EXECUTIVE SUMMARY', { underline: true });
        
        this.doc.moveDown(1);
        
        // Overview
        this.doc.fontSize(12)
           .font('Helvetica')
           .text(`This forensic investigation analyzed ${this.analysisResults.evidence.length} evidence files to identify patterns, anomalies, and potential security threats.`);
        
        this.doc.moveDown(1);
        
        // Key findings summary
        const criticalFindings = this.analysisResults.criticalFindings || [];
        const highSeverityAnomalies = this.analysisResults.anomalies?.filter(a => a.severity === 'high') || [];
        
        if (criticalFindings.length > 0 || highSeverityAnomalies.length > 0) {
            this.doc.font('Helvetica-Bold')
               .text('KEY RISKS IDENTIFIED:');
            
            this.doc.font('Helvetica');
            
            criticalFindings.forEach(finding => {
                this.doc.moveDown(0.5);
                this.doc.text(`• ${finding.description}`, { indent: 10 });
            });
            
            highSeverityAnomalies.forEach(anomaly => {
                this.doc.moveDown(0.5);
                this.doc.text(`• ${anomaly.description}`, { indent: 10 });
            });
        }
        
        this.doc.moveDown(2);
    }

    /**
     * Generate evidence summary
     */
    generateEvidenceSummary() {
        this.doc.fontSize(18)
           .font('Helvetica-Bold')
           .text('EVIDENCE SUMMARY', { underline: true });
        
        this.doc.moveDown(1);
        
        // Evidence table header
        const tableTop = this.doc.y;
        const itemHeight = 25;
        const tableWidth = 500;
        
        // Table headers
        this.doc.font('Helvetica-Bold');
        this.doc.text('File Name', 50, tableTop);
        this.doc.text('Type', 250, tableTop);
        this.doc.text('Size', 350, tableTop);
        this.doc.text('Key Findings', 420, tableTop);
        
        // Table data
        this.doc.font('Helvetica');
        let currentY = tableTop + itemHeight;
        
        this.analysisResults.evidence.forEach(evidence => {
            if (currentY > 700) {
                this.doc.addPage();
                currentY = 50;
            }
            
            const fileName = evidence.fileName.length > 25 ? 
                evidence.fileName.substring(0, 22) + '...' : evidence.fileName;
            
            this.doc.text(fileName, 50, currentY);
            this.doc.text(evidence.fileType.toUpperCase(), 250, currentY);
            this.doc.text(this.formatFileSize(evidence.size), 350, currentY);
            
            // Key findings based on analysis
            let keyFindings = 'Standard';
            if (evidence.parsedContent?.statistics?.errorCount > 0) {
                keyFindings = `${evidence.parsedContent.statistics.errorCount} errors`;
            } else if (evidence.parsedContent?.statistics?.suspiciousMessages > 0) {
                keyFindings = `${evidence.parsedContent.statistics.suspiciousMessages} suspicious`;
            }
            
            this.doc.text(keyFindings, 420, currentY);
            currentY += itemHeight;
        });
        
        this.doc.moveDown(2);
    }

    /**
     * Generate detailed analysis section
     */
    generateDetailedAnalysis() {
        this.doc.fontSize(18)
           .font('Helvetica-Bold')
           .text('DETAILED ANALYSIS', { underline: true });
        
        this.doc.moveDown(1);
        
        this.analysisResults.evidence.forEach((evidence, index) => {
            if (this.doc.y > 650) {
                this.doc.addPage();
            }
            
            this.doc.fontSize(14)
               .font('Helvetica-Bold')
               .text(`Evidence ${index + 1}: ${evidence.fileName}`);
            
            this.doc.moveDown(0.5);
            
            // File metadata
            this.doc.fontSize(11)
               .font('Helvetica')
               .text(`Type: ${evidence.fileType.toUpperCase()}`);
            this.doc.text(`Size: ${this.formatFileSize(evidence.size)}`);
            this.doc.text(`Upload Time: ${new Date(evidence.uploadTime).toLocaleString()}`);
            
            this.doc.moveDown(0.5);
            
            // Extracted data summary
            if (evidence.parsedContent?.statistics) {
                const stats = evidence.parsedContent.statistics;
                this.doc.font('Helvetica-Bold')
                   .text('Data Extracted:');
                
                this.doc.font('Helvetica');
                Object.entries(stats).forEach(([key, value]) => {
                    if (typeof value === 'number') {
                        this.doc.text(`• ${this.formatStatName(key)}: ${value}`, { indent: 10 });
                    }
                });
            }
            
            // Observed patterns
            const relatedPatterns = this.analysisResults.patterns?.filter(p => 
                p.description.toLowerCase().includes(evidence.fileName.toLowerCase())
            ) || [];
            
            if (relatedPatterns.length > 0) {
                this.doc.moveDown(0.5);
                this.doc.font('Helvetica-Bold')
                   .text('Observed Patterns:');
                
                this.doc.font('Helvetica');
                relatedPatterns.forEach(pattern => {
                    this.doc.text(`• ${pattern.description}`, { indent: 10 });
                });
            }
            
            // Detected anomalies
            const relatedAnomalies = this.analysisResults.anomalies?.filter(a => 
                a.evidence === evidence.fileName || 
                a.description.toLowerCase().includes(evidence.fileName.toLowerCase())
            ) || [];
            
            if (relatedAnomalies.length > 0) {
                this.doc.moveDown(0.5);
                this.doc.font('Helvetica-Bold')
                   .text('Detected Anomalies:');
                
                this.doc.font('Helvetica');
                relatedAnomalies.forEach(anomaly => {
                    this.doc.text(`• ${anomaly.description}`, { indent: 10 });
                });
            }
            
            this.doc.moveDown(1.5);
        });
    }

    /**
     * Generate critical findings section
     */
    generateCriticalFindings() {
        this.doc.fontSize(18)
           .font('Helvetica-Bold')
           .text('CRITICAL FINDINGS', { underline: true });
        
        this.doc.moveDown(1);
        
        const criticalFindings = this.analysisResults.criticalFindings || [];
        const highSeverityAnomalies = this.analysisResults.anomalies?.filter(a => a.severity === 'high') || [];
        const allCritical = [...criticalFindings, ...highSeverityAnomalies];
        
        if (allCritical.length === 0) {
            this.doc.fontSize(12)
               .font('Helvetica')
               .text('No critical findings detected in the evidence analysis.');
            return;
        }
        
        allCritical.forEach((finding, index) => {
            if (this.doc.y > 650) {
                this.doc.addPage();
            }
            
            // Severity indicator
            const severity = finding.severity || 'high';
            this.doc.fontSize(12)
               .font('Helvetica-Bold')
               .text(`${index + 1}. ${finding.description}`);
            
            // Severity badge
            this.doc.fillColor(severity === 'critical' ? 'red' : 'orange')
               .text(`[${severity.toUpperCase()}]`, { align: 'right' });
            this.doc.fillColor('black');
            
            this.doc.moveDown(0.5);
            
            // Additional details if available
            if (finding.data) {
                this.doc.fontSize(10)
                   .font('Helvetica')
                   .text('Details:', { indent: 10 });
                
                Object.entries(finding.data).forEach(([key, value]) => {
                    this.doc.text(`• ${key}: ${value}`, { indent: 20 });
                });
            }
            
            this.doc.moveDown(1);
        });
    }

    /**
     * Generate AI insights section
     */
    generateAIInsights() {
        this.doc.fontSize(18)
           .font('Helvetica-Bold')
           .text('AI INSIGHTS', { underline: true });
        
        this.doc.moveDown(1);
        
        const insights = this.analysisResults.insights || [];
        
        if (insights.length === 0) {
            this.doc.fontSize(12)
               .font('Helvetica')
               .text('No specific AI insights generated from the evidence.');
            return;
        }
        
        // Behavioral patterns
        const behavioralInsights = insights.filter(i => i.type === 'behavioral');
        if (behavioralInsights.length > 0) {
            this.doc.fontSize(14)
               .font('Helvetica-Bold')
               .text('Behavioral Patterns:');
            
            this.doc.fontSize(11)
               .font('Helvetica');
            
            behavioralInsights.forEach(insight => {
                this.doc.moveDown(0.5);
                this.doc.text(`• ${insight.description}`, { indent: 10 });
                
                if (insight.recommendation) {
                    this.doc.text(`  Recommendation: ${insight.recommendation}`, { indent: 20 });
                }
            });
            
            this.doc.moveDown(1);
        }
        
        // Security insights
        const securityInsights = insights.filter(i => i.type === 'security');
        if (securityInsights.length > 0) {
            this.doc.fontSize(14)
               .font('Helvetica-Bold')
               .text('Security Analysis:');
            
            this.doc.fontSize(11)
               .font('Helvetica');
            
            securityInsights.forEach(insight => {
                this.doc.moveDown(0.5);
                this.doc.text(`• ${insight.description}`, { indent: 10 });
                
                if (insight.recommendation) {
                    this.doc.text(`  Recommendation: ${insight.recommendation}`, { indent: 20 });
                }
            });
            
            this.doc.moveDown(1);
        }
        
        // Correlations
        const correlations = this.analysisResults.correlations || [];
        if (correlations.length > 0) {
            this.doc.fontSize(14)
               .font('Helvetica-Bold')
               .text('Data Correlations:');
            
            this.doc.fontSize(11)
               .font('Helvetica');
            
            correlations.forEach(correlation => {
                this.doc.moveDown(0.5);
                this.doc.text(`• ${correlation.description}`, { indent: 10 });
                this.doc.text(`  Significance: ${correlation.significance}`, { indent: 20 });
            });
        }
        
        this.doc.moveDown(1.5);
    }

    /**
     * Generate final conclusion
     */
    generateFinalConclusion() {
        this.doc.fontSize(18)
           .font('Helvetica-Bold')
           .text('FINAL CONCLUSION', { underline: true });
        
        this.doc.moveDown(1);
        
        this.doc.fontSize(12)
           .font('Helvetica');
        
        // Generate conclusion based on analysis
        const totalEvidence = this.analysisResults.evidence.length;
        const criticalFindings = this.analysisResults.criticalFindings?.length || 0;
        const highSeverityAnomalies = this.analysisResults.anomalies?.filter(a => a.severity === 'high').length || 0;
        const totalAnomalies = this.analysisResults.anomalies?.length || 0;
        
        let conclusion = `Based on the forensic analysis of ${totalEvidence} evidence files, `;
        
        if (criticalFindings > 0 || highSeverityAnomalies > 0) {
            conclusion += `${criticalFindings + highSeverityAnomalies} critical security issues were identified requiring immediate attention. `;
            conclusion += `The evidence suggests potential security threats that warrant further investigation and immediate remediation.`;
        } else if (totalAnomalies > 0) {
            conclusion += `${totalAnomalies} anomalies were detected that should be reviewed for potential security implications. `;
            conclusion += `While no critical threats were identified, the detected patterns suggest areas that may require monitoring.`;
        } else {
            conclusion += `no critical security threats were identified. The analyzed evidence shows normal operational patterns `;
            conclusion += `with no significant anomalies or suspicious activities detected.`;
        }
        
        this.doc.text(conclusion);
        
        this.doc.moveDown(1);
        
        // Professional disclaimer
        this.doc.font('Helvetica-Oblique')
           .text('This conclusion is based solely on the provided evidence and automated analysis. '
                 + 'Additional investigation may be required for complete forensic assessment.');
        
        this.doc.moveDown(2);
    }

    /**
     * Generate signature section
     */
    generateSignatureSection() {
        // Move to bottom of page or new page if needed
        if (this.doc.y > 600) {
            this.doc.addPage();
        } else {
            this.doc.moveDown(3);
        }
        
        // Signature line
        this.doc.moveTo(50, this.doc.y)
           .lineTo(250, this.doc.y)
           .stroke();
        
        this.doc.moveTo(350, this.doc.y)
           .lineTo(550, this.doc.y)
           .stroke();
        
        // Signature labels
        this.doc.fontSize(11)
           .font('Helvetica')
           .text('Legal Advisor:', 50, this.doc.y + 5);
        this.doc.text('Forensic Investigator:', 350, this.doc.y + 5);
        
        this.doc.moveDown(3);
        
        // Date and case reference
        this.doc.fontSize(10)
           .font('Helvetica-Oblique')
           .text(`Report generated on: ${new Date().toLocaleString()}`);
        this.doc.text(`Case Reference: ${this.caseInfo.caseId || 'CASE-' + Date.now()}`);
        this.doc.text(`Page ${this.doc.page._pageNumber} of ${this.doc.page._pageNumber}`);
    }

    /**
     * Helper function to format file size
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Helper function to format statistic names
     */
    formatStatName(statName) {
        return statName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    }
}

module.exports = ForensicReportGenerator;
