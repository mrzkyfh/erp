import { cn } from "@/lib/utils";

export function Card({ className, ...props }) {
  return (
    <div
      className={cn("rounded-xl border border-slate-200 bg-card p-4 md:p-6 shadow-card", className)}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }) {
  return <div className={cn("mb-3 md:mb-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4", className)} {...props} />;
}

export function CardTitle({ className, ...props }) {
  return <h3 className={cn("text-base md:text-lg font-semibold text-slate-900", className)} {...props} />;
}

export function CardDescription({ className, ...props }) {
  return <p className={cn("text-xs md:text-sm text-slate-600", className)} {...props} />;
}

export function CardContent({ className, ...props }) {
  return <div className={cn("space-y-4", className)} {...props} />;
}

