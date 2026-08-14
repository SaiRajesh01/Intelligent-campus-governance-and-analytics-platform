// authController.js
const User = require("../models/User");
const Department = require("../models/Department");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    // Build user data — only allow "student" and "departmentHead" via
    // registration. "admin" accounts must be created manually in the DB.
    const allowedRoles = ["student", "departmentHead"];
    const effectiveRole = allowedRoles.includes(role) ? role : "student";

    const userData = {
      name,
      email,
      password: hashed,
      role: effectiveRole,
    };

    // If registering as departmentHead, link to a department
    if (effectiveRole === "departmentHead" && department) {
      userData.department = department;
    }

    const user = await User.create(userData);

    // If departmentHead, also set this user as the department head
    if (effectiveRole === "departmentHead" && department) {
      await Department.findByIdAndUpdate(department, { head: user._id });
    }

    // Populate department name before returning
    const populated = await User.findById(user._id)
      .select("-password")
      .populate("department", "name");

    res.status(201).json({
      user: populated,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).populate("department", "name");

    if (!user) return res.status(404).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid password" });

    // Strip password from response
    const userObj = user.toObject();
    delete userObj.password;

    res.json({
      user: userObj,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};