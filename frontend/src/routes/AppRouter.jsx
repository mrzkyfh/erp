import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { useAuthStore } from "@/store/auth-store";
import { AttendancePage } from "@/pages/AttendancePage";
import { CustomersPage } from "@/pages/CustomersPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { EmployeesPage } from "@/pages/EmployeesPage";
import { InventoryPage } from "@/pages/InventoryPage";
import { LoginPage } from "@/pages/LoginPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { PayrollPage } from "@/pages/PayrollPage";
import { SalarySettingsPage } from "@/pages/SalarySettingsPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { SettingsPage } from "@/pages/SettingsPage";
import { AddItemPage, AddSupplierPage, PurchaseStockPage, UseStockPage, MaterialExpensePage } from "@/pages/inventory";

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
        
        {/* Routes for Owner & Manager */}
        <Route element={<ProtectedRoute allowedRoles={["owner"]} />}>
          <Route
            path="/karyawan"
            element={
              <AppShell>
                <EmployeesPage />
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
            path="/inventori/tambah-item"
            element={
              <AppShell>
                <AddItemPage />
              </AppShell>
            }
          />
          <Route
            path="/inventori/tambah-supplier"
            element={
              <AppShell>
                <AddSupplierPage />
              </AppShell>
            }
          />
          <Route
            path="/inventori/pembelian"
            element={
              <AppShell>
                <PurchaseStockPage />
              </AppShell>
            }
          />
          <Route
            path="/inventori/pengeluaran"
            element={
              <AppShell>
                <MaterialExpensePage />
              </AppShell>
            }
          />
          <Route
            path="/penggajian/pengaturan"
            element={
              <AppShell>
                <SalarySettingsPage />
              </AppShell>
            }
          />
          <Route
            path="/pengaturan"
            element={
              <AppShell>
                <SettingsPage />
              </AppShell>
            }
          />
        </Route>

        {/* Routes for All Roles */}
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
        <Route
          path="/inventori"
          element={
            <AppShell>
              <InventoryPage />
            </AppShell>
          }
        />
        <Route
          path="/inventori/penggunaan"
          element={
            <AppShell>
              <UseStockPage />
            </AppShell>
          }
        />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
