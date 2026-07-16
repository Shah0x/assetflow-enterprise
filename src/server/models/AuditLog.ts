import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  entityType: { type: String, required: true }, // "Asset", "User", etc.
  entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  details: { type: mongoose.Schema.Types.Mixed },
  companyId: { type: String, required: true },
}, { timestamps: true });

export const AuditLog = mongoose.model("AuditLog", auditLogSchema);
