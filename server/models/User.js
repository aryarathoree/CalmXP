const mongoose = require("mongoose");

const JournalSchema = new mongoose.Schema({
  content: { type: String, required: true },
  date: { type: Date, default: Date.now }
}, { 
  timestamps: true // This adds createdAt and updatedAt automatically
});

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  lastCheckIn: { type: Date },
  checkIns: [{ type: Date }],
  journals: [JournalSchema],
});

module.exports = mongoose.model("User", UserSchema);
