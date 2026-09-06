const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
  createElection,
  getAllElections,
  getElectionById,
  updateElection,
  addCandidate,
  removeCandidate,
  deleteElection,
} = require('../controllers/electionController');

// Create election (with candidate images)
router.post('/', upload.any(), createElection);

// Get all elections
router.get('/', getAllElections);

// Get single election
router.get('/:id', getElectionById);

// Update election
router.put('/:id', updateElection);

// Add candidate to election
router.post('/:id/candidate', upload.single('candidateImage'), addCandidate);

// Remove candidate from election
router.delete('/:id/candidate/:candidateId', removeCandidate);

// Delete election
router.delete('/:id', deleteElection);

module.exports = router;