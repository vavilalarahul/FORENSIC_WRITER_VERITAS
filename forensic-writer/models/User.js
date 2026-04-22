const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["admin", "investigator", "legal_advisor"],
    required: true
  },
  isVerified: { type: Boolean, default: false }
});

// Use existing model or create new one
const User = mongoose.models.User || mongoose.model("User", userSchema);

module.exports = User;
