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
  Wrench, 
  Plus, 
  Search, 
  TrendingUp, 
  Clock, 
  ShieldCheck, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  MoreVertical,
  Activity,
  Cpu,
  DollarSign
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

const INITIAL_MOCK_MAINTENANCE_LOGS = [
  {
    _id: "maint1",
    asset_id: { _id: "asset4", model: "Ubiquiti UniFi Dream Machine", serial_no: "UI-UDM-PRO-991" },
    issue: "SFP+ port is not registering link speed correctly. Overheating detected.",
    priority: "High",
    status: "In Progress",
    logged_at: "2026-02-14T09:00:00.000Z",
    cost: 120
  },
  {
    _id: "maint2",
    asset_id: { _id: "asset1", model: "MacBook Pro M3 Max", serial_no: "C02F19X0MD6R" },
    issue: "Slight backlight flicker near the notch. Diagnostics passed but needs panel swap.",
    priority: "Medium",
    status: "Pending",
    logged_at: "2026-02-15T14:30:00.000Z",
    cost: 450
  },
  {
    _id: "maint3",
    asset_id: { _id: "asset5", model: "Herman Miller Aeron", serial_no: "HM-AERON-99122" },
    issue: "Gas cylinder replacement and backrest alignment calibration.",
    priority: "Low",
    status: "Resolved",
    logged_at: "2026-01-10T11:15:00.000Z",
    resolved_at: "2026-01-12T16:00:00.000Z",
    cost: 85
  }
];

