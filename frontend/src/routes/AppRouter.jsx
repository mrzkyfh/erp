import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { useAuthStore } from "@/store/auth-store";
import { AttendancePage } from "@/pages/AttendancePage";
import { CustomersPage } from "@/pages/CustomersPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { EmployeesPage } from "@/pages/EmployeesPage";
import { FinesPage } from "@/pages/FinesPage";
import { InventoryPage } from "@/pages/InventoryPage";
import { LoginPage } from "@/pages/LoginPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { PayrollPage } from "@/pages/PayrollPage";
import { ProfilePage } from "@/pages/ProfilePage";

export function AppRouter() {
  const session = useAuthStore((state) => state.session);

  return (
    <Routes>
      <Route path="/login" element={session ? <Navigate to="/" replace /> : <LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route
          path="/"
          element={
            <AppShell>
              <DashboardPage />
            </AppShell>
          }
        />
        <Route
          path="/profil"
          element={
            <AppShell>
              <ProfilePage />
            </AppShell>
          }
        />
        <Route element={<ProtectedRoute allowedRoles={["owner", "manager"]} />}>
          <Route
            path="/karyawan"
            element={
              <AppShell>
                <EmployeesPage />
              </AppShell>
            }
          />
          <Route
            path="/denda"
            element={
              <AppShell>
                <FinesPage />
              </AppShell>
            }
          />
          <Route
            path="/konsumen"
            element={
              <AppShell>
                <CustomersPage />
              </AppShell>
            }
          />
          <Route
            path="/inventori"
            element={
              <AppShell>
                <InventoryPage />
              </AppShell>
            }
          />
        </Route>
        <Route
          path="/absensi"
          element={
            <AppShell>
              <AttendancePage />
            </AppShell>
          }
        />
        <Route
          path="/penggajian"
          element={
            <AppShell>
              <PayrollPage />
            </AppShell>
          }
        />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

