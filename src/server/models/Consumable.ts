import mongoose from "mongoose";

const consumableSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true }, // e.g. Ink, Toner, Paper
  manufacturer: { type: String },
  qty: { type: Number, required: true, default: 0 },
  min_amt: { type: Number, default: 5 }, // Alert if drops below this
  purchase_cost: { type: Number },
  companyId: { type: String, required: true }
}, { timestamps: true });

export const Consumable = mongoose.model("Consumable", consumableSchema);
