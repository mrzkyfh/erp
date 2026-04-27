import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { id as localeID } from "date-fns/locale";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatRupiah(value = 0) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(Number(value || 0));
}

export function formatDateID(value, pattern = "dd/MM/yyyy") {
  if (!value) return "-";
  return format(new Date(value), pattern, { locale: localeID });
}

export function formatDateTimeID(value) {
  if (!value) return "-";
  return formatDateID(value, "dd/MM/yyyy HH:mm");
}

export function getRoleLabel(role) {
  return {
    owner: "Owner",
    karyawan: "Karyawan",
  }[role] ?? role;
}

export function getStatusBadgeTone(status) {
  return {
    hadir: "success",
    telat: "warning",
    izin: "info",
    alpha: "danger",
    aktif: "success",
    nonaktif: "danger",
    draft: "warning",
    processed: "info",
    paid: "success",
  }[status] ?? "default";
}

export function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

