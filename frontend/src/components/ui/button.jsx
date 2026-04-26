import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const variants = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
  outline: "border border-border bg-white hover:bg-muted",
  ghost: "hover:bg-muted",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
};

const sizes = {
  default: "h-11 px-4 py-2",
  sm: "h-9 px-3",
  lg: "h-12 px-5",
};

export const Button = forwardRef(function Button(
  { className, variant = "default", size = "default", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-medium transition focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
});

