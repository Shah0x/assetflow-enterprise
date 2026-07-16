import mongoose from "mongoose";

const allocationHistorySchema = new mongoose.Schema({
  asset_id: { type: mongoose.Schema.Types.ObjectId, ref: "Asset", required: true },
  employee_id: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  issue_date: { type: Date, required: true },
  return_date: { type: Date },
  condition: { type: String, required: true },
  companyId: { type: String, required: true }
}, { timestamps: true });

// Validation: Return date must be after issue date
allocationHistorySchema.pre("validate", async function(this: any) {
  if (this.return_date && this.return_date <= this.issue_date) {
    throw new Error("Validation Failed: Return Date must be after the Issue Date.");
  }
  if (this.issue_date > new Date()) {
    throw new Error("Validation Failed: Issue Date cannot be in the future.");
  }
});

export const AllocationHistory = mongoose.model("AllocationHistory", allocationHistorySchema);
