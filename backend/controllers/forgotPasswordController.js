const bcrypt = require("bcryptjs");
const User = require("../models/User");

/* ======================================================
   STEP 1: CHECK EMAIL & RETURN SECURITY QUESTION
====================================================== */
exports.checkEmail = async (req, res) => {
  try {
    const email = String(req.body.email || "").toLowerCase();

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ where: { email } });

    if (!user || !user.securityQuestion) {
      return res.status(404).json({
        message: "No account found or security question not set",
      });
    }

    return res.status(200).json({
      securityQuestion: user.securityQuestion,
      username: user.username || "",
    });
  } catch (err) {
    console.error("CHECK EMAIL ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   STEP 2: VERIFY SECURITY ANSWER
====================================================== */
exports.verifySecurityAnswer = async (req, res) => {
  try {
    const { email, securityAnswer } = req.body;

    if (!email || !securityAnswer) {
      return res.status(400).json({
        message: "Email and security answer are required",
      });
    }

    const user = await User.findOne({
      where: { email: email.toLowerCase() },
    });

    if (!user || !user.securityAnswerHash) {
      return res.status(401).json({
        message: "Invalid security answer",
      });
    }

    const isMatch = await bcrypt.compare(
      securityAnswer,
      user.securityAnswerHash
    );

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid security answer",
      });
    }

    return res.status(200).json({
      message: "Security answer verified",
    });
  } catch (err) {
    console.error("VERIFY ANSWER ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   STEP 3: UPDATE USERNAME (OPTIONAL)
====================================================== */
exports.updateUsername = async (req, res) => {
  try {
    const { email, newUsername } = req.body;

    if (!email || !newUsername) {
      return res.status(400).json({
        message: "Email and new username are required",
      });
    }

    const existing = await User.findOne({
      where: { username: newUsername },
    });

    if (existing) {
      return res.status(409).json({
        message: "Username already taken",
      });
    }

    await User.update(
      { username: newUsername },
      { where: { email: email.toLowerCase() } }
    );

    return res.status(200).json({
      message: "Username updated successfully",
    });
  } catch (err) {
    console.error("UPDATE USERNAME ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   STEP 4: RESET PASSWORD
====================================================== */
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    if (!email || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.update(
      { password: hashedPassword },
      { where: { email: email.toLowerCase() } }
    );

    return res.status(200).json({
      message: "Password reset successful",
    });
  } catch (err) {
    console.error("RESET PASSWORD ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
