import * as React from "react";
import { useEffect, useState } from "react";
import api from "../lib/api.ts";
import { StatusBadge } from "../components/StatusBadge.tsx";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Package, 
  CheckCircle2, 
  ShieldCheck, 
  Wrench, 
  Tag, 
  QrCode, 
  ArrowUpRight,
  Cpu,
  History,
  Activity,
  Edit,
  Trash2,
  Calendar
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";

// Robust high-fidelity mock data for Employees fallback
const INITIAL_MOCK_EMPLOYEES = [
  {
    _id: "emp1",
    emp_id: "EMP-001",
    name: "Alex Rivera",
    email: "alex.rivera@enterprise.com",
    department: "Engineering",
    designation: "Staff Engineer",
    joining_date: "2024-01-15",
    assetCount: 1
  },
  {
    _id: "emp2",
    emp_id: "EMP-002",
    name: "Sarah Chen",
    email: "sarah.chen@enterprise.com",
    department: "Product",
    designation: "Director of Product",
    joining_date: "2023-06-10",
    assetCount: 1
  },
  {
    _id: "emp3",
    emp_id: "EMP-003",
    name: "Marcus Vance",
    email: "marcus.vance@enterprise.com",
    department: "Security",
    designation: "CISO",
    joining_date: "2022-11-01",
    assetCount: 0
  },
  {
    _id: "emp4",
    emp_id: "EMP-004",
    name: "Elena Rostova",
    email: "elena.rostova@enterprise.com",
    department: "Operations",
    designation: "Ops Manager",
    joining_date: "2025-02-18",
    assetCount: 0
  }
];

// Initial mock data for Assets
const INITIAL_MOCK_ASSETS = [
  {
    _id: "asset1",
    model: "MacBook Pro M3 Max",
    serial_no: "C02F19X0MD6R",
    category: "Laptop",
    status: "Assigned",
    purchase_date: "2025-01-10",
    warranty_expiry: "2027-01-10",
    purchase_cost: 3499,
    current_holder: {
      _id: "emp1",
      emp_id: "EMP-001",
      name: "Alex Rivera",
      department: "Engineering"
    },
    assigned_at: "2025-01-12T10:00:00.000Z"
  },
  {
    _id: "asset2",
    model: "Studio Display 27\" 5K",
    serial_no: "DY6H921PL192",
    category: "Monitor",
    status: "Assigned",
    purchase_date: "2024-05-15",
    warranty_expiry: "2026-05-15",
    purchase_cost: 1599,
    current_holder: {
      _id: "emp2",
      emp_id: "EMP-002",
      name: "Sarah Chen",
      department: "Product"
    },
    assigned_at: "2024-05-16T14:30:00.000Z"
  },
  {
    _id: "asset3",
    model: "iPhone 15 Pro",
    serial_no: "IMEI-88239102",
    category: "Mobile",
    status: "Available",
    purchase_date: "2024-09-20",
    warranty_expiry: "2026-09-20",
    purchase_cost: 999,
    current_holder: null,
    assigned_at: null
  },
  {
    _id: "asset4",
    model: "Ubiquiti UniFi Dream Machine",
    serial_no: "UI-UDM-PRO-991",
    category: "Networking",
    status: "Maintenance",
    purchase_date: "2023-11-05",
    warranty_expiry: "2025-11-05",
    purchase_cost: 379,
    current_holder: null,
    assigned_at: null
  },
  {
    _id: "asset5",
    model: "Herman Miller Aeron",
    serial_no: "HM-AERON-99122",
    category: "Furniture",
    status: "Available",
    purchase_date: "2023-03-01",
    warranty_expiry: "2035-03-01",
    purchase_cost: 1495,
    current_holder: null,
    assigned_at: null
  }
];

