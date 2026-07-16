import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "../models/User.ts";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, companyId, role } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = new User({ name, email, password, companyId, role });
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`Login attempt for: ${email}`);
    
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`User not found: ${email}`);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (user.isDeleted) {
      console.log(`User is deleted: ${email}`);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`Password mismatch for: ${email}`);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, companyId: user.companyId },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

export default router;
