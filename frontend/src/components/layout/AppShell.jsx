import { ChevronDown, LogOut, Menu } from "lucide-react";
import { useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { navigation } from "@/lib/constants";
import { cn, getInitials, getRoleLabel } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";

export function AppShell({ children }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState(["Karyawan"]);
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

  // Get top-level menu items for bottom nav (only non-group items or group labels)
  const bottomNavItems = useMemo(() => {
    return menus.filter((item) => !item.children || item.children.length === 0);
  }, [menus]);

  return (
    <div className="min-h-screen pb-24 md:pb-0">
      {/* Desktop Sidebar */}
      <aside className="hidden md:fixed md:inset-y-3 md:left-3 md:z-20 md:flex md:w-[280px] md:flex-col md:rounded-[28px] md:border md:border-white/50 md:bg-white/85 md:p-4 md:backdrop-blur-[18px]">
        <div className="mb-6 rounded-3xl bg-mesh p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">ERP Mini</p>
        </div>

        <nav className="space-y-1 flex-1">
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
                      "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                      hasActiveChild
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-muted",
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
                    <div className="ml-4 mt-1 space-y-1 border-l-2 border-primary/20 pl-3">
                      {item.children
                        .filter((child) => child.roles.includes(profile?.role))
                        .map((child) => (
                          <NavLink
                            key={child.path}
                            to={child.path}
                            className={({ isActive }) =>
                              cn(
                                "block rounded-xl px-3 py-2 text-sm font-medium transition",
                                isActive
                                  ? "bg-primary text-primary-foreground shadow-soft"
                                  : "text-foreground hover:bg-muted",
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
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-soft"
                      : "text-foreground hover:bg-muted",
                  )
                }
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="rounded-3xl bg-muted p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-sm font-semibold text-primary-foreground">
              {getInitials(profile?.full_name)}
            </div>
            <div className="min-w-0">
              <p className="font-medium truncate">{profile?.full_name}</p>
              <p className="text-sm text-muted-foreground">{getRoleLabel(profile?.role)}</p>
            </div>
          </div>
          <Button variant="ghost" className="mt-4 w-full justify-start" onClick={logout}>
            <LogOut className="h-4 w-4" />
            Keluar
          </Button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <button
          aria-label="Tutup menu"
          className="fixed inset-0 z-10 bg-slate-900/30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "glass fixed inset-y-0 left-0 z-20 flex w-[280px] flex-col rounded-r-[28px] border-r border-white/50 p-4 transition-transform md:hidden",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="mb-6 rounded-3xl bg-mesh p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">ERP Mini</p>
        </div>

        <nav className="space-y-1 flex-1 overflow-y-auto">
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
                      "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                      hasActiveChild
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-muted",
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
                    <div className="ml-4 mt-1 space-y-1 border-l-2 border-primary/20 pl-3">
                      {item.children
                        .filter((child) => child.roles.includes(profile?.role))
                        .map((child) => (
                          <NavLink
                            key={child.path}
                            to={child.path}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) =>
                              cn(
                                "block rounded-xl px-3 py-2 text-sm font-medium transition",
                                isActive
                                  ? "bg-primary text-primary-foreground shadow-soft"
                                  : "text-foreground hover:bg-muted",
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
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-soft"
                      : "text-foreground hover:bg-muted",
                  )
                }
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="rounded-3xl bg-muted p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-sm font-semibold text-primary-foreground">
              {getInitials(profile?.full_name)}
            </div>
            <div className="min-w-0">
              <p className="font-medium truncate">{profile?.full_name}</p>
              <p className="text-sm text-muted-foreground">{getRoleLabel(profile?.role)}</p>
            </div>
          </div>
          <Button variant="ghost" className="mt-4 w-full justify-start" onClick={logout}>
            <LogOut className="h-4 w-4" />
            Keluar
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="md:ml-[300px]">
        {/* Header */}
        <div className="sticky top-0 z-10 glass border-b border-white/60 p-3 md:rounded-t-[28px] md:border-0 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground md:text-sm">Sistem manajemen bisnis</p>
              <h2 className="text-lg font-bold md:text-2xl">{activeLabel}</h2>
            </div>
            <div className="flex items-center gap-2">
              <NavLink
                to="/profil"
                className="hidden rounded-2xl border border-border px-3 py-2 text-sm font-medium hover:bg-muted md:block"
              >
                Profil
              </NavLink>
              <Button
                variant="outline"
                size="sm"
                className="md:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="page-enter space-y-4 p-3 md:rounded-b-[28px] md:p-6">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 flex gap-1 border-t border-white/60 bg-white/85 p-2 backdrop-blur-[18px] md:hidden">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.path === location.pathname;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl py-2 text-xs font-medium transition",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted",
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
            "flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl py-2 text-xs font-medium transition",
            location.pathname === "/profil"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted",
          )}
        >
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-xs font-bold">
            {getInitials(profile?.full_name)?.[0]}
          </div>
          <span className="line-clamp-1">Profil</span>
        </NavLink>
      </nav>
    </div>
  );
}

