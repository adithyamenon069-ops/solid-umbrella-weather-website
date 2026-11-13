import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { RotateCw } from "lucide-react";

import { getForecast, type Place, type Unit } from "@/lib/weather";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/weather/Logo";
import { SearchBar } from "@/components/weather/SearchBar";
import { UnitToggle } from "@/components/weather/UnitToggle";
import { CurrentWeather } from "@/components/weather/CurrentWeather";
import { HourlyForecast } from "@/components/weather/HourlyForecast";
import { DailyForecast } from "@/components/weather/DailyForecast";
import { WeatherDetails } from "@/components/weather/WeatherDetails";
import { WeatherError, WeatherSkeleton } from "@/components/weather/StatusViews";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Solid Umbrella — Your weather, under one roof" },
      {
        name: "description",
        content:
          "Live weather for any city: current conditions, hourly and 7-day forecasts, humidity, wind, UV and visibility.",
      },
      { property: "og:title", content: "Solid Umbrella — Your weather, under one roof" },
      {
        property: "og:description",
        content: "Live weather for any city with hourly and 7-day forecasts.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

// Shortcut cities shown under the search bar (just names and coordinates, not weather).
const DEFAULT_CITY: Place = {
  id: "2643743", name: "London", region: "England", country: "United Kingdom", latitude: 51.50853, longitude: -0.12574,
};

const QUICK_CITIES: Place[] = [
  DEFAULT_CITY,
  { id: "5128581", name: "New York", region: "New York", country: "United States", latitude: 40.71427, longitude: -74.00597 },
  { id: "1850147", name: "Tokyo", region: "Tokyo", country: "Japan", latitude: 35.6895, longitude: 139.69171 },
  { id: "1275339", name: "Mumbai", region: "Maharashtra", country: "India", latitude: 19.07283, longitude: 72.88261 },
  { id: "2147714", name: "Sydney", region: "New South Wales", country: "Australia", latitude: -33.86785, longitude: 151.20732 },
  { id: "2988507", name: "Paris", region: "Île-de-France", country: "France", latitude: 48.85341, longitude: 2.3488 },
];

const STORAGE_PLACE = "solid-umbrella:place";
const STORAGE_UNIT = "solid-umbrella:unit";

function HomePage() {
  const [place, setPlace] = useState<Place>(DEFAULT_CITY);
  const [unit, setUnit] = useState<Unit>("C");
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Remember the last city and unit between visits (read after the page loads).
  useEffect(() => {
    try {
      const savedPlace = localStorage.getItem(STORAGE_PLACE);
      const savedUnit = localStorage.getItem(STORAGE_UNIT);
      if (savedPlace) setPlace(JSON.parse(savedPlace));
      if (savedUnit === "C" || savedUnit === "F") setUnit(savedUnit);
    } catch {
      // ignore broken saved data
    }
  }, []);

  function selectPlace(next: Place) {
    setPlace(next);
    setLocationError(null);
    localStorage.setItem(STORAGE_PLACE, JSON.stringify(next));
  }

  function changeUnit(next: Unit) {
    setUnit(next);
    localStorage.setItem(STORAGE_UNIT, next);
  }

  function locateMe() {
    if (!navigator.geolocation) {
      setLocationError("Your browser doesn't support location. Please search for your city instead.");
      return;
    }
    setLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        selectPlace({
          id: "my-location",
          name: "Your location",
          region: `${pos.coords.latitude.toFixed(2)}°, ${pos.coords.longitude.toFixed(2)}°`,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      (err) => {
        setLocating(false);
        setLocationError(
          err.code === err.PERMISSION_DENIED
            ? "Location access was blocked. Allow it in your browser, or just search for a city."
            : "We couldn't find your location. Please search for your city instead.",
        );
      },
      { timeout: 10000 },
    );
  }

  // Fetch the forecast whenever the chosen place changes.
  const forecast = useQuery({
    queryKey: ["forecast", place.latitude, place.longitude],
    queryFn: () => getForecast(place.latitude, place.longitude),
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="mx-auto max-w-6xl px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        {/* ---------- Header ---------- */}
        <header className="flex animate-fade-up items-center justify-between gap-4">
          <a href="/" className="flex items-center gap-3">
            <Logo className="size-11" />
            <div>
              <h1 className="text-lg font-semibold leading-tight tracking-tight sm:text-xl">Solid Umbrella</h1>
              <p className="text-xs text-muted-foreground sm:text-sm">Your weather, under one roof.</p>
            </div>
          </a>
          <UnitToggle unit={unit} onChange={changeUnit} />
        </header>

        {/* ---------- Search ---------- */}
        <div className="relative z-20 mt-8 animate-fade-up sm:mt-10" style={{ animationDelay: "80ms" }}>
          <SearchBar onSelect={selectPlace} onUseLocation={locateMe} locating={locating} />
          {locationError && (
            <p role="alert" className="mt-3 text-sm text-destructive">
              {locationError}
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            {QUICK_CITIES.map((city) => (
              <button
                key={city.id}
                type="button"
                onClick={() => selectPlace(city)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-sm transition-all duration-200 hover:-translate-y-0.5",
                  city.id === place.id
                    ? "border-primary/50 bg-primary/15 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
                )}
              >
                {city.name}
              </button>
            ))}
          </div>
        </div>

        {/* ---------- Weather ---------- */}
        <main className="mt-8">
          {forecast.isPending ? (
            <WeatherSkeleton />
          ) : forecast.isError ? (
            <WeatherError message={(forecast.error as Error).message} onRetry={() => forecast.refetch()} />
          ) : (
            <div key={`${place.latitude},${place.longitude}`} className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-5">
              <div className="min-w-0 space-y-4 lg:col-span-2 lg:space-y-5">
                <div className="animate-fade-up">
                  <CurrentWeather place={place} forecast={forecast.data} unit={unit} />
                </div>
                <div className="animate-fade-up" style={{ animationDelay: "100ms" }}>
                  <HourlyForecast hourly={forecast.data.hourly} unit={unit} />
                </div>
                <WeatherDetails forecast={forecast.data} unit={unit} />
              </div>
              <div className="min-w-0 animate-fade-up lg:row-span-2" style={{ animationDelay: "160ms" }}>
                <DailyForecast daily={forecast.data.daily} unit={unit} />
              </div>
            </div>
          )}
        </main>

        {/* ---------- Footer ---------- */}
        <footer className="mt-12 flex flex-col items-center justify-between gap-3 border-t pt-6 text-sm text-muted-foreground sm:flex-row">
          <p>© Solid Umbrella. Your weather, under one roof.</p>
          <div className="flex items-center gap-4">
            {forecast.isSuccess && (
              <button
                type="button"
                onClick={() => forecast.refetch()}
                className="inline-flex items-center gap-1.5 transition-colors hover:text-primary"
              >
                <RotateCw className={cn("size-3.5", forecast.isFetching && "animate-spin")} /> Refresh
              </button>
            )}
            <a
              href="https://open-meteo.com/"
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-primary"
            >
              Weather data by Open-Meteo
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
