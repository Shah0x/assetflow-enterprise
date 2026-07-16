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
  Zap, 
  Plus, 
  Search, 
  BarChart3, 
  TrendingDown, 
  AlertCircle, 
  Package, 
  ShoppingBag, 
  RefreshCw, 
  ArrowUpRight,
  Boxes,
  Activity,
  Edit,
  Trash2,
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
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

const INITIAL_MOCK_CONSUMABLES = [
  {
    _id: "cons1",
    name: "HP 65XL Ink Cartridge Black",
    category: "Ink",
    qty: 45,
    min_amt: 10,
    purchase_cost: 45
  },
  {
    _id: "cons2",
    name: "Dell Laser Toner 5130cdn",
    category: "Toner",
    qty: 8,
    min_amt: 10,
    purchase_cost: 110
  },
  {
    _id: "cons3",
    name: "Premium A4 Copier Paper (Case)",
    category: "Paper",
    qty: 25,
    min_amt: 5,
    purchase_cost: 35
  },
  {
    _id: "cons4",
    name: "Cat6 Ethernet Cable 10ft (10 Pack)",
    category: "Cabling",
    qty: 15,
    min_amt: 10,
    purchase_cost: 25
  },
  {
    _id: "cons5",
    name: "AA Batteries (Pack of 48)",
    category: "Power",
    qty: 3,
    min_amt: 8,
    purchase_cost: 18
  }
];

