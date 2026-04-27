export function FormField({ label, hint, error, required, children }) {
  return (
    <label className="block space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-slate-900">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </span>
        {hint ? <span className="text-xs text-slate-500">{hint}</span> : null}
      </div>
      {children}
      {error ? <p className="text-xs text-red-600 mt-1">{error}</p> : null}
    </label>
  );
}