export default function Maintenance() {
  const [logs, setLogs] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLog, setSelectedLog] = useState<any>(null);

  // Forms state
  const [formData, setFormData] = useState({
    asset_id: "",
    issue: "",
    priority: "Medium",
    status: "Pending",
    cost: ""
  });

  const [editFormData, setEditFormData] = useState({
    _id: "",
    asset_id: "",
    issue: "",
    priority: "Medium",
    status: "Pending",
    cost: ""
  });

  const fetchLogs = async () => {
    try {
      const res = await api.get("/maintenance");
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        setLogs(res.data);
        localStorage.setItem("maintenance_logs", JSON.stringify(res.data));
      } else if (res.data && Array.isArray(res.data)) {
        setLogs([]);
        localStorage.setItem("maintenance_logs", JSON.stringify([]));
      } else {
        const local = localStorage.getItem("maintenance_logs");
        if (local) {
          try {
            const parsed = JSON.parse(local);
            if (Array.isArray(parsed)) {
              setLogs(parsed);
            } else {
              localStorage.setItem("maintenance_logs", JSON.stringify(INITIAL_MOCK_MAINTENANCE_LOGS));
              setLogs(INITIAL_MOCK_MAINTENANCE_LOGS);
            }
          } catch {
            localStorage.setItem("maintenance_logs", JSON.stringify(INITIAL_MOCK_MAINTENANCE_LOGS));
            setLogs(INITIAL_MOCK_MAINTENANCE_LOGS);
          }
        } else {
          localStorage.setItem("maintenance_logs", JSON.stringify(INITIAL_MOCK_MAINTENANCE_LOGS));
          setLogs(INITIAL_MOCK_MAINTENANCE_LOGS);
        }
      }
    } catch (e) {
      console.warn("API offline, falling back to local storage");
      const local = localStorage.getItem("maintenance_logs");
      if (local) {
        try {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed)) {
            setLogs(parsed);
          } else {
            localStorage.setItem("maintenance_logs", JSON.stringify(INITIAL_MOCK_MAINTENANCE_LOGS));
            setLogs(INITIAL_MOCK_MAINTENANCE_LOGS);
          }
        } catch {
          localStorage.setItem("maintenance_logs", JSON.stringify(INITIAL_MOCK_MAINTENANCE_LOGS));
          setLogs(INITIAL_MOCK_MAINTENANCE_LOGS);
        }
      } else {
        localStorage.setItem("maintenance_logs", JSON.stringify(INITIAL_MOCK_MAINTENANCE_LOGS));
        setLogs(INITIAL_MOCK_MAINTENANCE_LOGS);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAssetsForSelect = () => {
    try {
      const localAssets = localStorage.getItem("assets");
      if (localAssets) {
        setAssets(JSON.parse(localAssets));
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchAssetsForSelect();
  }, []);

  const handleAddTicket = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const chosenAsset = assets.find(a => a._id === formData.asset_id);
      if (!chosenAsset) {
        toast.error("Please select a valid hardware node");
        return;
      }

      const newLog = {
        _id: "maint_" + Date.now(),
        asset_id: {
          _id: chosenAsset._id,
          model: chosenAsset.model,
          serial_no: chosenAsset.serial_no
        },
        issue: formData.issue,
        priority: formData.priority,
        status: formData.status,
        logged_at: new Date().toISOString(),
        cost: Number(formData.cost) || 0
      };

      const currentLogs = Array.isArray(logs) ? logs : [];
      const updated = [newLog, ...currentLogs];
      localStorage.setItem("maintenance_logs", JSON.stringify(updated));
      setLogs(updated);

      // Flag asset state in assets registry as well
      const currentAssets = Array.isArray(assets) ? assets : [];
      const updatedAssets = [...currentAssets];
      const assetIdx = updatedAssets.findIndex(a => a._id === chosenAsset._id);
      if (assetIdx !== -1) {
        updatedAssets[assetIdx].status = "Maintenance";
        localStorage.setItem("assets", JSON.stringify(updatedAssets));
        setAssets(updatedAssets);
      }

      toast.success("Maintenance ticket dispatched successfully");
      setIsAddModalOpen(false);
      setFormData({
        asset_id: "",
        issue: "",
        priority: "Medium",
        status: "Pending",
        cost: ""
      });
    } catch (error) {
      toast.error("Dispatched failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEditModal = (log: any) => {
    setSelectedLog(log);
    setEditFormData({
      _id: log._id,
      asset_id: log.asset_id?._id || "",
      issue: log.issue,
      priority: log.priority || "Medium",
      status: log.status || "Pending",
      cost: String(log.cost || "")
    });
    setIsEditModalOpen(true);
  };

  const handleEditTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const currentLogs = Array.isArray(logs) ? logs : [];
      const updated = [...currentLogs];
      const index = updated.findIndex(log => log._id === editFormData._id);
      if (index !== -1) {
        const prevStatus = updated[index].status;
        const finalStatus = editFormData.status;

        updated[index] = {
          ...updated[index],
          issue: editFormData.issue,
          priority: editFormData.priority,
          status: finalStatus,
          cost: Number(editFormData.cost) || 0,
          resolved_at: finalStatus === "Resolved" ? new Date().toISOString() : undefined
        };
        localStorage.setItem("maintenance_logs", JSON.stringify(updated));
        setLogs(updated);

        // If ticket was resolved, mark asset back to Available in assets!
        if (finalStatus === "Resolved" && prevStatus !== "Resolved") {
          const currentAssets = Array.isArray(assets) ? assets : [];
          const updatedAssets = [...currentAssets];
          const assetIdx = updatedAssets.findIndex(a => a._id === updated[index].asset_id?._id);
          if (assetIdx !== -1) {
            updatedAssets[assetIdx].status = "Available";
            localStorage.setItem("assets", JSON.stringify(updatedAssets));
            setAssets(updatedAssets);
          }
        }

        toast.success("Ticket diagnostic metadata updated");
        setIsEditModalOpen(false);
      }
    } catch (err) {
      toast.error("Failed to update ticket parameters");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickResolve = (log: any) => {
    try {
      const currentLogs = Array.isArray(logs) ? logs : [];
      const updated = [...currentLogs];
      const index = updated.findIndex(l => l._id === log._id);
      if (index !== -1) {
        updated[index].status = "Resolved";
        updated[index].resolved_at = new Date().toISOString();
        localStorage.setItem("maintenance_logs", JSON.stringify(updated));
        setLogs(updated);

        // Put asset back to Available
        const currentAssets = Array.isArray(assets) ? assets : [];
        const updatedAssets = [...currentAssets];
        const assetIdx = updatedAssets.findIndex(a => a._id === log.asset_id?._id);
        if (assetIdx !== -1) {
          updatedAssets[assetIdx].status = "Available";
          localStorage.setItem("assets", JSON.stringify(updatedAssets));
          setAssets(updatedAssets);
        }

        toast.success(`Ticket for ${log.asset_id?.model} resolved successfully`);
      }
    } catch (err) {
      toast.error("Resolution failed");
    }
  };

  const handleDeleteTicket = (id: string) => {
    try {
      const currentLogs = Array.isArray(logs) ? logs : [];
      const updated = currentLogs.filter(log => log._id !== id);
      localStorage.setItem("maintenance_logs", JSON.stringify(updated));
      setLogs(updated);
      toast.success("Ticket purged from system registries");
    } catch (err) {
      toast.error("Failed to delete ticket");
    }
  };

  const currentLogs = Array.isArray(logs) ? logs : [];

  const filtered = currentLogs.filter((log: any) => 
    (log.issue || "").toLowerCase().includes(search.toLowerCase()) ||
    (log.asset_id?.model || "").toLowerCase().includes(search.toLowerCase()) ||
    (log.asset_id?.serial_no || "").toLowerCase().includes(search.toLowerCase())
  );

  // Stats calculation
  const openTickets = currentLogs.filter((log: any) => log.status !== "Resolved").length;
  const inProgressTickets = currentLogs.filter((log: any) => log.status === "In Progress").length;
  const totalRepairSpend = currentLogs.reduce((sum, log: any) => sum + (Number(log.cost) || 0), 0);

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case "High": return <Badge className="bg-rose-50 border-none text-rose-700 font-black uppercase text-[9px] tracking-widest px-2.5 py-1 rounded-lg">High Priority</Badge>;
      case "Medium": return <Badge className="bg-amber-50 border-none text-amber-700 font-black uppercase text-[9px] tracking-widest px-2.5 py-1 rounded-lg">Medium Priority</Badge>;
      case "Low": return <Badge className="bg-blue-50 border-none text-blue-700 font-black uppercase text-[9px] tracking-widest px-2.5 py-1 rounded-lg">Low Priority</Badge>;
      default: return <Badge variant="outline">{p}</Badge>;
    }
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case "Pending": return <Badge className="bg-zinc-100 border-none text-zinc-700 font-black uppercase text-[9px] tracking-widest px-2.5 py-1 rounded-lg animate-pulse">Diagnostics pending</Badge>;
      case "In Progress": return <Badge className="bg-orange-50 border-none text-orange-600 font-black uppercase text-[9px] tracking-widest px-2.5 py-1 rounded-lg">Bench testing</Badge>;
      case "Resolved": return <Badge className="bg-emerald-50 border-none text-emerald-700 font-black uppercase text-[9px] tracking-widest px-2.5 py-1 rounded-lg">Resolved OK</Badge>;
      default: return <Badge variant="outline">{s}</Badge>;
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-12 p-4 sm:p-8 pb-20">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 sm:gap-6">
        <div className="space-y-4">
           <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-rose-600 text-white text-[10px] font-black tracking-widest uppercase py-1 px-3 rounded-lg border-none shadow-md">Engineering Ops</Badge>
              <div className="h-px w-8 bg-zinc-200" />
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Hardware Reliability Logs</span>
           </div>
           <h1 className="text-6xl font-black text-zinc-900 tracking-tighter leading-none">Repairs <span className="text-zinc-300">Lab.</span></h1>
           <p className="text-zinc-500 font-medium max-w-sm text-sm">Dispatched tickets, technical diagnostic parameters, and aggregated repair cost trackers.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
           <Button variant="outline" className="border-2 border-zinc-200 font-black rounded-2xl px-6 h-14 hover:bg-zinc-50 transition-all">
              <ShieldCheck className="w-5 h-5 mr-3 text-emerald-500" />
              BENCH METRICS
           </Button>
           <Button 
             onClick={() => setIsAddModalOpen(true)}
             className="bg-zinc-950 text-white bg-gradient-to-br from-zinc-800 to-zinc-950 hover:from-orange-500 hover:to-orange-600 border-none gap-3 font-black shadow-2xl rounded-2xl px-8 h-14 transition-all active:scale-95 group"
           >
              <Plus className="w-5 h-5 transition-transform group-hover:scale-110" />
              DISPATCH TICKET
           </Button>
        </div>
      </div>

      {/* Analytics Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-zinc-950 p-8 rounded-[2.5rem] border border-zinc-800 shadow-2xl relative overflow-hidden group"
        >
           <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-transform">
              <Wrench className="w-24 h-24 text-white" />
           </div>
           <div className="relative z-10 flex flex-col justify-between h-full">
              <div className="label-micro text-zinc-500 mb-8">Active Tickets</div>
              <div>
                 <div className="text-5xl font-black text-white tracking-tighter mb-2">{openTickets}</div>
                 <div className="flex items-center gap-2 text-[10px] font-black text-orange-400 uppercase tracking-widest">
                    {inProgressTickets} currently on test bench
                 </div>
              </div>
           </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm relative overflow-hidden group"
        >
           <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
              <DollarSign className="w-24 h-24 text-zinc-950" />
           </div>
           <div className="relative z-10">
              <div className="label-micro text-zinc-400 mb-8">Aggregated Repair Spend</div>
              <div className="text-5xl font-black text-zinc-950 tracking-tighter mb-2">${totalRepairSpend.toLocaleString()}</div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Gross Maintenance Budget</p>
           </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm relative overflow-hidden group"
        >
           <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
              <Activity className="w-24 h-24 text-emerald-600" />
           </div>
           <div className="relative z-10">
              <div className="label-micro text-zinc-400 mb-8">SLA Resolution Rate</div>
              <div className="text-5xl font-black text-emerald-600 tracking-tighter mb-2">
                 {logs.length > 0 ? Math.round((logs.filter(l => l.status === "Resolved").length / logs.length) * 100) : 100}%
              </div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Mean Time to Resolve &lt; 48h</p>
           </div>
        </motion.div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-2.5 rounded-3xl border border-zinc-100 shadow-sm relative z-10">
         <div className="relative flex-1 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300 group-focus-within:text-orange-500 transition-colors" />
            <Input 
              placeholder="Query logs by issue keyword, serial or model..." 
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
              <TableHead className="font-black uppercase text-[10px] tracking-[0.2em] text-zinc-400 pl-10 h-20">Hardware Unit</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-[0.2em] text-zinc-400 h-20">Failure Diagnostic Report</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-[0.2em] text-zinc-400 h-20 text-center">Urgency Tier</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-[0.2em] text-zinc-400 h-20 text-center">Lifecycle State</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-[0.2em] text-zinc-400 h-20 text-right pr-10">Accrued Repair Cost</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-40">
                  <div className="flex flex-col items-center gap-4">
                    <Activity className="w-12 h-12 text-zinc-950 animate-spin" />
                    <p className="label-micro animate-pulse">Pulling Laboratory Logs...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-40">
                  <div className="flex flex-col items-center gap-4">
                     <Wrench className="w-16 h-16 text-zinc-100" />
                     <p className="text-zinc-400 font-bold uppercase tracking-widest text-[11px]">Laboratory is pristine - no tickets</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              <AnimatePresence>
                {filtered.map((log: any, idx) => (
                  <motion.tr 
                    key={log._id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-all group"
                  >
                    <TableCell className="pl-10 py-6">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-zinc-950 rounded-[1.25rem] flex items-center justify-center text-white shadow-2xl group-hover:bg-orange-600 transition-all">
                           <Cpu className="w-6 h-6 text-orange-400" />
                        </div>
                        <div className="flex flex-col">
                           <span className="font-black text-zinc-900 text-base tracking-tighter leading-tight group-hover:text-orange-600 transition-colors uppercase">{log.asset_id?.model}</span>
                           <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest mt-1">Serial: {log.asset_id?.serial_no}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[400px]">
                       <div className="flex flex-col">
                          <span className="text-zinc-700 font-medium text-sm leading-relaxed line-clamp-2">{log.issue}</span>
                          <span className="text-[9px] font-black text-zinc-300 uppercase tracking-widest mt-1">
                             Dispatched: {format(new Date(log.logged_at), "MMM d, yyyy h:mm a")}
                          </span>
                       </div>
                    </TableCell>
                    <TableCell className="text-center">
                       {getPriorityBadge(log.priority)}
                    </TableCell>
                    <TableCell className="text-center">
                       {getStatusBadge(log.status)}
                    </TableCell>
                    <TableCell className="text-right pr-10">
                       <div className="flex items-center justify-end gap-4">
                          <div className="flex flex-col items-end">
                             <span className="font-black text-zinc-900 text-base">${(log.cost || 0).toLocaleString()}</span>
                             {log.resolved_at && (
                                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-tight mt-1">Closed OK</span>
                             )}
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-10 w-10 text-zinc-300 hover:text-zinc-950 rounded-xl">
                                 <MoreVertical className="w-5 h-5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 p-2 rounded-2xl shadow-2xl border-zinc-100">
                              {log.status !== "Resolved" && (
                                <DropdownMenuItem 
                                  onClick={() => handleQuickResolve(log)}
                                  className="rounded-xl px-4 py-3 text-xs font-black gap-3 focus:bg-emerald-50 focus:text-emerald-700 cursor-pointer"
                                >
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> RESOLVE TICKET
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem 
                                onClick={() => handleOpenEditModal(log)}
                                className="rounded-xl px-4 py-3 text-xs font-black gap-3 focus:bg-zinc-50 cursor-pointer"
                              >
                                <Edit className="w-4 h-4" /> DIAGNOSTIC PARAMETERS
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteTicket(log._id)}
                                className="rounded-xl px-4 py-3 text-xs font-black gap-3 text-rose-500 focus:bg-rose-50 focus:text-rose-600 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" /> PURGE TICKET
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                       </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Ticket Dialog */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-lg rounded-[2.5rem] p-10 border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black tracking-tighter flex items-center gap-2">
              <Plus className="w-6 h-6 text-orange-500" />
              Dispatch Repair Ticket
            </DialogTitle>
            <DialogDescription className="font-medium text-zinc-500 text-sm">
              Log a technical malfunction and deploy a laboratory repair cycle.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddTicket} className="space-y-6 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label className="label-micro ml-1">Target Hardware Node</Label>
                <Select onValueChange={(v) => setFormData({...formData, asset_id: v})}>
                  <SelectTrigger className="h-14 font-black text-sm bg-zinc-50 border-zinc-100 rounded-2xl px-6">
                    <SelectValue placeholder="Search target hardware serial..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl p-2 border-zinc-100 shadow-2xl max-h-[300px]">
                    {assets.map((ast: any) => (
                      <SelectItem key={ast._id} value={ast._id} className="rounded-xl py-4 font-bold">
                        <div className="flex flex-col text-left">
                           <span className="text-sm font-black text-zinc-900">{ast.model}</span>
                           <span className="text-[10px] text-zinc-400 uppercase tracking-widest">{ast.serial_no} • {ast.status}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="label-micro ml-1">Diagnostic Report / Issue</Label>
                <Input 
                  placeholder="Describe failure parameters..."
                  className="h-14 rounded-2xl border-zinc-200 font-black text-sm px-5 bg-zinc-50/50" 
                  value={formData.issue}
                  onChange={(e) => setFormData({...formData, issue: e.target.value})}
                  required 
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2 col-span-1">
                  <Label className="label-micro ml-1">Priority</Label>
                  <Select value={formData.priority} onValueChange={(v) => setFormData({...formData, priority: v})}>
                    <SelectTrigger className="h-14 border-zinc-200 rounded-2xl font-black text-sm px-5 bg-zinc-50/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-zinc-100 p-2">
                      <SelectItem value="Low" className="rounded-xl py-2 font-bold">Low</SelectItem>
                      <SelectItem value="Medium" className="rounded-xl py-2 font-bold">Medium</SelectItem>
                      <SelectItem value="High" className="rounded-xl py-2 font-bold">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 col-span-1">
                  <Label className="label-micro ml-1">Status</Label>
                  <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                    <SelectTrigger className="h-14 border-zinc-200 rounded-2xl font-black text-sm px-5 bg-zinc-50/50">
                       <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-zinc-100 p-2">
                      <SelectItem value="Pending" className="rounded-xl py-2 font-bold">Pending</SelectItem>
                      <SelectItem value="In Progress" className="rounded-xl py-2 font-bold">In Progress</SelectItem>
                      <SelectItem value="Resolved" className="rounded-xl py-2 font-bold">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 col-span-1">
                  <Label className="label-micro ml-1">Estimated Cost ($)</Label>
                  <Input 
                    type="number"
                    placeholder="0"
                    className="h-14 border-zinc-200 rounded-2xl font-black text-sm px-5 bg-zinc-50/50" 
                    value={formData.cost}
                    onChange={(e) => setFormData({...formData, cost: e.target.value})}
                    required 
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button 
                type="submit" 
                className="w-full bg-zinc-950 text-white font-black h-16 text-lg rounded-2xl shadow-2xl hover:bg-zinc-800 transition-all active:scale-[0.98]" 
                disabled={isSubmitting}
              >
                {isSubmitting ? <Activity className="w-6 h-6 animate-spin" /> : "DISPATCH TICKET"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Ticket Dialog */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-lg rounded-[2.5rem] p-10 border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black tracking-tighter">Diagnostic parameters</DialogTitle>
            <DialogDescription className="font-medium text-zinc-500 text-sm">
              Adjust technician parameters and financial expenditures for this case.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditTicketSubmit} className="space-y-6 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label className="label-micro ml-1">Diagnostic Report / Issue</Label>
                <Input 
                  className="h-14 rounded-2xl border-zinc-200 font-black text-sm px-5 bg-zinc-50/50" 
                  value={editFormData.issue}
                  onChange={(e) => setEditFormData({...editFormData, issue: e.target.value})}
                  required 
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2 col-span-1">
                  <Label className="label-micro ml-1">Priority</Label>
                  <Select value={editFormData.priority} onValueChange={(v) => setEditFormData({...editFormData, priority: v})}>
                    <SelectTrigger className="h-14 border-zinc-200 rounded-2xl font-black text-sm px-5 bg-zinc-50/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-zinc-100 p-2">
                      <SelectItem value="Low" className="rounded-xl py-2 font-bold">Low</SelectItem>
                      <SelectItem value="Medium" className="rounded-xl py-2 font-bold">Medium</SelectItem>
                      <SelectItem value="High" className="rounded-xl py-2 font-bold">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 col-span-1">
                  <Label className="label-micro ml-1">Status</Label>
                  <Select value={editFormData.status} onValueChange={(v) => setEditFormData({...editFormData, status: v})}>
                    <SelectTrigger className="h-14 border-zinc-200 rounded-2xl font-black text-sm px-5 bg-zinc-50/50">
                       <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-zinc-100 p-2">
                      <SelectItem value="Pending" className="rounded-xl py-2 font-bold">Pending</SelectItem>
                      <SelectItem value="In Progress" className="rounded-xl py-2 font-bold">In Progress</SelectItem>
                      <SelectItem value="Resolved" className="rounded-xl py-2 font-bold">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 col-span-1">
                  <Label className="label-micro ml-1">Repair Cost ($)</Label>
                  <Input 
                    type="number"
                    className="h-14 rounded-2xl border-zinc-200 font-black text-sm px-5 bg-zinc-50/50" 
                    value={editFormData.cost}
                    onChange={(e) => setEditFormData({...editFormData, cost: e.target.value})}
                    required 
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button 
                type="submit" 
                className="w-full bg-zinc-950 text-white font-black h-16 text-lg rounded-2xl shadow-2xl hover:bg-zinc-800 transition-all active:scale-[0.98]" 
                disabled={isSubmitting}
              >
                {isSubmitting ? <Activity className="w-6 h-6 animate-spin" /> : "SAVE PARAMETERS"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
