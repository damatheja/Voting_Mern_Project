const express = require('express');
const router = express.Router();
const {
  castVote,
  getResults,
  checkVoteStatus,
  getVoterHistory,
} = require('../controllers/voteController');

// Cast a vote
router.post('/', castVote);

// Real-time results for an election
router.get('/results/:electionId', getResults);

// Check if voter already voted in an election
router.get('/check/:voterId/:electionId', checkVoteStatus);

// Full voting history of a voter
router.get('/history/:voterId', getVoterHistory);

module.exports = router;