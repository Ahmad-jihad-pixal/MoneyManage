import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../prisma.js";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// receive email + password
//         ↓
// find user in database by email
//         ↓
// bcrypt.compare(password, user.hashedPassword)
//         ↓
// if user not found OR wrong password → return 401 (same message, avoids leaking which emails exist)
//         ↓
// create JWT token with jwt.sign()
//         ↓
// send token back
router.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Same response whether the user doesn't exist or the password is wrong,
    // so an attacker can't use this endpoint to discover valid emails.
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ error: "Failed to log in" });
  }
});

export default router;
