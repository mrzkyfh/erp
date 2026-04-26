import { cn } from "@/lib/utils";

const tones = {
  default: "bg-muted text-foreground",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  info: "bg-sky-100 text-sky-700",
  danger: "bg-rose-100 text-rose-700",
};

export function Badge({ className, tone = "default", ...props }) {
  return (
    <span
      className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold", tones[tone], className)}
      {...props}
    />
  );
}

