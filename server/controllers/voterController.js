const Voter = require('../models/Voter');
const { v4: uuidv4 } = require('uuid');

// ─── Generate Unique Voter ID ───────────────────────────────────────────────
const generateVoterId = () => {
  const part = uuidv4().replace(/-/g, '').substring(0, 8).toUpperCase();
  return `VOT-${part}`;
};

// ─── REGISTER ───────────────────────────────────────────────────────────────
const registerVoter = async (req, res) => {
  try {
    const {
      name, email, phone, dob, gender,
      street, city, state, pincode, country,
      idProofType, idProofNumber
    } = req.body;

    // Check duplicates
    const existingEmail = await Voter.findOne({ email });
    if (existingEmail) return res.status(400).json({ message: 'Email already registered' });

    const existingPhone = await Voter.findOne({ phone });
    if (existingPhone) return res.status(400).json({ message: 'Phone already registered' });

    const existingIdProof = await Voter.findOne({ idProofNumber });
    if (existingIdProof) return res.status(400).json({ message: 'ID Proof already registered' });

    // Image paths from multer
    const profileImage = req.files?.profileImage?.[0]?.path || null;
    const idProof      = req.files?.idProof?.[0]?.path || null;

    // Generate unique voter ID
    let voterId;
    let isUnique = false;
    while (!isUnique) {
      voterId = generateVoterId();
      const existing = await Voter.findOne({ voterId });
      if (!existing) isUnique = true;
    }

    const voter = new Voter({
      name, email, phone, dob, gender,
      address: { street, city, state, pincode, country: country || 'India' },
      idProofType, idProofNumber,
      profileImage,
      idProof,
      voterId,
    });

    await voter.save();

    res.status(201).json({
      message: '✅ Registration successful! Save your Voter ID.',
      voterId,
      name: voter.name,
      email: voter.email,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── LOGIN (using Voter ID) ──────────────────────────────────────────────────
const loginVoter = async (req, res) => {
  try {
    const { voterId } = req.body;

    if (!voterId) return res.status(400).json({ message: 'Voter ID is required' });

    const voter = await Voter.findOne({ voterId });

    if (!voter) return res.status(404).json({ message: 'Invalid Voter ID' });
    if (!voter.isActive) return res.status(403).json({ message: 'Your account has been deactivated' });
    if (!voter.isVerified) return res.status(403).json({ message: 'Your account is pending admin verification' });

    res.status(200).json({
      message: '✅ Login successful',
      voter: {
        _id:          voter._id,
        voterId:      voter.voterId,
        name:         voter.name,
        email:        voter.email,
        phone:        voter.phone,
        gender:       voter.gender,
        address:      voter.address,
        profileImage: voter.profileImage,
        isVerified:   voter.isVerified,
        hasVoted:     voter.hasVoted,
      }
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── GET PROFILE ─────────────────────────────────────────────────────────────
const getVoterProfile = async (req, res) => {
  try {
    const { voterId } = req.params;

    const voter = await Voter.findOne({ voterId })
      .select('-idProofNumber -__v')
      .populate('hasVoted', 'title startDate endDate');

    if (!voter) return res.status(404).json({ message: 'Voter not found' });

    res.status(200).json({ voter });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── UPDATE PROFILE ──────────────────────────────────────────────────────────
const updateVoterProfile = async (req, res) => {
  try {
    const { voterId } = req.params;
    const { street, city, state, pincode, country, phone } = req.body;

    const voter = await Voter.findOne({ voterId });
    if (!voter) return res.status(404).json({ message: 'Voter not found' });

    // Update allowed fields only
    if (phone)   voter.phone = phone;
    if (street)  voter.address.street = street;
    if (city)    voter.address.city = city;
    if (state)   voter.address.state = state;
    if (pincode) voter.address.pincode = pincode;
    if (country) voter.address.country = country;

    // Update profile image if uploaded
    if (req.files?.profileImage?.[0]?.path) {
      voter.profileImage = req.files.profileImage[0].path;
    }

    await voter.save();

    res.status(200).json({ message: '✅ Profile updated', voter });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { registerVoter, loginVoter, getVoterProfile, updateVoterProfile };