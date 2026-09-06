const Voter = require('../models/Voter');
const Election = require('../models/Election');
const Vote = require('../models/Vote');

// ─── ADMIN AUTH MIDDLEWARE (simple secret check) ───────────────────────────────
const verifyAdmin = (req, res, next) => {
  const secret = req.headers['admin-secret'] || req.body.adminSecret;
  if (secret !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ message: '❌ Unauthorized - Invalid admin secret' });
  }
  next();
};

// ─── DASHBOARD STATS ──────────────────────────────────────────────────────────
const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();

    const [
      totalVoters,
      verifiedVoters,
      pendingVoters,
      deactivatedVoters,
      totalElections,
      activeElections,
      upcomingElections,
      endedElections,
      totalVotes,
    ] = await Promise.all([
      Voter.countDocuments(),
      Voter.countDocuments({ isVerified: true }),
      Voter.countDocuments({ isVerified: false }),
      Voter.countDocuments({ isActive: false }),
      Election.countDocuments(),
      Election.countDocuments({ startDate: { $lte: now }, endDate: { $gte: now }, isActive: true }),
      Election.countDocuments({ startDate: { $gt: now } }),
      Election.countDocuments({ endDate: { $lt: now } }),
      Vote.countDocuments(),
    ]);

    // Most voted election
    const mostVoted = await Vote.aggregate([
      { $group: { _id: '$electionId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);

    let mostVotedElection = null;
    if (mostVoted.length > 0) {
      const elec = await Election.findById(mostVoted[0]._id).select('title');
      mostVotedElection = { title: elec?.title, voteCount: mostVoted[0].count };
    }

    // Recent 5 votes
    const recentVotes = await Vote.find()
      .sort({ timestamp: -1 })
      .limit(5)
      .populate('voterId', 'name voterId')
      .populate('electionId', 'title');

    res.status(200).json({
      stats: {
        voters: {
          total:       totalVoters,
          verified:    verifiedVoters,
          pending:     pendingVoters,
          deactivated: deactivatedVoters,
        },
        elections: {
          total:    totalElections,
          active:   activeElections,
          upcoming: upcomingElections,
          ended:    endedElections,
        },
        totalVotes,
        mostVotedElection,
      },
      recentVotes,
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── GET ALL VOTERS ───────────────────────────────────────────────────────────
const getAllVoters = async (req, res) => {
  try {
    const { status, page = 1, limit = 10, search } = req.query;

    const query = {};

    // Filter by status
    if (status === 'verified')    query.isVerified = true;
    if (status === 'pending')     query.isVerified = false;
    if (status === 'deactivated') query.isActive = false;

    // Search by name, email, voterId
    if (search) {
      query.$or = [
        { name:    { $regex: search, $options: 'i' } },
        { email:   { $regex: search, $options: 'i' } },
        { voterId: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const total = await Voter.countDocuments(query);

    const voters = await Voter.find(query)
      .select('-__v')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      total,
      page:       parseInt(page),
      totalPages: Math.ceil(total / limit),
      voters,
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── GET SINGLE VOTER ─────────────────────────────────────────────────────────
const getVoterById = async (req, res) => {
  try {
    const voter = await Voter.findById(req.params.id)
      .select('-__v')
      .populate('hasVoted', 'title startDate endDate');

    if (!voter) return res.status(404).json({ message: 'Voter not found' });

    // Get vote history
    const votes = await Vote.find({ voterId: voter._id })
      .populate('electionId', 'title')
      .sort({ timestamp: -1 });

    res.status(200).json({ voter, voteHistory: votes });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── VERIFY VOTER ─────────────────────────────────────────────────────────────
const verifyVoter = async (req, res) => {
  try {
    const voter = await Voter.findById(req.params.id);
    if (!voter) return res.status(404).json({ message: 'Voter not found' });

    if (voter.isVerified) {
      return res.status(400).json({ message: 'Voter is already verified' });
    }

    voter.isVerified = true;
    await voter.save();

    res.status(200).json({
      message: `✅ Voter "${voter.name}" has been verified`,
      voter,
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── REJECT / DELETE VOTER ────────────────────────────────────────────────────
const rejectVoter = async (req, res) => {
  try {
    const voter = await Voter.findById(req.params.id);
    if (!voter) return res.status(404).json({ message: 'Voter not found' });

    if (voter.isVerified) {
      return res.status(400).json({ message: '❌ Cannot reject an already verified voter. Deactivate instead.' });
    }

    await Voter.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: `🗑️ Voter "${voter.name}" registration rejected and removed` });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── TOGGLE VOTER ACTIVE STATUS ───────────────────────────────────────────────
const toggleVoterStatus = async (req, res) => {
  try {
    const voter = await Voter.findById(req.params.id);
    if (!voter) return res.status(404).json({ message: 'Voter not found' });

    voter.isActive = !voter.isActive;
    await voter.save();

    res.status(200).json({
      message: voter.isActive
        ? `✅ Voter "${voter.name}" has been activated`
        : `🚫 Voter "${voter.name}" has been deactivated`,
      isActive: voter.isActive,
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── GET ALL ELECTIONS WITH VOTE COUNTS ───────────────────────────────────────
const getAllElectionsAdmin = async (req, res) => {
  try {
    const elections = await Election.find().sort({ createdAt: -1 });
    const now = new Date();

    const enriched = await Promise.all(elections.map(async (election) => {
      const totalVotes = await Vote.countDocuments({ electionId: election._id });

      // Vote count per candidate
      const voteCounts = await Vote.aggregate([
        { $match: { electionId: election._id } },
        { $group: { _id: '$candidateId', count: { $sum: 1 } } },
      ]);

      const candidates = election.candidates.map((c) => {
        const found = voteCounts.find(v => v._id.toString() === c._id.toString());
        return {
          ...c.toObject(),
          voteCount:  found ? found.count : 0,
          percentage: totalVotes > 0
            ? ((( found?.count || 0) / totalVotes) * 100).toFixed(2) + '%'
            : '0.00%',
        };
      });

      return {
        ...election.toObject(),
        totalVotes,
        candidates,
        status:
          now < new Date(election.startDate) ? 'Upcoming' :
          now > new Date(election.endDate)   ? 'Ended'    : 'Active',
      };
    }));

    res.status(200).json({ total: elections.length, elections: enriched });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── ADMIN LOGIN ──────────────────────────────────────────────────────────────
const adminLogin = async (req, res) => {
  try {
    const { adminSecret } = req.body;

    if (adminSecret !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ message: '❌ Invalid admin secret' });
    }

    res.status(200).json({
      message: '✅ Admin login successful',
      role:    'admin',
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  verifyAdmin,
  getDashboardStats,
  getAllVoters,
  getVoterById,
  verifyVoter,
  rejectVoter,
  toggleVoterStatus,
  getAllElectionsAdmin,
  adminLogin,
};