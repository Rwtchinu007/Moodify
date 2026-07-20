const songModel = require("../models/song.model");
const storageService = require("../services/storage.service");
const id3 = require("node-id3");
const fs = require("fs");
const path = require("path");

async function uploadSong(req, res) {
  const songBuffer = req.file?.buffer;
  const { mood } = req.body;

  if (!songBuffer) {
    return res.status(400).json({
      message: "Song file is required.",
    });
  }

  const tags = id3.read(songBuffer) || {};
  const fallbackTitle = path.parse(req.file.originalname || "song").name;
  const title = tags.title || fallbackTitle;
  const fallbackPosterPath = path.join(
    __dirname,
    "..",
    "..",
    "public",
    "cover for song.jpg",
  );
  const posterBuffer =
    tags.image?.imageBuffer || fs.readFileSync(fallbackPosterPath);

  const [songFile, posterFile] = await Promise.all([
    storageService.uploadFile({
      buffer: songBuffer,
      filename: title + ".mp3",
      folder: "/cohort-2/moodify/songs",
    }),
    storageService.uploadFile({
      buffer: posterBuffer,
      filename: title + ".jpeg",
      folder: "/cohort-2/moodify/posters",
    }),
  ]);

  const song = await songModel.create({
    title,
    url: songFile.url,
    posterUrl: posterFile.url,
    mood,
  });

  res.status(201).json({
    message: "song created successfully",
    song,
  });
}

async function getSong(req, res) {
  const { mood } = req.query;

  try {
    // 1. Match the mood and randomly sample up to 10 songs for the playlist
    const randomSongs = await songModel.aggregate([
      { $match: { mood: mood } },
      { $sample: { size: 10 } }, // FIX: Increased from 1 to 10
    ]);

    // 2. Check if we found anything
    if (randomSongs.length === 0) {
      return res.status(404).json({
        message: "No songs found for this mood.",
      });
    }

    // 3. Send both the single song (for the player) and the full array (for the playlist UI)
    res.status(200).json({
      message: "Playlist fetched successfully.",
      song: randomSongs[0], // Keeps your existing player working
      songs: randomSongs, // Feeds data to your new right-column playlist
    });
  } catch (error) {
    console.error("Error fetching random songs:", error);
    res.status(500).json({
      message: "Internal server error while fetching playlist.",
    });
  }
}
module.exports = { uploadSong, getSong };
