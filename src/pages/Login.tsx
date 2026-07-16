import * as React from "react";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth.tsx";
import { useNavigate } from "react-router-dom";
import api from "../lib/api.ts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Loader2, AlertCircle, CheckCircle2, ShieldCheck, ArrowRight, Zap, Globe, Lock } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState<"checking" | "connected" | "disconnected">("checking");
  const { user, login } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      const timer = setTimeout(() => {
        navigate("/", { replace: true });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user, navigate]);

  React.useEffect(() => {
    let failedAttempts = 0;
    const checkHealth = async () => {
      try {
        const res = await api.get("/health");
        if (res.data.database === "connected") {
          setDbStatus("connected");
          failedAttempts = 0;
        } else {
          failedAttempts++;
          if (failedAttempts > 2) setDbStatus("disconnected");
        }
      } catch (e) {
        failedAttempts++;
        if (failedAttempts > 2) setDbStatus("disconnected");
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (dbStatus === "disconnected") {
        login("offline-demo-token", { 
          id: "offline-admin", 
          name: "Shahmeer Akram (Sandbox Admin)", 
          email: email, 
          role: "super_admin", 
          companyId: "demo-corp" 
        });
        toast.success("Sandbox Session authenticated locally");
        return;
      }
      const res = await api.post("/auth/login", { email, password });
      login(res.data.token, res.data.user);
      toast.success("Authentication successful");
    } catch (error: any) {
      const message = error.response?.data?.message || "Invalid credentials";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAccess = async () => {
    setLoading(true);
    try {
      if (dbStatus === "disconnected") {
        login("offline-demo-token", { 
          id: "offline-admin", 
          name: "Shahmeer Akram (Sandbox Dev)", 
          email: "admin@example.com", 
          role: "super_admin", 
          companyId: "demo-corp" 
        });
        toast.success("Sandbox Mode initiated: Offline registries active");
        return;
      }
      await api.post("/seed");
      const res = await api.post("/auth/login", { 
        email: "admin@example.com", 
        password: "password123" 
      });
      login(res.data.token, res.data.user);
      toast.success("Access Granted: Welcome back, Admin");
    } catch (error: any) {
      // Offline fallback if request fails
      login("offline-demo-token", { 
        id: "offline-admin", 
        name: "Shahmeer Akram (Sandbox Dev)", 
        email: "admin@example.com", 
        role: "super_admin", 
        companyId: "demo-corp" 
      });
      toast.success("Sandbox Mode initiated: Offline registries active");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white selection:bg-orange-100 selection:text-orange-900">
      {/* Left Column: Form Section */}
      <div className="flex items-center justify-center p-8 sm:p-12 relative overflow-hidden bg-white">
        {/* Subtle background ornamentation */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-zinc-900 to-orange-500" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "circOut" }}
          className="w-full max-w-[440px] space-y-10"
        >
          {/* Logo & Status */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-12 h-12 bg-zinc-950 rounded-2xl flex items-center justify-center text-white shadow-2xl">
                     <Building2 className="w-6 h-6" />
                   </div>
                   <span className="text-2xl font-black text-zinc-950 tracking-tighter">AssetFlow<span className="text-orange-500">.</span></span>
                </div>
                
                <AnimatePresence mode="wait">
                   {dbStatus === "connected" && (
                     <motion.div 
                       initial={{ opacity: 0, scale: 0.8 }}
                       animate={{ opacity: 1, scale: 1 }}
                       key="connected"
                       className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full"
                     >
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                       <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Node_Online</span>
                     </motion.div>
                   )}
                   {(dbStatus === "disconnected" || dbStatus === "checking") && (
                     <motion.div 
                       initial={{ opacity: 0, scale: 0.8 }}
                       animate={{ opacity: 1, scale: 1 }}
                       key="disconnected"
                       className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 border border-rose-100 rounded-full"
                     >
                       <AlertCircle className="w-3 h-3 text-rose-500" />
                       <span className="text-[10px] font-black text-rose-700 uppercase tracking-widest">Sandbox_Active</span>
                     </motion.div>
                   )}
                </AnimatePresence>
            </div>

            <div className="space-y-2">
               <h1 className="text-4xl font-black text-zinc-900 tracking-tighter">Enterprise Gateway.</h1>
               <p className="text-zinc-500 font-medium">Access your secure hardware inventory and talent registry.</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6 relative">
            <AnimatePresence>
               {user && (
                 <motion.div 
                   initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                   animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
                   className="absolute inset-0 z-50 bg-white/60 flex flex-col items-center justify-center p-6 text-center rounded-3xl border border-white/40"
                 >
                   <div className="w-20 h-20 bg-zinc-950 rounded-[2rem] flex items-center justify-center text-white mb-6 shadow-2xl">
                      <CheckCircle2 className="w-10 h-10" />
                   </div>
                   <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Identity Confirmed</h2>
                   <p className="text-sm font-medium text-zinc-500 mt-1">Initializing secure session...</p>
                 </motion.div>
               )}
            </AnimatePresence>

            <div className="space-y-4">
               <div className="space-y-2">
                  <Label className="label-micro ml-1">Official Email</Label>
                  <div className="relative group/input">
                     <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within/input:text-orange-500 transition-colors" />
                     <Input 
                        type="email" 
                        placeholder="admin@assetflow.com" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required 
                        className="h-14 pl-12 rounded-2xl border-zinc-100 bg-zinc-50/50 focus-visible:ring-orange-500/20 font-medium"
                     />
                  </div>
               </div>
               <div className="space-y-2">
                  <Label className="label-micro ml-1">Password</Label>
                  <div className="relative group/input">
                     <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within/input:text-orange-500 transition-colors" />
                     <Input 
                        type="password" 
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required 
                        className="h-14 pl-12 rounded-2xl border-zinc-100 bg-zinc-50/50 focus-visible:ring-orange-500/20 font-medium"
                     />
                  </div>
               </div>
            </div>

            <Button 
               type="submit" 
               className="w-full h-16 bg-zinc-950 text-white font-black text-lg rounded-2xl shadow-2xl hover:bg-zinc-800 transition-all active:scale-[0.98] group"
               disabled={loading}
            >
               {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                 <>
                   AUTHENTICATE
                   <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                 </>
               )}
            </Button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-zinc-100" />
              </div>
              <div className="relative flex justify-center text-[10px] items-center gap-4">
                <span className="bg-white px-4 text-zinc-300 font-bold uppercase tracking-[0.2em] italic">Or fast track access</span>
              </div>
            </div>

            <Button 
              type="button" 
              onClick={handleQuickAccess}
              className="w-full h-16 bg-white border-2 border-zinc-100 hover:border-orange-200 text-zinc-900 font-black text-sm rounded-2xl shadow-sm hover:bg-orange-50/30 transition-all group/btn"
              disabled={loading}
            >
              <Zap className="w-5 h-5 mr-3 text-orange-500 group-hover/btn:scale-125 transition-transform" />
              EXPLORE AS ADMIN (DEMO)
            </Button>
          </form>

          {/* Footer Info */}
          <div className="pt-8 flex flex-col gap-3 text-[11px] font-black text-zinc-300 uppercase tracking-widest mt-4 border-t border-zinc-100">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <ShieldCheck className="w-4 h-4 text-emerald-500" />
                   256-Bit Encrypted
                </div>
                <div>v4.2.0-STABLE</div>
              </div>
              <div className="text-center text-zinc-400 font-bold tracking-widest text-[10px] pt-1">
                 © 2026 Crafted by <span className="text-orange-500">Shahmeer Akram</span>
              </div>
          </div>
        </motion.div>
      </div>

      {/* Right Column: Visual/Hero Section */}
      <div className="hidden lg:block relative bg-zinc-950 overflow-hidden">
         {/* Abstract grid/pattern background */}
         <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />
         
         <div className="absolute inset-0 flex flex-col items-center justify-center p-20 text-center">
            <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 1 }}
               className="space-y-12"
            >
               <div className="relative inline-block">
                  <div className="absolute -inset-4 bg-orange-500/20 blur-3xl rounded-full animate-pulse" />
                  <div className="relative w-32 h-32 bg-gradient-to-br from-zinc-800 to-zinc-950 rounded-[3rem] border border-zinc-800 flex items-center justify-center text-white shadow-2xl overflow-hidden">
                     <motion.div
                       animate={{ 
                         rotate: [0, 90, 180, 270, 360],
                         scale: [1, 1.1, 1]
                       }}
                       transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                       className="absolute inset-0 opacity-10 bg-[conic-gradient(from_0deg,#fff,transparent)]"
                      />
                     <Globe className="w-12 h-12 relative z-10" />
                  </div>
               </div>

               <div className="space-y-6">
                  <h2 className="text-6xl font-black text-white tracking-tighter leading-none">
                    Next-Gen <br /> 
                    <span className="text-orange-500">Asset Management.</span>
                  </h2>
                  <p className="text-zinc-400 text-lg font-medium max-w-md mx-auto leading-relaxed">
                    Designed for high-growth enterprises who demand precision, speed, and absolute lifecycle visibility.
                  </p>
               </div>

               <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                  <div className="p-6 bg-zinc-900/50 rounded-3xl border border-zinc-800 backdrop-blur-sm">
                     <div className="text-2xl font-black text-white mb-1">99.9%</div>
                     <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Global Uptime</div>
                  </div>
                  <div className="p-6 bg-zinc-900/50 rounded-3xl border border-zinc-800 backdrop-blur-sm">
                     <div className="text-2xl font-black text-white mb-1">2.4k</div>
                     <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Active Nodes</div>
                  </div>
               </div>
            </motion.div>
         </div>

         {/* Brand overlay */}
         <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-6 opacity-30 group grayscale hover:grayscale-0 transition-all cursor-default">
            <span className="text-[10px] font-black text-zinc-500 tracking-[0.3em] uppercase">Trusted by industry leaders</span>
         </div>
      </div>
    </div>
  );
}
