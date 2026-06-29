const mongoose = require("mongoose");
const blacklistSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: [true, "token in required for blacklisting."],
    },
  },
  {
    timestamps: true,
  },
);

const blacklistModel = mongoose.model("blacklist", blacklistSchema);

module.exports = blacklistModel;
