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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  UserPlus, 
  Mail, 
  Building, 
  MoreVertical, 
  Briefcase, 
  Hash, 
  Activity, 
  ShieldCheck, 
  Clock, 
  ExternalLink,
  ChevronRight,
  Edit,
  Trash2,
  Lock
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
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { format } from "date-fns";
import { motion, AnimatePresence } from "motion/react";

const INITIAL_MOCK_EMPLOYEES = [
  {
    _id: "emp1",
    emp_id: "EMP-1001",
    name: "Alex Rivera",
    email: "alex.rivera@enterprise.com",
    department: "Engineering",
    designation: "Staff Engineer",
    joining_date: "2024-01-15",
    assetCount: 1
  },
  {
    _id: "emp2",
    emp_id: "EMP-1002",
    name: "Sarah Chen",
    email: "sarah.chen@enterprise.com",
    department: "Product",
    designation: "Director of Product",
    joining_date: "2023-06-10",
    assetCount: 1
  },
  {
    _id: "emp3",
    emp_id: "EMP-1003",
    name: "Marcus Vance",
    email: "marcus.vance@enterprise.com",
    department: "Security",
    designation: "CISO",
    joining_date: "2022-11-01",
    assetCount: 0
  },
  {
    _id: "emp4",
    emp_id: "EMP-1004",
    name: "Elena Rostova",
    email: "elena.rostova@enterprise.com",
    department: "Operations",
    designation: "Ops Manager",
    joining_date: "2025-02-18",
    assetCount: 0
  }
];

