// authController.js - starter file
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const hashed = await bcrypt.hash(password, 10);
    const existingUser = await User.findOne({email})

    if(existingUser){
      return res.status(400).json({
        error: "User already exists"
      })
    }

    const user = await User.create({
      name,
      email,
      password: hashed
    });

    res.json({
      user,
      token: generateToken(user._id)
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {

  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) return res.status(404).json({ message: "User not found" });

  const match = await bcrypt.compare(password, user.password);

  if (!match) return res.status(401).json({ message: "Invalid password" });

  res.json({
    user,
    token: generateToken(user._id)
  });
};