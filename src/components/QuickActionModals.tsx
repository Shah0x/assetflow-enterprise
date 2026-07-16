import React, { useState, useEffect } from "react";
import api from "../lib/api.ts";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Plus, CheckSquare, AlertTriangle, Package, Users } from "lucide-react";

interface QuickActionModalsProps {
  activeType: "add-asset" | "checkout" | "log-ticket" | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function QuickActionModals({ activeType, onClose, onSuccess }: QuickActionModalsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [availableAssets, setAvailableAssets] = useState<any[]>([]);

  // 1. Asset form state
  const [assetForm, setAssetForm] = useState({
    model: "",
    serial_no: "",
    category: "Laptop",
    status: "Available",
    purchase_date: new Date().toISOString().split("T")[0],
    warranty_expiry: new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString().split("T")[0],
    purchase_cost: "",
  });

  // 2. Checkout form state
  const [checkoutForm, setCheckoutForm] = useState({
    asset_id: "",
    employee_id: "",
    condition: "Excellent"
  });

  // 3. Ticket form state
  const [ticketForm, setTicketForm] = useState({
    asset_id: "",
    issue_type: "Hardware",
    priority: "Medium",
    description: ""
  });

  // Load auxiliary data (employees, assets) when checkout or ticket log triggers
  useEffect(() => {
    if (activeType === "checkout" || activeType === "log-ticket") {
      const loadData = async () => {
        let fetchedEmployees: any[] = [];
        let fetchedAssets: any[] = [];

        // 1. Try loading employees
        try {
          const empRes = await api.get("/employees");
          if (empRes && Array.isArray(empRes.data)) {
            fetchedEmployees = empRes.data;
          }
        } catch (error) {
          console.warn("Failed to load employees from API, falling back...", error);
        }

        if (fetchedEmployees.length === 0) {
          try {
            const localEmps = localStorage.getItem("employees");
            if (localEmps) {
              fetchedEmployees = JSON.parse(localEmps);
            }
          } catch (e) {
            console.error("Local employees parse failure", e);
          }
        }

        if (!Array.isArray(fetchedEmployees) || fetchedEmployees.length === 0) {
          fetchedEmployees = [
            { _id: "emp1", emp_id: "EMP-001", name: "Alex Rivera", department: "Engineering", designation: "Staff Engineer" },
            { _id: "emp2", emp_id: "EMP-002", name: "Sarah Chen", department: "Product", designation: "Director of Product" },
            { _id: "emp3", emp_id: "EMP-003", name: "Marcus Vance", department: "Security", designation: "CISO" },
            { _id: "emp4", emp_id: "EMP-004", name: "Elena Rostova", department: "Operations", designation: "Ops Manager" }
          ];
        }

        // 2. Try loading assets
        try {
          const assetRes = await api.get("/assets");
          if (assetRes && Array.isArray(assetRes.data)) {
            fetchedAssets = assetRes.data;
          }
        } catch (error) {
          console.warn("Failed to load assets from API, falling back...", error);
        }

        if (fetchedAssets.length === 0) {
          try {
            const localAssets = localStorage.getItem("assets");
            if (localAssets) {
              fetchedAssets = JSON.parse(localAssets);
            }
          } catch (e) {
            console.error("Local assets parse failure", e);
          }
        }

        if (!Array.isArray(fetchedAssets) || fetchedAssets.length === 0) {
          fetchedAssets = [
            { _id: "asset1", model: "MacBook Pro M3 Max", serial_no: "C02F19X0MD6R", category: "Laptop", status: "Assigned" },
            { _id: "asset2", model: "Studio Display 27\" 5K", serial_no: "DY6H921PL192", category: "Monitor", status: "Assigned" },
            { _id: "asset3", model: "iPhone 15 Pro", serial_no: "IMEI-88239102", category: "Mobile", status: "Available" }
          ];
        }

        const finalEmployees = Array.isArray(fetchedEmployees) ? fetchedEmployees : [];
        const finalAssets = Array.isArray(fetchedAssets) ? fetchedAssets : [];

        setEmployees(finalEmployees);
        setAssets(finalAssets);
        setAvailableAssets(finalAssets.filter((a: any) => a.status === "Available"));
      };
      loadData();
    }
  }, [activeType]);

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post("/assets", {
        ...assetForm,
        purchase_cost: Number(assetForm.purchase_cost) || 0
      });
      toast.success("Enterprise asset provisioned successfully");
      setAssetForm({
        model: "",
        serial_no: "",
        category: "Laptop",
        status: "Available",
        purchase_date: new Date().toISOString().split("T")[0],
        warranty_expiry: new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString().split("T")[0],
        purchase_cost: "",
      });
      onClose();
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Provisioning failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutForm.asset_id || !checkoutForm.employee_id) {
      toast.error("Please select both an asset and an employee");
      return;
    }
    setIsSubmitting(true);
    try {
      await api.patch(`/assets/${checkoutForm.asset_id}`, {
        status: "Assigned",
        current_holder: checkoutForm.employee_id,
        assigned_at: new Date()
      });
      toast.success("Asset successfully assigned");
      setCheckoutForm({ asset_id: "", employee_id: "", condition: "Excellent" });
      onClose();
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Assignment failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketForm.asset_id || !ticketForm.description) {
      toast.error("Please fill in all required fields");
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post("/maintenance", {
        asset_id: ticketForm.asset_id,
        issue_type: ticketForm.issue_type,
        priority: ticketForm.priority,
        description: ticketForm.description,
        status: "Open"
      });
      toast.success("Maintenance complaint ticket registered");
      setTicketForm({ asset_id: "", issue_type: "Hardware", priority: "Medium", description: "" });
      onClose();
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to log ticket");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* 1. Add Asset Modal */}
      <Dialog open={activeType === "add-asset"} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-lg rounded-[2.5rem] p-10 border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black tracking-tighter flex items-center gap-2">
              <Plus className="w-6 h-6 text-orange-500" />
              New Hardware Provision
            </DialogTitle>
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
                  value={assetForm.model}
                  onChange={(e) => setAssetForm({...assetForm, model: e.target.value})}
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="label-micro ml-1">Serial Number</Label>
                  <Input 
                    placeholder="ABC-123456"
                    className="h-14 font-mono border-zinc-200 rounded-2xl font-black text-sm px-5 bg-zinc-50/50" 
                    value={assetForm.serial_no}
                    onChange={(e) => setAssetForm({...assetForm, serial_no: e.target.value})}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="label-micro ml-1">Asset Category</Label>
                  <Select value={assetForm.category} onValueChange={(v) => setAssetForm({...assetForm, category: v})}>
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
                    placeholder="0.00"
                    className="h-14 border-zinc-200 rounded-2xl font-black text-sm px-5 bg-zinc-50/50" 
                    value={assetForm.purchase_cost}
                    onChange={(e) => setAssetForm({...assetForm, purchase_cost: e.target.value})}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="label-micro ml-1">Warranty Expiry</Label>
                  <Input 
                    type="date"
                    className="h-14 border-zinc-200 rounded-2xl font-black text-sm px-5 bg-zinc-50/50" 
                    value={assetForm.warranty_expiry}
                    onChange={(e) => setAssetForm({...assetForm, warranty_expiry: e.target.value})}
                    required 
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-zinc-950 text-white font-black py-7 rounded-2xl hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "PROVISION ASSET"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 2. Check Out Modal */}
      <Dialog open={activeType === "checkout"} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-lg rounded-[2.5rem] p-10 border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black tracking-tighter flex items-center gap-2">
              <CheckSquare className="w-6 h-6 text-orange-500" />
              Enterprise Handoff
            </DialogTitle>
            <DialogDescription className="font-medium text-zinc-500 text-sm">
              Assign an available physical asset to an active staff member.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCheckout} className="space-y-6 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label className="label-micro ml-1">Select Available Hardware</Label>
                <Select value={checkoutForm.asset_id} onValueChange={(v) => setCheckoutForm({...checkoutForm, asset_id: v})}>
                  <SelectTrigger className="h-14 border-zinc-200 rounded-2xl font-black text-sm px-5 bg-zinc-50/50 text-left">
                    <SelectValue placeholder="Select equipment..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-zinc-100 p-2 max-h-[220px]">
                    {availableAssets.length > 0 ? (
                      availableAssets.map((a: any) => (
                        <SelectItem key={a._id} value={a._id} className="rounded-xl py-2 font-bold">
                          {a.model} ({a.serial_no})
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-4 text-center text-xs font-black text-zinc-400 uppercase">
                        No equipment available
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="label-micro ml-1">Assign to Employee</Label>
                <Select value={checkoutForm.employee_id} onValueChange={(v) => setCheckoutForm({...checkoutForm, employee_id: v})}>
                  <SelectTrigger className="h-14 border-zinc-200 rounded-2xl font-black text-sm px-5 bg-zinc-50/50 text-left">
                    <SelectValue placeholder="Select staff member..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-zinc-100 p-2 max-h-[220px]">
                    {employees.map((e: any) => (
                      <SelectItem key={e._id} value={e._id} className="rounded-xl py-2 font-bold">
                        {e.name} - {e.department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button 
                type="submit" 
                disabled={isSubmitting || availableAssets.length === 0}
                className="w-full bg-zinc-950 text-white font-black py-7 rounded-2xl hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "COMPLETE HANDOFF"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 3. Log Ticket Modal */}
      <Dialog open={activeType === "log-ticket"} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-lg rounded-[2.5rem] p-10 border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black tracking-tighter flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-orange-500" />
              Log Repair Complaint
            </DialogTitle>
            <DialogDescription className="font-medium text-zinc-500 text-sm">
              Report equipment malfunction or hardware issues to IT Support.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleLogTicket} className="space-y-6 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label className="label-micro ml-1">Select Hardware Asset</Label>
                <Select value={ticketForm.asset_id} onValueChange={(v) => setTicketForm({...ticketForm, asset_id: v})}>
                  <SelectTrigger className="h-14 border-zinc-200 rounded-2xl font-black text-sm px-5 bg-zinc-50/50 text-left">
                    <SelectValue placeholder="Select equipment..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-zinc-100 p-2 max-h-[220px]">
                    {assets.map((a: any) => (
                      <SelectItem key={a._id} value={a._id} className="rounded-xl py-2 font-bold">
                        {a.model} ({a.serial_no})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="label-micro ml-1">Issue Type</Label>
                  <Select value={ticketForm.issue_type} onValueChange={(v) => setTicketForm({...ticketForm, issue_type: v})}>
                    <SelectTrigger className="h-14 border-zinc-200 rounded-2xl font-black text-sm px-5 bg-zinc-50/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-zinc-100 p-2">
                      <SelectItem value="Hardware" className="rounded-xl py-2 font-bold">Hardware Defect</SelectItem>
                      <SelectItem value="Software" className="rounded-xl py-2 font-bold">Software/OS Crash</SelectItem>
                      <SelectItem value="Screen" className="rounded-xl py-2 font-bold">Screen Damage</SelectItem>
                      <SelectItem value="Battery" className="rounded-xl py-2 font-bold">Battery Issue</SelectItem>
                      <SelectItem value="Connectivity" className="rounded-xl py-2 font-bold">Connectivity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="label-micro ml-1">Ticket Priority</Label>
                  <Select value={ticketForm.priority} onValueChange={(v) => setTicketForm({...ticketForm, priority: v})}>
                    <SelectTrigger className="h-14 border-zinc-200 rounded-2xl font-black text-sm px-5 bg-zinc-50/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-zinc-100 p-2">
                      <SelectItem value="Low" className="rounded-xl py-2 font-bold text-zinc-500">Low Priority</SelectItem>
                      <SelectItem value="Medium" className="rounded-xl py-2 font-bold text-blue-600">Medium Priority</SelectItem>
                      <SelectItem value="High" className="rounded-xl py-2 font-bold text-amber-600">High Priority</SelectItem>
                      <SelectItem value="Critical" className="rounded-xl py-2 font-bold text-rose-600">Critical Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="label-micro ml-1">Describe Issue / Symptoms</Label>
                <textarea 
                  placeholder="Provide precise symptoms, error codes, or defect reports..."
                  rows={3}
                  className="w-full rounded-2xl border border-zinc-200 font-medium text-sm p-4 bg-zinc-50/50 focus:border-zinc-900 outline-none" 
                  value={ticketForm.description}
                  onChange={(e) => setTicketForm({...ticketForm, description: e.target.value})}
                  required 
                />
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-zinc-950 text-white font-black py-7 rounded-2xl hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "LOG IT COMPLAINT"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
