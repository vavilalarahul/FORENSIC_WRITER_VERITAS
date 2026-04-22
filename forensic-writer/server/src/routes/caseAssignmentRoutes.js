const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/authRole');
const { respondToCaseAssignment, getCaseAssignments } = require('../controllers/caseAssignmentController');

// POST /api/case-assignments/respond - respond to case assignment (accept/decline)
router.post('/respond', protect, checkRole(['legal_advisor', 'forensic_investigator']), respondToCaseAssignment);

// GET /api/case-assignments - get pending assignments for user
router.get('/', protect, checkRole(['legal_advisor', 'forensic_investigator']), getCaseAssignments);

module.exports = router;
