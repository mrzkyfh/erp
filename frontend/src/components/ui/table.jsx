import { cn } from "@/lib/utils";

export function Table({ className, ...props }) {
  return (
    <div className="overflow-x-auto">
      <table className={cn("min-w-full text-left text-sm", className)} {...props} />
    </div>
  );
}

export function THead(props) {
  return <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground" {...props} />;
}

export function TBody(props) {
  return <tbody className="divide-y divide-border/70" {...props} />;
}

export function TR({ className, ...props }) {
  return <tr className={cn("align-top", className)} {...props} />;
}

export function TH({ className, ...props }) {
  return <th className={cn("px-3 py-3 font-medium", className)} {...props} />;
}

export function TD({ className, ...props }) {
  return <td className={cn("px-3 py-3", className)} {...props} />;
}

