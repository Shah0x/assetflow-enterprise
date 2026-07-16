import * as React from "react";
import { useEffect, useState } from "react";
import api from "../lib/api.ts";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Key, 
  Plus, 
  Search, 
  TrendingUp, 
  Layers, 
  Activity, 
  Clock, 
  ShieldCheck, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  MoreVertical
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
} from "@/components/ui/dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { format } from "date-fns";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

const INITIAL_MOCK_LICENSES = [
  {
    _id: "lic1",
    software_name: "Microsoft 365 Enterprise E5",
    category: "SaaS Productivity",
    total_seats: 150,
    used_seats: 124,
    cost_per_seat: 38,
    expiry_date: "2026-12-31"
  },
  {
    _id: "lic2",
    software_name: "Adobe Creative Cloud All Apps",
    category: "Design / Creative",
    total_seats: 30,
    used_seats: 28,
    cost_per_seat: 84,
    expiry_date: "2026-09-15"
  },
  {
    _id: "lic3",
    software_name: "GitHub Copilot for Business",
    category: "AI Development",
    total_seats: 100,
    used_seats: 98,
    cost_per_seat: 19,
    expiry_date: "2026-06-20"
  },
  {
    _id: "lic4",
    software_name: "Slack Pro Enterprise Grid",
    category: "Collaboration",
    total_seats: 250,
    used_seats: 190,
    cost_per_seat: 12,
    expiry_date: "2027-02-10"
  },
  {
    _id: "lic5",
    software_name: "AWS Enterprise Cloud Support Plan",
    category: "Infrastructure",
    total_seats: 10,
    used_seats: 10,
    cost_per_seat: 1500,
    expiry_date: "2026-03-01"
  }
];

