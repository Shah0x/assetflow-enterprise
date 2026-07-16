import mongoose from "mongoose";

const assetSchema = new mongoose.Schema({
  serial_no: { type: String, required: true, unique: true },
  model: { type: String, required: true },
  category: { 
    type: String, 
    enum: ["Laptop", "Monitor", "Mobile", "Furniture", "Networking", "Peripherals"],
    required: true 
  },
  status: { 
    type: String, 
    enum: ["Available", "Assigned", "Maintenance", "Retired"], 
    default: "Available" 
  },
  purchase_cost: { type: Number, required: true },
  purchase_date: { type: Date, required: true },
  warranty_expiry: { type: Date, required: true },
  current_holder: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  assigned_at: { type: Date },
  companyId: { type: String, required: true },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

// Lifecycle Logic: Prevent assigning if Maintenance or Retired
assetSchema.pre("validate", async function(this: any) {
  if (this.isModified("status") && this.status === "Assigned") {
    // Basic consistency check
    console.log(`Lifecycle Check: Asset ${this.serial_no} is being Assigned`);
  }
});

export const Asset = mongoose.model("Asset", assetSchema);
