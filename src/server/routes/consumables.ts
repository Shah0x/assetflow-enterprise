import express from "express";
import { Consumable } from "../models/Consumable.ts";
import { authMiddleware, AuthRequest } from "../middleware/auth.ts";

const router = express.Router();

router.get("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const consumables = await Consumable.find({ companyId: req.user.companyId });
    res.json(consumables);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

router.post("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const consumable = new Consumable({ ...req.body, companyId: req.user.companyId });
    await consumable.save();
    res.status(201).json(consumable);
  } catch (error) {
    res.status(400).json({ message: "Error creating consumable", error });
  }
});

export default router;
