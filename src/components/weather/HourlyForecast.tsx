import { Clock, Droplets } from "lucide-react";

import { convertTemp, formatHour, type Forecast, type Unit } from "@/lib/weather";
import { cn } from "@/lib/utils";
import { WeatherIcon } from "./WeatherIcon";

export function HourlyForecast({ hourly, unit }: { hourly: Forecast["hourly"]; unit: Unit }) {
  return (
    <section aria-label="Hourly forecast" className="glass-card rounded-3xl p-5 sm:p-6">
      <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        <Clock className="size-4" /> Next 24 hours
      </h3>

      <div className="scrollbar-thin -mx-2 mt-4 flex snap-x gap-2 overflow-x-auto px-2 pb-2">
        {hourly.map((hour, i) => (
          <div
            key={hour.time}
            className={cn(
              "flex min-w-[4.75rem] snap-start flex-col items-center gap-3 rounded-2xl border px-3 py-4 transition-colors",
              i === 0 ? "border-primary/40 bg-primary/10" : "border-transparent hover:bg-accent/60",
            )}
          >
            <span className={cn("text-sm", i === 0 ? "font-semibold text-primary" : "text-muted-foreground")}>
              {i === 0 ? "Now" : formatHour(hour.time)}
            </span>
            <WeatherIcon code={hour.weatherCode} isDay={hour.isDay} className="size-7" />
            <span className="font-display text-lg font-semibold">{convertTemp(hour.temperature, unit)}°</span>
            <span
              className={cn(
                "flex items-center gap-0.5 text-xs",
                hour.rainChance > 0 ? "text-rain" : "text-muted-foreground/50",
              )}
            >
              <Droplets className="size-3" />
              {hour.rainChance}%
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
