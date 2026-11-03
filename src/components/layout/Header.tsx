import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Waves, Bell, Smartphone, MessageSquare, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Location Intelligence", href: "/intelligence", icon: Waves },
  { name: "Live Risk Map", href: "/map", icon: Waves },
  { name: "SMS Alerts", href: "/sms", icon: Bell },
  { name: "USSD", href: "/ussd", icon: Smartphone },
  { name: "WhatsApp Bot", href: "/whatsapp", icon: MessageSquare },
  { name: "Emergency Dashboard", href: "/dashboard", icon: LayoutDashboard },
];

export function Header() {
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-primary p-1.5 rounded-lg transition-transform group-hover:scale-110">
                <Waves className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-primary tracking-tight">
                FLOODGUARD <span className="text-accent">9JA</span>
              </span>
              <span className="hidden md:inline-flex ml-6 text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 border-l pl-6 border-border">
                Predict. Prepare. Protect.
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary flex items-center gap-1.5",
                  location.pathname === item.href
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            ))}
            <Button asChild size="sm">
              <Link to="/report">Report Flood</Link>
            </Button>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="text-primary"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-background border-b animate-in slide-in-from-top duration-200">
          <div className="space-y-1 px-4 pb-3 pt-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 text-base font-medium rounded-md transition-colors",
                  location.pathname === item.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            ))}
            <div className="pt-2 px-3 pb-2">
              <Button asChild className="w-full">
                <Link to="/report" onClick={() => setIsOpen(false)}>Report Flood</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