export default function Licenses() {
  const [licenses, setLicenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLic, setSelectedLic] = useState<any>(null);

  // Forms state
  const [formData, setFormData] = useState({
    software_name: "",
    category: "SaaS Productivity",
    total_seats: "",
    used_seats: "",
    cost_per_seat: "",
    expiry_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split("T")[0]
  });

  const [editFormData, setEditFormData] = useState({
    _id: "",
    software_name: "",
    category: "SaaS Productivity",
    total_seats: "",
    used_seats: "",
    cost_per_seat: "",
    expiry_date: ""
  });

  const fetchLicenses = async () => {
    try {
      const res = await api.get("/licenses");
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        setLicenses(res.data);
        localStorage.setItem("licenses", JSON.stringify(res.data));
      } else if (res.data && Array.isArray(res.data)) {
        setLicenses([]);
        localStorage.setItem("licenses", JSON.stringify([]));
      } else {
        const local = localStorage.getItem("licenses");
        if (local) {
          try {
            const parsed = JSON.parse(local);
            if (Array.isArray(parsed)) {
              setLicenses(parsed);
            } else {
              localStorage.setItem("licenses", JSON.stringify(INITIAL_MOCK_LICENSES));
              setLicenses(INITIAL_MOCK_LICENSES);
            }
          } catch {
            localStorage.setItem("licenses", JSON.stringify(INITIAL_MOCK_LICENSES));
            setLicenses(INITIAL_MOCK_LICENSES);
          }
        } else {
          localStorage.setItem("licenses", JSON.stringify(INITIAL_MOCK_LICENSES));
          setLicenses(INITIAL_MOCK_LICENSES);
        }
      }
    } catch (e) {
      console.warn("API offline, falling back to local storage");
      const local = localStorage.getItem("licenses");
      if (local) {
        try {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed)) {
            setLicenses(parsed);
          } else {
            localStorage.setItem("licenses", JSON.stringify(INITIAL_MOCK_LICENSES));
            setLicenses(INITIAL_MOCK_LICENSES);
          }
        } catch {
          localStorage.setItem("licenses", JSON.stringify(INITIAL_MOCK_LICENSES));
          setLicenses(INITIAL_MOCK_LICENSES);
        }
      } else {
        localStorage.setItem("licenses", JSON.stringify(INITIAL_MOCK_LICENSES));
        setLicenses(INITIAL_MOCK_LICENSES);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLicenses();
  }, []);

  const handleAddLicense = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const newLic = {
        _id: "lic_" + Date.now(),
        software_name: formData.software_name,
        category: formData.category,
        total_seats: Number(formData.total_seats) || 0,
        used_seats: Number(formData.used_seats) || 0,
        cost_per_seat: Number(formData.cost_per_seat) || 0,
        expiry_date: formData.expiry_date
      };

      const currentLicenses = Array.isArray(licenses) ? licenses : [];
      const updated = [newLic, ...currentLicenses];
      localStorage.setItem("licenses", JSON.stringify(updated));
      setLicenses(updated);
      toast.success("License key profile saved");
      setIsAddModalOpen(false);
      setFormData({
        software_name: "",
        category: "SaaS Productivity",
        total_seats: "",
        used_seats: "",
        cost_per_seat: "",
        expiry_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split("T")[0]
      });
    } catch (error) {
      toast.error("Failed to register license profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEditModal = (lic: any) => {
    setSelectedLic(lic);
    setEditFormData({
      _id: lic._id,
      software_name: lic.software_name,
      category: lic.category || "SaaS Productivity",
      total_seats: String(lic.total_seats),
      used_seats: String(lic.used_seats),
      cost_per_seat: String(lic.cost_per_seat),
      expiry_date: lic.expiry_date ? lic.expiry_date.split("T")[0] : ""
    });
    setIsEditModalOpen(true);
  };

  const handleEditLicenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const currentLicenses = Array.isArray(licenses) ? licenses : [];
      const updated = [...currentLicenses];
      const index = updated.findIndex(lic => lic._id === editFormData._id);
      if (index !== -1) {
        updated[index] = {
          ...updated[index],
          software_name: editFormData.software_name,
          category: editFormData.category,
          total_seats: Number(editFormData.total_seats) || 0,
          used_seats: Number(editFormData.used_seats) || 0,
          cost_per_seat: Number(editFormData.cost_per_seat) || 0,
          expiry_date: editFormData.expiry_date
        };
        localStorage.setItem("licenses", JSON.stringify(updated));
        setLicenses(updated);
        toast.success("License metadata saved successfully");
        setIsEditModalOpen(false);
      }
    } catch (err) {
      toast.error("Failed to save license profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLicense = (id: string) => {
    try {
      const currentLicenses = Array.isArray(licenses) ? licenses : [];
      const updated = currentLicenses.filter(lic => lic._id !== id);
      localStorage.setItem("licenses", JSON.stringify(updated));
      setLicenses(updated);
      toast.success("License profile de-provisioned successfully");
    } catch (err) {
      toast.error("De-provisioning failed");
    }
  };

  const currentLicenses = Array.isArray(licenses) ? licenses : [];

  const filtered = currentLicenses.filter((lic: any) => 
    (lic.software_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (lic.category || "").toLowerCase().includes(search.toLowerCase())
  );

  // Aggregated analytics metrics
  const activeContracts = currentLicenses.length;
  const grossMonthlySpend = currentLicenses.reduce((sum, lic: any) => sum + ((Number(lic.used_seats) || 0) * (Number(lic.cost_per_seat) || 0)), 0);
  const maxSpendPotential = currentLicenses.reduce((sum, lic: any) => sum + ((Number(lic.total_seats) || 0) * (Number(lic.cost_per_seat) || 0)), 0);
  const overallUsedSeats = currentLicenses.reduce((sum, lic: any) => sum + (Number(lic.used_seats) || 0), 0);
  const overallTotalSeats = currentLicenses.reduce((sum, lic: any) => sum + (Number(lic.total_seats) || 0), 0);
  const globalSeatAllocationRate = overallTotalSeats > 0 ? Math.round((overallUsedSeats / overallTotalSeats) * 100) : 0;

  return (
    <div className="max-w-[1600px] mx-auto space-y-12 p-4 sm:p-8 pb-20">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 sm:gap-6">
        <div className="space-y-4">
           <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-zinc-950 text-white text-[10px] font-black tracking-widest uppercase py-1 px-3 rounded-lg border-none shadow-md">SaaS Assets</Badge>
              <div className="h-px w-8 bg-zinc-200" />
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Global SaaS Compliance Registry</span>
           </div>
           <h1 className="text-6xl font-black text-zinc-900 tracking-tighter leading-none">Licenses <span className="text-zinc-300">Vault.</span></h1>
           <p className="text-zinc-500 font-medium max-w-sm text-sm">A centralized, high-precision tracker for cloud software allocations and budget efficiency.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
           <Button variant="outline" className="border-2 border-zinc-200 font-black rounded-2xl px-6 h-14 hover:bg-zinc-50 transition-all">
              <ShieldCheck className="w-5 h-5 mr-3 text-emerald-500" />
              COMPLIANCE STATUS
           </Button>
           <Button 
             onClick={() => setIsAddModalOpen(true)}
             className="bg-zinc-950 text-white bg-gradient-to-br from-zinc-800 to-zinc-950 hover:from-orange-500 hover:to-orange-600 border-none gap-3 font-black shadow-2xl rounded-2xl px-8 h-14 transition-all active:scale-95 group"
           >
              <Plus className="w-5 h-5 transition-transform group-hover:scale-110" />
              REGISTER SOFTWARE
           </Button>
        </div>
      </div>

      {/* Analytics Bento Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-zinc-950 p-8 rounded-[2.5rem] border border-zinc-800 shadow-2xl relative overflow-hidden group"
        >
           <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-transform">
              <Layers className="w-24 h-24 text-white" />
           </div>
           <div className="relative z-10 flex flex-col justify-between h-full">
              <div className="label-micro text-zinc-500 mb-8">Monthly SaaS Burn</div>
              <div>
                 <div className="text-5xl font-black text-white tracking-tighter mb-2">${grossMonthlySpend.toLocaleString()}</div>
                 <div className="flex items-center gap-2 text-[10px] font-black text-orange-400 uppercase tracking-widest">
                    Max Potential: ${maxSpendPotential.toLocaleString()}
                 </div>
              </div>
           </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm relative overflow-hidden group"
        >
           <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
              <Key className="w-24 h-24 text-zinc-950" />
           </div>
           <div className="relative z-10">
              <div className="label-micro text-zinc-400 mb-8">Active Subscriptions</div>
              <div className="text-5xl font-black text-zinc-950 tracking-tighter mb-2">{activeContracts}</div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">100% Verified Compliant</p>
           </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm relative overflow-hidden group"
        >
           <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-24 h-24 text-emerald-600" />
           </div>
           <div className="relative z-10">
              <div className="label-micro text-zinc-400 mb-8">Seat Allocation Efficiency</div>
              <div className="text-5xl font-black text-emerald-600 tracking-tighter mb-2">{globalSeatAllocationRate}%</div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{overallUsedSeats} used of {overallTotalSeats} total seats</p>
           </div>
        </motion.div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-2.5 rounded-3xl border border-zinc-100 shadow-sm relative z-10">
         <div className="relative flex-1 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300 group-focus-within:text-orange-500 transition-colors" />
            <Input 
              placeholder="Filter by software, package classification..." 
              className="pl-14 h-14 bg-transparent border-none focus-visible:ring-0 text-base font-medium placeholder:text-zinc-300"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
         </div>
      </div>

      {/* Primary Table */}
      <div className="bg-white rounded-[3rem] border border-zinc-100 shadow-2xl overflow-hidden relative">
        <Table>
          <TableHeader className="bg-zinc-50/50">
            <TableRow className="border-b border-zinc-100 hover:bg-transparent">
              <TableHead className="font-black uppercase text-[10px] tracking-[0.2em] text-zinc-400 pl-10 h-20">Software Suite</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-[0.2em] text-zinc-400 h-20">Classification</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-[0.2em] text-zinc-400 h-20">Seat Utilization Rate</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-[0.2em] text-zinc-400 h-20 text-center">Renewal Target</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-[0.2em] text-zinc-400 h-20 text-right pr-10">Budget Footprint</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-40">
                  <div className="flex flex-col items-center gap-4">
                    <Activity className="w-12 h-12 text-zinc-950 animate-spin" />
                    <p className="label-micro animate-pulse">Scanning Cloud License Registries...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-40">
                  <div className="flex flex-col items-center gap-4">
                     <Key className="w-16 h-16 text-zinc-100" />
                     <p className="text-zinc-400 font-bold uppercase tracking-widest text-[11px]">Zero cloud profiles match query</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              <AnimatePresence>
                {filtered.map((lic: any, idx) => {
                  const utilizationPercentage = lic.total_seats > 0 ? Math.round((lic.used_seats / lic.total_seats) * 100) : 0;
                  const isLowSeats = utilizationPercentage >= 95;
                  return (
                    <motion.tr 
                      key={lic._id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-all group"
                    >
                      <TableCell className="pl-10 py-6">
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 bg-zinc-950 rounded-[1.25rem] flex items-center justify-center text-white shadow-2xl group-hover:bg-orange-600 transition-all">
                             <Key className="w-6 h-6 text-orange-400" />
                          </div>
                          <div className="flex flex-col">
                             <span className="font-black text-zinc-900 text-base tracking-tighter leading-tight group-hover:text-orange-600 transition-colors uppercase">{lic.software_name}</span>
                             <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest mt-1">MASTER CONTRACT: LIC-{lic._id.slice(-6).toUpperCase()}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                         <Badge variant="outline" className="rounded-lg px-3 py-1 font-black text-[9px] uppercase tracking-widest border-zinc-200 text-zinc-400">
                            {lic.category}
                         </Badge>
                      </TableCell>
                      <TableCell className="w-[300px]">
                         <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-baseline">
                               <span className="text-xs font-black text-zinc-900">{lic.used_seats} / {lic.total_seats} Seats</span>
                               <span className={cn("text-[10px] font-black", isLowSeats ? "text-red-500" : "text-emerald-500")}>
                                  {utilizationPercentage}% Allocated
                               </span>
                            </div>
                            <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                               <div 
                                 className={cn("h-full transition-all duration-500", isLowSeats ? "bg-red-500" : "bg-emerald-500")}
                                 style={{ width: `${utilizationPercentage}%` }} 
                               />
                            </div>
                         </div>
                      </TableCell>
                      <TableCell className="text-center">
                         <div className="flex flex-col items-center">
                            <span className="text-[11px] font-black text-zinc-500 font-mono">
                               {format(new Date(lic.expiry_date), "MMM d, yyyy").toUpperCase()}
                            </span>
                            <div className="flex items-center gap-1 mt-1">
                               <Clock className="w-3 h-3 text-zinc-300" />
                               <span className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest">Compliance Lock</span>
                            </div>
                         </div>
                      </TableCell>
                      <TableCell className="text-right pr-10">
                         <div className="flex items-center justify-end gap-4">
                            <div className="flex flex-col items-end">
                               <span className="font-black text-zinc-900 text-base">${(lic.used_seats * lic.cost_per_seat).toLocaleString()}</span>
                               <span className="text-[10px] font-bold text-zinc-400 tracking-tight mt-1">Cost: ${lic.cost_per_seat}/seat/mo</span>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-10 w-10 text-zinc-300 hover:text-zinc-950 rounded-xl">
                                   <MoreVertical className="w-5 h-5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48 p-2 rounded-2xl shadow-2xl border-zinc-100">
                                <DropdownMenuItem 
                                  onClick={() => handleOpenEditModal(lic)}
                                  className="rounded-xl px-4 py-3 text-xs font-black gap-3 focus:bg-zinc-50 cursor-pointer"
                                >
                                  <Edit className="w-4 h-4" /> EDIT SETTINGS
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteLicense(lic._id)}
                                  className="rounded-xl px-4 py-3 text-xs font-black gap-3 text-rose-500 focus:bg-rose-50 focus:text-rose-600 cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" /> REMOVE LICENSE
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                         </div>
                      </TableCell>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add License Dialog */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-lg rounded-[2.5rem] p-10 border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black tracking-tighter flex items-center gap-2">
              <Plus className="w-6 h-6 text-orange-500" />
              Register Software Profile
            </DialogTitle>
            <DialogDescription className="font-medium text-zinc-500 text-sm">
              Log enterprise software profiles and active volume seat contracts.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddLicense} className="space-y-6 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label className="label-micro ml-1">Software / Suite Name</Label>
                <Input 
                  placeholder="e.g. GitHub Copilot for Business"
                  className="h-14 rounded-2xl border-zinc-200 font-black text-sm px-5 bg-zinc-50/50" 
                  value={formData.software_name}
                  onChange={(e) => setFormData({...formData, software_name: e.target.value})}
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="label-micro ml-1">Classification (Category)</Label>
                  <Input 
                    placeholder="e.g. AI Developer Tool"
                    className="h-14 rounded-2xl border-zinc-200 font-black text-sm px-5 bg-zinc-50/50" 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="label-micro ml-1">Cost per seat ($ / mo)</Label>
                  <Input 
                    type="number"
                    placeholder="e.g. 19"
                    className="h-14 rounded-2xl border-zinc-200 font-black text-sm px-5 bg-zinc-50/50" 
                    value={formData.cost_per_seat}
                    onChange={(e) => setFormData({...formData, cost_per_seat: e.target.value})}
                    required 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="label-micro ml-1">Total Contract Seats</Label>
                  <Input 
                    type="number"
                    placeholder="e.g. 100"
                    className="h-14 rounded-2xl border-zinc-200 font-black text-sm px-5 bg-zinc-50/50" 
                    value={formData.total_seats}
                    onChange={(e) => setFormData({...formData, total_seats: e.target.value})}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="label-micro ml-1">Allocated / Used Seats</Label>
                  <Input 
                    type="number"
                    placeholder="e.g. 50"
                    className="h-14 rounded-2xl border-zinc-200 font-black text-sm px-5 bg-zinc-50/50" 
                    value={formData.used_seats}
                    onChange={(e) => setFormData({...formData, used_seats: e.target.value})}
                    required 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="label-micro ml-1">Contract Expiry Date</Label>
                <Input 
                  type="date"
                  className="h-14 rounded-2xl border-zinc-200 font-black text-sm px-5 bg-zinc-50/50" 
                  value={formData.expiry_date}
                  onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
                  required 
                />
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button 
                type="submit" 
                className="w-full bg-zinc-950 text-white font-black h-16 text-lg rounded-2xl shadow-2xl hover:bg-zinc-800 transition-all active:scale-[0.98]" 
                disabled={isSubmitting}
              >
                {isSubmitting ? <Activity className="w-6 h-6 animate-spin" /> : "FINALIZE PROFILE ENTRY"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit License Dialog */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-lg rounded-[2.5rem] p-10 border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black tracking-tighter">Edit License Settings</DialogTitle>
            <DialogDescription className="font-medium text-zinc-500 text-sm">
              Adjust seat caps, renewal schedules, and pricing frameworks.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditLicenseSubmit} className="space-y-6 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label className="label-micro ml-1">Software / Suite Name</Label>
                <Input 
                  className="h-14 rounded-2xl border-zinc-200 font-black text-sm px-5 bg-zinc-50/50" 
                  value={editFormData.software_name}
                  onChange={(e) => setEditFormData({...editFormData, software_name: e.target.value})}
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="label-micro ml-1">Classification (Category)</Label>
                  <Input 
                    className="h-14 rounded-2xl border-zinc-200 font-black text-sm px-5 bg-zinc-50/50" 
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({...editFormData, category: e.target.value})}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="label-micro ml-1">Cost per seat ($ / mo)</Label>
                  <Input 
                    type="number"
                    className="h-14 rounded-2xl border-zinc-200 font-black text-sm px-5 bg-zinc-50/50" 
                    value={editFormData.cost_per_seat}
                    onChange={(e) => setEditFormData({...editFormData, cost_per_seat: e.target.value})}
                    required 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="label-micro ml-1">Total Seats</Label>
                  <Input 
                    type="number"
                    className="h-14 rounded-2xl border-zinc-200 font-black text-sm px-5 bg-zinc-50/50" 
                    value={editFormData.total_seats}
                    onChange={(e) => setEditFormData({...editFormData, total_seats: e.target.value})}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="label-micro ml-1">Allocated / Used Seats</Label>
                  <Input 
                    type="number"
                    className="h-14 rounded-2xl border-zinc-200 font-black text-sm px-5 bg-zinc-50/50" 
                    value={editFormData.used_seats}
                    onChange={(e) => setEditFormData({...editFormData, used_seats: e.target.value})}
                    required 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="label-micro ml-1">Contract Expiry Date</Label>
                <Input 
                  type="date"
                  className="h-14 rounded-2xl border-zinc-200 font-black text-sm px-5 bg-zinc-50/50" 
                  value={editFormData.expiry_date}
                  onChange={(e) => setEditFormData({...editFormData, expiry_date: e.target.value})}
                  required 
                />
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button 
                type="submit" 
                className="w-full bg-zinc-950 text-white font-black h-16 text-lg rounded-2xl shadow-2xl hover:bg-zinc-800 transition-all active:scale-[0.98]" 
                disabled={isSubmitting}
              >
                {isSubmitting ? <Activity className="w-6 h-6 animate-spin" /> : "SAVE CONTRACT SETTINGS"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
