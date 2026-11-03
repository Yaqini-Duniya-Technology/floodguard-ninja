import * as React from "react";
import { MessageCircle, X, Send, CloudRain, MapPin, LifeBuoy, Info, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { SUGGESTED_QUESTIONS, INITIAL_CONVERSATION, type Message } from "./chatbot-data";
import { nigeriaStates } from "@/lib/nigeria-locations";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const iconMap: { [key: string]: LucideIcon } = {
  MapPin,
  LifeBuoy,
  CloudRain,
  Info,
};

export function Chatbot() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>(INITIAL_CONVERSATION);
  const [input, setInput] = React.useState("");
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [step, setStep] = React.useState('chat');
  const [selectedState, setSelectedState] = React.useState('');
  const [selectedLga, setSelectedLga] = React.useState('');

  const states = Object.keys(nigeriaStates);
  const lgas = selectedState ? (nigeriaStates as any)[selectedState] : [];


  React.useEffect(() => {
    if (isOpen && scrollRef.current) {
      const viewport = scrollRef.current.querySelector("div");
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages, isOpen]);

  const handleSend = (text?: string) => {
    const userMsg = text || input;
    if (!userMsg.trim()) return;

    if (userMsg === "Flood risk in my area") {
      setStep("location-select");
      return;
    }
    
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);

    simulateResponse(userMsg);
  };

  const handleLocationSubmit = () => {
    if (!selectedState || !selectedLga) return;
    const locationQuery = `Check flood risk for ${selectedLga}, ${selectedState}`;
    setMessages(prev => [...prev, { role: "user", content: locationQuery}]);
    simulateResponse(locationQuery);
    setStep('chat');
    setSelectedState('');
    setSelectedLga('');
  }

  const simulateResponse = (userMsg: string) => {
    // Simple mock response logic
    setTimeout(() => {
      let response = "I can only provide information on flood risks and safety. Please ask a relevant question.";
      const lowerUserMsg = userMsg.toLowerCase();

      if (lowerUserMsg.includes("risk for") || lowerUserMsg.includes("lagos") || lowerUserMsg.includes("kano") || lowerUserMsg.includes("high risk states")) {
        response = "Live flood-risk verification is not connected yet. I cannot determine whether this location is safe. Check official NEMA/NIHSA and local emergency advisories before making safety decisions.";
      } else if (lowerUserMsg.includes("what to do")) {
        response = "1. Move to higher ground. 2. Avoid floodwater. 3. Call emergency services like 112 if needed. Stay safe!";
      } else if (lowerUserMsg.includes("my area")) {
        response = "To check your area, please provide a state or local government name.";
      } else if (lowerUserMsg.includes("contacts")) {
        response = "For an immediate emergency in Nigeria, try the national emergency line 112. Verify local agency contact details through official sources.";
      }
      setMessages(prev => [...prev, { role: "bot", content: response }]);
    }, 800);
  };

  const renderMessageContent = (content: string) => {
    const warningRegex = /(High risk \(\d+% probability\))/g;
    return content.split(warningRegex).map((part, index) => {
      if (warningRegex.test(part)) {
        return <span key={index} className="font-bold text-accent-orange bg-accent-orange/10 px-1.5 py-0.5 rounded-md">{part}</span>;
      }
      return part;
    });
  };

  const renderContent = () => {
    if (step === 'location-select') {
      return (
        <div className="p-6 flex flex-col gap-4">
            <h4 className="font-bold text-lg text-center text-foreground">Select Location for Risk Assessment</h4>
            <Select onValueChange={setSelectedState} value={selectedState}> 
                <SelectTrigger><SelectValue placeholder="Choose your state..." /></SelectTrigger>
                <SelectContent>{states.map(state => <SelectItem key={state} value={state}>{state}</SelectItem>)}</SelectContent>
            </Select>
            <Select onValueChange={setSelectedLga} value={selectedLga} disabled={!selectedState}>
                <SelectTrigger><SelectValue placeholder="Choose your LGA..." /></SelectTrigger>
                <SelectContent>{lgas.map((lga: string) => <SelectItem key={lga} value={lga}>{lga}</SelectItem>)}</SelectContent>
            </Select>
            <div className="flex gap-2 mt-2">
                <Button variant="ghost" onClick={() => setStep('chat')} className="w-full">Cancel</Button>
                <Button onClick={handleLocationSubmit} disabled={!selectedState || !selectedLga} className="w-full">Check Risk</Button>
            </div>
        </div>
      )
    }

    return (
        <>
            {/* Quick Suggestions */}
            <div className="p-4 border-b border-border/50">
                <p className="text-sm text-muted-foreground mb-3 text-center">Quick Actions</p>
                <div className="grid grid-cols-2 gap-3">
                    {SUGGESTED_QUESTIONS.map((item) => {
                        const Icon = iconMap[item.icon as string];
                        return (
                            <button
                                key={item.question}
                                onClick={() => handleSend(item.question)}
                                className="px-4 py-3 rounded-lg bg-black/5 dark:bg-white/5 text-foreground text-xs font-medium text-left hover:bg-black/10 dark:hover:bg-white/10 transition-colors duration-200 flex items-center gap-2.5"
                            >
                                <Icon className="h-5 w-5 text-primary" />
                                <span>{item.question}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Chat Area */}
            <ScrollArea className="flex-1 px-4 pt-2 pb-4" ref={scrollRef}>
              <div className="space-y-4 py-4">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
                  >
                    <div className={cn(
                      "max-w-[85%] px-4 py-3 text-sm leading-relaxed",
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-none"
                        : cn(
                            "rounded-2xl rounded-tl-none bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-slate-50",
                            msg.isWarning && "bg-accent/20 border border-accent/50 text-foreground"
                          )
                    )}>
                      {renderMessageContent(msg.content)}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Input Bar */}
            <div className="p-3 border-t border-border/50">
              <div className="relative">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about flood safety..."
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground rounded-lg h-12 pr-12 focus-visible:ring-1 focus-visible:ring-ring transition-all duration-200"
                />
                <Button 
                  onClick={() => handleSend()} 
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 h-8 w-8 bg-primary hover:bg-primary/90 rounded-md p-0"
                >
                  <Send className="h-4 w-4 text-primary-foreground"/>
                </Button>
              </div>
            </div>
        </>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-[400px] h-auto max-h-[80vh] bg-card/90 backdrop-blur-lg border border-border/50 shadow-2xl rounded-2xl flex flex-col overflow-hidden mb-4"
          >
            {/* Header */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-border/50 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse"></div>
                <h3 className="text-md font-bold text-foreground">FLOODGUARD 9JA Support</h3>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsOpen(false)} 
                className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            {renderContent()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="h-16 w-16 rounded-full bg-primary hover:bg-primary/90 shadow-2xl shadow-black/30 transition-all duration-300 group relative overflow-hidden"
        >
          <MessageCircle className="h-8 w-8 text-primary-foreground relative z-10" />
          <div className="absolute inset-0 bg-white/25 scale-0 group-hover:scale-100 transition-transform duration-300 rounded-full" />
        </Button>
      )}
    </div>
  );
}
