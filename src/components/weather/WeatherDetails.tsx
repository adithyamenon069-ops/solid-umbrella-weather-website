import { Droplet, Eye, Sun, Sunrise, Sunset, Wind, type LucideIcon } from "lucide-react";

import {
  formatTime,
  formatVisibility,
  formatWind,
  humidityLevel,
  uvLevel,
  type Forecast,
  type Unit,
} from "@/lib/weather";

type Tile = { label: string; value: string; note: string; Icon: LucideIcon; meter?: number };

export function WeatherDetails({ forecast, unit }: { forecast: Forecast; unit: Unit }) {
  const { current, daily } = forecast;
  const today = daily[0];

  const tiles: Tile[] = [
    {
      label: "Humidity",
      value: `${current.humidity}%`,
      note: humidityLevel(current.humidity),
      Icon: Droplet,
      meter: current.humidity,
    },
    {
      label: "Wind speed",
      value: formatWind(current.windSpeed, unit),
      note: current.windSpeed < 12 ? "Light breeze" : current.windSpeed < 39 ? "Breezy" : "Strong wind",
      Icon: Wind,
    },
    {
      label: "UV index",
      value: String(Math.round(current.uvIndex)),
      note: uvLevel(current.uvIndex),
      Icon: Sun,
      meter: Math.min((current.uvIndex / 11) * 100, 100),
    },
    {
      label: "Visibility",
      value: formatVisibility(current.visibility, unit),
      note: current.visibility >= 10000 ? "Clear view" : current.visibility >= 4000 ? "Good" : "Reduced",
      Icon: Eye,
    },
    {
      label: "Sunrise",
      value: today ? formatTime(today.sunrise) : "—",
      note: "Local time",
      Icon: Sunrise,
    },
    { label: "Sunset", value: today ? formatTime(today.sunset) : "—", note: "Local time", Icon: Sunset },
  ];

  return (
    <section aria-label="Weather details" className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
      {tiles.map(({ label, value, note, Icon, meter }, i) => (
        <div
          key={label}
          className="glass-card group animate-fade-up rounded-3xl p-4 transition-transform duration-300 hover:-translate-y-1 sm:p-5"
          style={{ animationDelay: `${150 + i * 60}ms` }}
        >
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <span className="flex size-7 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Icon className="size-3.5" />
            </span>
            {label}
          </div>
          <p className="mt-4 font-display text-2xl font-semibold sm:text-3xl">{value}</p>
          {meter !== undefined ? (
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="bg-accent-gradient h-full rounded-full" style={{ width: `${meter}%` }} />
            </div>
          ) : null}
          <p className="mt-2 text-sm text-muted-foreground">{note}</p>
        </div>
      ))}
    </section>
  );
}
