import { cn } from "@/lib/utils";

export function Table({ className, ...props }) {
  return (
    <div className="overflow-x-auto -mx-4 md:mx-0">
      <div className="inline-block min-w-full align-middle">
        <table className={cn("min-w-full text-left text-sm", className)} {...props} />
      </div>
    </div>
  );
}

export function THead(props) {
  return <thead className="border-b-2 border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600" {...props} />;
}

export function TBody(props) {
  return <tbody className="divide-y divide-slate-100 bg-white" {...props} />;
}

export function TR({ className, ...props }) {
  return <tr className={cn("align-top hover:bg-slate-50 transition-colors", className)} {...props} />;
}

export function TH({ className, ...props }) {
  return <th className={cn("px-3 md:px-4 py-3 font-semibold text-left", className)} {...props} />;
}

export function TD({ className, ...props }) {
  return <td className={cn("px-3 md:px-4 py-3 text-slate-700", className)} {...props} />;
}

