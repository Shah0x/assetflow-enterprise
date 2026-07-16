import { useEffect, useState } from "react";
import api from "../lib/api.ts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Package, 
  Users, 
  AlertCircle, 
  CheckCircle2, 
  TrendingUp, 
  DollarSign, 
  Activity, 
  ShieldAlert,
  Calendar,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  Plus,
  ChevronRight,
  Database,
  X,
  PlusCircle,
  CheckSquare,
  AlertTriangle
} from "lucide-react";
import { 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  PieChart,
  Pie
} from "recharts";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import QuickActionModals from "../components/QuickActionModals.tsx";
import { MetricCard } from "../components/MetricCard.tsx";

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [activeQuickAction, setActiveQuickAction] = useState<"add-asset" | "checkout" | "log-ticket" | null>(null);

  const getOfflineStats = () => {
    let assets: any[] = [];
    let employees: any[] = [];
    let licenses: any[] = [];
    let consumables: any[] = [];
    let maintenance: any[] = [];

    try {
      const localAssets = localStorage.getItem("assets");
      assets = localAssets ? JSON.parse(localAssets) : [];
    } catch (e) {}

    try {
      const localEmps = localStorage.getItem("employees");
      employees = localEmps ? JSON.parse(localEmps) : [];
    } catch (e) {}

    try {
      const localLicenses = localStorage.getItem("licenses");
      licenses = localLicenses ? JSON.parse(localLicenses) : [];
    } catch (e) {}

    try {
      const localConsumables = localStorage.getItem("consumables");
      consumables = localConsumables ? JSON.parse(localConsumables) : [];
    } catch (e) {}

    try {
      const localMaintenance = localStorage.getItem("maintenance");
      maintenance = localMaintenance ? JSON.parse(localMaintenance) : [];
    } catch (e) {}

    // Calculate stats
    const totalAssets = assets.length;
    const totalValue = assets.reduce((sum, asset) => sum + (Number(asset.purchase_cost) || 0), 0);
    const maintenanceTickets = maintenance.filter((ticket: any) => ticket.status !== "Resolved").length;
    const brokenCount = assets.filter((a: any) => a.status === "Maintenance").length;
    const functionalCount = totalAssets - brokenCount;
    const healthPercent = totalAssets > 0 ? Math.round((functionalCount / totalAssets) * 100) : 100;

    // Category breakdown
    const categories = ["Laptop", "Monitor", "Mobile", "Furniture", "Networking", "Peripherals"];
    const categoryMap: Record<string, number> = {};
    categories.forEach(cat => { categoryMap[cat] = 0; });
    assets.forEach((a: any) => {
      if (a.category) {
        categoryMap[a.category] = (categoryMap[a.category] || 0) + 1;
      }
    });
    const categoryBreakdown = Object.entries(categoryMap)
      .map(([name, value]) => ({ name, value }))
      .filter(b => b.value > 0);

    // Alerts: warranty expiring in 30 days
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const now = new Date();
    const alerts = assets.filter((a: any) => {
      if (!a.warranty_expiry) return false;
      const exp = new Date(a.warranty_expiry);
      return exp <= thirtyDaysFromNow && exp >= now;
    }).map((a: any) => ({
      _id: a._id,
      model: a.model,
      serial_no: a.serial_no,
      warranty_expiry: a.warranty_expiry
    }));

    // Active employees/custodians
    const activeCustodianIds = new Set(
      assets.filter((a: any) => a.current_holder).map((a: any) => {
        if (typeof a.current_holder === "object") return a.current_holder._id;
        return a.current_holder;
      })
    );

    return {
      totalValue,
      totalAssets,
      healthPercent,
      alerts,
      maintenanceTickets,
      totalLicenses: licenses.length || 5,
      totalConsumables: consumables.length || 8,
      totalEmployees: activeCustodianIds.size || employees.length || 12,
      categoryBreakdown
    };
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/stats");
        if (res.data && typeof res.data === "object" && "totalAssets" in res.data) {
          setStats(res.data);
        } else {
          console.warn("Stats API returned non-stats response, falling back to offline calculation.");
          setStats(getOfflineStats());
        }
      } catch (error: any) {
        if (error.response?.status !== 401) {
          console.error("Failed to fetch dashboard stats, utilizing local storage fallback", error);
        }
        setStats(getOfflineStats());
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <Activity className="w-12 h-12 text-orange-500 animate-spin" />
        <p className="text-zinc-500 font-black uppercase tracking-[0.2em] animate-pulse text-xs">Synchronizing Enterprise HQ...</p>
      </div>
    </div>
  );

  if (!stats) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-6 max-w-md text-center p-8 bg-zinc-50 rounded-[2.5rem] border border-zinc-100">
        <AlertCircle className="w-16 h-16 text-zinc-300" />
        <div>
          <h2 className="text-2xl font-black text-zinc-900 tracking-tight mb-2">Sync Failure</h2>
          <p className="text-zinc-500 font-medium leading-relaxed">Infrastructure stats are temporarily unavailable. Please verify connection or refresh logs.</p>
        </div>
        <Button 
          onClick={() => window.location.reload()}
          className="bg-zinc-900 text-white font-black px-8 py-6 rounded-2xl shadow-xl hover:bg-zinc-800 transition-all"
        >
          RETRY SYNC
        </Button>
      </div>
    </div>
  );

  const pieData = [
    { name: "Active", value: (stats?.totalAssets || 0) - (stats?.maintenanceTickets || 0), color: "#10b981" },
    { name: "Issue", value: stats?.maintenanceTickets || 0, color: "#f43f5e" },
  ];

  return (
    <div className="max-w-[1600px] mx-auto space-y-12 pb-20 p-4 sm:p-8">
      {/* Hero Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row gap-8 items-start justify-between"
      >
        <div className="space-y-4 max-w-2xl">
          <div className="flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-600 rounded-full w-fit">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="text-[10px] font-black uppercase tracking-wider">Operational Integrity Active</span>
          </div>
          <h1 className="text-5xl sm:text-7xl font-black text-zinc-900 tracking-tighter leading-[0.9]">
            Enterprise <br />
            <span className="text-orange-500 drop-shadow-sm">Asset Intelligence.</span>
          </h1>
          <p className="text-zinc-500 font-medium text-lg leading-relaxed max-w-lg">
            A unified command center for hardware lifecycles, global logistics, and infrastructure compliance.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-4">
             <Button 
                onClick={() => setActiveQuickAction("add-asset")}
                className="bg-zinc-900 text-white font-black px-8 py-7 rounded-2xl shadow-2xl hover:bg-zinc-800 transition-all active:scale-95 group"
             >
                PROVISION HARDWARE
                <ArrowUpRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
             </Button>
             <Button 
                onClick={() => api.post("/api/seed").then(() => window.location.reload())} 
                variant="outline" 
                className="border-2 border-zinc-200 font-black px-8 py-7 rounded-2xl hover:bg-zinc-100 transition-all text-zinc-900 bg-white"
             >
               REFRESH DATA
             </Button>
          </div>
        </div>
      </motion.div>

      {/* Dashboard Widget System */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <MetricCard
          title="Total Assets"
          value={stats?.totalAssets || 0}
          icon={Package}
          description={`Fleet Valuation: $${Number(stats?.totalValue || 0).toLocaleString()}`}
          trend={{ value: "+8.2%", isPositive: true }}
          badge={{ text: "Fully Cataloged", variant: "info" }}
          onClick={() => window.location.href = "/assets"}
        />
        <MetricCard
          title="Assets in Maintenance"
          value={stats?.maintenanceTickets || 0}
          icon={AlertCircle}
          description={stats?.maintenanceTickets > 0 ? "Active incidents requiring technical review" : "All nodes report optimal operation"}
          trend={{ value: `${stats?.healthPercent || 100}% Operational`, isPositive: (stats?.healthPercent || 100) >= 90 }}
          badge={
            stats?.maintenanceTickets > 0 
              ? { text: "Needs Repair", variant: "warning" }
              : { text: "Stable", variant: "success" }
          }
          onClick={() => window.location.href = "/maintenance"}
        />
        <MetricCard
          title="Upcoming Expirations"
          value={stats?.alerts?.length || 0}
          icon={ShieldAlert}
          description="Hardware warranties expiring in 30 days"
          badge={
            stats?.alerts?.length > 0
              ? { text: "Action Required", variant: "danger" }
              : { text: "Secure", variant: "neutral" }
          }
          onClick={() => {
            const el = document.getElementById("warranty-risks-card");
            if (el) {
              el.scrollIntoView({ behavior: "smooth" });
            } else {
              window.location.href = "/assets";
            }
          }}
        />
      </motion.div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-12">
        {/* Main Value Card */}
        <Card className="md:col-span-12 lg:col-span-8 bento-card border-none overflow-hidden relative">
          <CardHeader className="p-10 pb-0">
             <p className="label-micro mb-2">Fleet Valuation</p>
             <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-zinc-400">$</span>
                <h2 className="text-6xl font-black tracking-tighter text-zinc-900 leading-none">
                  {Number(stats?.totalValue || 0).toLocaleString()}
                </h2>
                <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full ml-4">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-[11px] font-black text-emerald-600">+8.2%</span>
                </div>
             </div>
          </CardHeader>
          <CardContent className="p-10 pt-8">
            <div className="h-[240px] w-full mt-4">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats?.categoryBreakdown}>
                     <XAxis dataKey="name" hide />
                     <YAxis hide />
                     <Tooltip 
                        cursor={{ fill: 'rgba(249, 115, 22, 0.05)' }}
                        contentStyle={{ backgroundColor: "#18181b", border: "none", borderRadius: "16px", padding: "12px" }}
                        itemStyle={{ color: "#fff", fontWeight: "900", fontSize: "12px" }}
                     />
                     <Bar dataKey="value" fill="#F97316" radius={[12, 12, 12, 12]} barSize={50} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
          </CardContent>
          <div className="absolute top-0 right-0 p-10 opacity-10">
            <Database className="w-32 h-32 text-zinc-900" />
          </div>
        </Card>

        {/* Health Radial */}
        <Card className="md:col-span-6 lg:col-span-4 bento-card border-none">
          <CardHeader className="p-8 pb-0">
             <CardTitle className="text-xs font-black uppercase tracking-widest text-zinc-400">System Health</CardTitle>
          </CardHeader>
          <CardContent className="p-8 pt-4 flex flex-col items-center">
            <div className="h-[200px] w-full relative flex items-center justify-center">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie 
                        data={pieData} 
                        innerRadius={65} 
                        outerRadius={85} 
                        paddingAngle={4} 
                        dataKey="value"
                        startAngle={180}
                        endAngle={-180}
                     >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                     </Pie>
                  </PieChart>
               </ResponsiveContainer>
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none translate-y-2">
                  <span className="text-4xl font-black text-zinc-900">{stats?.healthPercent || 0}%</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mt-1">Operational</span>
               </div>
            </div>
            <div className="grid grid-cols-2 w-full gap-4 mt-8 pt-6 border-t border-zinc-50">
               <div className="text-center">
                  <p className="text-xl font-black text-emerald-600">{(stats?.totalAssets || 0) - (stats?.maintenanceTickets || 0)}</p>
                  <p className="text-[9px] font-black uppercase text-zinc-400 tracking-wider">Functional</p>
               </div>
               <div className="text-center border-l border-zinc-100">
                  <p className="text-xl font-black text-rose-600">{stats?.maintenanceTickets || 0}</p>
                  <p className="text-[9px] font-black uppercase text-zinc-400 tracking-wider">With Issues</p>
               </div>
            </div>
          </CardContent>
        </Card>

        {/* Warranty Risks */}
        <Card id="warranty-risks-card" className="md:col-span-12 lg:col-span-7 bento-card border-none overflow-hidden">
           <CardHeader className="p-8 pb-4">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center">
                    <ShieldAlert className="w-5 h-5 text-rose-500" />
                 </div>
                 <div>
                    <CardTitle className="text-lg font-black tracking-tight">Warranty Risks</CardTitle>
                    <CardDescription className="text-xs font-medium">Critical hardware requiring renewal cycles.</CardDescription>
                 </div>
              </div>
           </CardHeader>
           <CardContent className="p-0">
             <div className="divide-y divide-zinc-50">
                {stats?.alerts?.length > 0 ? (
                  stats.alerts.map((alert: any) => (
                    <div key={alert._id} className="px-8 py-5 flex items-center justify-between hover:bg-zinc-50/80 transition-all group">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center group-hover:bg-zinc-200 transition-all">
                             <Package className="w-5 h-5 text-zinc-400" />
                          </div>
                          <div>
                             <p className="text-sm font-black text-zinc-900">{alert.model}</p>
                             <p className="text-[10px] font-bold text-zinc-400 font-mono tracking-tighter">{alert.serial_no}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-4">
                          <div className="text-right">
                             <p className="text-xs font-black text-rose-600 uppercase tracking-tighter">
                                {format(new Date(alert.warranty_expiry), "MMM dd, yyyy")}
                             </p>
                             <p className="text-[9px] font-black text-zinc-300 uppercase tracking-widest">Expires In <span className="text-rose-400">30d</span></p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-zinc-200 group-hover:text-zinc-400 transition-all" />
                       </div>
                    </div>
                  ))
                ) : (
                  <div className="p-20 text-center flex flex-col items-center">
                    <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-4 opacity-20" />
                    <p className="text-zinc-600 font-black tracking-tight text-lg">Infrastructure Stable</p>
                  </div>
                )}
             </div>
           </CardContent>
        </Card>

        {/* Categories / Quick Stat */}
        <Card className="md:col-span-12 lg:col-span-5 bento-card border-none flex flex-col">
           <CardHeader className="p-8 pb-4">
              <CardTitle className="text-lg font-black tracking-tight">Fleet Distribution</CardTitle>
              <CardDescription className="text-xs font-medium">Categorical breakdown of inventory assets.</CardDescription>
           </CardHeader>
           <CardContent className="p-8 pt-2 flex-1">
              <div className="grid grid-cols-2 gap-3">
                 {stats?.categoryBreakdown?.map((item: any) => (
                    <div key={item.name} className="p-6 rounded-2xl bg-zinc-50 border border-zinc-100 hover:scale-[1.02] transition-transform">
                       <p className="label-micro block mb-4 opacity-60">{item.name}</p>
                       <span className="text-4xl font-black text-zinc-900 tracking-tighter">{item.value}</span>
                    </div>
                 ))}
              </div>
           </CardContent>
           <div className="p-8 pt-0 mt-auto">
             <Button 
                onClick={() => window.location.href='/assets'}
                className="w-full bg-zinc-950 text-white font-black py-6 rounded-2xl hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200"
             >
                VIEW FULL INVENTORY
             </Button>
           </div>

      {/* Floating Action Button & Menu */}
      <div className="fixed bottom-8 right-8 z-40 flex flex-col items-end gap-3.5">
        <AnimatePresence>
          {isFabOpen && (
            <div className="flex flex-col items-end gap-3 mb-1">
              {[
                {
                  id: 'add-asset' as const,
                  label: 'Provision Node',
                  icon: PlusCircle,
                  color: 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200/50',
                },
                {
                  id: 'checkout' as const,
                  label: 'Handoff Asset',
                  icon: CheckSquare,
                  color: 'bg-blue-500 hover:bg-blue-600 shadow-blue-200/50',
                },
                {
                  id: 'log-ticket' as const,
                  label: 'Log Complaint',
                  icon: AlertTriangle,
                  color: 'bg-rose-500 hover:bg-rose-600 shadow-rose-200/50',
                },
              ].map((action, idx) => (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, scale: 0.8, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 15 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center gap-3 group"
                >
                  <span className="bg-zinc-900 text-white font-black text-[10px] tracking-widest uppercase px-3.5 py-2 rounded-xl shadow-xl select-none border border-zinc-800/50 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {action.label}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveQuickAction(action.id);
                      setIsFabOpen(false);
                    }}
                    className={cn(
                      "w-12 h-12 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all duration-200",
                      action.color
                    )}
                  >
                    <action.icon className="w-5 h-5" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Main Floating Trigger Button */}
        <button
          type="button"
          onClick={() => setIsFabOpen((prev) => !prev)}
          className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 border border-zinc-800/10",
            isFabOpen ? 'bg-orange-500 text-white' : 'bg-zinc-950 text-white hover:bg-orange-500'
          )}
        >
          {isFabOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Zap className="w-6 h-6 animate-pulse" />
          )}
        </button>
      </div>

      {/* Dashboard Local Quick Action Modals */}
      <QuickActionModals 
        activeType={activeQuickAction}
        onClose={() => setActiveQuickAction(null)}
        onSuccess={() => {
          window.location.reload();
        }}
      />
        </Card>
      </div>
    </div>
  );
}
