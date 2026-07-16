import mongoose from "mongoose";

const licenseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  product_key: { type: String, required: true },
  manufacturer: { type: String, required: true },
  total_seats: { type: Number, required: true },
  available_seats: { type: Number, required: true },
  category: { type: String, default: "Software" },
  purchase_date: { type: Date },
  expiration_date: { type: Date },
  companyId: { type: String, required: true },
}, { timestamps: true });

export const License = mongoose.model("License", licenseSchema);
