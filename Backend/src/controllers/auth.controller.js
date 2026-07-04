const userModel = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const blacklistModel = require("../models/blacklist.model");
const redis = require("../config/cache");

async function registerUser(req, res) {
  const { username, email, password } = req.body;

  const isAlreadyRegistered = await userModel.findOne({
    $or: [{ username }, { email }],
  });
  if (isAlreadyRegistered) {
    return res
      .status(400)
      .json({ message: "Username or email already exists" });
  }

  const hash = await bcrypt.hash(password, 10);
  const user = await userModel.create({ username, email, password: hash });
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  res.cookie("token", token);

  return res.status(201).json({ message: "User registered successfully" });
}

async function loginUser(req, res) {
  const { email, password, username } = req.body;
  const user = await userModel
    .findOne({ $or: [{ email }, { username }] })
    .select("+password");

  if (!user) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  res.cookie("token", token);

  return res.status(200).json({ message: "User logged in successfully", user });
}

async function getMe(req, res) {
  const user = await userModel.findById(req.user.id);
  res.status(200).json({
    message: "User fetched successfully",
    user,
  });
}

async function logoutUser(req, res) {
  const token = req.cookies.token;
  res.clearCookie("token");
  await redis.set(token, Date.now().toString(), "EX", 3600); // Set the token in Redis with an expiration time of 1 hour (3600 seconds)

  // redis stores data in key-value pairs, so you can use the token as the key and the timestamp as the value. You can also set an expiration time for the token in redis, so that it will be automatically removed from the blacklist after a certain period of time.

  res.status(200).json({
    message: "logout successfully",
  });
}

module.exports = {
  registerUser,
  loginUser,
  getMe,
  logoutUser,
};
