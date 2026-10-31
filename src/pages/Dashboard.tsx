import * as React from "react";
import { 
  BarChart3, 
  Users, 
  Map as MapIcon, 
  AlertCircle, 
  Activity, 
  FileText, 
  Navigation,
  ArrowUpRight,
  TrendingDown,
  Clock,
  LayoutDashboard,
  ShieldAlert,
  Globe,
  Bell,
  Home,
  MessageSquare,
  Zap,
  ChevronRight,
  Phone,
  MapPin,
  Menu,
  X,
  PlusCircle,
  Droplets,
  Anchor,
  Box,
  TrendingUp,
  History,
  LifeBuoy,
  Book,
  PhoneIncoming
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogTrigger 
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import type { FloodReport } from "@/lib/storage";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { Chatbot } from "@/components/ai/Chatbot";

const NIGERIA_STATES = [
  { id: "kogi", name: "Kogi", risk: "EXTREME", color: "#D90429", prob: 78, rivers: "Niger, Benue", lgas: "Lokoja, Ibaji, Idah, Igalamela", pop: "150,000" },
  { id: "benue", name: "Benue", risk: "HIGH", color: "#FF9F1C", prob: 62, rivers: "Benue", lgas: "Makurdi, Agatu", pop: "210,000" },
  { id: "anambra", name: "Anambra", risk: "HIGH", color: "#D90429", prob: 82, rivers: "Niger", lgas: "Onitsha, Ogbaru", pop: "305,000" },
  { id: "delta", name: "Delta", risk: "MODERATE", color: "#EAB308", prob: 45, rivers: "Niger", lgas: "Asaba, Patani", pop: "120,000" },
  { id: "kano", name: "Kano", risk: "SAFE", color: "#2D6A4F", prob: 8, rivers: "None", lgas: "Kano City", pop: "12,000" },
  { id: "lagos", name: "Lagos", risk: "MODERATE", color: "#FF9F1C", prob: 52, rivers: "Ogun", lgas: "Ikorodu, Epe", pop: "540,000" },
];

const SHELTERS = [
  { name: "Lokoja Town Hall", status: "Active", capacity: "85%", location: "Lokoja, Kogi", type: "Primary" },
  { name: "St. Jude's Primary", status: "Active", capacity: "60%", location: "Ibaji, Kogi", type: "Emergency" },
  { name: "Federal Polytechnic", status: "Full", capacity: "100%", location: "Idah, Kogi", type: "Mass Shelter" },
  { name: "Community Center", status: "Standby", capacity: "0%", location: "Makurdi, Benue", type: "Secondary" },
];

const RESOURCES = [
  { name: "Rescue Boats Available", count: "18", status: "Ready", icon: Anchor },
  { name: "Shelter Capacity", count: "65%", status: "Remaining", icon: Home },
  { name: "Medical Kits Distributed", count: "350", status: "Active", icon: Box },
  { name: "Relief Materials", count: "1,200 kits", status: "In Transit", icon: Droplets },
  { name: "Medical Teams", count: 12, status: "Active", icon: Users },
  { name: "Water Pumps", count: 35, status: "Deployed", icon: Droplets },
];

export default function Dashboard() {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = React.useState("Overview");
  const [sidebarOpen, setSidebarOpen] = React.useState(!isMobile);
  const [reports, setReports] = React.useState<FloodReport[]>([]);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = React.useState(false);

  React.useEffect(() => {
    // Private production reports are intentionally not exposed to public dashboards.
    // Local browser reports are not authoritative production records.
    setReports([]);
  }, []);

  const sidebarItems = [
    { name: "Overview", icon: LayoutDashboard },
    { name: "National Heat Map", icon: Globe },
    { name: "Alerts", icon: Bell },
    { name: "Shelter Tracking", icon: Home },
    { name: "Reports", icon: MessageSquare },
    { name: "Resource Allocation", icon: Zap },
    { name: "Historical Data", icon: BarChart3 },
    { name: "Safety & Contacts", icon: LifeBuoy },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "Overview":
        return <OverviewTab />;
      case "National Heat Map":
        return <HeatMapTab />;
      case "Alerts":
        return <AlertsTab reports={reports} />;
      case "Shelter Tracking":
        return <ShelterTab />;
      case "Reports":
        return <ReportsTab reports={reports} />;
      case "Resource Allocation":
        return <ResourcesTab />;
      case "Historical Data":
        return <HistoryTab />;
      case "Safety & Contacts":
        return <SafetyContactsTab />;
      default:
        return <OverviewTab />;
    }
  };

  return (
    <div className="flex h-screen bg-[#F4EBD0] overflow-hidden">
      {/* MOBILE OVERLAY */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40"
          />
        )}
      </AnimatePresence>

      {/* LEFT SIDEBAR */}
      <aside className={cn(
        "bg-[#003566] text-white flex flex-col shrink-0 transition-all duration-300 z-50",
        isMobile ? "fixed inset-y-0 left-0 w-72 transform" : "w-72",
        isMobile && !sidebarOpen ? "-translate-x-full" : "translate-x-0"
      )}>
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500 p-2 rounded-lg">
              <ShieldAlert className="h-6 w-6 text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tighter">
              FG <span className="text-orange-500">COMMAND</span>
            </span>
          </div>
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
        
        <ScrollArea className="flex-1 p-4">
          <nav className="space-y-2">
            {sidebarItems.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  setActiveTab(item.name);
                  if (isMobile) setSidebarOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold transition-all group relative",
                  activeTab === item.name
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" 
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className={cn("h-5 w-5 transition-transform group-hover:scale-110", activeTab === item.name ? "text-white" : "text-white/40 group-hover:text-white")} />
                {item.name}
                {activeTab === item.name && (
                  <motion.div 
                    layoutId="active-pill"
                    className="absolute right-2 w-1.5 h-6 bg-white rounded-full"
                  />
                )}
              </button>
            ))}
          </nav>
        </ScrollArea>
        
        <div className="p-4 border-t border-white/10">
          <div className="bg-white/5 p-4 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">System Engine</p>
              <Badge variant="outline" className="text-[8px] border-white/20 text-white/60">v2.6.0</Badge>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs font-bold text-green-500 uppercase tracking-tighter">Prediction model not validated</span>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN PANEL */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b flex items-center justify-between px-6 lg:px-10 shrink-0 relative z-10">
          <div className="flex items-center gap-4">
            {isMobile && (
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
                <Menu className="h-6 w-6" />
              </Button>
            )}
            <h1 className="text-2xl font-black text-[#003566] tracking-tighter uppercase">{activeTab}</h1>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <div className="text-right">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Global Status</p>
              <p className="text-sm font-black text-red-600 uppercase">Live risk level unverified</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-black">
              78
            </div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-auto african-pattern">
            {/* HERO BANNER */}
            <div className="relative h-64 w-full overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1547683905-f686c993aae5?q=80&w=2070&auto=format&fit=crop" 
                alt="Nigeria Flood Theme"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#003566]/90 to-transparent flex flex-col justify-center px-10">
                <h2 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">Predict. Prepare. Protect.</h2>
                <p className="text-orange-400 font-bold tracking-widest text-xs uppercase mb-6">FloodGuard demonstration dashboard — not an official command center</p>
                
                <Dialog open={isEmergencyModalOpen} onOpenChange={setIsEmergencyModalOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      className="bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest text-xs w-fit h-12 px-8 rounded-xl shadow-2xl shadow-red-600/40 border-b-4 border-red-800 active:border-b-0 active:translate-y-1 transition-all"
                    >
                      Emergency Dispatch Unavailable
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
                    <div className="bg-red-600 p-8 text-white relative">
                      <div className="absolute top-0 right-0 p-8 opacity-20"><ShieldAlert className="h-24 w-24" /></div>
                      <DialogTitle className="text-3xl font-black uppercase tracking-tighter mb-2">Emergency Declaration</DialogTitle>
                      <DialogDescription className="text-white/80 font-medium">FloodGuard is not connected to emergency responders or government command centers.</DialogDescription>
                    </div>
                    <div className="p-8 space-y-6 bg-white">
                      <p className="text-sm text-[#003566] font-medium leading-relaxed">
                        This is a demonstration interface only. For immediate danger in Nigeria, call 112.
                      </p>
                      <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-start gap-4">
                        <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                        <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest leading-relaxed">
                          No emergency notification or broadcast can be initiated here.
                        </p>
                      </div>
                      <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-4">
                        <Button variant="outline" onClick={() => setIsEmergencyModalOpen(false)} className="rounded-xl h-12 font-black uppercase tracking-widest text-xs border-2 border-[#003566] text-[#003566]">Cancel</Button>
                        <Button disabled className="bg-red-600 text-white rounded-xl h-12 font-black uppercase tracking-widest text-xs flex-1">Dispatch Not Connected</Button>
                      </DialogFooter>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="p-6 lg:p-10">
              {renderContent()}
            </div>
          </div>

          {/* RIGHT PANEL - AI Predictive Insights */}
          <aside className="hidden xl:flex w-80 bg-white border-l flex-col shrink-0 overflow-hidden">
            <div className="p-6 border-b bg-[#003566] text-white">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="h-5 w-5 text-orange-500" />
                <h3 className="font-black uppercase tracking-tighter text-lg">AI Insights</h3>
              </div>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Real-time Predictive Analysis</p>
            </div>
            
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-8">
                <div>
                  <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Urgent Forecast</h4>
                  <div className="bg-orange-50 p-5 rounded-[2rem] border border-orange-100">
                    <p className="text-sm font-bold text-[#003566] leading-relaxed mb-4">
                      Upstream discharge at Lokoja projected to increase by <span className="text-orange-600">12%</span> in 48h.
                    </p>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-orange-600" />
                      <span className="text-[10px] font-black text-orange-600 uppercase">Window: 48 Hours</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Recommended Actions</h4>
                  <div className="space-y-3">
                    {["Activate Ibaji Shelter", "Issue SMS Alert Zone B", "Prep Boat Rescue Team"].map((action, i) => (
                      <div key={i} className="flex items-center gap-3 bg-muted/50 p-3 rounded-xl border border-white">
                        <div className="h-1.5 w-1.5 rounded-full bg-orange-500"></div>
                        <span className="text-xs font-bold text-[#003566]">{action}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Risk Probability</h4>
                  <div className="space-y-4">
                    {[{
                        label: "Lokoja Sector",
                        val: 85,
                        color: "bg-red-600"
                      },
                      {
                        label: "Ibaji Corridor",
                        val: 92,
                        color: "bg-red-600"
                      },
                      {
                        label: "Idah District",
                        val: 64,
                        color: "bg-orange-500"
                      }
                    ].map((item, i) => (
                      <div key={i} className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-tight">
                          <span>{item.label}</span>
                          <span>{item.val}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                          <div className={cn("h-full rounded-full", item.color)} style={{ width: `${item.val}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Button className="w-full h-12 bg-[#003566] text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-[#003566]/20">
                  Full AI Report
                </Button>
              </div>
            </ScrollArea>
          </aside>
        </div>
      </main>
      <Chatbot />
    </div>
  );
}

function OverviewTab() {
  const kogi = NIGERIA_STATES.find(s => s.id === "kogi")!;
  
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid gap-8">
        <Card className="rounded-[2.5rem] border-none shadow-2xl overflow-hidden bg-white">
          <div className="p-8 lg:p-12 relative">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
              <Globe className="h-96 w-96 text-[#003566]" />
            </div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
              <div>
                <Badge className="bg-red-600 text-white mb-4 px-4 py-1.5 text-xs font-black uppercase tracking-widest border-none">Current Focal Point</Badge>
                <h2 className="text-5xl font-black text-[#003566] tracking-tighter uppercase mb-2">{kogi.name} State</h2>
                <p className="text-muted-foreground font-medium">Critical monitoring active for North-Central corridor.</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center bg-[#003566] text-white p-6 rounded-[2rem] min-w-[140px] shadow-xl shadow-[#003566]/20">
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">Probability</p>
                  <p className="text-4xl font-black">{kogi.prob}%</p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-10">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-3 rounded-2xl"><Activity className="h-6 w-6 text-[#003566]" /></div>
                  <div>
                    <h4 className="font-bold text-[#003566] text-sm uppercase">Key River Confluence</h4>
                    <p className="text-muted-foreground text-sm">{kogi.rivers}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-orange-100 p-3 rounded-2xl"><Users className="h-6 w-6 text-orange-600" /></div>
                  <div>
                    <h4 className="font-bold text-[#003566] text-sm uppercase">Population at Risk</h4>
                    <p className="text-muted-foreground text-sm">{kogi.pop} People</p>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-red-100 p-3 rounded-2xl"><Navigation className="h-6 w-6 text-red-600" /></div>
                  <div>
                    <h4 className="font-bold text-[#003566] text-sm uppercase">Highly Affected LGAs</h4>
                    <p className="text-muted-foreground text-sm">{kogi.lgas}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-green-100 p-3 rounded-2xl"><Droplets className="h-6 w-6 text-green-600" /></div>
                  <div>
                    <h4 className="font-bold text-[#003566] text-sm uppercase">Rainfall Intensity</h4>
                    <p className="text-muted-foreground text-sm">Heavy (Last 24h: 145mm)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Live Water Gauge Sensors & 3-Day Weather Forecast */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Live Water Gauge Sensors */}
          <Card className="rounded-[2rem] border-none shadow-xl bg-white overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-4">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-white" />
                <h3 className="text-lg font-black text-white uppercase tracking-tight">Live Water Gauge Sensors</h3>
              </div>
              <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest mt-1">Real-time Telemetry</p>
            </div>
            <CardContent className="p-6 space-y-4">
              {/* River Niger - Lokoja */}
              <div className="border border-blue-100 rounded-2xl p-4 bg-blue-50/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
                    <h4 className="font-black text-[#003566] text-sm uppercase">River Niger (Lokoja)</h4>
                  </div>
                  <Badge className="bg-red-600 text-[9px] font-black uppercase">Critical</Badge>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Current Level</p>
                    <p className="text-3xl font-black text-[#003566]">8.42<span className="text-lg text-muted-foreground">m</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Trend</p>
                    <div className="flex items-center gap-1 text-red-600">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm font-black">Rising</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-muted-foreground">Warning: 7.5m</span>
                    <span className="text-red-600">+0.92m above</span>
                  </div>
                </div>
              </div>

              {/* River Benue - Makurdi */}
              <div className="border border-orange-100 rounded-2xl p-4 bg-orange-50/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse"></div>
                    <h4 className="font-black text-[#003566] text-sm uppercase">River Benue (Makurdi)</h4>
                  </div>
                  <Badge className="bg-orange-500 text-[9px] font-black uppercase">High</Badge>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Current Level</p>
                    <p className="text-3xl font-black text-[#003566]">6.18<span className="text-lg text-muted-foreground">m</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Trend</p>
                    <div className="flex items-center gap-1 text-orange-600">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm font-black">Rising</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-orange-200">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-muted-foreground">Warning: 5.8m</span>
                    <span className="text-orange-600">+0.38m above</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3-Day Weather Forecast */}
          <Card className="rounded-[2rem] border-none shadow-xl bg-white overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4">
              <div className="flex items-center gap-2">
                <Droplets className="h-5 w-5 text-white" />
                <h3 className="text-lg font-black text-white uppercase tracking-tight">3-Day Rainfall Forecast</h3>
              </div>
              <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest mt-1">Linked to Risk Engine</p>
            </div>
            <CardContent className="p-6 space-y-4">
              {/* Day 1 */}
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="text-center min-w-[50px]">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Today</p>
                    <p className="text-xs font-black text-[#003566]">Day 1</p>
                  </div>
                  <div className="h-8 w-px bg-blue-200"></div>
                  <Droplets className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-blue-600">78%</p>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase">Precipitation</p>
                </div>
              </div>

              {/* Day 2 */}
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl border border-purple-100">
                <div className="flex items-center gap-3">
                  <div className="text-center min-w-[50px]">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Tomorrow</p>
                    <p className="text-xs font-black text-[#003566]">Day 2</p>
                  </div>
                  <div className="h-8 w-px bg-purple-200"></div>
                  <Droplets className="h-5 w-5 text-purple-600" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-purple-600">65%</p>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase">Precipitation</p>
                </div>
              </div>

              {/* Day 3 */}
              <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                <div className="flex items-center gap-3">
                  <div className="text-center min-w-[50px]">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Day After</p>
                    <p className="text-xs font-black text-[#003566]">Day 3</p>
                  </div>
                  <div className="h-8 w-px bg-indigo-200"></div>
                  <Droplets className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-indigo-600">42%</p>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase">Precipitation</p>
                </div>
              </div>

              <div className="pt-3 border-t border-border">
                <p className="text-[10px] text-muted-foreground font-bold">
                  <span className="text-red-600">Storm Cell Alert:</span> Incoming system tracked 120km upstream
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Demographic Impact Metrics */}
        <Card className="rounded-[2rem] border-none shadow-2xl bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 overflow-hidden">
          <div className="bg-red-600 p-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-white" />
            <h3 className="text-lg font-black text-white uppercase tracking-tight">Critical Impact Summary</h3>
            <Badge className="ml-auto bg-white text-red-600 text-[9px] font-black uppercase">Active Zone</Badge>
          </div>
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <p className="text-5xl font-black text-red-600 mb-2">42,000+</p>
              <p className="text-sm font-bold text-[#003566] uppercase tracking-widest">Residents in Active High-Probability Impact Zone</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 pt-6 border-t border-red-200">
              <div className="text-center">
                <div className="bg-white p-4 rounded-2xl shadow-lg mb-3">
                  <Activity className="h-8 w-8 text-red-600 mx-auto mb-2" />
                  <p className="text-3xl font-black text-[#003566]">14</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Critical Facilities</p>
                </div>
                <p className="text-xs text-muted-foreground font-medium">Within impact zone</p>
              </div>
              
              <div className="text-center">
                <div className="bg-white p-4 rounded-2xl shadow-lg mb-3">
                  <Home className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-3xl font-black text-[#003566]">3</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Hospitals</p>
                </div>
                <p className="text-xs text-muted-foreground font-medium">Medical facilities at risk</p>
              </div>
              
              <div className="text-center">
                <div className="bg-white p-4 rounded-2xl shadow-lg mb-3">
                  <Book className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-3xl font-black text-[#003566]">11</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Schools</p>
                </div>
                <p className="text-xs text-muted-foreground font-medium">Educational institutions affected</p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-white/80 rounded-2xl border border-red-200">
              <p className="text-xs text-[#003566] font-bold leading-relaxed text-center">
                Estimated <span className="text-red-600 font-black">42,000+ residents</span> and <span className="text-red-600 font-black">14 critical facilities</span> (3 hospitals, 11 schools) currently within the active high-probability impact zone.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Resource Counters */}
        <Card className="rounded-[2rem] border-none shadow-xl bg-white overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-white" />
              <h3 className="text-lg font-black text-white uppercase tracking-tight">Emergency Resource Inventory</h3>
            </div>
            <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest mt-1">Live Asset Tracking</p>
          </div>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-2xl border-2 border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <Anchor className="h-8 w-8 text-blue-600" />
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                </div>
                <p className="text-4xl font-black text-[#003566] mb-1">18</p>
                <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">Rescue Boats Available</p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-5 rounded-2xl border-2 border-orange-200">
                <div className="flex items-center justify-between mb-3">
                  <Home className="h-8 w-8 text-orange-600" />
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                </div>
                <p className="text-4xl font-black text-[#003566] mb-1">65%</p>
                <p className="text-xs font-bold text-orange-700 uppercase tracking-wider">Shelter Capacity Remaining</p>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-red-100 p-5 rounded-2xl border-2 border-red-200">
                <div className="flex items-center justify-between mb-3">
                  <Box className="h-8 w-8 text-red-600" />
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                </div>
                <p className="text-4xl font-black text-[#003566] mb-1">350</p>
                <p className="text-xs font-bold text-red-700 uppercase tracking-wider">Medical Kits Distributed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Public Broadcast Log */}
        <Card className="rounded-[2rem] border-none shadow-xl bg-white overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-white" />
              <h3 className="text-lg font-black text-white uppercase tracking-tight">Recent Alerts Sent</h3>
            </div>
            <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest mt-1">Public Broadcast Log</p>
          </div>
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-xl border border-purple-200">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center">
                    <Bell className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-black text-[#003566] uppercase">SMS Alert Broadcast</p>
                    <span className="text-[10px] font-bold text-purple-600">10 min ago</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    SMS alert sent to <span className="font-black text-[#003566]">8,500 subscribers</span> in Wuse Zone 5 via NEMA network
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                    <Phone className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-black text-[#003566] uppercase">Voice Call Alert</p>
                    <span className="text-[10px] font-bold text-blue-600">25 min ago</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Automated voice call to <span className="font-black text-[#003566]">2,300 households</span> in Ibaji Waterside - Evacuation order issued
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-orange-50 rounded-xl border border-orange-200">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-orange-600 flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-black text-[#003566] uppercase">WhatsApp Broadcast</p>
                    <span className="text-[10px] font-bold text-orange-600">42 min ago</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    WhatsApp message sent to <span className="font-black text-[#003566]">12,000 users</span> in Lokoja Central - Flood warning level orange
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center">
                    <PhoneIncoming className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-black text-[#003566] uppercase">USSD Push Notification</p>
                    <span className="text-[10px] font-bold text-green-600">1 hour ago</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    USSD alert pushed to <span className="font-black text-[#003566]">5,200 feature phone users</span> in Bassa Junction - Shelter locations provided
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function HeatMapTab() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Card className="rounded-[2.5rem] border-none shadow-2xl overflow-hidden bg-white p-8 lg:p-12 min-h-[600px] flex flex-col">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-black text-[#003566] tracking-tighter uppercase mb-1">National Risk Distribution</h2>
            <p className="text-muted-foreground text-sm">Real-time flood risk mapping across Nigeria states.</p>
          </div>
          <div className="flex gap-2">
            {["Extreme", "High", "Moderate", "Safe"].map((level, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full">
                <div className={cn(
                  "h-2 w-2 rounded-full",
                  level === "Extreme" ? "bg-red-600" :
                  level === "High" ? "bg-orange-500" :
                  level === "Moderate" ? "bg-yellow-500" : "bg-green-600"
                )}></div>
                <span className="text-[10px] font-bold uppercase">{level}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex-1 bg-muted/30 rounded-[2rem] border border-dashed flex flex-col items-center justify-center p-12 text-center relative overflow-hidden group">
          <div className="absolute inset-0 african-pattern opacity-5 group-hover:opacity-10 transition-opacity"></div>
          
          <svg viewBox="0 0 500 400" className="w-full max-w-2xl h-auto relative z-10">
            <path d="M100 50 L400 50 L450 150 L420 350 L80 350 L50 150 Z" className="fill-green-600/20 stroke-green-600/40 stroke-2" />
            <circle cx="250" cy="200" r="40" className="fill-red-600/60 stroke-red-600 animate-pulse" />
            <circle cx="280" cy="230" r="30" className="fill-red-600/40" />
            <circle cx="200" cy="180" r="35" className="fill-orange-500/50" />
            <circle cx="350" cy="150" r="25" className="fill-yellow-500/50" />
            <circle cx="150" cy="250" r="20" className="fill-yellow-500/50" />
            
            <text x="250" y="200" textAnchor="middle" className="fill-white text-[12px] font-black pointer-events-none">KOGI</text>
            <text x="280" y="245" textAnchor="middle" className="fill-white text-[10px] font-bold pointer-events-none">BENUE</text>
            <text x="200" y="180" textAnchor="middle" className="fill-white text-[10px] font-bold pointer-events-none">FCT</text>
          </svg>
          
          <div className="mt-8 max-w-md relative z-10">
            <p className="text-[#003566] font-bold text-lg mb-2">Interactive Command Map</p>
            <p className="text-muted-foreground text-sm">Click on any region to view detailed catchment area analysis and hydrological forecasts.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function AlertsTab({ reports }: { reports: FloodReport[] }) {
  const alerts = [
    { title: "Heavy Rainfall Expected", state: "Benue", time: "10 mins ago", level: "High", msg: "Predicted 50mm rainfall in the next 3 hours." },
    { title: "Rising Water Level", state: "Lokoja", time: "45 mins ago", level: "Extreme", msg: "River Niger gauge shows critical levels." },
    { title: "Dam Release Warning", state: "Kainji", time: "2 hours ago", level: "Moderate", msg: "Controlled release scheduled for midnight." },
    { title: "Evacuation Order", state: "Anambra", time: "5 hours ago", level: "High", msg: "Low lying areas in Ogbaru must evacuate." },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {alerts.map((alert, i) => (
          <Card key={i} className="rounded-3xl border-none shadow-xl bg-white overflow-hidden group hover:scale-105 transition-all">
            <div className={cn(
              "h-2 w-full",
              alert.level === "Extreme" ? "bg-red-600" :
              alert.level === "High" ? "bg-orange-500" : "bg-yellow-500"
            )}></div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <Badge variant="outline" className="text-[8px] uppercase tracking-widest">{alert.state}</Badge>
                <span className="text-[8px] font-bold text-muted-foreground uppercase">{alert.time}</span>
              </div>
              <h3 className="text-lg font-black text-[#003566] tracking-tighter uppercase mb-2">{alert.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-6">{alert.msg}</p>
              <Button size="sm" className="w-full rounded-xl text-[10px] font-bold uppercase tracking-widest bg-[#003566]">View Details</Button>
            </div>
          </Card>
        ))}
      </div>
      
      <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden">
        <div className="p-8 border-b flex justify-between items-center">
          <h3 className="font-black text-[#003566] uppercase tracking-tighter">System Generated Alerts</h3>
          <Button variant="ghost" size="sm" className="text-xs font-bold uppercase">Archive</Button>
        </div>
        <div className="divide-y divide-muted">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="p-6 flex items-center justify-between hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className="bg-orange-100 p-2 rounded-lg"><Bell className="h-4 w-4 text-orange-600" /></div>
                <div>
                  <p className="text-sm font-bold text-[#003566]">Sensor Alert: Water Velocity Increase</p>
                  <p className="text-xs text-muted-foreground">Location ID: #LKJ-204 | Lokoja North</p>
                </div>
              </div>
              <Badge className="bg-muted text-muted-foreground border-none">Logged</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function ShelterTab() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          {SHELTERS.map((shelter, i) => (
            <Card key={i} className="rounded-3xl border-none shadow-xl bg-white p-6 flex items-center gap-6 group hover:translate-x-2 transition-all">
              <div className={cn(
                "h-16 w-16 rounded-2xl flex items-center justify-center shrink-0 transition-colors",
                shelter.status === "Active" ? "bg-green-100 text-green-600" : 
                shelter.status === "Full" ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"
              )}>
                <Home className="h-8 w-8" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-lg font-black text-[#003566] uppercase tracking-tighter">{shelter.name}</h3>
                  <Badge className={cn(
                    "border-none text-white text-[10px] uppercase font-black",
                    shelter.status === "Active" ? "bg-green-600" : 
                    shelter.status === "Full" ? "bg-red-600" : "bg-orange-500"
                  )}>{shelter.status}</Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {shelter.location}</span>
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {shelter.capacity} Occupied</span>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full group-hover:bg-muted">
                <ChevronRight className="h-5 w-5" />
              </Button>
            </Card>
          ))}
        </div>
        
        <Card className="rounded-[2.5rem] border-none shadow-2xl bg-muted/50 overflow-hidden relative min-h-[500px] flex items-center justify-center border-4 border-dashed border-white/40">
           <div className="text-center p-12">
              <div className="bg-white p-4 rounded-3xl shadow-xl inline-block mb-6"><Globe className="h-12 w-12 text-[#003566]" /></div>
              <h3 className="text-2xl font-black text-[#003566] tracking-tighter uppercase mb-2">Live Shelter Map</h3>
              <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-8">Visualization of all emergency centers and their current resource availability.</p>
              <Button className="rounded-2xl bg-[#003566] px-8 h-12 font-black uppercase tracking-widest text-xs">Initialize GIS Viewer</Button>
           </div>
        </Card>
      </div>
    </div>
  );
}

function ReportsTab({ reports }: { reports: FloodReport[] }) {
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diff = Math.floor((now.getTime() - date.getTime()) / 60000);
      if (diff < 1) return "Just now";
      if (diff < 60) return `${diff}m ago`;
      return `${Math.floor(diff / 60)}h ago`;
    } catch (e) {
      return "Recently";
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <h2 className="text-3xl font-black text-[#003566] tracking-tighter uppercase mb-1">Ground Intelligence</h2>
          <p className="text-muted-foreground">Public report listings are unavailable pending authenticated, audited access.</p>
        </div>
        <Button className="h-12 px-6 bg-[#003566] text-white font-black uppercase tracking-widest rounded-xl gap-2">
          <PlusCircle className="h-5 w-5" />
          Create New Agency Report
        </Button>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.length === 0 ? (
          <div className="col-span-full py-24 text-center bg-white/50 rounded-[2.5rem] border-4 border-dashed border-white">
            <MessageSquare className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-bold">Production reports are private. Public listing is not enabled.</p>
          </div>
        ) : (
          reports.map((report) => (
            <Card key={report.id} className="rounded-3xl overflow-hidden border-none shadow-xl bg-white flex flex-col group hover:scale-[1.02] transition-all">
              <div className="aspect-video bg-muted relative overflow-hidden">
                {report.image ? (
                  <img src={report.image} alt="Report" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/5">
                    <FileText className="h-12 w-12 text-primary/10" />
                  </div>
                )}
                <Badge className={cn("absolute top-4 left-4 text-white font-black text-[8px] tracking-widest border-none", 
                  report.severity === "extreme" ? "bg-red-600" : 
                  report.severity === "high" ? "bg-orange-600" : "bg-yellow-500"
                )}>
                  {report.severity.toUpperCase()}
                </Badge>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-black text-[#003566] uppercase text-sm tracking-tight">{report.type.replace("-", " ")}</h3>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">{formatTime(report.timestamp)}</span>
                </div>
                <p className="text-[10px] text-muted-foreground font-bold flex items-center gap-1 mb-4 uppercase tracking-wider">
                  <MapPin className="h-3 w-3" /> {report.location}
                </p>
                <p className="text-sm text-primary/80 line-clamp-2 mb-6 font-medium italic">"{report.description}"</p>
                <div className="mt-auto pt-6 border-t flex gap-2">
                  <Button size="sm" className="flex-1 h-10 text-[10px] font-black uppercase tracking-widest rounded-lg bg-[#003566]">Verify</Button>
                  <Button size="sm" variant="outline" className="h-10 text-[10px] font-black uppercase tracking-widest rounded-lg border-2 border-[#003566] text-[#003566]">Contact</Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

function ResourcesTab() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {RESOURCES.map((res, i) => (
          <Card key={i} className="rounded-3xl border-none shadow-xl bg-white p-8 text-center group hover:bg-[#003566] hover:text-white transition-all">
            <div className="bg-orange-100 group-hover:bg-orange-500 p-5 rounded-3xl inline-block mb-6 transition-colors">
              <res.icon className="h-8 w-8 text-orange-600 group-hover:text-white" />
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">{res.count}</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-6 group-hover:text-white/60">{res.name}</p>
            <Badge className={cn(
              "border-none px-4 py-1 text-[8px] font-black uppercase tracking-widest",
              res.status === "Deployed" || res.status === "Active" ? "bg-green-600 text-white" : "bg-orange-500 text-white"
            )}>{res.status}</Badge>
          </Card>
        ))}
      </div>
      
      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 rounded-[2.5rem] border-none shadow-xl bg-white p-8">
          <h3 className="text-xl font-black text-[#003566] uppercase tracking-tighter mb-8">Recent Deployments</h3>
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="flex items-center justify-between p-4 bg-muted/50 rounded-2xl border border-white">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm"><Anchor className="h-5 w-5 text-[#003566]" /></div>
                  <div>
                    <p className="text-sm font-bold text-[#003566]">10 Rescue Boats to Ibaji</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Dispatched: Today 08:30 AM</p>
                  </div>
                </div>
                <Badge variant="outline" className="border-green-600 text-green-600 font-black text-[8px]">IN TRANSIT</Badge>
              </div>
            ))}
          </div>
        </Card>
        
        <Card className="rounded-[2.5rem] border-none shadow-xl bg-orange-500 text-white p-8 relative overflow-hidden">
          <div className="absolute inset-0 kente-pattern opacity-10"></div>
          <div className="relative z-10">
            <h3 className="text-xl font-black uppercase tracking-tighter mb-4">Request Resources</h3>
            <p className="text-white/80 text-sm mb-8 leading-relaxed">Need additional supplies? State coordinators can request priority resource allocation here.</p>
            <Button className="w-full h-14 bg-white text-orange-600 hover:bg-white/90 font-black uppercase tracking-widest rounded-2xl">Create Request</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function HistoryTab() {
  const years = [2018, 2019, 2020, 2021, 2022, 2023, 2024];
  const data = [45, 30, 85, 40, 95, 60, 78];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Card className="rounded-[2.5rem] border-none shadow-2xl bg-white p-8 lg:p-12 overflow-hidden relative">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl font-black text-[#003566] tracking-tighter uppercase mb-1">Flood Severity Trends</h2>
            <p className="text-muted-foreground text-sm tracking-tight">Annual peak flood probability index (National Average).</p>
          </div>
          <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-xl border border-green-100">
             <TrendingUp className="h-4 w-4" />
             <span className="text-xs font-black uppercase tracking-widest">+18% vs Last Year</span>
          </div>
        </div>
        
        <div className="h-[400px] flex items-end justify-between gap-4 pt-10">
          {data.map((val, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
              <div className="w-full relative flex flex-col items-center justify-end h-full">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${val}%` }}
                  transition={{ delay: i * 0.1, duration: 1 }}
                  className={cn(
                    "w-full rounded-t-2xl shadow-lg relative group-hover:brightness-110 transition-all",
                    val > 80 ? "bg-red-600 shadow-red-200" : 
                    val > 60 ? "bg-orange-500 shadow-orange-200" : "bg-blue-600 shadow-blue-200"
                  )}
                >
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#003566] text-white text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {val}%
                  </div>
                </motion.div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{years[i]}</span>
            </div>
          ))}
        </div>
        
        <div className="mt-12 grid md:grid-cols-3 gap-6 pt-12 border-t border-muted">
           <div className="flex items-center gap-4">
              <div className="h-3 w-3 rounded-full bg-red-600"></div>
              <p className="text-[10px] font-bold uppercase text-muted-foreground">Severe Crisis (&gt;80%)</p>
           </div>
           <div className="flex items-center gap-4">
              <div className="h-3 w-3 rounded-full bg-orange-500"></div>
              <p className="text-[10px] font-bold uppercase text-muted-foreground">Major Alert (&gt;60%)</p>
           </div>
           <div className="flex items-center gap-4">
              <div className="h-3 w-3 rounded-full bg-blue-600"></div>
              <p className="text-[10px] font-bold uppercase text-muted-foreground">Moderate Trend</p>
           </div>
        </div>
      </Card>
      
      <div className="grid md:grid-cols-2 gap-8">
         <Card className="rounded-[2.5rem] border-none shadow-xl bg-[#003566] text-white p-8">
            <h4 className="text-lg font-black uppercase tracking-tighter mb-4 flex items-center gap-2">
              <History className="h-5 w-5 text-orange-500" />
              Historical Insights
            </h4>
            <p className="text-white/70 text-sm leading-relaxed mb-6">
              AI analysis of the 2022 peak shows striking similarities to current hydrological patterns. Preparedness protocols in Lokoja saved over 40,000 lives during that period.
            </p>
            <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10 font-black uppercase tracking-widest text-xs h-12 rounded-xl">Download 2022 Report</Button>
         </Card>
         
         <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-8">
            <h4 className="text-lg font-black uppercase tracking-tighter mb-4 text-[#003566]">Correlative Data</h4>
            <div className="space-y-4">
               {[{
                   label: "Rainfall Correlation",
                   value: "92%"
                 },
                 {
                   label: "River Discharge Lag",
                   value: "3 Days"
                 },
                 {
                   label: "AI Accuracy Rating",
                   value: "98.4%"
                 }
               ].map((item, i) => (
                 <div key={i} className="flex justify-between items-center p-3 bg-muted/50 rounded-xl">
                    <span className="text-xs font-bold text-muted-foreground uppercase">{item.label}</span>
                    <span className="text-sm font-black text-[#003566]">{item.value}</span>
                 </div>
               ))}
            </div>
         </Card>
      </div>
    </div>
  );
}

function SafetyContactsTab() {
  const SAFETY_TIPS = {
    "before_flood": [
      "Identify elevated safe zones or shelters in your local LGA.",
      "Pack an emergency bag with clean water, dry food, flashlights, and vital documents.",
      "Clear nearby drainage paths and trash channels to allow free water flow."
    ],
    "during_flood": [
      "Evacuate immediately to high ground if water begins rising.",
      "Shut down your main electricity grid and gas lines to avoid shocks or fires.",
      "Do not walk or drive through moving floodwaters."
    ],
    "after_flood": [
      "Avoid standing water near downed power lines or leaning utility poles.",
      "Inspect buildings carefully for displaced dangerous wildlife like snakes.",
      "Boil or chemically treat all drinking water to prevent waterborne diseases."
    ]
  };

  const EMERGENCY_CONTACTS = [
    {
      "agency": "National Emergency Line",
      "zone": "Federal",
      "number": "112",
      "type": "Toll-Free"
    },
    {
      "agency": "Kogi State Emergency Management Agency (KOSEMA)",
      "zone": "Kogi State",
      "number": "+2348036152419",
      "type": "Disaster Response"
    },
    {
      "agency": "Federal Road Safety Corps (FRSC) Sector Command",
      "zone": "Lokoja",
      "number": "122",
      "type": "Rescue & Traffic"
    },
    {
      "agency": "Federal Medical Centre (FMC) Emergency Room",
      "zone": "Lokoja",
      "number": "+23458221282",
      "type": "Medical"
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="rounded-[2.5rem] border-none shadow-2xl bg-white p-8">
          <h3 className="text-xl font-black text-[#003566] uppercase tracking-tighter mb-8 flex items-center gap-2">
            <Book className="h-5 w-5 text-orange-500" />
            Safety Tips
          </h3>

          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-black text-[#003566] uppercase tracking-widest mb-3">Before Flood</h4>
              <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                {SAFETY_TIPS.before_flood.map((tip, i) => <li key={i} className="text-sm font-medium">{tip}</li>)}
              </ul>
            </div>

            <div className="border-t pt-6">
              <h4 className="text-sm font-black text-[#003566] uppercase tracking-widest mb-3">During Flood</h4>
              <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                {SAFETY_TIPS.during_flood.map((tip, i) => <li key={i} className="text-sm font-medium">{tip}</li>)}
              </ul>
            </div>

            <div className="border-t pt-6">
              <h4 className="text-sm font-black text-[#003566] uppercase tracking-widest mb-3">After Flood</h4>
              <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                {SAFETY_TIPS.after_flood.map((tip, i) => <li key={i} className="text-sm font-medium">{tip}</li>)}
              </ul>
            </div>
          </div>
        </Card>

        <Card className="rounded-[2.5rem] border-none shadow-2xl bg-white p-8">
          <h3 className="text-xl font-black text-[#003566] uppercase tracking-tighter mb-8 flex items-center gap-2">
            <PhoneIncoming className="h-5 w-5 text-orange-500" />
            Emergency Contacts
          </h3>

          <div className="space-y-4">
            {EMERGENCY_CONTACTS.map((contact, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-muted/50 rounded-2xl border border-white">
                <div className="flex-1">
                  <p className="text-sm font-bold text-[#003566]">{contact.agency}</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{contact.zone} - {contact.type}</p>
                </div>
                <a 
                  href={`tel:${contact.number}`}
                  className={cn(
                    buttonVariants({ size: "sm" }),
                    "h-10 px-6 bg-green-600 hover:bg-green-700 text-white font-black uppercase tracking-widest rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-green-500/20"
                  )}
                >
                   <Phone className="h-4 w-4 mr-2"/>
                  {contact.number}
                </a>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
