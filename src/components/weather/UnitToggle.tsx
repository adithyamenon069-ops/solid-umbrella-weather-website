import type { Unit } from "@/lib/weather";
import { cn } from "@/lib/utils";

/** Pill switch for °C / °F. */
export function UnitToggle({ unit, onChange }: { unit: Unit; onChange: (u: Unit) => void }) {
  return (
    <div role="radiogroup" aria-label="Temperature unit" className="glass-card flex rounded-full p-1">
      {(["C", "F"] as const).map((u) => (
        <button
          key={u}
          type="button"
          role="radio"
          aria-checked={unit === u}
          onClick={() => onChange(u)}
          className={cn(
            "rounded-full px-3.5 py-1.5 text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            unit === u
              ? "bg-accent-gradient text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          °{u}
        </button>
      ))}
    </div>
  );
}
