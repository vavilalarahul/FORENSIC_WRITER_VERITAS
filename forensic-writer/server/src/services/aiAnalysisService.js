const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

/**
 * AI Forensic Analysis Service
 * Realistic file processing with hash generation, anomaly detection, and report generation
 */

class AIAnalysisService {
    constructor() {
        this.suspiciousKeywords = [
            'failed',
            'unauthorized',
            'attack',
            'error',
            'breach',
            'malicious',
            'suspicious',
            'hack',
            'exploit',
            'injection',
            'denied',
            'forbidden',
            'exception',
            'critical',
            'fatal',
            'alert',
            'warning'
        ];
    }

    /**
     * Generate SHA-256 hash of file buffer
     */
    generateHash(buffer) {
        return crypto.createHash('sha256').update(buffer).digest('hex');
    }

    /**
     * Detect file type from extension and content
     */
    detectFileType(fileName, mimeType) {
        const ext = path.extname(fileName).toLowerCase();
        const typeMap = {
            '.txt': 'text',
            '.log': 'text',
            '.csv': 'csv',
            '.json': 'json',
            '.pdf': 'pdf',
            '.doc': 'document',
            '.docx': 'document',
            '.mp3': 'audio',
            '.wav': 'audio',
            '.png': 'image',
            '.jpg': 'image',
            '.jpeg': 'image'
        };
        
        return typeMap[ext] || 'binary';
    }

    /**
     * Extract content from file based on type
     */
    async extractContent(filePath, fileType) {
        try {
            if (!fs.existsSync(filePath)) {
                return { content: '', error: 'File not found' };
            }

            const buffer = fs.readFileSync(filePath);
            const hash = this.generateHash(buffer);

            let content = '';
            
            switch (fileType) {
                case 'text':
                case 'log':
                case 'csv':
                case 'json':
                    content = buffer.toString('utf-8');
                    break;
                case 'pdf':
                case 'document':
                case 'audio':
                case 'image':
                    content = `[${fileType.toUpperCase()} FILE] Binary data - Hash: ${hash.substring(0, 16)}...`;
                    break;
                default:
                    content = '[BINARY FILE] Content not displayable';
            }

            return { content, hash, size: buffer.length };
        } catch (error) {
            console.error('Content extraction error:', error);
            return { content: '', error: error.message };
        }
    }

    /**
     * Detect anomalies in text content
     */
    detectAnomalies(content, fileType) {
        const anomalies = [];
        const contentLower = content.toLowerCase();

        // Keyword-based detection
        this.suspiciousKeywords.forEach(keyword => {
            const regex = new RegExp(keyword, 'gi');
            const matches = content.match(regex);
            if (matches) {
                const severity = this.getSeverity(keyword, matches.length);
                anomalies.push({
                    type: 'Keyword Detection',
                    keyword: keyword,
                    count: matches.length,
                    severity: severity,
                    description: `Found ${matches.length} occurrence(s) of suspicious keyword "${keyword}"`
                });
            }
        });

        // IP address detection
        const ipRegex = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
        const ips = content.match(ipRegex);
        if (ips && ips.length > 0) {
            const uniqueIps = [...new Set(ips)];
            if (uniqueIps.length > 5) {
                anomalies.push({
                    type: 'Network Activity',
                    count: uniqueIps.length,
                    severity: 'MEDIUM',
                    description: `Detected ${uniqueIps.length} unique IP addresses in the file`
                });
            }
        }

        // Timestamp anomaly detection
        const timestampRegex = /\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4}/g;
        const timestamps = content.match(timestampRegex);
        if (timestamps && timestamps.length > 0) {
            anomalies.push({
                type: 'Temporal Analysis',
                count: timestamps.length,
                severity: 'LOW',
                description: `Found ${timestamps.length} timestamp entries`
            });
        }

        // File size anomaly
        if (content.length > 1000000) {
            anomalies.push({
                type: 'File Size',
                size: content.length,
                severity: 'MEDIUM',
                description: `Large file detected (${(content.length / 1024).toFixed(2)} KB)`
            });
        }

