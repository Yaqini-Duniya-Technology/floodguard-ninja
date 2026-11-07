import * as React from "react";
import { Bell, Shield, MapPin, Smartphone, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { storage } from "@/lib/storage";

export default function SmsRegistration() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: "",
    phone: "",
    state: "",
    lga: "",
    community: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.state || !formData.lga || !formData.phone) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      storage.saveRegistration(formData);
      setIsSubmitting(false);
      setIsSuccess(true);
      toast.info("Saved on this device only. SMS alerts are not connected.");
    }, 1500);
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="py-16 md:py-24 bg-background african-pattern min-h-[80vh]">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-4 py-1.5 mb-6">
                <Smartphone className="h-4 w-4 text-accent" />
                <span className="text-xs font-bold uppercase tracking-wider text-accent">Rural Inclusion</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-6">
                No Smartphone? <br />
                <span className="text-accent">Stay Protected.</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                SMS warning delivery is planned, but no SMS provider is connected. This page is a local demonstration and does not subscribe your phone to alerts.
              </p>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="bg-primary/10 p-3 rounded-full h-fit">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-primary">Zero Internet Required</h4>
                    <p className="text-sm text-muted-foreground">Planned SMS delivery for basic phones; not available yet.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="bg-primary/10 p-3 rounded-full h-fit">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-primary">Location-Specific</h4>
                    <p className="text-sm text-muted-foreground">Location-specific delivery is planned; no messages are being sent.</p>
                  </div>
                </div>
              </div>

              <div className="mt-10 p-6 bg-accent/5 border border-accent/20 rounded-2xl italic text-sm text-primary/80">
                "No physical FloodGuard registration office or live SMS subscription is verified."
              </div>
            </div>

            <AnimatePresence mode="wait">
              {isSuccess ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white p-10 rounded-3xl shadow-2xl text-center border border-green-100"
                >
                  <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="h-10 w-10 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-primary mb-4">Demo details saved locally</h2>
                  <p className="text-muted-foreground mb-8">
                    Your number {formData.phone} was saved only on this device for {formData.community || formData.lga}.
                  </p>
                  <Button onClick={() => setIsSuccess(false)} variant="outline" className="w-full">Register Another Number</Button>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="shadow-2xl border-none rounded-3xl overflow-hidden">
                    <CardHeader className="bg-primary text-white p-8">
                      <CardTitle className="text-2xl">SMS Registration Demo — Not Connected</CardTitle>
                      <CardDescription className="text-white/70 text-xs">For 2G/3G basic phones and areas with low connectivity.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8">
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input 
                            id="name" 
                            placeholder="Enter your full name" 
                            required 
                            value={formData.name}
                            onChange={(e) => updateField("name", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input 
                            id="phone" 
                            type="tel" 
                            placeholder="+234 800 000 0000" 
                            required 
                            value={formData.phone}
                            onChange={(e) => updateField("phone", e.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>State</Label>
                            <Select onValueChange={(value) => updateField("state", value)} value={formData.state}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select State" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="kogi">Kogi State</SelectItem>
                                <SelectItem value="benue">Benue State</SelectItem>
                                <SelectItem value="anambra">Anambra State</SelectItem>
                                <SelectItem value="delta">Delta State</SelectItem>
                                <SelectItem value="lagos">Lagos State</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>LGA</Label>
                            <Select onValueChange={(value) => updateField("lga", value)} value={formData.lga}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select LGA" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="lokoja">Lokoja</SelectItem>
                                <SelectItem value="ibaji">Ibaji</SelectItem>
                                <SelectItem value="idah">Idah</SelectItem>
                                <SelectItem value="makurdi">Makurdi</SelectItem>
                                <SelectItem value="ikorodu">Ikorodu</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="community">Community Name</Label>
                          <Input 
                            id="community" 
                            placeholder="e.g. Ganaja Village" 
                            required 
                            value={formData.community}
                            onChange={(e) => updateField("community", e.target.value)}
                          />
                        </div>
                        <Button type="submit" className="w-full h-12 text-lg bg-primary hover:bg-primary/90 rounded-xl" disabled={isSubmitting}>
                          {isSubmitting ? "Processing..." : "Save Demo Details Locally"}
                        </Button>
                        <p className="text-[10px] text-center text-muted-foreground">
                          Demo only. Details are saved in this browser, not transmitted to an SMS provider. No SMS delivery or pricing is available.
                        </p>
                      </form>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
