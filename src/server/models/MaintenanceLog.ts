import mongoose from "mongoose";

const maintenanceLogSchema = new mongoose.Schema({
  asset_id: { type: mongoose.Schema.Types.ObjectId, ref: "Asset", required: true },
  issue_type: { type: String, required: true },
  priority: { 
    type: String, 
    enum: ["Critical", "High", "Medium", "Low"],
    required: true 
  },
  description: { type: String, required: true },
  status: { 
    type: String, 
    enum: ["Open", "In-Progress", "Fixed"],
    default: "Open"
  },
  reported_at: { type: Date, default: Date.now },
  companyId: { type: String, required: true }
}, { timestamps: true });

export const MaintenanceLog = mongoose.model("MaintenanceLog", maintenanceLogSchema);
