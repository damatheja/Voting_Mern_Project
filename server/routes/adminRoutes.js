const express = require('express');
const router = express.Router();
const {
  verifyAdmin,
  getDashboardStats,
  getAllVoters,
  getVoterById,
  verifyVoter,
  rejectVoter,
  toggleVoterStatus,
  getAllElectionsAdmin,
  adminLogin,
} = require('../controllers/adminController');

// Admin login
router.post('/login', adminLogin);

// All routes below are admin protected
router.use(verifyAdmin);

// Dashboard stats
router.get('/dashboard', getDashboardStats);

// Voter management
router.get('/voters',              getAllVoters);
router.get('/voters/:id',          getVoterById);
router.patch('/voters/:id/verify', verifyVoter);
router.delete('/voters/:id/reject',rejectVoter);
router.patch('/voters/:id/toggle', toggleVoterStatus);

// Election overview
router.get('/elections', getAllElectionsAdmin);

module.exports = router;