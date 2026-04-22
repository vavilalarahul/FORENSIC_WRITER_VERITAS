import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
    ArrowLeft, CloudUpload, FileText, Image as ImageIcon, Database, 
    Phone, MessageSquare, CheckCircle, Loader2, X, Upload, File
} from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const UploadEvidence = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const fileInputRef = useRef(null);
    const { forensicCase } = location.state || {};

    const [files, setFiles] = useState([]);
    const [currentFiles, setCurrentFiles] = useState([]);
    const [cases, setCases] = useState([]);
    const [selectedCaseId, setSelectedCaseId] = useState('');
    const [loadingCases, setLoadingCases] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [isUploaded, setIsUploaded] = useState(false);
    const [error, setError] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [dragActive, setDragActive] = useState(false);

    useEffect(() => {
        if (!forensicCase) {
            const fetchCases = async () => {
                try {
                    setLoadingCases(true);
                    const token = localStorage.getItem('token') || localStorage.getItem('forensic-token');
                    const headers = token ? { Authorization: `Bearer ${token}` } : {};
                    const response = await axios.get(`${API_URL}/cases`, { headers });
                    setCases(response.data.cases || response.data || []);
                } catch (err) {
                    console.error('Failed to fetch cases', err);
                    setError('Failed to load available cases.');
                } finally {
                    setLoadingCases(false);
                }
            };
            fetchCases();
        }
    }, [forensicCase]);

    const fileTypes = [
        { name: 'Documents', icon: FileText, ext: 'PDF, DOCX', color: 'blue' },
        { name: 'Images', icon: ImageIcon, ext: 'JPG, PNG', color: 'green' },
        { name: 'System Logs', icon: Database, ext: 'EVTX, LOG', color: 'purple' },
        { name: 'Call Records', icon: Phone, ext: 'CSV, XLSX', color: 'yellow' },
        { name: 'Chat Files', icon: MessageSquare, ext: 'DB, SQLITE', color: 'red' }
    ];

    const handleFileSelect = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setCurrentFiles(selectedFiles);
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        const droppedFiles = Array.from(e.dataTransfer.files);
        setCurrentFiles(droppedFiles);
    };

    const handleUpload = async () => {
        const targetCaseId = forensicCase?._id || selectedCaseId;

        if (!targetCaseId) {
            setError('No case selected. Please select a case first.');
            return;
        }
        if (currentFiles.length === 0) {
            setError('Please select at least one file.');
            return;
        }

        setUploading(true);
        setError('');
        const formData = new FormData();
        currentFiles.forEach(file => {
            formData.append('evidence', file);
        });

        try {
            const token = localStorage.getItem('token') || localStorage.getItem('forensic-token');
            await axios.post(`${API_URL}/evidence/${targetCaseId}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                }
            });

            setIsUploaded(true);
            setTimeout(() => {
                navigate('/investigator');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const removeFile = (index) => {
        setCurrentFiles(prev => prev.filter((_, i) => i !== index));
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (fileName) => {
        const ext = fileName.split('.').pop().toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return ImageIcon;
        if (['pdf', 'doc', 'docx'].includes(ext)) return FileText;
        if (['csv', 'xlsx', 'xls'].includes(ext)) return Database;
        return File;
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors mb-4"
                >
                    <ArrowLeft size={18} />
                    Back
                </button>
                
                <div>
                    <h1 className="text-2xl font-bold text-black dark:text-white mb-1">Upload Evidence</h1>
                    {forensicCase ? (
                        <p className="text-sm text-gray-400">
                            Case: <span className="text-black dark:text-white font-medium">{forensicCase.caseName}</span>
                        </p>
                    ) : (
                        <div className="mt-2 text-sm text-gray-400">
                            {loadingCases ? (
                                <span>Loading cases...</span>
                            ) : (
                                <div className="flex flex-col gap-1">
                                    <label htmlFor="case-select">Select a Case for Upload</label>
                                    <select 
                                        id="case-select"
                                        className="w-full md:w-80 px-4 py-2 bg-white dark:bg-card border border-gray-300 dark:border-gray-800 rounded-lg text-black dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                                        value={selectedCaseId}
                                        onChange={(e) => {
                                            setSelectedCaseId(e.target.value);
                                            setError('');
                                        }}
                                    >
                                        <option value="">-- Choose Case --</option>
                                        {cases.map((c) => (
                                            <option key={c._id} value={c._id}>
                                                {c.caseId} - {c.caseName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Upload Area */}
                <div className="lg:col-span-2">
                    <div className="card p-8">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            multiple
                            style={{ display: 'none' }}
                        />

                        {/* Drop Zone */}
                        <div
                            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all ${
                                dragActive 
                                    ? 'border-blue-500 bg-blue-500/10' 
                                    : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
                            }`}
                            onClick={() => fileInputRef.current?.click()}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            {isUploaded ? (
                                <div className="space-y-4">
                                    <CheckCircle size={64} className="text-green-500 mx-auto" />
                                    <div>
                                        <h2 className="text-xl font-semibold text-black dark:text-white">Upload Complete</h2>
                                        <p className="text-gray-400">Evidence successfully processed and stored</p>
                                    </div>
                                </div>
                            ) : uploading ? (
                                <div className="space-y-4">
                                    <Loader2 size={64} className="text-blue-500 mx-auto animate-spin" />
                                    <div>
                                        <h2 className="text-xl font-semibold text-black dark:text-white">Uploading... {uploadProgress}%</h2>
                                        <p className="text-gray-400">Processing evidence files</p>
                                    </div>
                                    <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2">
                                        <div 
                                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${uploadProgress}%` }}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <CloudUpload size={64} className="text-gray-400 mx-auto" />
                                    <div>
                                        <h2 className="text-xl font-semibold text-white">
                                            {currentFiles.length > 0 
                                                ? `${currentFiles.length} file(s) selected` 
                                                : 'Drop evidence files here'
                                            }
                                        </h2>
                                        <p className="text-gray-400">
                                            {currentFiles.length > 0 
                                                ? 'Click to change selection' 
                                                : 'or click to browse files'
                                            }
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* File List */}
                        {currentFiles.length > 0 && !uploading && !isUploaded && (
                            <div className="mt-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-black dark:text-white">Selected Files</h3>
                                    <button 
                                        onClick={handleUpload}
                                        className="btn btn-primary flex items-center gap-2"
                                    >
                                        <Upload size={18} />
                                        Upload Evidence
                                    </button>
                                </div>
                                
                                <div className="space-y-2">
                                    {currentFiles.map((file, index) => {
                                        const Icon = getFileIcon(file.name);
                                        return (
                                            <div key={index} className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-800/50 rounded-lg">
                                                <Icon size={20} className="text-gray-400" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-black dark:text-white truncate">{file.name}</p>
                                                    <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                                                </div>
                                                <button
                                                    onClick={() => removeFile(index)}
                                                    className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                                {error}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Supported Formats */}
                    <div className="card p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Supported Formats</h3>
                        <div className="space-y-3">
                            {fileTypes.map((type, index) => {
                                const Icon = type.icon;
                                return (
                                    <div key={index} className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-lg bg-${type.color}-500/20 flex items-center justify-center`}>
                                            <Icon size={18} className={`text-${type.color}-400`} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white">{type.name}</p>
                                            <p className="text-xs text-gray-400">{type.ext}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Upload Guidelines */}
                    <div className="card p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Upload Guidelines</h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 flex-shrink-0" />
                                Files are automatically hashed and verified
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 flex-shrink-0" />
                                Maximum file size: 100MB per file
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 flex-shrink-0" />
                                All files are encrypted during transmission
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 flex-shrink-0" />
                                Metadata is preserved for forensic analysis
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UploadEvidence;
