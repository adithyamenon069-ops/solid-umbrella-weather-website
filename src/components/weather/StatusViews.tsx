import { CloudOff, RotateCw } from "lucide-react";

/** Shimmering placeholders shown while the weather loads. */
export function WeatherSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading weather" className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-5">
      <div className="min-w-0 space-y-4 lg:col-span-2 lg:space-y-5">
        <div className="skeleton h-72 rounded-3xl" />
        <div className="skeleton h-44 rounded-3xl" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-32 rounded-3xl" />
          ))}
        </div>
      </div>
      <div className="skeleton h-[32rem] rounded-3xl" />
    </div>
  );
}

/** Friendly message when the weather can't be loaded. */
export function WeatherError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="glass-card mx-auto flex max-w-lg animate-fade-up flex-col items-center rounded-3xl px-6 py-14 text-center"
    >
      <span className="flex size-16 items-center justify-center rounded-full bg-destructive/15 text-destructive">
        <CloudOff className="size-8" />
      </span>
      <h2 className="mt-5 text-xl font-semibold">Looks like the forecast got caught in the rain</h2>
      <p className="mt-2 text-muted-foreground">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="bg-accent-gradient mt-6 inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-semibold text-primary-foreground transition-transform hover:scale-105 active:scale-95"
      >
        <RotateCw className="size-4" /> Try again
      </button>
    </div>
  );
}
