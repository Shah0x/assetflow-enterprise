import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  companyId: { type: String, required: true },
  manager: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

export const Department = mongoose.model("Department", departmentSchema);
