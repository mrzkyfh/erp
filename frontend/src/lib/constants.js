import {
  BadgeDollarSign,
  Boxes,
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
    path: "/inventori",
    icon: Boxes,
    roles: ["owner", "karyawan"],
  },
  {
    label: "Pengaturan",
    path: "/pengaturan",
    icon: Settings,
    roles: ["owner"],
  },
];

export const defaultAttendanceRadius = 100;

