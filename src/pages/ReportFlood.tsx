import * as React from "react";
import { Camera, MapPin, AlertCircle, Send, CheckCircle2, Waves, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { submitFloodReport } from "@/lib/reportApi";
import { resolvePostcode } from "@/lib/postcodeApi";

export default function ReportFlood() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [postcode, setPostcode] = React.useState("");
  const [postcodeBusy, setPostcodeBusy] = React.useState(false);
  const [postcodeMessage, setPostcodeMessage] = React.useState("");
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [receiptId, setReceiptId] = React.useState("");
  const [receiptToken, setReceiptToken] = React.useState("");
  const [filePreview, setFilePreview] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState({
    type: "",
    severity: "",
    location: "",
    description: ""
  });

  const checkPostcode = async () => {
    setPostcodeBusy(true);
    setPostcodeMessage("");
    try {
      const result = await resolvePostcode(postcode);
      if (result.status === "verified") {
        setPostcodeMessage(`Verified: ${[result.lga, result.state].filter(Boolean).join(", ") || result.postcode}. Confirm your location below.`);
      } else {
        setPostcodeMessage("Postcode could not be verified. Enter a descriptive location below.");
      }
    } catch (error) {
      setPostcodeMessage(error instanceof Error ? error.message : "Postcode lookup unavailable.");
    } finally {
      setPostcodeBusy(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.type || !formData.severity || !formData.location) {
      toast.error("Please fill in all required fields");
      return;
    }
    setIsSubmitting(true);
    try {
      const receipt = await submitFloodReport({ ...formData, postcode: postcode.trim() || undefined });
      setReceiptId(receipt.id);
      setReceiptToken(receipt.receipt_token);
      setFormData({ type: "", severity: "", location: "", description: "" });
      setFilePreview(null);
      setPostcode("");
      setIsSuccess(true);
      toast.success("Report received by FloodGuard. It is pending review; emergency services were not notified.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to submit report.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="py-12 md:py-20 bg-muted/30 min-h-[90vh]">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-5xl font-extrabold text-primary mb-4 flex items-center justify-center gap-3">
              <AlertCircle className="h-10 w-10 text-destructive" />
              Community Intelligence
            </h1>
            <p className="text-muted-foreground text-lg">
              Report rising water levels, blocked drainages, or flooded roads in your area. 
              Reports are stored for review when the central service is available. For immediate danger, call 112.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-12 rounded-3xl shadow-xl text-center border border-border"
              >
                <div className="bg-green-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
                  <CheckCircle2 className="h-12 w-12 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-primary mb-4">Report Received!</h2>
                <p className="text-muted-foreground mb-8 text-lg">
                  Thank you for contributing to community safety. Your report is pending review. Emergency responders have not been automatically notified.
                </p>
                {receiptId && <div className="mb-5 text-sm break-all space-y-2 text-left bg-muted p-4 rounded-lg"><p>Report reference: <strong>{receiptId}</strong></p><p>Private receipt token: <strong>{receiptToken}</strong></p><p>Save both values securely to check your report status. The token is displayed only now. This is not emergency dispatch.</p><Button type="button" variant="secondary" onClick={() => { navigator.clipboard?.writeText(`Reference: ${receiptId}\nReceipt token: ${receiptToken}`).then(() => toast.success("Receipt copied")).catch(() => toast.error("Copy unavailable; save both values manually")); }}>Copy receipt</Button></div>}
                <Button onClick={() => { setIsSuccess(false); setFilePreview(null); }} variant="outline" size="lg">Submit Another Report</Button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="shadow-2xl border-none rounded-3xl overflow-hidden">
                  <CardHeader className="bg-primary text-primary-foreground p-8 text-white">
                    <CardTitle className="text-2xl">Flood Incident Report</CardTitle>
                    <CardDescription className="text-primary-foreground/70">Please provide as much detail as possible.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label>What are you reporting?</Label>
                          <Select onValueChange={(value) => updateField("type", value)} value={formData.type}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Incident Type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="rising">Rising River/Water Levels</SelectItem>
                              <SelectItem value="road">Flooded Road/Bridge</SelectItem>
                              <SelectItem value="drainage">Blocked/Overflowing Drainage</SelectItem>
                              <SelectItem value="home">Property Flooding</SelectItem>
                              <SelectItem value="other">Other Emergency</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Severity Level</Label>
                          <Select onValueChange={(value) => updateField("severity", value)} value={formData.severity}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Severity" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low - Minor Inconvenience</SelectItem>
                              <SelectItem value="med">Medium - Significant Impact</SelectItem>
                              <SelectItem value="high">High - Dangerous Situation</SelectItem>
                              <SelectItem value="extreme">Extreme - Life Threatening</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="digital-postcode">Nigerian Digital Postcode (optional)</Label>
                        <div className="flex gap-2">
                          <Input id="digital-postcode" value={postcode} maxLength={40} onChange={(e) => { setPostcode(e.target.value); setPostcodeMessage(""); }} placeholder="Enter your digital postcode" />
                          <Button type="button" variant="outline" onClick={checkPostcode} disabled={postcodeBusy || !postcode.trim()}>{postcodeBusy ? "Checking..." : "Verify"}</Button>
                        </div>
                        <p className="text-xs text-muted-foreground" role="status">{postcodeMessage || "Official postcode verification is pending NIPOST developer access. You can still describe your location manually."}</p>
                      </div>

                      <div className="space-y-2">
                        <Label>Specific Location</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            placeholder="e.g. Near the old bridge, Ganaja Road" 
                            className="pl-9" 
                            required 
                            value={formData.location}
                            onChange={(e) => updateField("location", e.target.value)}
                          />
                        </div>
                        <p className="text-[10px] text-muted-foreground">Enter a clear location description. GPS coordinates are not automatically attached.</p>
                      </div>

                      <div className="space-y-2">
                        <Label>Describe the Situation</Label>
                        <Textarea 
                          placeholder="Tell us what you see... (e.g. The water has risen by 2 feet in the last hour)" 
                          className="min-h-[120px]"
                          required
                          value={formData.description}
                          onChange={(e) => updateField("description", e.target.value)}
                        />
                      </div>

                      <div className="space-y-4">
                        <Label>Photos or Videos</Label>
                        <div 
                          className={cn(
                            "border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-colors relative overflow-hidden",
                            filePreview ? "border-primary" : "border-border hover:border-primary/50"
                          )}
                        >
                          {filePreview ? (
                            <div className="relative w-full aspect-video">
                              <img src={filePreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                              <Button 
                                type="button" 
                                variant="destructive" 
                                size="sm" 
                                className="absolute top-2 right-2"
                                onClick={() => setFilePreview(null)}
                              >
                                Remove
                              </Button>
                            </div>
                          ) : (
                            <>
                              <div className="bg-primary/5 p-4 rounded-full mb-4">
                                <Camera className="h-8 w-8 text-primary" />
                              </div>
                              <p className="text-sm font-medium">Click to upload or drag and drop</p>
                              <p className="text-xs text-muted-foreground mt-1">Local preview only. Media is not uploaded with this report.</p>
                            </>
                          )}
                          <input 
                            type="file" 
                            accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer" 
                            onChange={handleFileChange}
                          />
                        </div>
                      </div>

                      <Button type="submit" className="w-full h-14 text-lg bg-primary hover:bg-primary/90 rounded-2xl" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <div className="flex items-center gap-2">
                            <Waves className="h-5 w-5 animate-bounce" />
                            Uploading Report...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Send className="h-5 w-5" />
                            Submit Flood Report
                          </div>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
