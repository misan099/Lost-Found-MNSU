const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

/* ======================================================
   LOGIN (USER + ADMIN via EMAIL)
====================================================== */
exports.login = async (req, res) => {
  try {
    const email = String(req.body.email || "").toLowerCase();
    const password = String(req.body.password || "");

    //  console.log("LOGIN BODY:", { email, password });

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    // console.log("PASSWORD MATCH:", isMatch);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

/* ======================================================
   SIGNUP (Normal users only)
====================================================== */
exports.signup = async (req, res) => {
  try {
    const {
      fullname,
      email,
      password,
      confirmPassword,
      securityQuestion,
      securityAnswer,
    } = req.body;

    if (!fullname || !email || !password) {
      return res.status(400).json({
        message: "Full name, email, and password are required",
      });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match",
      });
    }

    const normalizedEmail = email.toLowerCase();

    const exists = await User.findOne({
      where: { email: normalizedEmail },
    });

    if (exists) {
      return res.status(409).json({
        message: "Email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const securityHash = securityAnswer
      ? await bcrypt.hash(securityAnswer, 10)
      : null;

    const user = await User.create({
      name: fullname,
      email: normalizedEmail, // 🔴 FIXED
      password: hashedPassword,
      role: "user",
      securityQuestion: securityQuestion || null,
      securityAnswerHash: securityHash,
    });

    const token = generateToken(user.id); // 🔴 FIXED

    return res.status(201).json({
      message: "Signup successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({
      message: "Server error",
    });
  }
};
