const Election = require('../models/Election');
const Vote = require('../models/Vote');
const path = require('path');

// ─── CREATE ELECTION ─────────────────────────────────────────────────────────
const createElection = async (req, res) => {
  try {
    const { title, description, candidates, startDate, endDate, adminSecret } = req.body;

    // Admin check
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ message: '❌ Unauthorized - Invalid admin secret' });
    }

    if (!title || !startDate || !endDate) {
      return res.status(400).json({ message: 'Title, startDate and endDate are required' });
    }

    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({ message: 'endDate must be after startDate' });
    }

    // Parse candidates (comes as JSON string from form-data)
    let parsedCandidates = [];
    if (candidates) {
      parsedCandidates = typeof candidates === 'string'
        ? JSON.parse(candidates)
        : candidates;
    }

    // Attach candidate images if uploaded
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        const index = parseInt(file.fieldname.replace('candidateImage_', ''));
        if (parsedCandidates[index]) {
          parsedCandidates[index].image = file.path;
        }
      });
    }

    const election = new Election({
      title,
      description,
      candidates: parsedCandidates,
      startDate,
      endDate,
      createdBy: 'admin',
    });

    await election.save();

    res.status(201).json({
      message: '✅ Election created successfully',
      election,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── GET ALL ELECTIONS ────────────────────────────────────────────────────────
const getAllElections = async (req, res) => {
  try {
    const now = new Date();

    // Auto update isActive based on dates
    await Election.updateMany(
      { endDate: { $lt: now } },
      { $set: { isActive: false } }
    );

    const elections = await Election.find().sort({ createdAt: -1 });

    // Add status label to each election
    const enriched = elections.map((e) => ({
      ...e.toObject(),
      status:
        now < new Date(e.startDate) ? 'Upcoming' :
        now > new Date(e.endDate)   ? 'Ended' :
                                      'Active',
    }));

    res.status(200).json({ total: elections.length, elections: enriched });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── GET SINGLE ELECTION ──────────────────────────────────────────────────────
const getElectionById = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) return res.status(404).json({ message: 'Election not found' });

    const now = new Date();
    const status =
      now < new Date(election.startDate) ? 'Upcoming' :
      now > new Date(election.endDate)   ? 'Ended' :
                                           'Active';

    res.status(200).json({ election: { ...election.toObject(), status } });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── UPDATE ELECTION ──────────────────────────────────────────────────────────
const updateElection = async (req, res) => {
  try {
    const { adminSecret, title, description, startDate, endDate, isActive } = req.body;

    if (adminSecret !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ message: '❌ Unauthorized - Invalid admin secret' });
    }

    const election = await Election.findById(req.params.id);
    if (!election) return res.status(404).json({ message: 'Election not found' });

    if (title)       election.title = title;
    if (description) election.description = description;
    if (startDate)   election.startDate = startDate;
    if (endDate)     election.endDate = endDate;
    if (isActive !== undefined) election.isActive = isActive;

    await election.save();

    res.status(200).json({ message: '✅ Election updated', election });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── ADD CANDIDATE TO ELECTION ────────────────────────────────────────────────
const addCandidate = async (req, res) => {
  try {
    const { adminSecret, name, party, description } = req.body;

    if (adminSecret !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ message: '❌ Unauthorized' });
    }

    const election = await Election.findById(req.params.id);
    if (!election) return res.status(404).json({ message: 'Election not found' });

    const image = req.file?.path || null;

    election.candidates.push({ name, party, description, image });
    await election.save();

    res.status(200).json({ message: '✅ Candidate added', candidates: election.candidates });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── REMOVE CANDIDATE ─────────────────────────────────────────────────────────
const removeCandidate = async (req, res) => {
  try {
    const { adminSecret } = req.body;

    if (adminSecret !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ message: '❌ Unauthorized' });
    }

    const election = await Election.findById(req.params.id);
    if (!election) return res.status(404).json({ message: 'Election not found' });

    election.candidates = election.candidates.filter(
      (c) => c._id.toString() !== req.params.candidateId
    );

    await election.save();

    res.status(200).json({ message: '✅ Candidate removed', candidates: election.candidates });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── DELETE ELECTION ──────────────────────────────────────────────────────────
const deleteElection = async (req, res) => {
  try {
    const { adminSecret } = req.body;

    if (adminSecret !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ message: '❌ Unauthorized' });
    }

    const election = await Election.findByIdAndDelete(req.params.id);
    if (!election) return res.status(404).json({ message: 'Election not found' });

    // Delete all votes for this election too
    await Vote.deleteMany({ electionId: req.params.id });

    res.status(200).json({ message: '✅ Election and related votes deleted' });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  createElection,
  getAllElections,
  getElectionById,
  updateElection,
  addCandidate,
  removeCandidate,
  deleteElection,
};