import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FileText, 
    Upload, 
    AlertCircle, 
    CheckCircle, 
    Clock, 
    Download, 
    Eye,
    Shield,
    Brain,
    Search,
    Activity,
    FileWarning,
    TrendingUp,
    Users,
    Calendar,
    BarChart3
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
    canAccessAI,
    canGenerateReports,
    canDownloadReports,
    getRoleDisplayName
} from '../utils/rbac';

const ForensicReportGenerator = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [cases, setCases] = useState([]);
    const [selectedCase, setSelectedCase] = useState(null);
    const [investigatorName, setInvestigatorName] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);
    const [reports, setReports] = useState([]);
    const [showAnalysis, setShowAnalysis] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [userRole, setUserRole] = useState('');

  useEffect(() => {
    fetchCases();
    fetchReports();
    if (user?.role) {
      setUserRole(getRoleDisplayName(user.role));
    }
  }, [user]);

  const fetchCases = async () => {
    try {
      const response = await axios.get('/api/cases');
      setCases((response.data || []).filter(c => c.evidence && c.evidence.length > 0));
    } catch (error) {
      console.error('Error fetching cases:', error);
      setError('Failed to load cases');
      setCases([]);
    }
  };

  const fetchReports = async () => {
    try {
      const response = await axios.get('/api/reports');
      setReports(response.data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setReports([]);
    }
  };

  const generateReport = async () => {
    if (!selectedCase) {
      setError('Please select a case with evidence files');
      return;
    }

    if (!investigatorName.trim()) {
      setError('Please enter investigator name');
      return;
    }

    // Check if user has permission to generate reports
    if (!canGenerateReports(user)) {
      setError('Access Denied: You do not have permission to generate forensic reports.');
      return;
    }

    setIsGenerating(true);
    setError('');
    setSuccess('');
    setGenerationProgress(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      const response = await axios.post('/api/reports/generate', {
        caseId: selectedCase._id,
        caseName: selectedCase.caseName,
        investigatorName: investigatorName || 'Forensic Analyst'
      });

      clearInterval(progressInterval);
      setGenerationProgress(100);

      setSuccess('AI-powered forensic report generated successfully!');
      fetchReports();
      
      // Reset form
      setSelectedCase(null);
      setInvestigatorName('');
      setGenerationProgress(0);

    } catch (error) {
      console.error('Error generating report:', error);
      setError(error.response?.data?.message || 'Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadReport = async (reportId, fileName) => {
    try {
      const response = await axios.get(`/api/reports/${reportId}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading report:', error);
      setError('Failed to download report');
    }
  };

  const viewAnalysis = async (reportId) => {
    try {
      const response = await axios.get(`/api/reports/${reportId}/analysis`);
      setShowAnalysis(response.data);
    } catch (error) {
      console.error('Error fetching analysis:', error);
      setError('Failed to load analysis details');
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="w-full h-full p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <Brain className="w-12 h-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">AI-Powered Forensic Report Generator</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Advanced AI analysis of evidence to generate comprehensive, data-driven forensic reports with pattern detection and anomaly identification.
          </p>
        </motion.div>

        {/* Error and Success Messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center"
            >
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <span className="text-red-700">{error}</span>
            </motion.div>
          )}
          
          {success && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center"
            >
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-green-700">{success}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Report Generation Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <div className="flex items-center mb-6">
            <FileText className="w-6 h-6 text-blue-600 mr-2" />
            <h2 className="text-2xl font-semibold text-gray-900">Generate New Report</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Case Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Case with Evidence
              </label>
              <select
                value={selectedCase?._id || ''}
                onChange={(e) => {
                  const case_ = cases.find(c => c._id === e.target.value);
                  setSelectedCase(case_);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isGenerating}
              >
                <option value="">Choose a case...</option>
                {cases.map(case_ => (
                  <option key={case_._id} value={case_._id}>
                    {case_.caseName} ({case_.evidence?.length || 0} evidence files)
                  </option>
                ))}
              </select>
            </div>

            {/* Investigator Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Investigator Name
              </label>
              <input
                type="text"
                value={investigatorName}
                onChange={(e) => setInvestigatorName(e.target.value)}
                placeholder="Enter investigator name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isGenerating}
              />
            </div>
          </div>

          {/* Case Details */}
          {selectedCase && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-6 p-4 bg-blue-50 rounded-lg"
            >
              <h3 className="font-semibold text-gray-900 mb-2">Case Details</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Case ID:</span>
                  <p className="font-medium">{selectedCase.caseId}</p>
                </div>
                <div>
                  <span className="text-gray-600">Evidence Files:</span>
                  <p className="font-medium">{selectedCase.evidence?.length || 0}</p>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <p className="font-medium">{selectedCase.status}</p>
                </div>
                <div>
                  <span className="text-gray-600">Created:</span>
                  <p className="font-medium">{new Date(selectedCase.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Generate Button */}
          <div className="mt-6">
            <button
              onClick={generateReport}
              disabled={!selectedCase || isGenerating}
              className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isGenerating ? (
                <span className="flex items-center justify-center">
                  <Clock className="w-5 h-5 mr-2 animate-spin" />
                  Generating Report...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <Brain className="w-5 h-5 mr-2" />
                  Generate AI-Powered Report
                </span>
              )}
            </button>
          </div>

          {/* Progress Bar */}
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Analysis Progress</span>
                <span className="text-sm font-medium">{generationProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className="bg-blue-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${generationProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <div className="mt-2 text-sm text-gray-500">
                {generationProgress < 30 && 'Analyzing evidence files...'}
                {generationProgress >= 30 && generationProgress < 60 && 'Detecting patterns and anomalies...'}
                {generationProgress >= 60 && generationProgress < 90 && 'Generating insights and correlations...'}
                {generationProgress >= 90 && 'Creating professional PDF report...'}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Existing Reports */}
        {reports.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <FileText className="w-6 h-6 text-blue-600 mr-2" />
                <h2 className="text-2xl font-semibold text-gray-900">Generated Reports</h2>
              </div>
              <span className="text-sm text-gray-500">{reports.length} reports</span>
            </div>

            <div className="space-y-4">
              {reports.map((report) => (
                <motion.div
                  key={report._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{report.caseName}</h3>
                      <p className="text-sm text-gray-600 mt-1">{report.summary}</p>
                      
                      <div className="flex items-center mt-3 space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(report.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <BarChart3 className="w-4 h-4 mr-1" />
                          {report.confidence}% confidence
                        </div>
                        <div className="flex items-center">
                          <Shield className="w-4 h-4 mr-1" />
                          {report.anomalies} anomalies
                        </div>
                      </div>

                      {/* Analysis Summary */}
                      {report.analysisResults && (
                        <div className="mt-3 grid grid-cols-2 md:grid-cols-5 gap-2">
                          <div className="text-center p-2 bg-blue-50 rounded">
                            <div className="text-lg font-semibold text-blue-600">
                              {report.analysisResults.evidence?.length || 0}
                            </div>
                            <div className="text-xs text-gray-600">Evidence</div>
                          </div>
                          <div className="text-center p-2 bg-green-50 rounded">
                            <div className="text-lg font-semibold text-green-600">
                              {report.analysisResults.patterns?.length || 0}
                            </div>
                            <div className="text-xs text-gray-600">Patterns</div>
                          </div>
                          <div className="text-center p-2 bg-yellow-50 rounded">
                            <div className="text-lg font-semibold text-yellow-600">
                              {report.analysisResults.anomalies?.length || 0}
                            </div>
                            <div className="text-xs text-gray-600">Anomalies</div>
                          </div>
                          <div className="text-center p-2 bg-red-50 rounded">
                            <div className="text-lg font-semibold text-red-600">
                              {report.analysisResults.criticalFindings?.length || 0}
                            </div>
                            <div className="text-xs text-gray-600">Critical</div>
                          </div>
                          <div className="text-center p-2 bg-purple-50 rounded">
                            <div className="text-lg font-semibold text-purple-600">
                              {report.analysisResults.insights?.length || 0}
                            </div>
                            <div className="text-xs text-gray-600">Insights</div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => viewAnalysis(report._id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Analysis"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => downloadReport(report._id, `Forensic-Report-${report.caseName}-${report.reportId}.pdf`)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Download PDF"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Analysis Modal */}
        <AnimatePresence>
          {showAnalysis && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setShowAnalysis(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Analysis Details</h2>
                  <button
                    onClick={() => setShowAnalysis(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <AlertCircle className="w-5 h-5" />
                  </button>
                </div>

                {showAnalysis.analysis && (
                  <div className="space-y-6">
                    {/* Critical Findings */}
                    {showAnalysis.analysis.criticalFindings?.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-red-600 mb-3 flex items-center">
                          <FileWarning className="w-5 h-5 mr-2" />
                          Critical Findings
                        </h3>
                        <div className="space-y-2">
                          {showAnalysis.analysis.criticalFindings.map((finding, index) => (
                            <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                              <p className="font-medium text-red-800">{finding.description}</p>
                              <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${getSeverityColor(finding.severity)}`}>
                                {finding.severity?.toUpperCase()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Patterns */}
                    {showAnalysis.analysis.patterns?.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-blue-600 mb-3 flex items-center">
                          <Activity className="w-5 h-5 mr-2" />
                          Detected Patterns
                        </h3>
                        <div className="space-y-2">
                          {showAnalysis.analysis.patterns.map((pattern, index) => (
                            <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                              <p className="font-medium text-blue-800">{pattern.description}</p>
                              <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${getSeverityColor(pattern.severity)}`}>
                                {pattern.severity?.toUpperCase()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Insights */}
                    {showAnalysis.analysis.insights?.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-purple-600 mb-3 flex items-center">
                          <Brain className="w-5 h-5 mr-2" />
                          AI Insights
                        </h3>
                        <div className="space-y-2">
                          {showAnalysis.analysis.insights.map((insight, index) => (
                            <div key={index} className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                              <p className="font-medium text-purple-800">{insight.description}</p>
                              {insight.recommendation && (
                                <p className="text-sm text-purple-600 mt-2">
                                  Recommendation: {insight.recommendation}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ForensicReportGenerator;
