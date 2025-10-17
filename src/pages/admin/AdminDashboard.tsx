import { Outlet, NavLink, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  FolderTree,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const AdminDashboard = () => {
  const { profile, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Redirect non-admin users
  if (profile?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  const navItems = [
    { title: "Overview", path: "/admin", icon: LayoutDashboard, end: true },
    { title: "Manage Content", path: "/admin/content", icon: FolderTree },
    { title: "Students", path: "/admin/students", icon: Users },
    { title: "Settings", path: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } transition-all duration-300 bg-card border-r border-border flex flex-col`}
      >
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          {sidebarOpen && (
            <h2 className="text-xl font-bold text-foreground">Admin Panel</h2>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-auto"
          >
            {sidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted text-foreground"
                }`
              }
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && <span className="font-medium">{item.title}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Sign Out */}
        <div className="p-4 border-t border-border">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={signOut}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {sidebarOpen && <span className="ml-3">Sign Out</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminDashboard;
