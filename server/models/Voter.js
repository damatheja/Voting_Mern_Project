const mongoose = require('mongoose');

const voterSchema = new mongoose.Schema({
  // Personal Info
  name:         { type: String, required: true, trim: true },
  email:        { type: String, required: true, unique: true, lowercase: true },
  phone:        { type: String, required: true, unique: true },
  dob:          { type: Date, required: true },
  gender:       { type: String, enum: ['Male', 'Female', 'Other'], required: true },

  // Address
  address: {
    street:  { type: String, required: true },
    city:    { type: String, required: true },
    state:   { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, default: 'India' },
  },

  // ID Proof
  idProofType:   { type: String, enum: ['Aadhaar', 'PAN', 'Passport', 'VoterID', 'DrivingLicense'], required: true },
  idProofNumber: { type: String, required: true, unique: true },
  idProof:       { type: String },   // file path

  // Profile Image
  profileImage:  { type: String },   // file path

  // Voter ID (auto-generated)
  voterId: { type: String, unique: true },

  // Voting tracking
  hasVoted: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Election' }],

  // Status
  isVerified: { type: Boolean, default: false },  // Admin verifies
  isActive:   { type: Boolean, default: true },

}, { timestamps: true });

module.exports = mongoose.model('Voter', voterSchema);