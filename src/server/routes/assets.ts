import express from "express";
import { Asset } from "../models/Asset.ts";
import { authMiddleware, AuthRequest } from "../middleware/auth.ts";

const router = express.Router();

// Get all assets
router.get("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { category, status, search } = req.query;
    const query: any = { companyId: req.user.companyId, isDeleted: false };

    if (category) query.category = category;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { model: { $regex: search, $options: "i" } },
        { serial_no: { $regex: search, $options: "i" } }
      ];
    }

    const assets = await Asset.find(query).populate("current_holder", "name email emp_id");
    res.json(assets);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Create asset
router.post("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const assetData = { ...req.body, companyId: req.user.companyId };
    const asset = new Asset(assetData);
    await asset.save();
    res.status(201).json(asset);
  } catch (error: any) {
    res.status(400).json({ message: error.message || "Error creating asset" });
  }
});

// Update asset
router.patch("/:id", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const updateData = { ...req.body };
    const currentAsset = await Asset.findOne({ _id: req.params.id, companyId: req.user.companyId });
    if (!currentAsset) return res.status(404).json({ message: "Asset not found" });

    // Handle Assignment Metadata
    if (updateData.status === "Assigned" && currentAsset.status !== "Assigned") {
      updateData.assigned_at = new Date();
    } else if (updateData.status === "Available" && currentAsset.status === "Assigned") {
      updateData.assigned_at = null;
      updateData.current_holder = null;
    }

    const asset = await Asset.findOneAndUpdate(
      { _id: req.params.id, companyId: req.user.companyId },
      updateData,
      { new: true, runValidators: true }
    );

    res.json(asset);
  } catch (error: any) {
    res.status(400).json({ message: error.message || "Error updating asset" });
  }
});

export default router;
