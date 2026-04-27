import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const variants = {
  default: "bg-primary text-primary-foreground hover:bg-slate-700 active:bg-slate-800 shadow-sm",
  secondary: "bg-secondary text-secondary-foreground hover:bg-slate-800 active:bg-slate-900 shadow-sm",
  outline: "border-2 border-slate-300 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700",
  ghost: "hover:bg-slate-100 active:bg-slate-200 text-slate-700",
  destructive: "bg-destructive text-destructive-foreground hover:bg-red-700 active:bg-red-800 shadow-sm",
};

const sizes = {
  default: "h-11 px-4 py-2 text-sm",
  sm: "h-9 px-3 text-xs",
  lg: "h-12 px-6 text-base",
  icon: "h-11 w-11",
};

export const Button = forwardRef(function Button(
  { className, variant = "default", size = "default", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 touch-manipulation",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
});

