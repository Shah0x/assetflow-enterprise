import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

import { User } from "./src/server/models/User.ts";
import { Asset } from "./src/server/models/Asset.ts";
import { Employee } from "./src/server/models/Employee.ts";
import { MaintenanceLog } from "./src/server/models/MaintenanceLog.ts";
import { AllocationHistory } from "./src/server/models/AllocationHistory.ts";
import { License } from "./src/server/models/License.ts";
import { Consumable } from "./src/server/models/Consumable.ts";

import authRoutes from "./src/server/routes/auth.ts";
import assetRoutes from "./src/server/routes/assets.ts";
import employeeRoutes from "./src/server/routes/employees.ts";
import statsRoutes from "./src/server/routes/stats.ts";
import licenseRoutes from "./src/server/routes/licenses.ts";
import consumableRoutes from "./src/server/routes/consumables.ts";
import maintenanceRoutes from "./src/server/routes/maintenance.ts";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Connect to MongoDB
  const MONGODB_URI = process.env.MONGODB_URI;
  if (MONGODB_URI) {
    console.log("Attempting to connect to MongoDB...");
    mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 15000, // Timeout after 15s instead of 5s
    })
      .then(async () => {
        console.log("✅ Connected to MongoDB successfully");
        if (mongoose.connection.db) {
          try {
            const collections = await mongoose.connection.db.listCollections({ name: "assets" }).toArray();
            if (collections.length > 0) {
              await mongoose.connection.db.collection("assets").dropIndex("serialNumber_1");
              console.log("🧹 Dropped legacy index 'serialNumber_1' from assets collection.");
            }
          } catch (indexErr: any) {
            console.log("ℹ️ Legacy 'serialNumber_1' index not found or already dropped:", indexErr.message);
          }
        }
      })
      .catch((err) => {
        console.error("❌ MongoDB connection error:", err.message);
        if (err.message.includes("IP isn't whitelisted")) {
          console.error("👉 ACTION REQUIRED: Please whitelist your IP in MongoDB Atlas (Network Access -> Allow Access From Anywhere)");
        }
      });
  } else {
    console.warn("⚠️ MONGODB_URI not found in environment variables. Database features will not work.");
  }

  // Middleware to check DB connection
  app.use((req, res, next) => {
    if (req.path.startsWith("/api") && req.path !== "/api/health" && mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        message: "Database not connected. Please check your MongoDB Atlas IP whitelist settings.",
        error: "Database Connection Error"
      });
    }
    next();
  });

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      message: "AssetFlow API is running",
      database: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
    });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/assets", assetRoutes);
  app.use("/api/employees", employeeRoutes);
  app.use("/api/stats", statsRoutes);
  app.use("/api/licenses", licenseRoutes);
  app.use("/api/consumables", consumableRoutes);
  app.use("/api/maintenance", maintenanceRoutes);

  app.post("/api/seed", async (req, res) => {
    try {
      console.log("PRO-LEVEL Seeding process started...");
      
      const companyId = "demo-corp";

      // 1. Wipe everything
      try {
        if (mongoose.connection.db) {
          const collections = await mongoose.connection.db.listCollections().toArray();
          const collectionNames = collections.map(c => c.name);
          
          if (collectionNames.includes("assets")) {
            await mongoose.connection.db.collection("assets").drop();
            console.log("🧹 Dropped assets collection to clear legacy indexes.");
          }
        }
      } catch (dropErr: any) {
        console.log("⚠️ Failed to drop assets collection:", dropErr.message);
      }

      await Promise.all([
        User.deleteMany({}),
        Asset.deleteMany({}),
        Employee.deleteMany({}),
        MaintenanceLog.deleteMany({}),
        AllocationHistory.deleteMany({}),
        License.deleteMany({}),
        Consumable.deleteMany({})
      ]);

      // Recreate indexes explicitly for Asset to ensure only the active schema indexes exist
      try {
        await Asset.createIndexes();
        console.log("✅ Recreated active indexes for Asset model.");
      } catch (indexErr: any) {
        console.log("⚠️ Index recreation info:", indexErr.message);
      }

      // 2. Create Admin User
      const admin = new User({
        name: "Enterprise IT Admin",
        email: "admin@example.com",
        password: "password123",
        role: "super_admin",
        companyId: companyId
      });
      await admin.save();

      // 3. Create 15 Employees spanning key departments
      const depts = ["IT", "HR", "Sales", "Finance", "Legal", "Operations", "Engineering"];
      const employeeSeeds = [
        { name: "Sarah Chen", dept: "Engineering", role: "Principal Software Engineer" },
        { name: "Marcus Miller", dept: "HR", role: "Director of HR" },
        { name: "Elena Rodriguez", dept: "Sales", role: "VP of Global Sales" },
        { name: "David Kim", dept: "Finance", role: "CFO" },
        { name: "James Wilson", dept: "IT", role: "IT Security Manager" },
        { name: "Linda Thompson", dept: "Legal", role: "General Counsel" },
        { name: "Robert Taylor", dept: "Operations", role: "COO" },
        { name: "Nancy White", dept: "Engineering", role: "Frontend Lead" },
        { name: "John Davis", dept: "Engineering", role: "DevOps Engineer" },
        { name: "Patricia Moore", dept: "IT", role: "Helpdesk Supervisor" },
        { name: "Kevin Brown", dept: "Sales", role: "Account Executive" },
        { name: "Amanda Lee", dept: "Engineering", role: "Fullstack Developer" },
        { name: "Chris Evans", dept: "Finance", role: "Controller" },
        { name: "Jessica Alba", dept: "Sales", role: "Sales Manager" },
        { name: "Tom Holland", dept: "Operations", role: "Logistics Coordinator" }
      ];

      const createdEmployees = await Promise.all(employeeSeeds.map((emp, i) => 
        Employee.create({
          emp_id: `EMP-${1000 + i}`,
          name: emp.name,
          department: emp.dept,
          email: `${emp.name.toLowerCase().replace(" ", ".")}@company.com`,
          designation: emp.role,
          joining_date: new Date(2022, i % 12, 1 + i),
          companyId
        })
      ));

      // 4. Create 50 Realistic IT Assets
      const hardwareTemplates = [
        { model: "MacBook Pro M3 Max 16\" (64GB RAM)", category: "Laptop", cost: 3999 },
        { model: "MacBook Air M3 15\" (24GB RAM)", category: "Laptop", cost: 1699 },
        { model: "Dell Precision 5680 Workstation", category: "Laptop", cost: 3200 },
        { model: "Lenovo ThinkPad X1 Carbon Gen 12", category: "Laptop", cost: 1950 },
        { model: "HP EliteBook 1040 G10", category: "Laptop", cost: 1450 },
        { model: "Dell UltraSharp 40\" Curved 5K", category: "Monitor", cost: 1899 },
        { model: "LG 38\" UltraWide WQHD+", category: "Monitor", cost: 1200 },
        { model: "Samsung Odyssey G9 49\"", category: "Monitor", cost: 1100 },
        { model: "iPhone 15 Pro Max (512GB)", category: "Mobile", cost: 1399 },
        { model: "Samsung Galaxy S24 Ultra (512GB)", category: "Mobile", cost: 1299 },
        { model: "Google Pixel 8 Pro", category: "Mobile", cost: 999 },
        { model: "Herman Miller Embody Chair", category: "Furniture", cost: 1800 },
        { model: "Steelcase Gesture Chair", category: "Furniture", cost: 1400 },
        { model: "Fully Jarvis Standing Desk 72x30", category: "Furniture", cost: 950 },
        { model: "Cisco Catalyst 9300 Switch", category: "Networking", cost: 4500 },
        { model: "Ubiquiti UniFi Dream Machine Pro", category: "Networking", cost: 379 },
        { model: "Logitech MX Master 3S Mouse", category: "Peripherals", cost: 99 },
        { model: "Keychron Q6 Mechanical Keyboard", category: "Peripherals", cost: 190 }
      ];

      const assetsToCreate = [];
      const serials = new Set();
      for (let i = 0; i < 50; i++) {
        const template = hardwareTemplates[i % hardwareTemplates.length];
        let serial = `SN-${100000 + i}-${Math.random().toString(36).substring(7).toUpperCase()}`;
        while(serials.has(serial)) {
          serial = `SN-${100000 + i}-${Math.random().toString(36).substring(7).toUpperCase()}`;
        }
        serials.add(serial);

        const status = i < 35 ? "Assigned" : (i < 45 ? "Available" : (i < 48 ? "Maintenance" : "Retired"));
        assetsToCreate.push({
          serial_no: serial,
          model: template.model,
          category: template.category,
          status,
          purchase_cost: template.cost,
          purchase_date: new Date(2023, 0, i + 1),
          warranty_expiry: new Date(2026, 0, i + 1),
          current_holder: status === "Assigned" ? createdEmployees[i % createdEmployees.length]._id : null,
          assigned_at: status === "Assigned" ? new Date(2024, 0, i + 1) : null,
          companyId
        });
      }
      const createdAssets = await Asset.insertMany(assetsToCreate);

      // 4.5 Create Allocation History
      const histories = createdAssets
        .filter(a => a.status === "Assigned")
        .map(a => ({
          asset_id: a._id,
          employee_id: a.current_holder,
          issue_date: a.assigned_at,
          condition: "Excellent",
          companyId
        }));
      await AllocationHistory.insertMany(histories);

      // 5. Create 10 Software Licenses
      const licenseTemplates = [
        { name: "Adobe Creative Cloud All Apps", manufacturer: "Adobe", seats: 50, cost: 80 },
        { name: "Microsoft 365 Business Premium", manufacturer: "Microsoft", seats: 200, cost: 22 },
        { name: "JetBrains All Products Pack", manufacturer: "JetBrains", seats: 30, cost: 650 },
        { name: "Slack Enterprise Grid", manufacturer: "Slack", seats: 500, cost: 15 },
        { name: "Zoom Pro", manufacturer: "Zoom", seats: 100, cost: 150 },
        { name: "GitHub Enterprise", manufacturer: "GitHub", seats: 100, cost: 21 }
      ];

      await Promise.all(licenseTemplates.map(lic => 
        License.create({
          name: lic.name,
          product_key: `KEY-${Math.random().toString(36).substring(7).toUpperCase()}`,
          manufacturer: lic.manufacturer,
          total_seats: lic.seats,
          available_seats: Math.floor(lic.seats * 0.4),
          category: "Software",
          purchase_date: new Date(2023, 5, 12),
          expiration_date: new Date(2025, 5, 12),
          companyId
        })
      ));

      // 6. Create 10 Consumables
      const consumableTemplates = [
        { name: "HP 65XL Ink Cartridge Black", cat: "Ink", qty: 45 },
        { name: "Dell Laser Toner 5130cdn", cat: "Toner", qty: 12 },
        { name: "Premium A4 Copier Paper (Case)", cat: "Paper", qty: 20 },
        { name: "Cat6 Ethernet Cable 10ft (Pack of 10)", cat: "Cabling", qty: 15 },
        { name: "AA Batteries (Pack of 48)", cat: "Power", qty: 8 }
      ];

      await Promise.all(consumableTemplates.map(item => 
        Consumable.create({
          name: item.name,
          category: item.cat,
          qty: item.qty,
          min_amt: 10,
          purchase_cost: 45,
          companyId
        })
      ));

      // 7. Create 8 Maintenance Tickets
      const ticketIssues = [
        { type: "Screen", priority: "High", desc: "Horizontal lines appearing on display" },
        { type: "Battery", priority: "Medium", desc: "Battery swells slightly, needs replacement" },
        { type: "Keyboard", priority: "Low", desc: "Sticky keys resulting from coffee spill" },
        { type: "Connectivity", priority: "Critical", desc: "No internet via Ethernet port" },
        { type: "Software", priority: "Medium", desc: "Constant BSOD on startup" }
      ];

      const tickets = [];
      for (let i = 0; i < 8; i++) {
        const issue = ticketIssues[i % ticketIssues.length];
        tickets.push({
          asset_id: createdAssets[20 + i]._id, // Using unassigned assets for tickets
          issue_type: issue.type,
          priority: issue.priority,
          description: issue.desc,
          status: i % 2 === 0 ? "Open" : "In-Progress",
          companyId
        });
      }
      await MaintenanceLog.insertMany(tickets);

      res.json({ 
        success: true, 
        message: "FULL PRO SYSTEM SEEDED! 30 Assets, 15 Employees, 10 Licenses, 10 Consumables, and 8 Tickets active." 
      });
    } catch (error: any) {
      console.error("Pro Seed failed:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
