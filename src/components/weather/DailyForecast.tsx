import { CalendarDays, Droplets } from "lucide-react";

import { convertTemp, describeWeather, formatWeekday, type Forecast, type Unit } from "@/lib/weather";
import { WeatherIcon } from "./WeatherIcon";

export function DailyForecast({ daily, unit }: { daily: Forecast["daily"]; unit: Unit }) {
  // The coldest and warmest temperatures of the week, used to draw the range bars.
  const weekMin = Math.min(...daily.map((d) => d.min));
  const weekMax = Math.max(...daily.map((d) => d.max));
  const span = weekMax - weekMin || 1;

  return (
    <section aria-label="7-day forecast" className="glass-card h-full rounded-3xl p-5 sm:p-6">
      <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        <CalendarDays className="size-4" /> 7-day forecast
      </h3>

      <ul className="mt-3 divide-y divide-border">
        {daily.map((day, i) => {
          const left = ((day.min - weekMin) / span) * 100;
          const width = ((day.max - day.min) / span) * 100;
          return (
            <li
              key={day.date}
              className="grid grid-cols-[3.5rem_2rem_1fr] items-center gap-3 py-3.5 sm:grid-cols-[4rem_2.25rem_1fr]"
            >
              <span className="font-semibold">{i === 0 ? "Today" : formatWeekday(day.date, true)}</span>

              <WeatherIcon code={day.weatherCode} className="size-7" />

              <div className="min-w-0">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="truncate">{describeWeather(day.weatherCode).label}</span>
                  {day.rainChance > 0 && (
                    <span className="ml-2 flex shrink-0 items-center gap-0.5 text-rain">
                      <Droplets className="size-3" />
                      {day.rainChance}%
                    </span>
                  )}
                </div>
                <div className="mt-1.5 flex items-center gap-2.5">
                  <span className="w-8 text-right text-sm text-muted-foreground">
                    {convertTemp(day.min, unit)}°
                  </span>
                  <div className="relative h-1.5 flex-1 rounded-full bg-muted">
                    <div
                      className="bg-temp-gradient absolute inset-y-0 rounded-full"
                      style={{ left: `${left}%`, width: `${Math.max(width, 6)}%` }}
                    />
                  </div>
                  <span className="w-8 text-sm font-semibold">{convertTemp(day.max, unit)}°</span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
