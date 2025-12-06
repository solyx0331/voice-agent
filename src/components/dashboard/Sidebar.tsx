import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";
import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { 
  LayoutDashboard, 
  Mic, 
  Phone, 
  Radio,
  Settings, 
  Users, 
  BarChart3,
  HelpCircle,
  LogOut
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Mic, label: "Voice Agents", path: "/voice-agents" },
  { icon: Phone, label: "Call History", path: "/call-history" },
  { icon: Radio, label: "Live Calls", path: "/live-calls" },
  { icon: Users, label: "Contacts", path: "/contacts" },
  { icon: BarChart3, label: "Analytics", path: "/analytics" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export function Sidebar() {
  const navigate = useNavigate();
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      toast.success("Logged out successfully");
      // In real app: clear auth tokens, redirect to login
      // navigate("/login");
    }
  };

  const handleHelp = () => {
    setIsHelpOpen(true);
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-16 sm:w-64 bg-sidebar border-r border-sidebar-border flex flex-col z-50 transition-all duration-300">
      {/* Logo */}
      <div className="p-3 sm:p-6 border-b border-sidebar-border flex items-center justify-center">
        <div className="rounded-full w-14 h-14 sm:w-32 sm:h-32 shadow-sm flex items-center justify-center p-2">
          <img src={logo} alt="Evolved Sound" className="h-full w-full object-contain" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 sm:p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) => cn(
              "w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 justify-center sm:justify-start",
              isActive
                ? "bg-sidebar-primary text-white"
                : "text-white/70 hover:text-white hover:bg-sidebar-accent"
            )}
            title={item.label}
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn("h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0", isActive && "text-white")} />
                <span className="hidden sm:inline">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Navigation */}
      <div className="p-2 sm:p-4 border-t border-sidebar-border space-y-1">
        <Dialog open={isHelpOpen} onOpenChange={setIsHelpOpen}>
          <DialogTrigger asChild>
            <button
              onClick={handleHelp}
              className="w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-medium text-white/70 hover:text-white hover:bg-sidebar-accent transition-all duration-200 justify-center sm:justify-start"
              title="Help & Support"
            >
              <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              <span className="hidden sm:inline">Help & Support</span>
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Help & Support</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <h3 className="font-semibold mb-2">Documentation</h3>
                <p className="text-sm text-muted-foreground">
                  Visit our documentation for guides and tutorials on using the Voice AI Agent Dashboard.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Contact Support</h3>
                <p className="text-sm text-muted-foreground">
                  Email: support@evolvedsound.com<br />
                  Phone: +61 2 1234 5678
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-medium text-white/70 hover:text-white hover:bg-sidebar-accent transition-all duration-200 justify-center sm:justify-start"
          title="Logout"
        >
          <LogOut className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </aside>
  );
}
