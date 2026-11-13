import { MapPin, Thermometer } from "lucide-react";

import {
  convertTemp,
  describeWeather,
  formatShortDate,
  formatTime,
  formatWeekday,
  placeSubtitle,
  type Forecast,
  type Place,
  type Unit,
} from "@/lib/weather";
import { WeatherIcon } from "./WeatherIcon";

type Props = { place: Place; forecast: Forecast; unit: Unit };

export function CurrentWeather({ place, forecast, unit }: Props) {
  const { current, daily } = forecast;
  const today = daily[0];
  const { label } = describeWeather(current.weatherCode, current.isDay);
  const subtitle = placeSubtitle(place);

  return (
    <section
      aria-label="Current weather"
      className="bg-hero relative overflow-hidden rounded-3xl p-6 sm:p-8"
    >
      {/* soft decorative glow */}
      <div className="pointer-events-none absolute -right-24 -top-24 size-72 animate-drift rounded-full bg-primary/20 blur-3xl" />

      <div className="relative flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm font-medium text-primary-glow">
            <MapPin className="size-4" />
            <span>
              {formatWeekday(current.time)}, {formatShortDate(current.time)} · {formatTime(current.time)}
            </span>
          </div>
          <h2 className="mt-2 truncate text-3xl font-semibold tracking-tight sm:text-4xl">{place.name}</h2>
          {subtitle && <p className="mt-1 truncate text-muted-foreground">{subtitle}</p>}

          <div className="mt-6 flex items-start">
            <span className="text-gradient font-display text-8xl font-light leading-none tracking-tighter sm:text-9xl">
              {convertTemp(current.temperature, unit)}
            </span>
            <span className="mt-2 font-display text-3xl font-light text-muted-foreground">°{unit}</span>
          </div>
        </div>

        <div className="flex items-center gap-5 sm:flex-col sm:items-end sm:gap-4 sm:text-right">
          <WeatherIcon
            code={current.weatherCode}
            isDay={current.isDay}
            strokeWidth={1.25}
            className="size-24 shrink-0 animate-float drop-shadow-2xl sm:size-36"
          />
          <div>
            <p className="text-2xl font-semibold">{label}</p>
            <p className="mt-1 flex items-center gap-1.5 text-muted-foreground sm:justify-end">
              <Thermometer className="size-4" />
              Feels like {convertTemp(current.feelsLike, unit)}°
            </p>
            {today && (
              <p className="mt-1 text-sm text-muted-foreground">
                H: {convertTemp(today.max, unit)}° · L: {convertTemp(today.min, unit)}°
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
