import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Textarea = forwardRef(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "min-h-24 w-full rounded-xl border border-border bg-white px-3 py-3 text-sm placeholder:text-muted-foreground focus:border-primary",
        className,
      )}
      {...props}
    />
  );
});

