const mongoose = require('mongoose');

const reportVaultSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    caseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Case',
        required: false
    },
    caseName: {
        type: String,
        required: false
    },
    fileName: {
        type: String,
        required: true
    },
    fileSize: {
        type: Number,
        required: false,
        default: 0
    },
    filePath: {
        type: String,
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastAccessedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for efficient queries
reportVaultSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('ReportVault', reportVaultSchema);