        return anomalies;
    }

    /**
     * Determine severity based on keyword and count
     */
    getSeverity(keyword, count) {
        const highSeverityKeywords = ['attack', 'breach', 'hack', 'exploit', 'injection'];
        
        if (highSeverityKeywords.includes(keyword.toLowerCase()) || count > 5) {
            return 'HIGH';
        } else if (count > 2) {
            return 'MEDIUM';
        }
        return 'LOW';
    }

    /**
     * Calculate confidence score based on anomalies
     */
    calculateConfidence(anomalies) {
        if (anomalies.length === 0) {
            return 95.0; // High confidence if no anomalies
        }

        const highSeverityCount = anomalies.filter(a => a.severity === 'HIGH').length;
        const mediumSeverityCount = anomalies.filter(a => a.severity === 'MEDIUM').length;
        const lowSeverityCount = anomalies.filter(a => a.severity === 'LOW').length;

        // Base confidence decreases with more high-severity anomalies
        let confidence = 95.0;
        confidence -= (highSeverityCount * 15);
        confidence -= (mediumSeverityCount * 5);
        confidence -= (lowSeverityCount * 2);

        return Math.max(50.0, Math.min(99.9, confidence));
    }

    /**
     * Main analysis pipeline with progress callback
     */
    async analyzeFiles(evidenceFiles, onProgress) {
        const results = {
            files: [],
            totalAnomalies: [],
            overallConfidence: 0,
            processingTime: 0,
            startTime: Date.now()
        };

        try {
            for (let i = 0; i < evidenceFiles.length; i++) {
                const file = evidenceFiles[i];
                const progress = Math.round(((i + 1) / evidenceFiles.length) * 100);
                
                if (onProgress) {
                    onProgress({
                        stage: 'Processing',
                        file: file.fileName,
                        progress: progress,
                        message: `Analyzing ${file.fileName}...`
                    });
                }

                // Simulate processing time for realism
                await new Promise(resolve => setTimeout(resolve, 1500));

                // Extract content
                const fileType = this.detectFileType(file.fileName, file.fileType);
                let contentResult = { content: '', hash: '' };
                
                // Check if file has a real path or is just metadata
                if (file.filePath && fs.existsSync(file.filePath)) {
                    contentResult = await this.extractContent(file.filePath, fileType);
                } else {
                    // Generate hash from metadata if file doesn't exist
                    const dummyBuffer = Buffer.from(file.fileName + file.fileType);
                    contentResult = {
                        content: `[${fileType.toUpperCase()} FILE] ${file.fileName}`,
                        hash: this.generateHash(dummyBuffer),
                        size: file.fileSize || 0
                    };
                }

                // Detect anomalies
                const anomalies = this.detectAnomalies(contentResult.content, fileType);

                results.files.push({
                    fileName: file.fileName,
                    fileType: fileType,
                    fileSize: contentResult.size,
                    hash: contentResult.hash,
                    anomalies: anomalies,
                    confidence: this.calculateConfidence(anomalies),
                    processedAt: new Date().toISOString()
                });

                results.totalAnomalies.push(...anomalies);
            }

            // Calculate overall confidence
            results.overallConfidence = this.calculateConfidence(results.totalAnomalies);
            results.processingTime = ((Date.now() - results.startTime) / 1000).toFixed(2);

            if (onProgress) {
                onProgress({
                    stage: 'Complete',
                    progress: 100,
                    message: 'Analysis complete'
                });
            }

            return results;
        } catch (error) {
            console.error('Analysis error:', error);
            throw error;
        }
    }

    /**
     * Generate analysis summary
     */
    generateSummary(results) {
        const highSeverity = results.totalAnomalies.filter(a => a.severity === 'HIGH').length;
        const mediumSeverity = results.totalAnomalies.filter(a => a.severity === 'MEDIUM').length;
        const lowSeverity = results.totalAnomalies.filter(a => a.severity === 'LOW').length;

        return {
            totalFiles: results.files.length,
            totalAnomalies: results.totalAnomalies.length,
            severityBreakdown: {
                HIGH: highSeverity,
                MEDIUM: mediumSeverity,
                LOW: lowSeverity
            },
            overallConfidence: results.overallConfidence,
            processingTime: results.processingTime,
            riskLevel: highSeverity > 0 ? 'HIGH' : mediumSeverity > 2 ? 'MEDIUM' : 'LOW'
        };
    }
}

module.exports = new AIAnalysisService();