export default function Consumables() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Forms state
  const [formData, setFormData] = useState({
    name: "",
    category: "Ink",
    qty: "",
    min_amt: "",
    purchase_cost: ""
  });

  const [editFormData, setEditFormData] = useState({
    _id: "",
    name: "",
    category: "Ink",
    qty: "",
    min_amt: "",
    purchase_cost: ""
  });

  const fetchConsumables = async () => {
    try {
      const res = await api.get("/consumables");
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        setItems(res.data);
        localStorage.setItem("consumables", JSON.stringify(res.data));
      } else if (res.data && Array.isArray(res.data)) {
        setItems([]);
        localStorage.setItem("consumables", JSON.stringify([]));
      } else {
        const local = localStorage.getItem("consumables");
        if (local) {
          try {
            const parsed = JSON.parse(local);
            if (Array.isArray(parsed)) {
              setItems(parsed);
            } else {
              localStorage.setItem("consumables", JSON.stringify(INITIAL_MOCK_CONSUMABLES));
              setItems(INITIAL_MOCK_CONSUMABLES);
            }
          } catch {
            localStorage.setItem("consumables", JSON.stringify(INITIAL_MOCK_CONSUMABLES));
            setItems(INITIAL_MOCK_CONSUMABLES);
          }
        } else {
          localStorage.setItem("consumables", JSON.stringify(INITIAL_MOCK_CONSUMABLES));
          setItems(INITIAL_MOCK_CONSUMABLES);
        }
      }
    } catch (e) {
      console.warn("API offline, falling back to local storage");
      const local = localStorage.getItem("consumables");
      if (local) {
        try {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed)) {
            setItems(parsed);
          } else {
            localStorage.setItem("consumables", JSON.stringify(INITIAL_MOCK_CONSUMABLES));
            setItems(INITIAL_MOCK_CONSUMABLES);
          }
        } catch {
          localStorage.setItem("consumables", JSON.stringify(INITIAL_MOCK_CONSUMABLES));
          setItems(INITIAL_MOCK_CONSUMABLES);
        }
      } else {
        localStorage.setItem("consumables", JSON.stringify(INITIAL_MOCK_CONSUMABLES));
        setItems(INITIAL_MOCK_CONSUMABLES);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsumables();
  }, []);

  const handleAddConsumable = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const newItem = {
        _id: "cons_" + Date.now(),
        name: formData.name,
        category: formData.category,
        qty: Number(formData.qty) || 0,
        min_amt: Number(formData.min_amt) || 0,
        purchase_cost: Number(formData.purchase_cost) || 0
      };

      const currentList = Array.isArray(items) ? items : [];
      const updated = [newItem, ...currentList];
      localStorage.setItem("consumables", JSON.stringify(updated));
      setItems(updated);
      toast.success("Consumable SKU registered successfully");
      setIsAddModalOpen(false);
      setFormData({
        name: "",
        category: "Ink",
        qty: "",
        min_amt: "",
        purchase_cost: ""
      });
    } catch (error) {
      toast.error("Failed to add SKU");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEditModal = (item: any) => {
    setSelectedItem(item);
    setEditFormData({
      _id: item._id,
      name: item.name,
      category: item.category || "Ink",
      qty: String(item.qty),
      min_amt: String(item.min_amt),
      purchase_cost: String(item.purchase_cost)
    });
    setIsEditModalOpen(true);
  };

  const handleEditConsumableSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const currentList = Array.isArray(items) ? items : [];
      const updated = [...currentList];
      const index = updated.findIndex(item => item._id === editFormData._id);
      if (index !== -1) {
        updated[index] = {
          ...updated[index],
          name: editFormData.name,
          category: editFormData.category,
          qty: Number(editFormData.qty) || 0,
          min_amt: Number(editFormData.min_amt) || 0,
          purchase_cost: Number(editFormData.purchase_cost) || 0
        };
        localStorage.setItem("consumables", JSON.stringify(updated));
        setItems(updated);
        toast.success("SKU stock levels saved successfully");
        setIsEditModalOpen(false);
      }
    } catch (err) {
      toast.error("Failed to update SKU");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConsumable = (id: string) => {
    try {
      const currentList = Array.isArray(items) ? items : [];
      const updated = currentList.filter(item => item._id !== id);
      localStorage.setItem("consumables", JSON.stringify(updated));
      setItems(updated);
      toast.success("Consumable SKU deleted from system");
    } catch (err) {
      toast.error("Failed to delete SKU");
    }
  };

  const handleQuickRestock = (item: any) => {
    try {
      const currentList = Array.isArray(items) ? items : [];
      const updated = [...currentList];
      const index = updated.findIndex(i => i._id === item._id);
      if (index !== -1) {
        updated[index].qty += 50; // Add standard restock packet
        localStorage.setItem("consumables", JSON.stringify(updated));
        setItems(updated);
        toast.success(`Quick restock of +50 units complete for ${item.name}`);
      }
    } catch (err) {
      toast.error("Restock failure");
    }
  };

  const currentItems = Array.isArray(items) ? items : [];

  const filtered = currentItems.filter((i: any) => 
    (i.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (i.category || "").toLowerCase().includes(search.toLowerCase())
  );

  const lowStockCount = currentItems.filter((i: any) => i.qty <= i.min_amt).length;
  const totalQty = currentItems.reduce((acc, i: any) => acc + (Number(i.qty) || 0), 0);

  return (
    <div className="max-w-[1600px] mx-auto space-y-12 p-4 sm:p-8 pb-20">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 sm:gap-6">
        <div className="space-y-4">
           <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-orange-500 text-white text-[10px] font-black tracking-widest uppercase py-1 px-3 rounded-lg border-none shadow-[0_0_15px_rgba(249,115,22,0.3)]">Supply Chain</Badge>
              <div className="h-px w-8 bg-zinc-200" />
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Global Supply Registry</span>
           </div>
           <h1 className="text-6xl font-black text-zinc-900 tracking-tighter leading-none">Inventory <span className="text-zinc-300">Hub.</span></h1>
           <p className="text-zinc-500 font-medium max-w-sm text-sm">Synchronized tracking for high-turnover peripheral assets and IT consumables.</p>
        </div>
        <div className="flex items-center gap-3">
           <Button 
             onClick={() => toast.success("AI-driven vendor reorder requests have been automated.")}
             variant="outline" 
             className="border-2 border-zinc-200 font-black rounded-2xl px-6 h-14 hover:bg-zinc-50 transition-all"
           >
              <RefreshCw className="w-5 h-5 mr-3 text-zinc-400 animate-spin-slow" />
              REORDER AUTOMATION
           </Button>
           <Button 
             onClick={() => setIsAddModalOpen(true)}
             className="bg-zinc-950 text-white bg-gradient-to-br from-zinc-800 to-zinc-950 hover:from-orange-500 hover:to-orange-600 border-none gap-3 font-black shadow-2xl rounded-2xl px-8 h-14 transition-all active:scale-95 group"
           >
              <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
              ADD STOCK
           </Button>
        </div>
      </div>

      {/* Analytics Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-zinc-950 p-8 rounded-[2.5rem] border border-zinc-800 shadow-2xl relative overflow-hidden group"
        >
           <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-transform">
              <Boxes className="w-24 h-24 text-white" />
           </div>
           <div className="relative z-10 flex flex-col justify-between h-full">
              <div className="label-micro text-zinc-500 mb-8">Active SKUs</div>
              <div>
                 <div className="text-5xl font-black text-white tracking-tighter mb-2">{items.length}</div>
                 <div className="flex items-center gap-2 text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                    <TrendingDown className="w-3 h-3 rotate-180" />
                    +12.4% vs LQM
                 </div>
              </div>
           </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm relative overflow-hidden group"
        >
           <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
              <AlertCircle className="w-24 h-24 text-red-600" />
           </div>
           <div className="relative z-10">
              <div className="label-micro text-zinc-400 mb-8">Critical Alerts</div>
              <div className="text-5xl font-black text-red-600 tracking-tighter mb-2">{lowStockCount}</div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest italic">Action Required via SCM</p>
           </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm relative overflow-hidden group"
        >
           <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
              <Package className="w-24 h-24 text-zinc-900" />
           </div>
           <div className="relative z-10">
              <div className="label-micro text-zinc-400 mb-8">Gross Quantity</div>
              <div className="text-5xl font-black text-zinc-950 tracking-tighter mb-2">{totalQty.toLocaleString()}</div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Aggregated Inventory</p>
           </div>
        </motion.div>
        
        <motion.div 
          onClick={() => toast.info("Launching enterprise SCM purchase channels...")}
          whileHover={{ y: -5 }}
          className="bg-orange-500 p-8 rounded-[2.5rem] shadow-[0_20px_40px_rgba(249,115,22,0.3)] relative overflow-hidden group cursor-pointer"
        >
           <div className="relative z-10 flex flex-col justify-between h-full text-white">
              <div className="flex justify-between items-start">
                 <ShoppingBag className="w-10 h-10 opacity-30 group-hover:rotate-12 transition-transform" />
                 <ArrowUpRight className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </div>
              <div>
                 <div className="text-2xl font-black tracking-tight leading-tight uppercase">Procure<br/>Supplies</div>
                 <div className="text-[10px] font-black uppercase tracking-widest mt-2 opacity-60 italic">Launch Vendor Portal</div>
              </div>
           </div>
        </motion.div>
      </div>

      {/* Inventory Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-2.5 rounded-3xl border border-zinc-100 shadow-sm relative z-10">
         <div className="relative flex-1 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300 group-focus-within:text-orange-500 transition-colors" />
            <Input 
              placeholder="Query by stock ID, item name, or category..." 
              className="pl-14 h-14 bg-transparent border-none focus-visible:ring-0 text-base font-medium placeholder:text-zinc-300"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
         </div>
      </div>

      {/* Main Registry */}
      <div className="bg-white rounded-[3rem] border border-zinc-100 shadow-2xl overflow-hidden relative">
        <Table>
          <TableHeader className="bg-zinc-50/50">
            <TableRow className="border-b border-zinc-100 hover:bg-transparent">
              <TableHead className="font-black uppercase text-[10px] tracking-[0.2em] text-zinc-400 pl-10 h-20">Consumable Item</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-[0.2em] text-zinc-400 h-20">Classification</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-[0.2em] text-zinc-400 h-20">Stock Integrity</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-[0.2em] text-zinc-400 h-20 text-center">Health Status</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-[0.2em] text-zinc-400 h-20 text-right pr-10">Lifecycle Control</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-40">
                  <div className="flex flex-col items-center gap-4">
                    <Activity className="w-12 h-12 text-zinc-900 animate-spin" />
                    <p className="label-micro">Aggregating Global Inventory...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-40">
                  <div className="flex flex-col items-center gap-4">
                     <Package className="w-16 h-16 text-zinc-100" />
                     <p className="text-zinc-400 font-bold uppercase tracking-widest text-[11px]">Zero inventory records match query</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              <AnimatePresence>
                {filtered.map((item: any, idx) => (
                  <motion.tr 
                    key={item._id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-all group cursor-default"
                  >
                    <TableCell className="pl-10 py-6">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-zinc-950 rounded-2xl flex items-center justify-center text-white shadow-2xl group-hover:bg-orange-600 transition-all">
                          <Zap className={cn("w-6 h-6", item.qty <= item.min_amt ? "text-orange-400" : "text-emerald-400")} />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-zinc-900 text-base tracking-tighter leading-tight group-hover:text-orange-600 transition-colors uppercase">{item.name}</span>
                          <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest mt-1">Global SKU: AF-{item._id.slice(-6).toUpperCase()}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                       <Badge variant="outline" className="rounded-lg px-3 py-1 font-black text-[9px] uppercase tracking-widest border-zinc-200 text-zinc-400">
                          {item.category}
                       </Badge>
                    </TableCell>
                    <TableCell>
                       <div className="flex items-center gap-3">
                          <div className={cn(
                             "w-10 h-10 rounded-xl flex items-center justify-center border transition-colors",
                             item.qty <= item.min_amt ? "bg-red-50 border-red-100 text-red-600" : "bg-emerald-50 border-emerald-100 text-emerald-600"
                          )}>
                             <BarChart3 className="w-5 h-5" />
                          </div>
                          <div className="flex flex-col">
                             <div className="flex items-baseline gap-1">
                                <span className={cn("text-2xl font-black", item.qty <= item.min_amt ? "text-red-600" : "text-zinc-900")}>
                                   {item.qty}
                                </span>
                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">Units</span>
                             </div>
                             <div className="text-[9px] font-black text-zinc-300 uppercase tracking-widest">Min Threshold: {item.min_amt}</div>
                          </div>
                       </div>
                    </TableCell>
                    <TableCell className="text-center">
                       {item.qty <= item.min_amt ? (
                          <Badge className="bg-red-50 text-red-700 font-black text-[10px] uppercase tracking-widest px-4 py-1.5 border-none shadow-sm animate-pulse">
                             Critical Restock
                          </Badge>
                       ) : (
                          <Badge className="bg-emerald-50 text-emerald-700 font-black text-[10px] uppercase tracking-widest px-4 py-1.5 border-none shadow-sm">
                             Optimal Levels
                          </Badge>
                       )}
                    </TableCell>
                    <TableCell className="text-right pr-10">
                       <div className="flex gap-2 justify-end">
                          <Button 
                            onClick={() => handleQuickRestock(item)}
                            variant="outline" 
                            className="h-10 px-4 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-zinc-950 hover:text-white transition-all border-zinc-250"
                          >
                             Quick +50
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-10 w-10 text-zinc-300 hover:text-zinc-950 rounded-xl">
                                 <MoreVertical className="w-5 h-5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 p-2 rounded-2xl shadow-2xl border-zinc-100">
                              <DropdownMenuItem 
                                onClick={() => handleOpenEditModal(item)}
                                className="rounded-xl px-4 py-3 text-xs font-black gap-3 focus:bg-zinc-50 cursor-pointer"
                              >
                                <Edit className="w-4 h-4" /> EDIT SKU
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteConsumable(item._id)}
                                className="rounded-xl px-4 py-3 text-xs font-black gap-3 text-rose-500 focus:bg-rose-50 focus:text-rose-600 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" /> REMOVE SKU
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

      {/* Add Consumable Dialog */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-lg rounded-[2.5rem] p-10 border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black tracking-tighter flex items-center gap-2">
              <Plus className="w-6 h-6 text-orange-500" />
              Register Inventory Item
            </DialogTitle>
            <DialogDescription className="font-medium text-zinc-500 text-sm">
              Log high-turnover accessories or office consumables into local storage.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddConsumable} className="space-y-6 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label className="label-micro ml-1">Consumable Item Name</Label>
                <Input 
                  placeholder="e.g. Cat6 Ethernet Patch Cable"
                  className="h-14 rounded-2xl border-zinc-200 font-black text-sm px-5 bg-zinc-50/50" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="label-micro ml-1">Classification (Category)</Label>
                  <Input 
                    placeholder="e.g. Cabling"
                    className="h-14 rounded-2xl border-zinc-200 font-black text-sm px-5 bg-zinc-50/50" 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="label-micro ml-1">Acquisition Cost per unit ($)</Label>
                  <Input 
                    type="number"
                    placeholder="e.g. 25"
                    className="h-14 rounded-2xl border-zinc-200 font-black text-sm px-5 bg-zinc-50/50" 
                    value={formData.purchase_cost}
                    onChange={(e) => setFormData({...formData, purchase_cost: e.target.value})}
                    required 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="label-micro ml-1">Current Stock Quantity</Label>
                  <Input 
                    type="number"
                    placeholder="e.g. 100"
                    className="h-14 rounded-2xl border-zinc-200 font-black text-sm px-5 bg-zinc-50/50" 
                    value={formData.qty}
                    onChange={(e) => setFormData({...formData, qty: e.target.value})}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="label-micro ml-1">Minimum Alert Threshold</Label>
                  <Input 
                    type="number"
                    placeholder="e.g. 15"
                    className="h-14 rounded-2xl border-zinc-200 font-black text-sm px-5 bg-zinc-50/50" 
                    value={formData.min_amt}
                    onChange={(e) => setFormData({...formData, min_amt: e.target.value})}
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
                {isSubmitting ? <Activity className="w-6 h-6 animate-spin" /> : "PROVISION ITEM SKU"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Consumable Dialog */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-lg rounded-[2.5rem] p-10 border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black tracking-tighter">Edit Inventory Item</DialogTitle>
            <DialogDescription className="font-medium text-zinc-500 text-sm">
              Adjust stock levels or configuration parameters.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditConsumableSubmit} className="space-y-6 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label className="label-micro ml-1">Consumable Item Name</Label>
                <Input 
                  className="h-14 rounded-2xl border-zinc-200 font-black text-sm px-5 bg-zinc-50/50" 
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="label-micro ml-1">Category</Label>
                  <Input 
                    className="h-14 rounded-2xl border-zinc-200 font-black text-sm px-5 bg-zinc-50/50" 
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({...editFormData, category: e.target.value})}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="label-micro ml-1">Acquisition Cost ($)</Label>
                  <Input 
                    type="number"
                    className="h-14 rounded-2xl border-zinc-200 font-black text-sm px-5 bg-zinc-50/50" 
                    value={editFormData.purchase_cost}
                    onChange={(e) => setEditFormData({...editFormData, purchase_cost: e.target.value})}
                    required 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="label-micro ml-1">Stock Quantity</Label>
                  <Input 
                    type="number"
                    className="h-14 rounded-2xl border-zinc-200 font-black text-sm px-5 bg-zinc-50/50" 
                    value={editFormData.qty}
                    onChange={(e) => setEditFormData({...editFormData, qty: e.target.value})}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="label-micro ml-1">Minimum Alert Threshold</Label>
                  <Input 
                    type="number"
                    className="h-14 rounded-2xl border-zinc-200 font-black text-sm px-5 bg-zinc-50/50" 
                    value={editFormData.min_amt}
                    onChange={(e) => setEditFormData({...editFormData, min_amt: e.target.value})}
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
                {isSubmitting ? <Activity className="w-6 h-6 animate-spin" /> : "SAVE SKU SETTINGS"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
