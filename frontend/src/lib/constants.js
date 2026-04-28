import {
  BadgeDollarSign,
  Boxes,
  Clock,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  SquareUserRound,
  Users,
  UserSquare2,
} from "lucide-react";

export const navigation = [
  {
    label: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
    roles: ["owner", "karyawan"],
  },
  {
    label: "Karyawan",
    icon: Users,
    roles: ["owner"],
    children: [
      {
        label: "Data Karyawan",
        path: "/karyawan",
        roles: ["owner"],
      },
      {
        label: "Absensi",
        path: "/absensi",
        roles: ["owner"],
      },
    ],
  },
  {
    label: "Absensi",
    path: "/absensi",
    icon: ShieldCheck,
    roles: ["karyawan"],
  },
  {
    label: "Lembur",
    path: "/lembur",
    icon: Clock,
    roles: ["owner", "karyawan"],
  },
  {
    label: "Penggajian",
    path: "/penggajian",
    icon: SquareUserRound,
    roles: ["owner", "karyawan"],
  },
  {
    label: "Konsumen",
    path: "/konsumen",
    icon: UserSquare2,
    roles: ["owner"],
  },
  {
    label: "Inventori",
    icon: Boxes,
    roles: ["owner", "karyawan"],
    children: [
      {
        label: "Stok Barang",
        path: "/inventori",
        roles: ["owner", "karyawan"],
      },
      {
        label: "Tambah Item",
        path: "/inventori/tambah-item",
        roles: ["owner", "karyawan"],
      },
      {
        label: "Tambah Supplier",
        path: "/inventori/tambah-supplier",
        roles: ["owner", "karyawan"],
      },
      {
        label: "Pembelian Stok",
        path: "/inventori/pembelian",
        roles: ["owner", "karyawan"],
      },
      {
        label: "Penggunaan Stok",
        path: "/inventori/penggunaan",
        roles: ["owner", "karyawan"],
      },
      {
        label: "Pengeluaran",
        path: "/inventori/pengeluaran",
        roles: ["owner", "karyawan"],
      },
    ],
  },
  {
    label: "Pengaturan",
    path: "/pengaturan",
    icon: Settings,
    roles: ["owner"],
  },
];

export const defaultAttendanceRadius = 100;

