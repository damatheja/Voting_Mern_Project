const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
  registerVoter,
  loginVoter,
  getVoterProfile,
  updateVoterProfile
} = require('../controllers/voterController');

// Register — accepts profileImage + idProof uploads
router.post(
  '/register',
  upload.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'idProof', maxCount: 1 }
  ]),
  registerVoter
);

// Login with Voter ID
router.post('/login', loginVoter);

// Get profile
router.get('/profile/:voterId', getVoterProfile);

// Update profile
router.put(
  '/profile/:voterId',
  upload.fields([{ name: 'profileImage', maxCount: 1 }]),
  updateVoterProfile
);

module.exports = router;