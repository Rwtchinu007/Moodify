const express = require("express");
const upload = require("../middlewares/upload.middleware");
const router = express.Router();
const songController = require("../controllers/song.controller");

/**
 * POST /api/songs/
 */
router.post("/", upload.single("song"), songController.uploadSong);
router.get("/", songController.getSong);
module.exports = router;
 