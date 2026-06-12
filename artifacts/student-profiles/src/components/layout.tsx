import React from "react";
import { Link, useLocation } from "wouter";
import { 
  Users, LayoutDashboard, Settings, LogOut, Shield, ChevronRight, UserPlus,
  BookOpen, CalendarCheck, CalendarDays, ClipboardList, BarChart3
} from "lucide-react";
import { useAuth } from "@/context/auth-context";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const navGroups = [
    {
      items: [
        { name: "Dashboard", href: "/", icon: LayoutDashboard },
      ]
    },
    {
      label: "Students",
      items: [
        { name: "Directory", href: "/students", icon: Users },
        { name: "Add Student", href: "/students/new", icon: UserPlus },
        { name: "Grades & Results", href: "/grades", icon: BookOpen },
        { name: "Attendance", href: "/attendance", icon: CalendarCheck },
      ]
    },
    {
      label: "Administration",
      items: [
        { name: "Leave Management", href: "/leaves", icon: CalendarDays },
        { name: "Apply for Leave", href: "/leaves/apply", icon: ClipboardList },
        { name: "Reports", href: "/analytics", icon: BarChart3 },
      ]
    },
    {
      label: "Account",
      items: [
        { name: "Settings", href: "/settings", icon: Settings },
      ]
    }
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-indigo-950 text-indigo-50 border-r border-indigo-900 hidden md:flex flex-col flex-shrink-0">
        <div className="p-6 flex items-center gap-3 border-b border-indigo-900">
          <div className="text-[#c9a84c] p-1">
            <Shield size={32} />
          </div>
          <div>
            <div className="font-serif font-bold text-2xl tracking-tight text-[#c9a84c]">SUAS</div>
            <div className="text-xs text-indigo-300 font-medium">Symbiosis University</div>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
          {navGroups.map((group, i) => (
            <div key={i} className="space-y-1">
              {group.label && (
                <div className="px-3 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">
                  {group.label}
                </div>
              )}
              {group.items.map((item) => {
                const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
                return (
                  <Link key={item.name} href={item.href}>
                    <div
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                        isActive 
                          ? "bg-indigo-900 text-white" 
                          : "text-indigo-200 hover:bg-indigo-900/50 hover:text-white cursor-pointer"
                      }`}
                    >
                      <item.icon size={18} />
                      {item.name}
                      {isActive && <ChevronRight size={16} className="ml-auto opacity-50" />}
                    </div>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-indigo-900 space-y-2">
          {user && (
            <div className="px-3 py-2 flex flex-col">
              <span className="text-sm font-medium text-white">{user.name}</span>
              <span className="text-xs text-indigo-300 capitalize">{user.role}</span>
            </div>
          )}
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-md text-sm font-medium text-indigo-200 hover:bg-indigo-900/50 hover:text-white transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between h-16 px-4 border-b bg-indigo-950 text-white">
          <div className="flex items-center gap-2">
            <Shield size={24} className="text-[#c9a84c]" />
            <span className="font-serif font-bold text-lg text-[#c9a84c]">SUAS</span>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
