const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  voterId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Voter', required: true },
  electionId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Election', required: true },
  candidateId: { type: mongoose.Schema.Types.ObjectId, required: true },
  timestamp:   { type: Date, default: Date.now },
});

// ✅ Prevent double voting
voteSchema.index({ voterId: 1, electionId: 1 }, { unique: true });

module.exports = mongoose.model('Vote', voteSchema);