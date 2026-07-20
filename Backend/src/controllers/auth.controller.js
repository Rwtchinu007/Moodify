const userModel = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const blacklistModel = require("../models/blacklist.model");
const redis = require("../config/cache");

const isProduction = process.env.NODE_ENV === "production";
const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  maxAge: 24 * 60 * 60 * 1000,
};

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

  res.cookie("token", token, cookieOptions);

  return res.status(201).json({ message: "User registered successfully",user });
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

  res.cookie("token", token, cookieOptions);

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
  
  res.clearCookie("token", cookieOptions);

  await redis.set(token, Date.now().toString(), "EX", 3600); 

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