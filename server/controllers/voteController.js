const Vote = require('../models/Vote');
const Voter = require('../models/Voter');
const Election = require('../models/Election');

// ─── CAST VOTE ────────────────────────────────────────────────────────────────
const castVote = async (req, res) => {
  try {
    const { voterId, electionId, candidateId } = req.body;

    if (!voterId || !electionId || !candidateId) {
      return res.status(400).json({ message: 'voterId, electionId and candidateId are required' });
    }

    // ── 1. Validate voter ──
    const voter = await Voter.findOne({ voterId });
    if (!voter)           return res.status(404).json({ message: '❌ Invalid Voter ID' });
    if (!voter.isActive)  return res.status(403).json({ message: '❌ Your account is deactivated' });
    if (!voter.isVerified)return res.status(403).json({ message: '❌ Your account is not verified yet' });

    // ── 2. Validate election ──
    const election = await Election.findById(electionId);
    if (!election) return res.status(404).json({ message: '❌ Election not found' });

    const now = new Date();
    if (now < new Date(election.startDate)) {
      return res.status(400).json({ message: '❌ Election has not started yet' });
    }
    if (now > new Date(election.endDate)) {
      return res.status(400).json({ message: '❌ Election has already ended' });
    }
    if (!election.isActive) {
      return res.status(400).json({ message: '❌ Election is not active' });
    }

    // ── 3. Validate candidate ──
    const candidate = election.candidates.id(candidateId);
    if (!candidate) {
      return res.status(404).json({ message: '❌ Candidate not found in this election' });
    }

    // ── 4. Check double voting ──
    const alreadyVoted = await Vote.findOne({ voterId: voter._id, electionId });
    if (alreadyVoted) {
      return res.status(409).json({ message: '❌ You have already voted in this election' });
    }

    // ── 5. Save vote ──
    const vote = new Vote({
      voterId:     voter._id,
      electionId,
      candidateId,
    });
    await vote.save();

    // ── 6. Mark voter as voted for this election ──
    voter.hasVoted.push(electionId);
    await voter.save();

    res.status(201).json({
      message: '✅ Vote cast successfully!',
      vote: {
        election:  election.title,
        candidate: candidate.name,
        party:     candidate.party,
        timestamp: vote.timestamp,
      }
    });

  } catch (err) {
    // Duplicate key = double vote attempt
    if (err.code === 11000) {
      return res.status(409).json({ message: '❌ You have already voted in this election' });
    }
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── GET REAL-TIME RESULTS ────────────────────────────────────────────────────
const getResults = async (req, res) => {
  try {
    const { electionId } = req.params;

    const election = await Election.findById(electionId);
    if (!election) return res.status(404).json({ message: 'Election not found' });

    // Aggregate vote counts per candidate
    const voteCounts = await Vote.aggregate([
      { $match: { electionId: election._id } },
      { $group: { _id: '$candidateId', count: { $sum: 1 } } }
    ]);

    // Total votes
    const totalVotes = voteCounts.reduce((sum, v) => sum + v.count, 0);

    // Map results to candidates
    const results = election.candidates.map((candidate) => {
      const found = voteCounts.find(
        (v) => v._id.toString() === candidate._id.toString()
      );
      const count = found ? found.count : 0;
      const percentage = totalVotes > 0
        ? ((count / totalVotes) * 100).toFixed(2)
        : '0.00';

      return {
        candidateId:  candidate._id,
        name:         candidate.name,
        party:        candidate.party,
        image:        candidate.image,
        voteCount:    count,
        percentage:   `${percentage}%`,
      };
    });

    // Sort by vote count descending
    results.sort((a, b) => b.voteCount - a.voteCount);

    // Leading candidate
    const leader = results[0] || null;

    const now = new Date();
    const status =
      now < new Date(election.startDate) ? 'Upcoming' :
      now > new Date(election.endDate)   ? 'Ended'    : 'Active';

    res.status(200).json({
      election: {
        _id:         election._id,
        title:       election.title,
        description: election.description,
        startDate:   election.startDate,
        endDate:     election.endDate,
        status,
      },
      totalVotes,
      leader: leader
        ? { name: leader.name, party: leader.party, voteCount: leader.voteCount, percentage: leader.percentage }
        : null,
      results,
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── CHECK IF VOTER ALREADY VOTED ─────────────────────────────────────────────
const checkVoteStatus = async (req, res) => {
  try {
    const { voterId, electionId } = req.params;

    const voter = await Voter.findOne({ voterId });
    if (!voter) return res.status(404).json({ message: 'Voter not found' });

    const vote = await Vote.findOne({ voterId: voter._id, electionId });

    if (vote) {
      const election = await Election.findById(electionId);
      const candidate = election?.candidates.id(vote.candidateId);
      return res.status(200).json({
        hasVoted:  true,
        message:   '✅ You have already voted in this election',
        votedFor:  candidate ? { name: candidate.name, party: candidate.party } : null,
        timestamp: vote.timestamp,
      });
    }

    res.status(200).json({ hasVoted: false, message: 'You have not voted in this election yet' });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── GET ALL VOTES BY VOTER ───────────────────────────────────────────────────
const getVoterHistory = async (req, res) => {
  try {
    const { voterId } = req.params;

    const voter = await Voter.findOne({ voterId });
    if (!voter) return res.status(404).json({ message: 'Voter not found' });

    const votes = await Vote.find({ voterId: voter._id })
      .populate('electionId', 'title startDate endDate')
      .sort({ timestamp: -1 });

    const history = await Promise.all(votes.map(async (vote) => {
      const election = await Election.findById(vote.electionId);
      const candidate = election?.candidates.id(vote.candidateId);
      return {
        election:  vote.electionId,
        votedFor:  candidate ? { name: candidate.name, party: candidate.party } : null,
        timestamp: vote.timestamp,
      };
    }));

    res.status(200).json({ totalVotes: history.length, history });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { castVote, getResults, checkVoteStatus, getVoterHistory };