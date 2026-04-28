import { ChevronDown, LogOut, Menu, User } from "lucide-react";
import { useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { navigation } from "@/lib/constants";
import { cn, getInitials, getRoleLabel } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";

export function AppShell({ children }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState(["Karyawan", "Inventori"]);
  const profile = useAuthStore((state) => state.profile);
  const logout = useAuthStore((state) => state.logout);

  const menus = useMemo(
    () => navigation.filter((item) => item.roles.includes(profile?.role)),
    [profile?.role],
  );

  const toggleGroup = (label) => {
    setOpenGroups((prev) =>
      prev.includes(label) ? prev.filter((g) => g !== label) : [...prev, label],
    );
  };

  // Find active page label for header
  const activeLabel = useMemo(() => {
    for (const item of menus) {
      if (item.children) {
        const child = item.children.find((c) => c.path === location.pathname);
        if (child) return child.label;
      } else if (item.path === location.pathname) {
        return item.label;
      }
    }
    return "Dashboard";
  }, [menus, location.pathname]);

  // Get top-level menu items for bottom nav
  const bottomNavItems = useMemo(() => {
    return menus.slice(0, 4).filter((item) => !item.children || item.children.length === 0);
  }, [menus]);

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-0">
      {/* Desktop Sidebar */}
      <aside className="hidden md:fixed md:inset-y-4 md:left-4 md:z-20 md:flex md:w-[280px] md:flex-col md:rounded-xl md:border md:border-slate-200 md:bg-white md:shadow-lg">
        {/* Logo */}
        <div className="m-4 mb-6 rounded-lg bg-gradient-to-br from-slate-600 to-slate-800 p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white">Rumah Kue Nuraisah</p>
          <p className="text-[10px] text-slate-300 mt-0.5">Sistem Manajemen</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 overflow-y-auto">
          {menus.map((item) => {
            const Icon = item.icon;

            // Group with children (submenu)
            if (item.children) {
              const isOpen = openGroups.includes(item.label);
              const hasActiveChild = item.children.some((c) => c.path === location.pathname);

              return (
                <div key={item.label}>
                  <button
                    onClick={() => toggleGroup(item.label)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      hasActiveChild
                        ? "bg-slate-100 text-slate-900"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1 text-left">{item.label}</span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform",
                        isOpen ? "rotate-180" : "",
                      )}
                    />
                  </button>
                  {isOpen && (
                    <div className="ml-7 mt-1 space-y-0.5 border-l-2 border-slate-200 pl-3">
                      {item.children
                        .filter((child) => child.roles.includes(profile?.role))
                        .map((child) => (
                          <NavLink
                            key={child.path}
                            to={child.path}
                            className={({ isActive }) =>
                              cn(
                                "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                isActive
                                  ? "bg-primary text-primary-foreground shadow-sm"
                                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                              )
                            }
                          >
                            {child.label}
                          </NavLink>
                        ))}
                    </div>
                  )}
                </div>
              );
            }

            // Regular menu item
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                  )
                }
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="m-3 mt-auto rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
              {getInitials(profile?.full_name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900 truncate">{profile?.full_name}</p>
              <p className="text-xs text-slate-500">{getRoleLabel(profile?.role)}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="mt-3 w-full justify-start text-slate-600" onClick={logout}>
            <LogOut className="h-4 w-4" />
            Keluar
          </Button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <button
          aria-label="Tutup menu"
          className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-[280px] flex-col bg-white shadow-2xl transition-transform duration-300 md:hidden",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Logo */}
        <div className="m-4 mb-6 rounded-lg bg-gradient-to-br from-slate-600 to-slate-800 p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white">Rumah Kue Nuraisah</p>
          <p className="text-[10px] text-slate-300 mt-0.5">Sistem Manajemen</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 overflow-y-auto">
          {menus.map((item) => {
            const Icon = item.icon;

            if (item.children) {
              const isOpen = openGroups.includes(item.label);
              const hasActiveChild = item.children.some((c) => c.path === location.pathname);

              return (
                <div key={item.label}>
                  <button
                    onClick={() => toggleGroup(item.label)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      hasActiveChild
                        ? "bg-slate-100 text-slate-900"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1 text-left">{item.label}</span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform",
                        isOpen ? "rotate-180" : "",
                      )}
                    />
                  </button>
                  {isOpen && (
                    <div className="ml-7 mt-1 space-y-0.5 border-l-2 border-slate-200 pl-3">
                      {item.children
                        .filter((child) => child.roles.includes(profile?.role))
                        .map((child) => (
                          <NavLink
                            key={child.path}
                            to={child.path}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) =>
                              cn(
                                "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                isActive
                                  ? "bg-primary text-primary-foreground shadow-sm"
                                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                              )
                            }
                          >
                            {child.label}
                          </NavLink>
                        ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                  )
                }
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="m-3 mt-auto rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
              {getInitials(profile?.full_name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900 truncate">{profile?.full_name}</p>
              <p className="text-xs text-slate-500">{getRoleLabel(profile?.role)}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="mt-3 w-full justify-start text-slate-600" onClick={logout}>
            <LogOut className="h-4 w-4" />
            Keluar
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="md:ml-[300px] md:mr-4">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur-sm px-4 py-3 md:mt-4 md:rounded-t-xl md:border-x md:border-t md:px-6 md:py-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-slate-500 md:text-sm">Sistem Manajemen Bisnis</p>
              <h2 className="text-lg font-bold text-slate-900 md:text-xl">{activeLabel}</h2>
            </div>
            <div className="flex items-center gap-2">
              <NavLink
                to="/profil"
                className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 md:flex"
              >
                <User className="h-4 w-4" />
                Profil
              </NavLink>
              <Button
                variant="outline"
                size="icon"
                className="md:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="page-enter space-y-4 p-4 md:rounded-b-xl md:border-x md:border-b md:border-slate-200 md:bg-white md:p-6 md:shadow-sm min-h-[calc(100vh-80px)]">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 flex items-center gap-1 border-t border-slate-200 bg-white px-2 py-2 shadow-lg md:hidden">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.path === location.pathname;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 rounded-lg py-2 text-[10px] font-medium transition-colors min-h-[60px]",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-slate-500 active:bg-slate-100",
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="line-clamp-1">{item.label}</span>
            </NavLink>
          );
        })}
        <NavLink
          to="/profil"
          className={cn(
            "flex flex-1 flex-col items-center justify-center gap-1 rounded-lg py-2 text-[10px] font-medium transition-colors min-h-[60px]",
            location.pathname === "/profil"
              ? "bg-primary text-primary-foreground"
              : "text-slate-500 active:bg-slate-100",
          )}
        >
          <div className={cn(
            "flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-bold",
            location.pathname === "/profil" ? "bg-white/20" : "bg-slate-200"
          )}>
            {getInitials(profile?.full_name)?.[0]}
          </div>
          <span className="line-clamp-1">Profil</span>
        </NavLink>
      </nav>
    </div>
  );
}
