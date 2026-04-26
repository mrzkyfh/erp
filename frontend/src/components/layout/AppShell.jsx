import { LogOut, Menu } from "lucide-react";
import { useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { navigation } from "@/lib/constants";
import { cn, getInitials, getRoleLabel } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";

export function AppShell({ children }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const profile = useAuthStore((state) => state.profile);
  const logout = useAuthStore((state) => state.logout);

  const menus = useMemo(
    () => navigation.filter((item) => item.roles.includes(profile?.role)),
    [profile?.role],
  );

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-[1600px] gap-4 p-3 md:p-5">
        <aside
          className={cn(
            "glass fixed inset-y-3 left-3 z-20 flex w-[280px] flex-col rounded-[28px] border border-white/50 p-4 transition md:static md:translate-x-0",
            mobileOpen ? "translate-x-0" : "-translate-x-[120%]",
          )}
        >
          <div className="mb-6 rounded-3xl bg-mesh p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">ERP Mini</p>
            <h1 className="mt-2 text-2xl font-bold">Operasional UMKM</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Kelola tim, absensi, gaji, dan stok dalam satu dashboard.
            </p>
          </div>

          <nav className="space-y-2">
            {menus.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
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

          <div className="mt-auto rounded-3xl bg-muted p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-sm font-semibold text-primary-foreground">
                {getInitials(profile?.full_name)}
              </div>
              <div>
                <p className="font-medium">{profile?.full_name}</p>
                <p className="text-sm text-muted-foreground">{getRoleLabel(profile?.role)}</p>
              </div>
            </div>
            <Button variant="ghost" className="mt-4 w-full justify-start" onClick={logout}>
              <LogOut className="h-4 w-4" />
              Keluar
            </Button>
          </div>
        </aside>

        {mobileOpen ? (
          <button
            aria-label="Tutup menu"
            className="fixed inset-0 z-10 bg-slate-900/30 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        ) : null}

        <main className="min-w-0 flex-1 md:pl-0">
          <div className="page-enter glass rounded-[28px] border border-white/60 p-4 md:p-6">
            <div className="mb-6 flex items-center justify-between gap-4 border-b border-white/60 pb-4">
              <div>
                <p className="text-sm text-muted-foreground">Sistem manajemen bisnis</p>
                <h2 className="text-2xl font-bold">
                  {menus.find((item) => item.path === location.pathname)?.label ?? "Dashboard"}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <NavLink
                  to="/profil"
                  className="hidden rounded-2xl border border-border px-4 py-2 text-sm font-medium hover:bg-muted md:block"
                >
                  Profil Saya
                </NavLink>
                <Button variant="outline" size="sm" className="md:hidden" onClick={() => setMobileOpen(true)}>
                  <Menu className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

