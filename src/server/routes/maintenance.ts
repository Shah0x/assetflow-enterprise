import express from "express";
import { MaintenanceLog } from "../models/MaintenanceLog.ts";
import { authMiddleware, AuthRequest } from "../middleware/auth.ts";

const router = express.Router();

// Get all maintenance tickets (Complaints)
router.get("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const logs = await MaintenanceLog.find({ 
      companyId: req.user.companyId 
    })
    .populate("asset_id", "model serial_no")
    .sort({ createdAt: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Create ticket
router.post("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const log = new MaintenanceLog({ ...req.body, companyId: req.user.companyId });
    await log.save();
    res.status(201).json(log);
  } catch (error: any) {
    res.status(400).json({ message: error.message || "Error creating ticket" });
  }
});

// Update ticket status
router.patch("/:id", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const log = await MaintenanceLog.findOneAndUpdate(
      { _id: req.params.id, companyId: req.user.companyId },
      req.body,
      { new: true }
    );
    res.json(log);
  } catch (error: any) {
    res.status(400).json({ message: error.message || "Error updating ticket" });
  }
});

export default router;
