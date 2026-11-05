import * as React from "react";
import { MapContainer, TileLayer, Circle, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import { 
  AlertTriangle, 
  Droplets, 
  Wind, 
  Thermometer, 
  MapPin, 
  Search, 
  Navigation, 
  School, 
  Hospital, 
  Shield,
  Users,
  Route,
  ArrowRight,
  CheckCircle2,
  Layers,
  ChevronDown,
  ChevronUp,
  History,
  Satellite,
  Mountain,
  BarChart3
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

// Fix leaflet icon issue
import "leaflet/dist/leaflet.css";

const RISK_LEVELS = {
  SAFE: { color: "#2D6A4F", label: "Safe", bg: "bg-green-500" },
  LOW: { color: "#EAB308", label: "Low Risk", bg: "bg-yellow-500" },
  MODERATE: { color: "#FF9F1C", label: "Moderate Risk", bg: "bg-orange-500" },
  HIGH: { color: "#D90429", label: "High Risk", bg: "bg-red-500" },
  EXTREME: { color: "#000000", label: "Extreme Risk", bg: "bg-black" },
};

const locations = [
  { id: 1, name: "Lokoja", coords: [7.8023, 6.7333] as [number, number], risk: "HIGH", probability: 85, population: "150k" },
  { id: 2, name: "Makurdi", coords: [7.7322, 8.5214] as [number, number], risk: "MODERATE", probability: 60, population: "250k" },
  { id: 3, name: "Asaba", coords: [6.1978, 6.7324] as [number, number], risk: "LOW", probability: 30, population: "120k" },
  { id: 4, name: "Onitsha", coords: [6.1437, 6.7844] as [number, number], risk: "HIGH", probability: 78, population: "500k" },
  { id: 5, name: "Kogi State Univ", coords: [7.5023, 7.1333] as [number, number], risk: "SAFE", probability: 5, population: "30k" },
];

const facilities = [
  { id: 1, name: "Lokoja Govt Secondary School", type: "SHELTER", coords: [7.8123, 6.7433] as [number, number] },
  { id: 3, name: "Community Primary School", type: "SCHOOL", coords: [7.7923, 6.7533] as [number, number] },
];

const VULNERABILITY_LEVELS = {
  CRITICAL: { color: "#7C1D6F", label: "Critical", description: "Immediate rescue priority" },
  HIGH: { color: "#C026D3", label: "High", description: "Priority rescue zone" },
  MODERATE: { color: "#E879F9", label: "Moderate", description: "Monitor closely" },
  LOW: { color: "#F0ABFC", label: "Low", description: "Standard response" },
};

const vulnerabilityZones = [
  { id: 1, name: "Ibaji Waterside", coords: [7.7900, 6.7200] as [number, number], level: "CRITICAL" as const, density: "High-density", detail: "Low-income, 40% elderly", radius: 1800 },
  { id: 2, name: "Bassa Junction", coords: [7.8150, 6.7500] as [number, number], level: "HIGH" as const, density: "Dense settlement", detail: "Low-income, 30% elderly", radius: 1500 },
  { id: 3, name: "Lokoja Central Market", coords: [7.8050, 6.7380] as [number, number], level: "HIGH" as const, density: "Market district", detail: "Informal traders, limited mobility", radius: 1200 },
  { id: 4, name: "Eggan Rural", coords: [7.8300, 6.7100] as [number, number], level: "MODERATE" as const, density: "Semi-rural", detail: "Farming community, 25% elderly", radius: 2200 },
  { id: 5, name: "Koton-Karfe", coords: [7.7700, 6.6900] as [number, number], level: "CRITICAL" as const, density: "Riverine area", detail: "Extreme poverty, 45% elderly", radius: 1600 },
  { id: 6, name: "Ogaminana", coords: [7.8200, 6.7700] as [number, number], level: "LOW" as const, density: "Suburban", detail: "Mixed income, 10% elderly", radius: 1400 },
];

const evacuationRoutes = [
  {
    id: 1,
    from: "Lokoja Central",
    to: "Kogi State Univ Shelter",
    estimatedTime: "12 min",
    distance: "4.2 km",
    aiOptimized: true,
    hazardBypass: "Bypassing flooded Wuse River Bridge",
    steps: [
      { id: 1, instruction: "Head north on Mohammed Abacha Way", distance: "0.8 km", note: null },
      { id: 2, instruction: "Turn right onto elevated corridor via Okene Road", distance: "1.2 km", note: "Route Optimized: Bypassing flooded Wuse River Bridge. Proceed via alternative elevated corridor." },
      { id: 3, instruction: "Continue straight past Federal Medical Centre", distance: "0.9 km", note: null },
      { id: 4, instruction: "Turn left onto School Access Road", distance: "0.7 km", note: null },
      { id: 5, instruction: "Arrive at Kogi State Univ Shelter", distance: "0.6 km", note: "Safe zone confirmed. Shelter capacity: 85%." },
    ]
  },
  {
    id: 2,
    from: "Bassa Junction",
    to: "Lokoja Govt Secondary School",
    estimatedTime: "8 min",
    distance: "2.8 km",
    aiOptimized: true,
    hazardBypass: "Avoiding submerged underpass at Market Square",
    steps: [
      { id: 1, instruction: "Proceed east on Bassa Access Road", distance: "0.6 km", note: null },
      { id: 2, instruction: "Turn left onto elevated highway bypass", distance: "1.0 km", note: "Route Optimized: Avoiding submerged underpass at Market Square. Use overhead bypass." },
      { id: 3, instruction: "Continue north past Community Primary School", distance: "0.7 km", note: null },
      { id: 4, instruction: "Arrive at Lokoja Govt Secondary School Shelter", distance: "0.5 km", note: "Safe zone confirmed. Shelter capacity: 72%." },
    ]
  }
];

const historicalFloodEvents = [
  { id: 1, year: 2012, name: "2012 Great Flood", coords: [7.8023, 6.7333] as [number, number], waterLevel: "4.8m", affected: "350k people", color: "#B45309" },
  { id: 2, year: 2022, name: "2022 Severe Flood", coords: [7.7900, 6.7200] as [number, number], waterLevel: "5.2m", affected: "420k people", color: "#92400E" },
  { id: 3, year: 2012, name: "2012 Bassa Inundation", coords: [7.8150, 6.7500] as [number, number], waterLevel: "3.9m", affected: "120k people", color: "#B45309" },
  { id: 4, year: 2022, name: "2022 Lokoja Central", coords: [7.8050, 6.7380] as [number, number], waterLevel: "5.5m", affected: "280k people", color: "#92400E" },
  { id: 5, year: 2012, name: "2012 Eggan Floodplain", coords: [7.8300, 6.7100] as [number, number], waterLevel: "3.2m", affected: "85k people", color: "#B45309" },
  { id: 6, year: 2022, name: "2022 Koton-Karfe Surge", coords: [7.7700, 6.6900] as [number, number], waterLevel: "6.1m", affected: "95k people", color: "#92400E" },
];

const evacuationCorridors = [
  {
    id: 1,
    name: "Lokoja North Corridor",
    path: [[7.8023, 6.7333], [7.8100, 6.7400], [7.8200, 6.7450], [7.8300, 6.7500]] as [number, number][],
    status: "SAFE",
    elevation: "Elevated"
  },
  {
    id: 2,
    name: "Bassa East Route",
    path: [[7.8150, 6.7500], [7.8180, 6.7550], [7.8200, 6.7600], [7.8220, 6.7650]] as [number, number][],
    status: "SAFE",
    elevation: "Elevated"
  },
  {
    id: 3,
    name: "Central Evacuation Artery",
    path: [[7.8050, 6.7380], [7.8080, 6.7420], [7.8120, 6.7460], [7.8150, 6.7500]] as [number, number][],
    status: "SAFE",
    elevation: "Elevated"
  }
];

const MAP_LAYERS = {
  STANDARD: { label: "Standard", icon: "Map", url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" },
  SATELLITE: { label: "Satellite View", icon: "Satellite", url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" },
  TOPOGRAPHIC: { label: "Topographic Terrain", icon: "Mountain", url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png" },
  POPULATION: { label: "Population Density", icon: "BarChart3", url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" },
};

export default function LiveMap() {
  const apiBase = import.meta.env.VITE_FLOODGUARD_API_URL?.replace(/\/$/, "");
  const [evidence, setEvidence] = React.useState<{warning:string; observations:Array<{latitude:number;longitude:number;summary:string;source_name:string;source_url:string;observed_at:string}>}|null>(null);
  const [evidenceError, setEvidenceError] = React.useState("");
  React.useEffect(() => {
    if (!apiBase) { setEvidenceError("Evidence API not configured"); return; }
    const controller = new AbortController();
    fetch(`${apiBase}/api/v1/flood-risk/assess`, {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({latitude:7.8023,longitude:6.7333}),signal:controller.signal})
      .then(async r => {if (!r.ok) throw new Error("Evidence service unavailable");return r.json();})
      .then(setEvidence).catch(e => {if (!controller.signal.aborted) setEvidenceError(String(e));});
    return () => controller.abort();
  }, [apiBase]);
  const [selectedCity, setSelectedCity] = React.useState(locations[0]);
  const [showVulnerability, setShowVulnerability] = React.useState(false);
  const [showEvacuationRoute, setShowEvacuationRoute] = React.useState(false);
  const [activeRoute, setActiveRoute] = React.useState(evacuationRoutes[0]);
  const [activeLayer, setActiveLayer] = React.useState<keyof typeof MAP_LAYERS>("STANDARD");
  const [showLegend, setShowLegend] = React.useState(true);
  const [showHistorical, setShowHistorical] = React.useState(false);
  const [showEvacuationCorridors, setShowEvacuationCorridors] = React.useState(false);
  const center: [number, number] = [7.8023, 6.7333];

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden">
      {/* Sidebar */}
      <div className="w-full lg:w-96 bg-card border-r flex flex-col z-10">
        <div className="p-4 border-b space-y-4">
          <h1 className="text-xl font-bold text-primary flex items-center gap-2">
            <Shield className="h-5 w-5 text-accent" />
            Live Flood Risk
          </h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search community..." className="pl-9" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Weather Stats */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="shadow-none bg-muted/30 border-none">
              <CardContent className="p-3 flex flex-col items-center">
                <Thermometer className="h-4 w-4 text-orange-500 mb-1" />
                <span className="text-sm font-bold">28°C</span>
                <span className="text-[10px] text-muted-foreground">Temp</span>
              </CardContent>
            </Card>
            <Card className="shadow-none bg-muted/30 border-none">
              <CardContent className="p-3 flex flex-col items-center">
                <Droplets className="h-4 w-4 text-blue-500 mb-1" />
                <span className="text-sm font-bold">82%</span>
                <span className="text-[10px] text-muted-foreground">Humidity</span>
              </CardContent>
            </Card>
          </div>

          <div role="status" className="rounded-lg border border-amber-400 bg-amber-50 p-3 text-sm text-amber-950">
            <strong>DEMONSTRATION ONLY — NOT LIVE FLOOD WARNINGS</strong>
            <p>Risk percentages, weather, facilities and evacuation routes shown here are illustrative, not verified emergency information.</p>
            <p className="mt-2 font-semibold">Sourced evidence near Lokoja:</p>
            <p>{evidenceError || evidence?.warning || "Checking evidence…"}</p>
            {evidence?.observations.map((obs,i) => <p key={i}>{obs.summary} — <a className="underline" href={obs.source_url} target="_blank" rel="noopener noreferrer">{obs.source_name}</a> ({new Date(obs.observed_at).toLocaleDateString()})</p>)}
          </div>
          {/* Critical Alerts */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Simulated Alerts</h3>
            {locations.filter(l => l.risk === "HIGH" || l.risk === "EXTREME").map(city => (
              <div 
                key={city.id}
                onClick={() => setSelectedCity(city)}
                className="flex items-center gap-4 p-3 rounded-xl border border-red-200 bg-red-50 cursor-pointer hover:bg-red-100 transition-colors"
              >
                <AlertTriangle className="h-8 w-8 text-red-600" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-red-900">{city.name}</span>
                    <Badge variant="destructive" className="text-[10px] uppercase">Demo</Badge>
                  </div>
                  <p className="text-[10px] text-red-700">Probability: {city.probability}% - Demo only — not an evacuation order.</p>
                </div>
              </div>
            ))}
          </div>

          {/* Risk List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Demo Community Risks</h3>
            <div className="space-y-2">
              {locations.map(city => (
                <button
                  key={city.id}
                  onClick={() => setSelectedCity(city)}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left",
                    selectedCity.id === city.id ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border hover:bg-muted"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-primary/60" />
                    <div>
                      <div className="text-sm font-bold">{city.name}</div>
                      <div className="text-[10px] text-muted-foreground">Pop: {city.population}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold uppercase" style={{ color: RISK_LEVELS[city.risk as keyof typeof RISK_LEVELS].color }}>
                      {RISK_LEVELS[city.risk as keyof typeof RISK_LEVELS].label}
                    </div>
                    <div className="text-[10px] text-muted-foreground">{city.probability}% Prob</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Socio-Economic Vulnerability Overlay Toggle */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Map Overlays</h3>
            <div className="flex items-start gap-3 p-3 rounded-xl border border-purple-200 bg-purple-50">
              <Checkbox
                id="vulnerability-heatmap"
                checked={showVulnerability}
                onCheckedChange={(checked) => setShowVulnerability(checked === true)}
                className="mt-0.5"
              />
              <label htmlFor="vulnerability-heatmap" className="cursor-pointer flex-1">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-700" />
                  <span className="text-sm font-bold text-purple-900">Socio-Economic Vulnerability Heatmap</span>
                </div>
                <p className="text-[10px] text-purple-700 mt-1">Highlight high-density, low-income & elderly-majority neighborhoods for rescue prioritization</p>
              </label>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl border border-amber-200 bg-amber-50">
              <Checkbox
                id="historical-comparison"
                checked={showHistorical}
                onCheckedChange={(checked) => setShowHistorical(checked === true)}
                className="mt-0.5"
              />
              <label htmlFor="historical-comparison" className="cursor-pointer flex-1">
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4 text-amber-700" />
                  <span className="text-sm font-bold text-amber-900">Historical Comparison</span>
                </div>
                <p className="text-[10px] text-amber-700 mt-1">Overlay high-water marks from 2012 &amp; 2022 flood events alongside current levels</p>
              </label>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl border border-green-200 bg-green-50">
              <Checkbox
                id="evacuation-corridors"
                checked={showEvacuationCorridors}
                onCheckedChange={(checked) => setShowEvacuationCorridors(checked === true)}
                className="mt-0.5"
              />
              <label htmlFor="evacuation-corridors" className="cursor-pointer flex-1">
                <div className="flex items-center gap-2">
                  <Route className="h-4 w-4 text-green-700" />
                  <span className="text-sm font-bold text-green-900">Evacuation Route Highlights</span>
                </div>
                <p className="text-[10px] text-green-700 mt-1">Display glowing green corridors showing safest, entirely dry evacuation routes</p>
              </label>
            </div>
          </div>
        </div>

        {/* Evacuation Route Planner */}
        <div className="p-4 border-t bg-muted/20 space-y-3">
          <Button 
            className="w-full gap-2" 
            variant={showEvacuationRoute ? "default" : "outline"}
            onClick={() => setShowEvacuationRoute(!showEvacuationRoute)}
          >
            <Route className="h-4 w-4" />
            {showEvacuationRoute ? "Hide Evacuation Route" : "View Example Route"}
          </Button>

          {showEvacuationRoute && (
            <div className="space-y-3 max-h-[40vh] overflow-y-auto">
              {/* Route Selector */}
              <div className="flex gap-2">
                {evacuationRoutes.map(route => (
                  <Button
                    key={route.id}
                    variant={activeRoute.id === route.id ? "default" : "outline"}
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => setActiveRoute(route)}
                  >
                    Route {route.id}
                  </Button>
                ))}
              </div>

              {/* Route Summary Card */}
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-xs font-bold text-green-900">Illustrative Route — Not Verified</span>
                    </div>
                    <Badge className="bg-green-600 text-[10px]">Active</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs mb-2">
                    <MapPin className="h-3 w-3 text-primary" />
                    <span className="font-medium">{activeRoute.from}</span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <MapPin className="h-3 w-3 text-green-600" />
                    <span className="font-medium">{activeRoute.to}</span>
                  </div>
                  <div className="flex gap-3 text-[10px] text-muted-foreground">
                    <span>⏱ {activeRoute.estimatedTime}</span>
                    <span>📍 {activeRoute.distance}</span>
                  </div>
                  {activeRoute.aiOptimized && (
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-[10px] text-blue-900 font-semibold flex items-start gap-1">
                        <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0 text-blue-600" />
                        <span>Route Optimized: {activeRoute.hazardBypass}. Proceed via alternative elevated corridor.</span>
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Turn-by-Turn Instructions */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Turn-by-Turn Directions</h4>
                {activeRoute.steps.map((step, index) => (
                  <div key={step.id} className="flex gap-3 p-2 rounded-lg bg-card border border-border">
                    <div className="flex flex-col items-center">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      {index < activeRoute.steps.length - 1 && (
                        <div className="w-0.5 h-full bg-border mt-1"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium">{step.instruction}</p>
                      <p className="text-[10px] text-muted-foreground">{step.distance}</p>
                      {step.note && (
                        <p className="text-[10px] text-blue-700 font-semibold mt-1 bg-blue-50 p-1.5 rounded border border-blue-200">
                          {step.note}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative bg-muted z-0">
        <MapContainer 
          {...({
            center: center,
            zoom: 11,
            className: "h-full w-full",
            scrollWheelZoom: true
          } as any)}
        >
          <TileLayer
            {...({
              attribution: activeLayer === "SATELLITE" ? '&copy; Esri, Maxar, Earthstar Geographics' : activeLayer === "TOPOGRAPHIC" ? '&copy; OpenTopoMap (CC-BY-SA)' : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
              url: MAP_LAYERS[activeLayer].url,
            } as any)}
          />
          
          {evidence?.observations.map((obs,i) => <Circle key={`evidence-${i}`} {...({center:[obs.latitude,obs.longitude],radius:450,pathOptions:{color:"#2563eb",fillColor:"#2563eb",fillOpacity:0.2}} as any)}><Popup><strong>Sourced observation — not a prediction</strong><p>{obs.summary}</p><a href={obs.source_url} target="_blank" rel="noopener noreferrer">{obs.source_name}</a></Popup></Circle>)}
          {/* Risk Areas — illustrative */}
          {locations.map(city => (
            <Circle
              key={city.id}
              {...({
                center: city.coords,
                pathOptions: { 
                  fillColor: RISK_LEVELS[city.risk as keyof typeof RISK_LEVELS].color,
                  color: RISK_LEVELS[city.risk as keyof typeof RISK_LEVELS].color,
                  fillOpacity: 0.4,
                  weight: 1
                },
                radius: 2000
              } as any)}
            >
              <Popup>
                <div className="p-1">
                  <h4 className="font-bold text-primary">{city.name}</h4>
                  <Badge className={cn("mt-1", RISK_LEVELS[city.risk as keyof typeof RISK_LEVELS].bg)}>
                    {RISK_LEVELS[city.risk as keyof typeof RISK_LEVELS].label}
                  </Badge>
                  <p className="text-xs mt-2">Flood Probability: {city.probability}%</p>
                </div>
              </Popup>
            </Circle>
          ))}

          {/* Facilities */}
          {facilities.map(fac => (
            <Marker 
              key={fac.id} 
              {...({
                position: fac.coords,
                icon: new L.DivIcon({
                  className: 'custom-icon',
                  html: `<div class="bg-white p-1.5 rounded-full shadow-lg border-2 border-primary">${
                    fac.type === 'SHELTER' ? '🏠' : fac.type === 'HOSPITAL' ? '🏥' : '🏫'
                  }</div>`,
                  iconSize: [30, 30],
                })
              } as any)}
            >
              <Popup>
                <div className="p-1">
                  <h4 className="font-bold text-primary">{fac.name}</h4>
                  <p className="text-xs text-muted-foreground">{fac.type}</p>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Socio-Economic Vulnerability Overlay */}
          {showVulnerability && vulnerabilityZones.map(zone => (
            <Circle
              key={`vuln-${zone.id}`}
              {...({
                center: zone.coords,
                pathOptions: {
                  fillColor: VULNERABILITY_LEVELS[zone.level].color,
                  color: VULNERABILITY_LEVELS[zone.level].color,
                  fillOpacity: 0.35,
                  weight: 2,
                  dashArray: "6 3"
                },
                radius: zone.radius
              } as any)}
            >
              <Popup>
                <div className="p-1">
                  <h4 className="font-bold text-primary">{zone.name}</h4>
                  <Badge className="mt-1" style={{ backgroundColor: VULNERABILITY_LEVELS[zone.level].color, color: "#fff" }}>
                    {VULNERABILITY_LEVELS[zone.level].label} Vulnerability
                  </Badge>
                  <p className="text-xs mt-2 font-medium">{zone.density}</p>
                  <p className="text-[10px] text-muted-foreground">{zone.detail}</p>
                  <p className="text-[10px] mt-1 font-semibold text-purple-700">{VULNERABILITY_LEVELS[zone.level].description}</p>
                </div>
              </Popup>
            </Circle>
          ))}
          {/* Historical Flood Markers */}
          {showHistorical && historicalFloodEvents.map(event => (
            <Marker
              key={`hist-${event.id}`}
              {...({
                position: event.coords,
                icon: new L.DivIcon({
                  className: 'historical-flood-icon',
                  html: `<div style="background:${event.color};width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3);font-size:10px;color:#fff;font-weight:bold;">${event.year}</div>`,
                  iconSize: [28, 28],
                  iconAnchor: [14, 14],
                })
              } as any)}
            >
              <Popup>
                <div className="p-1">
                  <h4 className="font-bold text-amber-900">{event.name}</h4>
                  <Badge className="mt-1 bg-amber-700 text-[10px]">{event.year} Flood Event</Badge>
                  <p className="text-xs mt-2">Water Level: <strong>{event.waterLevel}</strong></p>
                  <p className="text-[10px] text-muted-foreground">Affected: {event.affected}</p>
                </div>
              </Popup>
            </Marker>
          ))}
          {/* Evacuation Route Corridors */}
          {showEvacuationCorridors && evacuationCorridors.map(corridor => (
            <Polyline
              key={`corridor-${corridor.id}`}
              {...({
                positions: corridor.path,
                pathOptions: {
                  color: "#10B981",
                  weight: 8,
                  opacity: 0.8,
                  dashArray: "0",
                  lineCap: "round",
                  lineJoin: "round",
                },
              } as any)}
            >
              <Popup>
                <div className="p-1">
                  <h4 className="font-bold text-green-900">{corridor.name}</h4>
                  <Badge className="mt-1 bg-green-600 text-[10px]">{corridor.status}</Badge>
                  <p className="text-xs mt-2 font-medium">{corridor.elevation} Route</p>
                  <p className="text-[10px] text-muted-foreground">Illustrative route; not validated</p>
                </div>
              </Popup>
            </Polyline>
          ))}
        </MapContainer>

        {/* Layer Toggle Buttons */}
        <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
          <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-1.5 flex gap-1">
            <button
              onClick={() => setActiveLayer("STANDARD")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all",
                activeLayer === "STANDARD" ? "bg-primary text-primary-foreground shadow-md" : "text-foreground hover:bg-muted"
              )}
              title="Standard Map"
            >
              <MapPin className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Standard</span>
            </button>
            <button
              onClick={() => setActiveLayer("SATELLITE")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all",
                activeLayer === "SATELLITE" ? "bg-primary text-primary-foreground shadow-md" : "text-foreground hover:bg-muted"
              )}
              title="Satellite View"
            >
              <Satellite className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Satellite</span>
            </button>
            <button
              onClick={() => setActiveLayer("TOPOGRAPHIC")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all",
                activeLayer === "TOPOGRAPHIC" ? "bg-primary text-primary-foreground shadow-md" : "text-foreground hover:bg-muted"
              )}
              title="Topographic Terrain"
            >
              <Mountain className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Terrain</span>
            </button>
            <button
              onClick={() => setActiveLayer("POPULATION")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all",
                activeLayer === "POPULATION" ? "bg-primary text-primary-foreground shadow-md" : "text-foreground hover:bg-muted"
              )}
              title="Population Density"
            >
              <BarChart3 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Population</span>
            </button>
          </div>
        </div>

        {/* Interactive Collapsible Legend */}
        <div className="absolute bottom-6 left-6 z-[1000] hidden sm:block">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            <button
              onClick={() => setShowLegend(!showLegend)}
              className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
            >
              <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Layers className="h-3.5 w-3.5" />
                Risk Legend
              </h4>
              {showLegend ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronUp className="h-4 w-4 text-muted-foreground" />}
            </button>
            {showLegend && (
              <div className="px-3 pb-3 space-y-2 border-t border-border/50 pt-2">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  <span className="text-xs font-medium">🟢 Green — Low Risk</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                  <span className="text-xs font-medium">🟡 Yellow — Moderate Watch</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                  <span className="text-xs font-medium">🟠 Orange — High Alert</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-red-700"></div>
                  <span className="text-xs font-medium">🔴 Dark Red — Extreme Risk Level</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Vulnerability Overlay Legend */}
        {showVulnerability && (
          <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-purple-200 z-[1000] max-w-[220px]">
            <h4 className="text-xs font-bold uppercase tracking-widest text-purple-800 mb-1 flex items-center gap-2">
              <Users className="h-3.5 w-3.5" />
              Vulnerability Index
            </h4>
            <p className="text-[10px] text-muted-foreground mb-3">Prioritize rescue resources based on human vulnerability, not just terrain data.</p>
            <div className="space-y-2">
              {Object.entries(VULNERABILITY_LEVELS).map(([key, value]) => (
                <div key={key} className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full border-2 border-dashed" style={{ backgroundColor: value.color, borderColor: value.color }}></div>
                  <div>
                    <span className="text-xs font-medium">{value.label}</span>
                    <span className="text-[9px] text-muted-foreground block">{value.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
