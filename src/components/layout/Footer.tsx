import { Link } from "react-router-dom";
import { Waves, Mail, Phone, MapPin, Share2, Globe } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Waves className="h-8 w-8 text-accent" />
              <span className="text-2xl font-bold tracking-tight">
                FloodGuard <span className="text-accent">AI</span>
              </span>
            </Link>
            <p className="text-primary-foreground/80 text-sm leading-relaxed">
              Nigeria's leading AI-powered disaster prediction and response platform. 
              Predict. Prepare. Protect.
            </p>
            <div className="flex space-x-4 mt-6">
              <a href="#" className="text-primary-foreground/60 hover:text-accent transition-colors">
                <Share2 className="h-5 w-5" />
              </a>
              <a href="#" className="text-primary-foreground/60 hover:text-accent transition-colors">
                <Globe className="h-5 w-5" />
              </a>
              <a href="#" className="text-primary-foreground/60 hover:text-accent transition-colors">
                <Share2 className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-accent">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/map" className="hover:text-accent transition-colors">Live Risk Map</Link></li>
              <li><Link to="/sms" className="hover:text-accent transition-colors">SMS Registration</Link></li>
              <li><Link to="/ussd" className="hover:text-accent transition-colors">USSD Platform</Link></li>
              <li><Link to="/dashboard" className="hover:text-accent transition-colors">Agency Dashboard</Link></li>
              <li><Link to="/download" className="hover:text-accent transition-colors">Download App</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-accent">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-accent transition-colors">Safety Tips</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Shelter Locations</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Emergency Contacts</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Community Office</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">About Us</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-accent">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <span>Nigeria — digital service; no physical office verified</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-accent shrink-0" />
                <span>112 (Nigeria emergency services)</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-accent shrink-0" />
                <span>Contact details pending verification</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-primary-foreground/10 text-center text-sm text-primary-foreground/60">
          <p>© {new Date().getFullYear()} FloodGuard AI — Developed by Yaqini & Duniya Technology. Prototype: not an emergency dispatch service.</p>
        </div>
      </div>
    </footer>
  );
}