export default function Assets() {
  const [assets, setAssets] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Recent");

  // Dialog Controls
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  
  // Checkout & Forms State
  const [checkoutData, setCheckoutData] = useState({ employee_id: "" });
  
  const [formData, setFormData] = useState({
    model: "",
    serial_no: "",
    category: "Laptop",
    status: "Available",
    purchase_date: new Date().toISOString().split("T")[0],
    warranty_expiry: new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString().split("T")[0],
    purchase_cost: "",
  });

  const [editFormData, setEditFormData] = useState({
    _id: "",
    model: "",
    serial_no: "",
    category: "Laptop",
    status: "Available",
    purchase_date: "",
    warranty_expiry: "",
    purchase_cost: "",
    current_holder_id: "none"
  });

  // Fetch / Initialize state
  const fetchEmployees = async () => {
    try {
      const res = await api.get("/employees");
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        setEmployees(res.data);
        localStorage.setItem("employees", JSON.stringify(res.data));
      } else if (res.data && Array.isArray(res.data)) {
        setEmployees([]);
        localStorage.setItem("employees", JSON.stringify([]));
      } else {
        const localEmps = localStorage.getItem("employees");
        if (localEmps) {
          try {
            const parsed = JSON.parse(localEmps);
            if (Array.isArray(parsed)) {
              setEmployees(parsed);
            } else {
              localStorage.setItem("employees", JSON.stringify(INITIAL_MOCK_EMPLOYEES));
              setEmployees(INITIAL_MOCK_EMPLOYEES);
            }
          } catch {
            localStorage.setItem("employees", JSON.stringify(INITIAL_MOCK_EMPLOYEES));
            setEmployees(INITIAL_MOCK_EMPLOYEES);
          }
        } else {
          localStorage.setItem("employees", JSON.stringify(INITIAL_MOCK_EMPLOYEES));
          setEmployees(INITIAL_MOCK_EMPLOYEES);
        }
      }
    } catch (e) {
      console.warn("API Error, falling back to local mock employees:", e);
      const localEmps = localStorage.getItem("employees");
      if (localEmps) {
        try {
          const parsed = JSON.parse(localEmps);
          if (Array.isArray(parsed)) {
            setEmployees(parsed);
          } else {
            localStorage.setItem("employees", JSON.stringify(INITIAL_MOCK_EMPLOYEES));
            setEmployees(INITIAL_MOCK_EMPLOYEES);
          }
        } catch {
          localStorage.setItem("employees", JSON.stringify(INITIAL_MOCK_EMPLOYEES));
          setEmployees(INITIAL_MOCK_EMPLOYEES);
        }
      } else {
        localStorage.setItem("employees", JSON.stringify(INITIAL_MOCK_EMPLOYEES));
        setEmployees(INITIAL_MOCK_EMPLOYEES);
      }
    }
  };

  const fetchAssets = () => {
    setLoading(true);
    try {
      const localAssets = localStorage.getItem("assets");
      if (localAssets) {
        setAssets(JSON.parse(localAssets));
      } else {
        localStorage.setItem("assets", JSON.stringify(INITIAL_MOCK_ASSETS));
        setAssets(INITIAL_MOCK_ASSETS);
      }
    } catch (error) {
      toast.error("Failed to fetch hardware assets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
    fetchEmployees();
  }, []);

  // CRUD Actions
  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const newAsset = {
        _id: "asset_" + Date.now(),
        model: formData.model,
        serial_no: formData.serial_no,
        category: formData.category,
        status: formData.status,
        purchase_date: formData.purchase_date,
        warranty_expiry: formData.warranty_expiry,
        purchase_cost: Number(formData.purchase_cost) || 0,
        current_holder: null,
        assigned_at: null
      };
      
      const updatedAssets = [newAsset, ...assets];
      localStorage.setItem("assets", JSON.stringify(updatedAssets));
      setAssets(updatedAssets);
      
      toast.success("Enterprise asset provisioned");
      setIsAddModalOpen(false);
      setFormData({
        model: "",
        serial_no: "",
        category: "Laptop",
        status: "Available",
        purchase_date: new Date().toISOString().split("T")[0],
        warranty_expiry: new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString().split("T")[0],
        purchase_cost: "",
      });
    } catch (error) {
      toast.error("Provisioning failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEditModal = (asset: any) => {
    setSelectedAsset(asset);
    setEditFormData({
      _id: asset._id,
      model: asset.model,
      serial_no: asset.serial_no,
      category: asset.category,
      status: asset.status,
      purchase_date: asset.purchase_date ? asset.purchase_date.split("T")[0] : "",
      warranty_expiry: asset.warranty_expiry ? asset.warranty_expiry.split("T")[0] : "",
      purchase_cost: String(asset.purchase_cost || ""),
      current_holder_id: asset.current_holder?._id || "none"
    });
    setIsEditModalOpen(true);
  };

  const handleEditAssetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const updated = [...assets];
      const index = updated.findIndex(a => a._id === editFormData._id);
      
      if (index !== -1) {
        let holderObj = null;
        let finalStatus = editFormData.status;

        if (finalStatus === "Assigned") {
          if (editFormData.current_holder_id !== "none") {
            const emp = employees.find(e => e._id === editFormData.current_holder_id);
            if (emp) {
              holderObj = {
                _id: emp._id,
                emp_id: emp.emp_id || emp._id.slice(-6).toUpperCase(),
                name: emp.name,
                department: emp.department
              };
            }
          } else {
            // Can't assign without a custodian
            finalStatus = "Available";
          }
        } else {
          // Cleared custodian if not assigned
          holderObj = null;
        }

        updated[index] = {
          ...updated[index],
          model: editFormData.model,
          serial_no: editFormData.serial_no,
          category: editFormData.category,
          status: finalStatus,
          purchase_date: editFormData.purchase_date,
          warranty_expiry: editFormData.warranty_expiry,
          purchase_cost: Number(editFormData.purchase_cost) || 0,
          current_holder: holderObj,
          assigned_at: holderObj ? (updated[index].assigned_at || new Date().toISOString()) : null
        };
        
        localStorage.setItem("assets", JSON.stringify(updated));
        setAssets(updated);
        toast.success("Hardware node updated successfully");
        setIsEditModalOpen(false);
      } else {
        toast.error("Hardware node not found");
      }
    } catch (err) {
      toast.error("Failed to update hardware node");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAsset = (assetId: string) => {
    try {
      const updated = assets.filter(a => a._id !== assetId);
      localStorage.setItem("assets", JSON.stringify(updated));
      setAssets(updated);
      toast.success("Hardware node de-provisioned successfully");
    } catch (err) {
      toast.error("Failed to de-provision hardware node");
    }
  };

  const handleCheckout = () => {
    setIsSubmitting(true);
    try {
      const emp = employees.find(e => e._id === checkoutData.employee_id);
      if (!emp) {
        toast.error("Please select a valid custodian");
        return;
      }
      
      const updated = [...assets];
      const index = updated.findIndex(a => a._id === selectedAsset._id);
      
      if (index !== -1) {
        updated[index] = {
          ...updated[index],
          status: "Assigned",
          current_holder: {
            _id: emp._id,
            emp_id: emp.emp_id || emp._id.slice(-6).toUpperCase(),
            name: emp.name,
            department: emp.department
          },
          assigned_at: new Date().toISOString()
        };
        
        localStorage.setItem("assets", JSON.stringify(updated));
        setAssets(updated);
        toast.success("Handoff successful");
        setIsCheckoutModalOpen(false);
      }
    } catch (e) {
      toast.error("Handoff failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckin = (assetId: string) => {
    try {
      const updated = [...assets];
      const index = updated.findIndex(a => a._id === assetId);
      if (index !== -1) {
        updated[index] = {
          ...updated[index],
          status: "Available",
          current_holder: null,
          assigned_at: null
        };
        localStorage.setItem("assets", JSON.stringify(updated));
        setAssets(updated);
        toast.success("Hardware returned to inventory");
      }
    } catch (e) {
      toast.error("Check-in failed");
    }
  };

  const handleFlagMaintenance = (assetId: string) => {
    try {
      const updated = [...assets];
      const index = updated.findIndex(a => a._id === assetId);
      if (index !== -1) {
        updated[index] = {
          ...updated[index],
          status: "Maintenance",
          current_holder: null,
          assigned_at: null
        };
        localStorage.setItem("assets", JSON.stringify(updated));
        setAssets(updated);
        toast.success("Hardware node flagged for maintenance");
      }
    } catch (e) {
      toast.error("Failed to flag for maintenance");
    }
  };

  // Client-side instant filtering & sorting
  const filteredAssets = assets.filter((asset: any) => {
    const matchesSearch = 
      asset.model.toLowerCase().includes(search.toLowerCase()) ||
      asset.serial_no.toLowerCase().includes(search.toLowerCase()) ||
      asset.category.toLowerCase().includes(search.toLowerCase()) ||
      (asset.current_holder?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (asset.current_holder?.emp_id || "").toLowerCase().includes(search.toLowerCase());

    const matchesCategory = categoryFilter === "All" || asset.category === categoryFilter;
    const matchesStatus = statusFilter === "All" || asset.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const sortedAssets = [...filteredAssets].sort((a: any, b: any) => {
    if (sortBy === "Recent") {
      return new Date(b.purchase_date).getTime() - new Date(a.purchase_date).getTime();
    }
    if (sortBy === "Oldest") {
      return new Date(a.purchase_date).getTime() - new Date(b.purchase_date).getTime();
    }
    if (sortBy === "Cost: High to Low") {
      return (b.purchase_cost || 0) - (a.purchase_cost || 0);
    }
    if (sortBy === "Cost: Low to High") {
      return (a.purchase_cost || 0) - (b.purchase_cost || 0);
    }
    return 0;
  });

  const getStatusBadge = (status: string) => {
    return <StatusBadge status={status} />;
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-12 p-4 sm:p-8 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 sm:gap-6">
        <div className="space-y-3">
           <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-zinc-950 text-white text-[10px] font-black tracking-widest uppercase py-1 px-2.5 rounded-lg border-none">Active Nodes</Badge>
              <div className="h-px w-8 bg-zinc-200" />
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{sortedAssets.length} In System</span>
           </div>
           <h1 className="text-6xl font-black text-zinc-900 tracking-tighter leading-none">Inventory <span className="text-zinc-300">Vault.</span></h1>
           <p className="text-zinc-500 font-medium max-w-sm text-sm">A centralized, high-precision registry for tracing hardware deployment and lifecycle health.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
           <Button variant="outline" className="border-2 border-zinc-200 font-black rounded-2xl px-6 h-14 hover:bg-zinc-50 transition-all">
              <History className="w-5 h-5 mr-2 text-zinc-400" />
              AUDIT LOG
           </Button>
           
           <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
             <DialogTrigger 
               render={
                 <Button className="bg-zinc-950 text-white bg-gradient-to-br from-zinc-800 to-zinc-950 hover:from-orange-500 hover:to-orange-600 border-none gap-2 font-black shadow-2xl rounded-2xl px-8 h-14 transition-all active:scale-95">
                   <Plus className="w-5 h-5" />
                   PROVISION NODE
                 </Button>
               } 
             />
             <DialogContent className="sm:max-w-lg rounded-[2.5rem] p-10 border-none shadow-2xl">
               <DialogHeader>
                 <DialogTitle className="text-3xl font-black tracking-tighter">New Hardware Provision</DialogTitle>
                 <DialogDescription className="font-medium text-zinc-500 text-sm">
                   Initialize a secure entry for hardware into the enterprise inventory.
                 </DialogDescription>
               </DialogHeader>
               <form onSubmit={handleAddAsset} className="space-y-6 py-4">
                 <div className="grid grid-cols-1 gap-4">
                   <div className="space-y-2">
                     <Label className="label-micro ml-1">Hardware Model</Label>
                     <Input 
                       placeholder="e.g. MacBook Pro M3 Max"
                       className="h-14 rounded-2xl border-zinc-200 font-black text-sm px-5 bg-zinc-50/50" 
                       value={formData.model}
                       onChange={(e) => setFormData({...formData, model: e.target.value})}
                       required 
                     />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="label-micro ml-1">Serial Number</Label>
                        <Input 
                          placeholder="ABC-123456"
                          className="h-14 font-mono border-zinc-200 rounded-2xl font-black text-sm px-5 bg-zinc-50/50" 
                          value={formData.serial_no}
                          onChange={(e) => setFormData({...formData, serial_no: e.target.value})}
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="label-micro ml-1">Asset Category</Label>
                        <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                          <SelectTrigger className="h-14 border-zinc-200 rounded-2xl font-black text-sm px-5 bg-zinc-50/50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-zinc-100 p-2">
                            <SelectItem value="Laptop" className="rounded-xl py-2 font-bold">Laptop</SelectItem>
                            <SelectItem value="Monitor" className="rounded-xl py-2 font-bold">Monitor</SelectItem>
                            <SelectItem value="Mobile" className="rounded-xl py-2 font-bold">Mobile</SelectItem>
                            <SelectItem value="Furniture" className="rounded-xl py-2 font-bold">Furniture</SelectItem>
                            <SelectItem value="Networking" className="rounded-xl py-2 font-bold">Networking</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="label-micro ml-1">Procurement Cost ($)</Label>
                        <Input 
                          type="number"
                          placeholder="0"
                          className="h-14 border-zinc-200 rounded-2xl font-black text-sm px-5 bg-zinc-50/50" 
                          value={formData.purchase_cost}
                          onChange={(e) => setFormData({...formData, purchase_cost: e.target.value})}
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="label-micro ml-1">Warranty Lock</Label>
                        <Input 
                          type="date"
                          className="h-14 border-zinc-200 rounded-2xl font-black text-sm px-5 bg-zinc-50/50" 
                          value={formData.warranty_expiry}
                          onChange={(e) => setFormData({...formData, warranty_expiry: e.target.value})}
                          required 
                        />
                      </div>
                   </div>
                 </div>
                 <DialogFooter className="pt-6">
                   <Button type="submit" className="w-full bg-zinc-950 text-white font-black h-16 text-lg rounded-2xl shadow-2xl hover:bg-zinc-800 transition-all active:scale-[0.98]" disabled={isSubmitting}>
                     {isSubmitting ? <Activity className="w-6 h-6 animate-spin" /> : "FINALIZE PROVISIONING"}
                   </Button>
                 </DialogFooter>
               </form>
             </DialogContent>
           </Dialog>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-2.5 rounded-3xl border border-zinc-100 shadow-sm relative z-10">
         <div className="relative flex-1 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300 group-focus-within:text-orange-500 transition-colors" />
            <Input 
              placeholder="Filter by serial, model, category or custodian..." 
              className="pl-14 h-14 bg-transparent border-none focus-visible:ring-0 text-base font-medium placeholder:text-zinc-300 w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
         </div>
         <div className="flex items-center gap-2 pr-2">
            {/* Interactive Category Filter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger render={
                <Button variant="ghost" className="h-12 px-6 font-black text-[11px] uppercase tracking-[0.2em] text-zinc-400 hover:bg-zinc-50 rounded-2xl hover:text-zinc-950 transition-all flex items-center">
                   <Filter className="w-4 h-4 mr-2" />
                   Category: {categoryFilter}
                </Button>
              } />
              <DropdownMenuContent className="rounded-2xl border-zinc-100 p-2 shadow-2xl w-48">
                {["All", "Laptop", "Monitor", "Mobile", "Furniture", "Networking"].map((cat) => (
                  <DropdownMenuItem key={cat} onClick={() => setCategoryFilter(cat)} className="rounded-xl py-2 font-bold cursor-pointer">
                    {cat}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="h-8 w-px bg-zinc-100" />

            {/* Interactive Status Filter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger render={
                <Button variant="ghost" className="h-12 px-6 font-black text-[11px] uppercase tracking-[0.2em] text-zinc-400 hover:bg-zinc-50 rounded-2xl hover:text-zinc-950 transition-all flex items-center">
                   <Filter className="w-4 h-4 mr-2" />
                   Status: {statusFilter === "Assigned" ? "Deployed" : statusFilter}
                </Button>
              } />
              <DropdownMenuContent className="rounded-2xl border-zinc-100 p-2 shadow-2xl w-48">
                {["All", "Available", "Assigned", "Maintenance", "Retired", "Defective"].map((st) => (
                  <DropdownMenuItem key={st} onClick={() => setStatusFilter(st)} className="rounded-xl py-2 font-bold cursor-pointer">
                    {st === "Assigned" ? "Deployed" : st}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="h-8 w-px bg-zinc-100" />

            {/* Interactive Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger render={
                <Button variant="ghost" className="h-12 px-6 font-black text-[11px] uppercase tracking-[0.2em] text-zinc-400 hover:bg-zinc-50 rounded-2xl hover:text-zinc-950 transition-all">
                   Sort: {sortBy}
                </Button>
              } />
              <DropdownMenuContent className="rounded-2xl border-zinc-100 p-2 shadow-2xl w-56">
                {["Recent", "Oldest", "Cost: High to Low", "Cost: Low to High"].map((opt) => (
                  <DropdownMenuItem key={opt} onClick={() => setSortBy(opt)} className="rounded-xl py-2 font-bold cursor-pointer">
                    {opt}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
         </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[3rem] border border-zinc-100 shadow-2xl overflow-hidden relative">
        <Table>
          <TableHeader className="bg-zinc-50/50">
            <TableRow className="border-b border-zinc-100 hover:bg-transparent">
              <TableHead className="font-black uppercase text-[10px] tracking-[0.2em] text-zinc-400 pl-10 h-20">Hardware Profile</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-[0.2em] text-zinc-400 h-20">Identification</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-[0.2em] text-zinc-400 h-20 text-center">Lifecycle State</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-[0.2em] text-zinc-400 h-20 text-center">Human Custodian</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-[0.2em] text-zinc-400 h-20 text-center">Issuance Date</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-[0.2em] text-zinc-400 h-20 text-right">Valuation</TableHead>
              <TableHead className="w-[100px] pr-10 h-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-40">
                  <div className="flex flex-col items-center gap-4">
                    <Activity className="w-12 h-12 text-orange-500 animate-spin" />
                    <p className="label-micro animate-pulse">Synchronizing Hardware Vault...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : sortedAssets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-40">
                  <Package className="w-16 h-16 text-zinc-100 mx-auto mb-4" />
                  <p className="text-zinc-400 font-bold uppercase tracking-widest text-[11px]">Vault empty for current selection</p>
                </TableCell>
              </TableRow>
            ) : (
                <AnimatePresence>
                  {sortedAssets.map((asset: any, idx) => (
                    <motion.tr 
                      key={asset._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-all group"
                    >
                      <TableCell className="pl-10 py-6">
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 bg-zinc-100 rounded-[1.25rem] flex items-center justify-center text-zinc-400 group-hover:bg-zinc-950 group-hover:text-white transition-all shadow-sm">
                            <Cpu className="w-6 h-6" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-black text-zinc-900 text-base tracking-tighter leading-tight">{asset.model}</span>
                            <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest mt-1 italic">{asset.category}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-zinc-500 font-mono text-[11px] font-bold tracking-tight">{asset.serial_no}</span>
                          <span className="text-[10px] font-black text-zinc-200 uppercase mt-0.5 tracking-wider">SECURE_NODE_PTR</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(asset.status)}
                      </TableCell>
                      <TableCell className="text-center">
                        {asset.current_holder ? (
                          <div className="flex flex-col items-center group/custodian transition-all cursor-pointer">
                            <span className="text-sm font-black text-zinc-900 leading-tight border-b-2 border-transparent group-hover/custodian:border-orange-200">{asset.current_holder.name}</span>
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter mt-1">{asset.current_holder.emp_id}</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center opacity-20">
                            <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full mb-1" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Available</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                         <span className="text-[11px] font-black text-zinc-400 font-mono">
                            {asset.assigned_at ? format(new Date(asset.assigned_at), "MMM d, yyyy") : "-"}
                         </span>
                      </TableCell>
                      <TableCell className="text-right">
                         <div className="flex flex-col items-end">
                            <span className="font-black text-zinc-900 text-base leading-tight">${asset.purchase_cost?.toLocaleString()}</span>
                            <div className="flex items-center gap-1 text-[10px] font-black text-zinc-300 uppercase tracking-tighter mt-1">
                               <ShieldCheck className="w-3 h-3" />
                               WARRANTY_{format(new Date(asset.warranty_expiry), "yy").toUpperCase()}
                            </div>
                         </div>
                      </TableCell>
                      <TableCell className="pr-10">
                        <DropdownMenu>
                          <DropdownMenuTrigger render={
                            <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-zinc-200 rounded-xl transition-all">
                              <MoreVertical className="w-5 h-5 text-zinc-400" />
                            </Button>
                          } />
                          <DropdownMenuContent align="end" className="w-64 p-2 rounded-[1.5rem] border-zinc-100 shadow-2xl">
                             <DropdownMenuLabel className="label-micro px-3 py-4">Hardware Intelligence</DropdownMenuLabel>
                             <DropdownMenuSeparator className="bg-zinc-50" />
                             <div className="p-1 space-y-1">
                                {asset.status === "Available" && (
                                  <DropdownMenuItem 
                                    onClick={() => { setSelectedAsset(asset); setCheckoutData({ employee_id: "" }); setIsCheckoutModalOpen(true); }}
                                    className="rounded-xl px-4 py-3 text-xs font-black gap-3 focus:bg-orange-50 focus:text-orange-600 cursor-pointer"
                                  >
                                     <ArrowUpRight className="w-4 h-4" /> DEPLOY TO STAFF
                                  </DropdownMenuItem>
                                )}
                                {asset.status === "Assigned" && (
                                  <DropdownMenuItem 
                                    onClick={() => handleCheckin(asset._id)}
                                    className="rounded-xl px-4 py-3 text-xs font-black gap-3 focus:bg-emerald-50 focus:text-emerald-700 cursor-pointer"
                                  >
                                     <CheckCircle2 className="w-4 h-4" /> RETURN TO VAULT
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem 
                                  onClick={() => handleOpenEditModal(asset)}
                                  className="rounded-xl px-4 py-3 text-xs font-black gap-3 focus:bg-zinc-50 cursor-pointer"
                                >
                                  <Edit className="w-4 h-4" /> EDIT NODE
                                </DropdownMenuItem>
                                <DropdownMenuItem className="rounded-xl px-4 py-3 text-xs font-black gap-3 focus:bg-zinc-50 cursor-pointer">
                                  <QrCode className="w-4 h-4" /> GENERATE_DIGITAL_TWIN
                                </DropdownMenuItem>
                                <DropdownMenuItem className="rounded-xl px-4 py-3 text-xs font-black gap-3 focus:bg-zinc-50 cursor-pointer">
                                  <Tag className="w-4 h-4" /> PRINT_IDENTIFICATION
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleFlagMaintenance(asset._id)}
                                  className="rounded-xl px-4 py-3 text-xs font-black gap-3 focus:bg-zinc-50 cursor-pointer"
                                >
                                  <Wrench className="w-4 h-4" /> FLAG FOR MAINTENANCE
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-zinc-50" />
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteAsset(asset._id)}
                                  className="rounded-xl px-4 py-3 text-xs font-black gap-3 text-rose-500 focus:bg-rose-50 focus:text-rose-600 cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" /> DELETE_PROVISION
                                </DropdownMenuItem>
                             </div>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Checkout Dialog */}
      <Dialog open={isCheckoutModalOpen} onOpenChange={setIsCheckoutModalOpen}>
        <DialogContent className="sm:max-w-lg rounded-[2.5rem] p-10 border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black tracking-tighter">Hardware Handoff</DialogTitle>
            <DialogDescription className="font-medium text-zinc-500 text-sm">
              Provisioning node <span className="text-zinc-950 font-black tracking-tight">{selectedAsset?.model}</span> to a verified human custodian.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-6">
              <div className="space-y-3">
                <Label className="label-micro ml-1">Official Custodian</Label>
                <Select onValueChange={(v) => setCheckoutData({...checkoutData, employee_id: v})}>
                  <SelectTrigger className="h-16 font-black text-sm bg-zinc-50 border-zinc-100 rounded-2xl px-6">
                    <SelectValue placeholder="Search by name or Employee ID..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl p-2 border-zinc-100 shadow-2xl max-h-[300px]">
                    {(Array.isArray(employees) ? employees : []).map((emp: any) => (
                      <SelectItem key={emp._id} value={emp._id} className="rounded-xl py-4 font-bold group">
                        <div className="flex flex-col text-left">
                           <span className="text-sm font-black text-zinc-900">{emp.name}</span>
                           <span className="text-[10px] text-zinc-400 uppercase tracking-widest">{emp.emp_id || emp._id.slice(-6).toUpperCase()} • {emp.department}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="p-5 bg-zinc-50 rounded-2xl border border-zinc-100 flex gap-4">
                 <ShieldCheck className="w-6 h-6 text-emerald-500 shrink-0 mt-1" />
                 <div>
                    <p className="text-xs font-black text-zinc-900 mb-1">Audit Verification</p>
                    <p className="text-[11px] font-medium text-zinc-500 leading-relaxed">
                       This action is permanent and will be logged in the global audit trail. Deployment status will be synchronized across all systems.
                    </p>
                 </div>
              </div>
          </div>
          <DialogFooter>
            <Button 
                onClick={handleCheckout} 
                className="w-full h-18 bg-zinc-950 text-white font-black text-xl rounded-2xl shadow-2xl hover:bg-zinc-800 transition-all active:scale-95 px-8"
                disabled={isSubmitting}
            >
                {isSubmitting ? <Activity className="animate-spin w-8 h-8" /> : "FINALIZE DEPLOYMENT"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-lg rounded-[2.5rem] p-10 border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black tracking-tighter">Edit Hardware Node</DialogTitle>
            <DialogDescription className="font-medium text-zinc-500 text-sm">
              Modify technical and administrative details of this hardware entry.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditAssetSubmit} className="space-y-6 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label className="label-micro ml-1">Hardware Model</Label>
                <Input 
                  className="h-14 rounded-2xl border-zinc-200 font-black text-sm px-5 bg-zinc-50/50" 
                  value={editFormData.model}
                  onChange={(e) => setEditFormData({...editFormData, model: e.target.value})}
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="label-micro ml-1">Serial Number</Label>
                  <Input 
                    className="h-14 font-mono border-zinc-200 rounded-2xl font-black text-sm px-5 bg-zinc-50/50" 
                    value={editFormData.serial_no}
                    onChange={(e) => setEditFormData({...editFormData, serial_no: e.target.value})}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="label-micro ml-1">Asset Category</Label>
                  <Select value={editFormData.category} onValueChange={(v) => setEditFormData({...editFormData, category: v})}>
                    <SelectTrigger className="h-14 border-zinc-200 rounded-2xl font-black text-sm px-5 bg-zinc-50/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-zinc-100 p-2">
                      <SelectItem value="Laptop" className="rounded-xl py-2 font-bold">Laptop</SelectItem>
                      <SelectItem value="Monitor" className="rounded-xl py-2 font-bold">Monitor</SelectItem>
                      <SelectItem value="Mobile" className="rounded-xl py-2 font-bold">Mobile</SelectItem>
                      <SelectItem value="Furniture" className="rounded-xl py-2 font-bold">Furniture</SelectItem>
                      <SelectItem value="Networking" className="rounded-xl py-2 font-bold">Networking</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="label-micro ml-1">Lifecycle Status</Label>
                  <Select value={editFormData.status} onValueChange={(v) => setEditFormData({...editFormData, status: v})}>
                    <SelectTrigger className="h-14 border-zinc-200 rounded-2xl font-black text-sm px-5 bg-zinc-50/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-zinc-100 p-2">
                      <SelectItem value="Available" className="rounded-xl py-2 font-bold">Available</SelectItem>
                      <SelectItem value="Assigned" className="rounded-xl py-2 font-bold">Assigned</SelectItem>
                      <SelectItem value="Maintenance" className="rounded-xl py-2 font-bold">Maintenance</SelectItem>
                      <SelectItem value="Retired" className="rounded-xl py-2 font-bold">Retired</SelectItem>
                      <SelectItem value="Defective" className="rounded-xl py-2 font-bold">Defective</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="label-micro ml-1">Custodian (If Assigned)</Label>
                  <Select 
                    disabled={editFormData.status !== "Assigned"}
                    value={editFormData.current_holder_id} 
                    onValueChange={(v) => setEditFormData({...editFormData, current_holder_id: v})}
                  >
                    <SelectTrigger className="h-14 border-zinc-200 rounded-2xl font-black text-sm px-5 bg-zinc-50/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-zinc-100 p-2 max-h-[250px]">
                      <SelectItem value="none" className="rounded-xl py-2 font-bold">No Custodian</SelectItem>
                      {(Array.isArray(employees) ? employees : []).map((emp) => (
                        <SelectItem key={emp._id} value={emp._id} className="rounded-xl py-2 font-bold">
                          {emp.name} ({emp.emp_id || emp._id.slice(-6).toUpperCase()})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="label-micro ml-1">Valuation ($)</Label>
                  <Input 
                    type="number"
                    className="h-14 border-zinc-200 rounded-2xl font-black text-sm px-5 bg-zinc-50/50" 
                    value={editFormData.purchase_cost}
                    onChange={(e) => setEditFormData({...editFormData, purchase_cost: e.target.value})}
                    required 
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label className="label-micro ml-1">Warranty Lock</Label>
                  <Input 
                    type="date"
                    className="h-14 border-zinc-200 rounded-2xl font-black text-sm px-5 bg-zinc-50/50" 
                    value={editFormData.warranty_expiry}
                    onChange={(e) => setEditFormData({...editFormData, warranty_expiry: e.target.value})}
                    required 
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="pt-6">
              <Button type="submit" className="w-full bg-zinc-950 text-white font-black h-16 text-lg rounded-2xl shadow-2xl hover:bg-zinc-800 transition-all active:scale-[0.98]" disabled={isSubmitting}>
                {isSubmitting ? <Activity className="w-6 h-6 animate-spin" /> : "SAVE CHANGES"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
