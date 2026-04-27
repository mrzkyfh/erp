import { cn } from "@/lib/utils";

const tones = {
  default: "bg-slate-100 text-slate-700 border border-slate-200",
  success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border border-amber-200",
  info: "bg-blue-50 text-blue-700 border border-blue-200",
  danger: "bg-rose-50 text-rose-700 border border-rose-200",
};

export function Badge({ className, tone = "default", ...props }) {
  return (
    <span
      className={cn("inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium", tones[tone], className)}
      {...props}
    />
  );
}

