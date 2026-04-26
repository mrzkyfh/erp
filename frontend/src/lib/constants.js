import {
  BadgeDollarSign,
  Boxes,
  LayoutDashboard,
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
    roles: ["owner", "manager", "karyawan"],
  },
  {
    label: "Karyawan",
    icon: Users,
    roles: ["owner", "manager"],
    children: [
      {
        label: "Data Karyawan",
        path: "/karyawan",
        roles: ["owner", "manager"],
      },
      {
        label: "Absensi",
        path: "/absensi",
        roles: ["owner", "manager"],
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
    label: "Denda",
    path: "/denda",
    icon: BadgeDollarSign,
    roles: ["owner", "manager"],
  },
  {
    label: "Penggajian",
    path: "/penggajian",
    icon: SquareUserRound,
    roles: ["owner", "manager", "karyawan"],
  },
  {
    label: "Konsumen",
    path: "/konsumen",
    icon: UserSquare2,
    roles: ["owner", "manager"],
  },
  {
    label: "Inventori",
    path: "/inventori",
    icon: Boxes,
    roles: ["owner", "manager"],
  },
];

export const defaultAttendanceRadius = 100;

