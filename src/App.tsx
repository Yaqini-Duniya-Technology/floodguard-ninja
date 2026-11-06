import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { Toaster } from "./components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "./components/ui/tooltip";
import { EmergencySOSButton } from "./components/EmergencySOSButton";
import * as React from "react";

// Lazy load pages for better performance
const Intelligence = React.lazy(() => import("./pages/Intelligence"));
const Home = React.lazy(() => import("./pages/Home"));
const LiveMap = React.lazy(() => import("./pages/LiveMap"));
const SmsRegistration = React.lazy(() => import("./pages/SmsRegistration"));
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const TrackReport = React.lazy(() => import("./pages/TrackReport"));
const ReportFlood = React.lazy(() => import("./pages/ReportFlood"));
const UssdPlatform = React.lazy(() => import("./pages/UssdPlatform"));
const WhatsAppBot = React.lazy(() => import("./pages/WhatsAppBot"));
const DownloadApp = React.lazy(() => import("./pages/DownloadApp"));

const NotFound = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh]">
    <h1 className="text-4xl font-bold text-primary">404</h1>
    <p className="text-muted-foreground">Page Not Found</p>
  </div>
);

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <Layout>
            <React.Suspense fallback={
              <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            }>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/intelligence" element={<Intelligence />} />
                <Route path="/map" element={<LiveMap />} />
                <Route path="/sms" element={<SmsRegistration />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/report" element={<ReportFlood />} />
                <Route path="/track" element={<TrackReport />} />
                <Route path="/ussd" element={<UssdPlatform />} />
                <Route path="/whatsapp" element={<WhatsAppBot />} />
                <Route path="/download" element={<DownloadApp />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </React.Suspense>
          </Layout>
          <Toaster position="top-center" richColors />
          <EmergencySOSButton />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;