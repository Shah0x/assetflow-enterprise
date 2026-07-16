import express from "express";
import { License } from "../models/License.ts";
import { authMiddleware, AuthRequest } from "../middleware/auth.ts";

const router = express.Router();

router.get("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const licenses = await License.find({ companyId: req.user.companyId });
    res.json(licenses);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

router.post("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const license = new License({ ...req.body, companyId: req.user.companyId });
    await license.save();
    res.status(201).json(license);
  } catch (error) {
    res.status(400).json({ message: "Error creating license", error });
  }
});

export default router;
