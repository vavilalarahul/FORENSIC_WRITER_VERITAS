import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    Download, FileText, Calendar, Search, Filter, Trash2, 
    FolderOpen, Shield, CheckCircle, Clock, TrendingUp
} from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const ReportVault = () => {
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('date');
    const [filterBy, setFilterBy] = useState('all');

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const response = await axios.get(`${API_URL}/report-vault`);
            setReports(response.data.reports || []);
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (report) => {
        try {
            const response = await axios.get(`${API_URL}/report-vault/download/${report._id}`, {
                responseType: 'blob'
            });

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.download = report.fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download error:', error);
            alert('Failed to download report');
        }
    };

    const handleDelete = async (reportId) => {
        if (!confirm('Are you sure you want to delete this report from vault?')) {
            return;
        }

        try {
            await axios.delete(`${API_URL}/report-vault/${reportId}`);
            setReports(prev => prev.filter(r => r._id !== reportId));
        } catch (error) {
            console.error('Delete error:', error);
            alert('Failed to delete report');
        }
    };

    const filteredReports = reports
        .filter(report => {
            const matchesSearch = report.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                 report.caseName?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFilter = filterBy === 'all' || report.caseId === filterBy;
            return matchesSearch && matchesFilter;
        })
        .sort((a, b) => {
            if (sortBy === 'date') {
                return new Date(b.createdAt) - new Date(a.createdAt);
            } else if (sortBy === 'name') {
                return a.fileName.localeCompare(b.fileName);
            } else if (sortBy === 'case') {
                return (a.caseId || '').localeCompare(b.caseId || '');
            }
            return 0;
        });

    const StatCard = ({ title, value, icon: Icon, color }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-100 dark:bg-gray-800/60 backdrop-blur-md border border-gray-300 dark:border-gray-700 p-6 rounded-2xl flex items-center gap-4"
        >
            <div className={`p-3 rounded-xl ${color} bg-opacity-20`}>
                <Icon className="w-6 h-6 text-black dark:text-white" />
            </div>
            <div>
                <p className="text-gray-400 text-sm font-medium">{title}</p>
                <p className="text-black dark:text-white text-2xl font-bold">{value}</p>
            </div>
        </motion.div>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400 text-sm">Loading report vault...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <Shield className="text-blue-400" size={32} />
                        <div>
                            <h1 className="text-3xl font-bold text-black dark:text-white">Report Vault</h1>
                            <p className="text-gray-400">Secure storage for your generated reports</p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <StatCard 
                            title="Total Reports" 
                            value={reports.length} 
                            icon={FileText} 
                            color="bg-blue-500" 
                        />
                        <StatCard 
                            title="Storage Used" 
                            value={`${Math.round(reports.reduce((acc, r) => acc + (r.fileSize || 0), 0) / 1024 / 1024)} MB`} 
                            icon={TrendingUp} 
                            color="bg-green-500" 
                        />
                        <StatCard 
                            title="This Month" 
                            value={reports.filter(r => new Date(r.createdAt).getMonth() === new Date().getMonth()).length} 
                            icon={Calendar} 
                            color="bg-purple-500" 
                        />
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search reports..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-gray-800/60 border border-gray-300 dark:border-gray-700 rounded-xl text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-4 py-2 bg-gray-100 dark:bg-gray-800/60 border border-gray-300 dark:border-gray-700 rounded-xl text-black dark:text-white focus:outline-none focus:border-blue-500 transition-all"
                        >
                            <option value="date">Sort by Date</option>
                            <option value="name">Sort by Name</option>
                            <option value="case">Sort by Case</option>
                        </select>
                        <select
                            value={filterBy}
                            onChange={(e) => setFilterBy(e.target.value)}
                            className="px-4 py-2 bg-gray-100 dark:bg-gray-800/60 border border-gray-300 dark:border-gray-700 rounded-xl text-black dark:text-white focus:outline-none focus:border-blue-500 transition-all"
                        >
                            <option value="all">All Reports</option>
                            {Array.from(new Set(reports.map(r => r.caseId))).map(caseId => (
                                <option key={caseId} value={caseId}>Case {caseId}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </motion.div>

            {/* Reports Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredReports.map((report, index) => (
                    <motion.div
                        key={report._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gray-100 dark:bg-gray-800/60 backdrop-blur-md border border-gray-300 dark:border-gray-700 rounded-2xl p-6 hover:border-gray-400 dark:hover:border-gray-600 transition-all duration-300"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <FileText className="text-blue-400" size={20} />
                                <div>
                                    <h3 className="text-black dark:text-white font-semibold text-lg">{report.fileName}</h3>
                                    <p className="text-gray-400 text-sm">
                                        {report.caseName ? `Case: ${report.caseName}` : 'System Generated'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleDownload(report)}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center gap-2 transition-colors"
                                >
                                    <Download size={16} />
                                    Download
                                </button>
                                <button
                                    onClick={() => handleDelete(report._id)}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg flex items-center gap-2 transition-colors"
                                >
                                    <Trash2 size={16} />
                                    Delete
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-400">
                            <Clock size={14} />
                            <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-400">
                            <CheckCircle size={14} />
                            <span>Size: {report.fileSize ? `${(report.fileSize / 1024).toFixed(2)} KB` : 'Unknown'}</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Empty State */}
            {filteredReports.length === 0 && !loading && (
                <div className="text-center py-20">
                    <FolderOpen className="text-gray-400 mx-auto mb-4" size={48} />
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No Reports Found</h3>
                    <p className="text-gray-400">
                        {searchTerm ? 'No reports match your search criteria.' : 'Your report vault is empty.'}
                    </p>
                </div>
            )}
        </div>
    );
};

export default ReportVault;
