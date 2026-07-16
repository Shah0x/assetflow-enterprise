import express from "express";
import { Asset } from "../models/Asset.ts";
import { MaintenanceLog } from "../models/MaintenanceLog.ts";
import { License } from "../models/License.ts";
import { Consumable } from "../models/Consumable.ts";
import { authMiddleware, AuthRequest } from "../middleware/auth.ts";

const router = express.Router();

router.get("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const companyId = req.user.companyId;

    // 1. Total Company Asset Value
    const assets = await Asset.find({ companyId, isDeleted: false });
    const totalValue = assets.reduce((sum, asset) => sum + (asset.purchase_cost || 0), 0);

    // 2. Asset Health %
    const totalCount = assets.length;
    const maintenanceCount = await MaintenanceLog.countDocuments({ companyId, status: { $ne: "Fixed" } });
    const brokenCount = assets.filter(a => a.status === "Maintenance").length;
    const functionalCount = totalCount - brokenCount;
    const healthPercent = totalCount > 0 ? (functionalCount / totalCount) * 100 : 100;

    // 3. Alert List: Warranty expiring in < 30 days
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const alerts = await Asset.find({
      companyId,
      isDeleted: false,
      warranty_expiry: { $lte: thirtyDaysFromNow, $gte: new Date() }
    }).select("model serial_no warranty_expiry");

    const totalLicenses = await License.countDocuments({ companyId });
    const totalConsumables = await Consumable.countDocuments({ companyId });
    const activeEmployeesCount = await Asset.distinct("current_holder", { companyId, current_holder: { $ne: null } });

    // 4. Category Breakdown
    const categories = ["Laptop", "Monitor", "Mobile", "Furniture", "Networking", "Peripherals"];
    const breakdown = await Promise.all(categories.map(async cat => ({
      name: cat,
      value: await Asset.countDocuments({ companyId, category: cat, isDeleted: false })
    })));

    res.json({
      totalValue,
      totalAssets: totalCount,
      healthPercent: Math.round(healthPercent),
      alerts,
      maintenanceTickets: maintenanceCount,
      totalLicenses,
      totalConsumables,
      totalEmployees: activeEmployeesCount.length,
      categoryBreakdown: breakdown.filter(b => b.value > 0)
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching dashboard stats", error });
  }
});

export default router;