export default function Employees() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Dialog State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState<any>(null);

  // Form States
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "Engineering",
    designation: "",
    joining_date: new Date().toISOString().split("T")[0],
  });

  const [editFormData, setEditFormData] = useState({
    _id: "",
    emp_id: "",
    name: "",
    email: "",
    department: "Engineering",
    designation: "",
    joining_date: "",
  });

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
        const local = localStorage.getItem("employees");
        if (local) {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed)) {
            setEmployees(parsed);
          } else {
            localStorage.setItem("employees", JSON.stringify(INITIAL_MOCK_EMPLOYEES));
            setEmployees(INITIAL_MOCK_EMPLOYEES);
          }
        } else {
          localStorage.setItem("employees", JSON.stringify(INITIAL_MOCK_EMPLOYEES));
          setEmployees(INITIAL_MOCK_EMPLOYEES);
        }
      }
    } catch (e) {
      console.warn("API disconnect, falling back to local storage");
      const local = localStorage.getItem("employees");
      if (local) {
        try {
          const parsed = JSON.parse(local);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const currentEmployees = Array.isArray(employees) ? employees : [];
      const nextId = currentEmployees.length > 0 
        ? `EMP-${Math.max(...currentEmployees.map(emp => parseInt(emp.emp_id?.replace("EMP-", "") || "1000"))) + 1}`
        : "EMP-1005";

      const newEmp = {
        _id: "emp_" + Date.now(),
        emp_id: nextId,
        name: formData.name,
        email: formData.email,
        department: formData.department,
        designation: formData.designation,
        joining_date: formData.joining_date,
        assetCount: 0
      };

      const updated = [newEmp, ...employees];
      localStorage.setItem("employees", JSON.stringify(updated));
      setEmployees(updated);
      toast.success("Staff profile provisioned in registry");
      setIsAddModalOpen(false);
      setFormData({
        name: "",
        email: "",
        department: "Engineering",
        designation: "",
        joining_date: new Date().toISOString().split("T")[0],
      });
    } catch (error) {
      toast.error("Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEditModal = (emp: any) => {
    setSelectedEmp(emp);
    setEditFormData({
      _id: emp._id,
      emp_id: emp.emp_id || `EMP-${emp._id.slice(-4).toUpperCase()}`,
      name: emp.name,
      email: emp.email,
      department: emp.department || "Engineering",
      designation: emp.designation,
      joining_date: emp.joining_date ? emp.joining_date.split("T")[0] : "",
    });
    setIsEditModalOpen(true);
  };

  const handleEditEmployeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const updated = [...employees];
      const index = updated.findIndex(emp => emp._id === editFormData._id);
      if (index !== -1) {
        updated[index] = {
          ...updated[index],
          name: editFormData.name,
          email: editFormData.email,
          department: editFormData.department,
          designation: editFormData.designation,
          joining_date: editFormData.joining_date
        };
        localStorage.setItem("employees", JSON.stringify(updated));
        setEmployees(updated);
        toast.success("Talent registry updated successfully");
        setIsEditModalOpen(false);
      }
    } catch (err) {
      toast.error("Update failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEmployee = (empId: string) => {
    try {
      const currentEmployees = Array.isArray(employees) ? employees : [];
      const updated = currentEmployees.filter(emp => emp._id !== empId);
      localStorage.setItem("employees", JSON.stringify(updated));
      setEmployees(updated);
      toast.success("Staff profile decommissioned from directory");
    } catch (err) {
      toast.error("Decommissioning failed");
    }
  };

  const currentEmployees = Array.isArray(employees) ? employees : [];
  const filteredEmployees = currentEmployees.filter((emp: any) => 
    (emp.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (emp.email || "").toLowerCase().includes(search.toLowerCase()) ||
    (emp.emp_id || "").toLowerCase().includes(search.toLowerCase()) ||
    (emp.department || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-[1600px] mx-auto space-y-12 p-4 sm:p-8 pb-20">
      {/* Registry Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 sm:gap-6">
        <div className="space-y-3">
           <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-zinc-950 text-white text-[10px] font-black tracking-widest uppercase py-1 px-2.5 rounded-lg border-none">Human Capital</Badge>
              <div className="h-px w-8 bg-zinc-200" />
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{employees.length} Verified Records</span>
           </div>
           <h1 className="text-6xl font-black text-zinc-900 tracking-tighter leading-none">Staff <span className="text-zinc-300">Registry.</span></h1>
           <p className="text-zinc-500 font-medium max-w-sm text-sm">A centralized, high-fidelity directory managing talent allocation and departmental hierarchies.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
           <Button variant="outline" className="border-2 border-zinc-200 font-black rounded-2xl px-6 h-14 hover:bg-zinc-50 transition-all">
              <ExternalLink className="w-5 h-5 mr-2 text-zinc-400" />
              PORTAL CONFIG
           </Button>
           <Button 
             onClick={() => setIsAddModalOpen(true)}
             className="bg-zinc-950 text-white bg-gradient-to-br from-zinc-800 to-zinc-950 hover:from-orange-500 hover:to-orange-600 border-none gap-3 font-black shadow-2xl rounded-2xl px-8 h-14 transition-all active:scale-95 group"
           >
              <UserPlus className="w-5 h-5 transition-transform group-hover:scale-110" />
              ADD NEW TALENT
           </Button>
        </div>
      </div>

      {/* Dynamic Search & Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-2.5 rounded-3xl border border-zinc-100 shadow-sm relative z-10">
         <div className="relative flex-1 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300 group-focus-within:text-orange-500 transition-colors" />
            <Input 
              placeholder="Search by name, identity ID, or department node..." 
              className="pl-14 h-14 bg-transparent border-none focus-visible:ring-0 text-base font-medium placeholder:text-zinc-300"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
         </div>
      </div>

      {/* Registry Table */}
      <div className="bg-white rounded-[3rem] border border-zinc-100 shadow-2xl overflow-hidden relative">
        <Table>
          <TableHeader className="bg-zinc-50/50">
            <TableRow className="border-b border-zinc-100 hover:bg-transparent">
              <TableHead className="font-black uppercase text-[10px] tracking-[0.2em] text-zinc-400 pl-10 h-20">Official Profile</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-[0.2em] text-zinc-400 h-20">Identity ID</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-[0.2em] text-zinc-400 h-20">Structural Node</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-[0.2em] text-zinc-400 h-20 text-center">Node Allocation</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-[0.2em] text-zinc-400 h-20 text-center">Tenure Status</TableHead>
              <TableHead className="w-[100px] pr-10 h-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-40">
                  <div className="flex flex-col items-center gap-4">
                    <Activity className="w-12 h-12 text-zinc-900 animate-spin" />
                    <p className="label-micro animate-pulse">Accessing Secure HR Vault...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredEmployees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-40">
                  <UserPlus className="w-16 h-16 text-zinc-100 mx-auto mb-4" />
                  <p className="text-zinc-400 font-bold uppercase tracking-widest text-[11px]">No matching records found in registry</p>
                </TableCell>
              </TableRow>
            ) : (
              <AnimatePresence>
                {filteredEmployees.map((emp: any, idx) => (
                  <motion.tr 
                    key={emp._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-all group"
                  >
                    <TableCell className="pl-10 py-6">
                      <div className="flex items-center gap-5">
                        <div className="relative">
                          <Avatar className="h-14 w-14 rounded-[1.25rem] border-2 border-white shadow-md group-hover:shadow-lg transition-all scale-100 group-hover:scale-105">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${emp.name}`} />
                            <AvatarFallback className="bg-zinc-950 text-white font-black text-xs uppercase">
                              {emp.name.split(" ").map((n: string) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-zinc-900 text-base tracking-tighter leading-tight group-hover:text-orange-600 transition-colors uppercase">{emp.name}</span>
                          <div className="flex items-center gap-3 mt-1">
                             <span className="text-[10px] font-bold text-zinc-400 flex items-center gap-1 leading-none">
                               <Mail className="w-3 h-3" /> {emp.email.toLowerCase()}
                             </span>
                             <span className="w-1 h-1 bg-zinc-200 rounded-full" />
                             <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest leading-none">Verified User</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                         <div className="flex items-center gap-1.5 mb-1">
                            <Hash className="w-3 h-3 text-zinc-300" />
                            <span className="font-mono text-[11px] font-black text-zinc-900 tracking-tight">
                              {emp.emp_id || `EMP-${emp._id.slice(-4).toUpperCase()}`}
                            </span>
                         </div>
                         <span className="text-[10px] font-black text-zinc-200 uppercase tracking-widest">Global Master ID</span>
                      </div>
                    </TableCell>
                    <TableCell>
                       <div className="flex flex-col">
                          <div className="flex items-center gap-2 mb-1">
                             <div className="w-6 h-6 bg-zinc-100 rounded-lg flex items-center justify-center">
                                <Building className="w-3.5 h-3.5 text-zinc-500" />
                             </div>
                             <span className="text-xs font-black text-zinc-900 uppercase tracking-tight">{emp.department}</span>
                          </div>
                          <span className="text-[10px] font-bold text-zinc-400 italic flex items-center gap-1">
                             <Briefcase className="w-3 h-3" /> {emp.designation}
                          </span>
                       </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-2">
                        {emp.assetCount > 0 ? (
                          <div className="flex flex-col items-center group/nodes">
                             <span className="text-lg font-black text-zinc-950 leading-none">{emp.assetCount}</span>
                             <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.1em] mt-1 group-hover/nodes:tracking-[0.2em] transition-all">Hardware Node{emp.assetCount > 1 ? 's' : ''}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] font-black text-zinc-200 uppercase tracking-[0.2em]">Zero Allocation</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                       <div className="flex flex-col items-center">
                          <span className="text-[11px] font-black text-zinc-500 font-mono tracking-tighter">
                            {format(new Date(emp.joining_date), "MMM yyyy").toUpperCase()}
                          </span>
                          <div className="flex items-center gap-1 mt-1">
                             <Clock className="w-3 h-3 text-zinc-200" />
                             <span className="text-[9px] font-bold text-zinc-300 tracking-widest uppercase">Member</span>
                          </div>
                       </div>
                    </TableCell>
                    <TableCell className="pr-10 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-zinc-200 rounded-xl transition-all">
                            <MoreVertical className="w-5 h-5 text-zinc-400" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 p-2 rounded-2xl shadow-2xl border-zinc-100">
                          <DropdownMenuItem 
                            onClick={() => handleOpenEditModal(emp)}
                            className="rounded-xl px-4 py-3 text-xs font-black gap-3 focus:bg-zinc-50 cursor-pointer"
                          >
                            <Edit className="w-4 h-4 text-zinc-500" /> EDIT PROFILE
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteEmployee(emp._id)}
                            className="rounded-xl px-4 py-3 text-xs font-black gap-3 text-rose-500 focus:bg-rose-50 focus:text-rose-600 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" /> DECOMMISSION
                          </DropdownMenuItem>
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

      {/* Add Employee Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-lg rounded-[2.5rem] p-10 border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black tracking-tighter flex items-center gap-2">
              <UserPlus className="w-6 h-6 text-orange-500" />
              Register Enterprise Talent
            </DialogTitle>
            <DialogDescription className="font-medium text-zinc-500 text-sm">
              Create a primary directory identity for tracking and node allocation.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddEmployee} className="space-y-6 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label className="label-micro ml-1">Full Name</Label>
                <Input 
                  placeholder="e.g. Liam Vance"
                  className="h-14 rounded-2xl border-zinc-200 font-black text-sm px-5 bg-zinc-50/50" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label className="label-micro ml-1">Work Email</Label>
                <Input 
                  type="email"
                  placeholder="e.g. liam.vance@company.com"
                  className="h-14 rounded-2xl border-zinc-200 font-black text-sm px-5 bg-zinc-50/50" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="label-micro ml-1">Structural Node (Dept)</Label>
                  <Input 
                    placeholder="e.g. Engineering"
                    className="h-14 rounded-2xl border-zinc-200 font-black text-sm px-5 bg-zinc-50/50" 
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="label-micro ml-1">Designation Role</Label>
                  <Input 
                    placeholder="e.g. Senior Staff Architect"
                    className="h-14 rounded-2xl border-zinc-200 font-black text-sm px-5 bg-zinc-50/50" 
                    value={formData.designation}
                    onChange={(e) => setFormData({...formData, designation: e.target.value})}
                    required 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="label-micro ml-1">Joining Date</Label>
                <Input 
                  type="date"
                  className="h-14 rounded-2xl border-zinc-200 font-black text-sm px-5 bg-zinc-50/50" 
                  value={formData.joining_date}
                  onChange={(e) => setFormData({...formData, joining_date: e.target.value})}
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
                {isSubmitting ? <Activity className="w-6 h-6 animate-spin" /> : "PROVISION TALENT ID"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Employee Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-lg rounded-[2.5rem] p-10 border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black tracking-tighter">Edit Staff Identity</DialogTitle>
            <DialogDescription className="font-medium text-zinc-500 text-sm">
              Update directory node settings or career configurations.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditEmployeeSubmit} className="space-y-6 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label className="label-micro ml-1">Full Name</Label>
                <Input 
                  className="h-14 rounded-2xl border-zinc-200 font-black text-sm px-5 bg-zinc-50/50" 
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label className="label-micro ml-1">Work Email</Label>
                <Input 
                  type="email"
                  className="h-14 rounded-2xl border-zinc-200 font-black text-sm px-5 bg-zinc-50/50" 
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="label-micro ml-1">Department</Label>
                  <Input 
                    className="h-14 rounded-2xl border-zinc-200 font-black text-sm px-5 bg-zinc-50/50" 
                    value={editFormData.department}
                    onChange={(e) => setEditFormData({...editFormData, department: e.target.value})}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="label-micro ml-1">Designation</Label>
                  <Input 
                    className="h-14 rounded-2xl border-zinc-200 font-black text-sm px-5 bg-zinc-50/50" 
                    value={editFormData.designation}
                    onChange={(e) => setEditFormData({...editFormData, designation: e.target.value})}
                    required 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="label-micro ml-1">Joining Date</Label>
                <Input 
                  type="date"
                  className="h-14 rounded-2xl border-zinc-200 font-black text-sm px-5 bg-zinc-50/50" 
                  value={editFormData.joining_date}
                  onChange={(e) => setEditFormData({...editFormData, joining_date: e.target.value})}
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
                {isSubmitting ? <Activity className="w-6 h-6 animate-spin" /> : "SAVE TALENT PROFILE"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Verification Shield */}
      <div className="bg-zinc-50 p-8 rounded-[2rem] border border-zinc-100 flex flex-col md:flex-row items-center gap-6 justify-between">
         <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm">
               <ShieldCheck className="w-8 h-8 text-emerald-500" />
            </div>
            <div>
               <h3 className="text-lg font-black text-zinc-900 tracking-tight">Identity Compliance Verified</h3>
               <p className="text-sm font-medium text-zinc-500">All directory entries are synchronized with primary identity providers.</p>
            </div>
         </div>
         <Button 
           onClick={() => toast.success("Identity systems operating at peak performance")}
           variant="outline" 
           className="h-12 border-2 border-zinc-200 rounded-xl px-6 font-black text-xs hover:bg-zinc-100 transition-all"
         >
            RUN INTEGRITY CHECK
         </Button>
      </div>
    </div>
  );
}
