import { cn } from "@/lib/utils";
import logo from "@/assets/evolved-sound-logo.svg";
import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Mic, 
  Phone, 
  Settings, 
  Users, 
  BarChart3,
  HelpCircle,
  LogOut
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Mic, label: "Voice Agents", path: "/voice-agents" },
  { icon: Phone, label: "Call History", path: "/call-history" },
  { icon: Users, label: "Contacts", path: "/contacts" },
  { icon: BarChart3, label: "Analytics", path: "/analytics" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

const bottomNavItems = [
  { icon: HelpCircle, label: "Help & Support", path: "#" },
  { icon: LogOut, label: "Logout", path: "#" },
];

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <img src={logo} alt="Evolved Sound" className="h-10 w-auto" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) => cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-sidebar-primary text-white"
                : "text-white/70 hover:text-white hover:bg-sidebar-accent"
            )}
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn("h-5 w-5", isActive && "text-white")} />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Navigation */}
      <div className="p-4 border-t border-sidebar-border space-y-1">
        {bottomNavItems.map((item) => (
          <button
            key={item.label}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-sidebar-accent transition-all duration-200"
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </button>
        ))}
      </div>
    </aside>
  );
}
