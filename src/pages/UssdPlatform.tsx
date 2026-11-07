import * as React from "react";
import { Smartphone, Hash, Navigation, Shield, Phone, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { nigeriaStates } from "@/lib/nigeria-locations";

export default function UssdPlatform() {
  const [step, setStep] = React.useState('menu');
  const [selectedState, setSelectedState] = React.useState('');
  const [selectedLga, setSelectedLga] = React.useState('');

  const states = Object.keys(nigeriaStates);
  const lgas = selectedState ? (nigeriaStates as any)[selectedState] : [];

  const ussdSteps = [
    { code: "1", label: "Check Flood Risk", icon: AlertTriangle },
    { code: "2", label: "Find Nearest Shelter", icon: Navigation },
    { code: "3", label: "Emergency Numbers", icon: Phone },
    { code: "4", label: "Safety Tips", icon: Shield },
    { code: "5", label: "Subscribe to Alerts", icon: Smartphone },
  ];

  const handleMenuSelect = (value: string) => {
    if (value === '1') {
      setStep('state-select');
    } else {
        alert(`Feature "${ussdSteps.find(s => s.code === value)?.label}" is not implemented in this demo.`);
    }
  };

  return (
    <div className="py-16 md:py-24 bg-background african-pattern min-h-[80vh]">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
            <Hash className="h-4 w-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Browser-only USSD concept</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-6">
            Preview a USSD Menu <br />
            <span className="text-accent">No Live Network Connection</span>
          </h1>
          <div className="inline-block bg-primary text-primary-foreground px-8 py-4 rounded-3xl text-3xl md:text-5xl font-mono font-bold tracking-widest shadow-xl mb-8">
            USSD DEMO
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            This is a browser simulation only. No USSD shortcode has been provisioned and no mobile network is connected. Do not dial the example code as a FloodGuard service.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative mx-auto max-w-[300px]">
            <div className="bg-slate-900 rounded-[3rem] p-4 shadow-2xl border-4 border-slate-800">
              <div className="bg-slate-800 h-2 w-20 mx-auto rounded-full mb-8"></div>
              <div className="bg-white rounded-lg p-6 min-h-[400px] flex flex-col font-mono text-sm border-2 border-slate-200">
                <div className="border-b pb-2 mb-4 font-bold text-center text-primary">FloodGuard USSD</div>
                
                {step === 'menu' && (
                  <div className="space-y-3 mb-8">
                    {ussdSteps.map(s => <p key={s.code}>{s.code}. {s.label}</p>)}
                  </div>
                )}

                {step === 'state-select' && (
                  <div className="space-y-4 mb-4"><p className="font-bold text-primary">Step 1: Select State</p>
                    <Select onValueChange={setSelectedState} value={selectedState}>
                        <SelectTrigger><SelectValue placeholder="Choose your state..." /></SelectTrigger>
                        <SelectContent>
                            {states.map(state => <SelectItem key={state} value={state}>{state}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    {selectedState && (
                        <div className="space-y-4">
                            <p className="font-bold text-primary pt-4">Step 2: Select Local Govt.</p>
                            <Select onValueChange={setSelectedLga} value={selectedLga} disabled={!selectedState}>
                                <SelectTrigger><SelectValue placeholder="Choose your LGA..." /></SelectTrigger>
                                <SelectContent>
                                    {lgas.map((lga: string) => <SelectItem key={lga} value={lga}>{lga}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                  </div>
                )}

                <div className="mt-auto border-t pt-4">
                  <div className="flex justify-between items-center text-xs text-muted-foreground mb-2">
                    <span>{step === 'menu' ? 'Reply with number:' : 'Selection:'}</span>
                     <button className="text-xs text-accent hover:underline" onClick={() => { setStep('menu'); setSelectedState(''); setSelectedLga(''); }}>Back</button>
                  </div>
                  <div className="bg-slate-100 p-2 rounded text-primary font-semibold min-h-[2.5rem]">
                    {step === 'menu' ? '1' : `${selectedState}${selectedLga ? ', ' + selectedLga : ''}`}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button className="flex-1 bg-slate-200 h-8 rounded text-center leading-8 text-xs font-bold text-muted-foreground" onClick={() => { setStep('menu'); setSelectedState(''); setSelectedLga(''); }}>CANCEL</button>
                    <button className={`flex-1 bg-primary text-primary-foreground h-8 rounded text-center leading-8 text-xs font-bold transition-opacity ${(!selectedState || !selectedLga) && step !== 'menu' ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={step !== 'menu' && (!selectedState || !selectedLga)} onClick={() => { step === 'menu' ? handleMenuSelect('1') : alert('Demo selection only. No risk assessment was requested or completed.') }}>SEND</button>
                  </div>
                </div>
              </div>
              <div className="bg-slate-800 h-10 w-10 mx-auto rounded-full mt-8"></div>
            </div>
            {/* Decoration */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent/20 rounded-full blur-3xl z-[-1]"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl z-[-1]"></div>
          </div>

          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-primary">USSD Menu Options</h3>
            <div className="grid gap-4">
              {ussdSteps.map((step, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-border group hover:border-accent transition-colors"
                >
                  <div className="bg-muted p-3 rounded-xl text-primary font-bold w-12 h-12 flex items-center justify-center group-hover:bg-accent/10 group-hover:text-accent">
                    {step.code}
                  </div>
                  <div className="flex items-center gap-3">
                    <step.icon className="h-5 w-5 text-muted-foreground" />
                    <span className="font-bold text-primary">{step.label}</span>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="p-6 bg-secondary/5 border border-secondary/20 rounded-2xl">
              <h4 className="font-bold text-secondary mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Network Coverage
              </h4>
              <p className="text-sm text-muted-foreground">
                No live USSD service, network availability, operating hours or call pricing has been verified.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
