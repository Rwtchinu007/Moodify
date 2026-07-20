const mongoose = require("mongoose");

const songSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  posterUrl: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  mood: {
    type: String,
    enum: {
      // FIX: Added "neutral" to support the new frontend logic
      values: ["sad", "happy", "surprised", "neutral"], 
      message: "{VALUE} is not a supported mood",
    },
  },
});

const songModel = mongoose.model("songs", songSchema);

module.exports = songModel;