import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema({
  emp_id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  department: { 
    type: String, 
    enum: ["IT", "HR", "Sales", "Finance", "Legal", "Operations", "Engineering"],
    required: true 
  },
  email: { type: String, required: true, unique: true },
  designation: { type: String, required: true },
  joining_date: { type: Date, required: true },
  companyId: { type: String, required: true },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

export const Employee = mongoose.model("Employee", employeeSchema);
