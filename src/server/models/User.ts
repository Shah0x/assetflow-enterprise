import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ["super_admin", "admin", "manager", "employee"], 
    default: "employee" 
  },
  department: { type: String },
  companyId: { type: String, required: true }, // For multi-tenancy
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

userSchema.pre("save", async function(this: any) {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

export const User = mongoose.model("User", userSchema);
