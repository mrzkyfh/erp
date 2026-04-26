import { cn } from "@/lib/utils";

export function Card({ className, ...props }) {
  return (
    <div
      className={cn("rounded-3xl border border-white/60 bg-card p-5 shadow-soft", className)}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }) {
  return <div className={cn("mb-4 flex items-start justify-between gap-4", className)} {...props} />;
}

export function CardTitle({ className, ...props }) {
  return <h3 className={cn("text-lg font-semibold", className)} {...props} />;
}

export function CardDescription({ className, ...props }) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

export function CardContent({ className, ...props }) {
  return <div className={cn("space-y-4", className)} {...props} />;
}

