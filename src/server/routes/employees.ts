import express from "express";
import mongoose from "mongoose";
import { Employee } from "../models/Employee.ts";
import { authMiddleware, AuthRequest } from "../middleware/auth.ts";

const router = express.Router();

router.get("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const employees = await Employee.find({ 
      companyId: req.user.companyId, 
      isDeleted: false 
    }).lean();

    const Asset = mongoose.model("Asset"); // Avoid circular require or just use model
    
    const enriched = await Promise.all(employees.map(async emp => {
      const assetCount = await Asset.countDocuments({ current_holder: emp._id, isDeleted: false });
      return { ...emp, assetCount };
    }));

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

router.post("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const employeeData = { ...req.body, companyId: req.user.companyId };
    const employee = new Employee(employeeData);
    await employee.save();
    res.status(201).json(employee);
  } catch (error: any) {
    res.status(400).json({ message: error.message || "Error creating employee" });
  }
});

export default router;
