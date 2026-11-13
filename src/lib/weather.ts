/**
 * weather.ts — everything that talks to the Open-Meteo API, plus small
 * helpers for turning raw numbers into friendly text.
 *
 * Open-Meteo is free and needs no API key: https://open-meteo.com
 */

// ---------- Types ----------

export type Unit = "C" | "F";

/** A city (or location) the user picked. */
export type Place = {
  id: string;
  name: string;
  region?: string | undefined;
  country?: string | undefined;
  latitude: number;
  longitude: number;
};

export type Forecast = {
  current: {
    time: string;
    temperature: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number; // km/h
    uvIndex: number;
    visibility: number; // metres
    weatherCode: number;
    isDay: boolean;
  };
  hourly: { time: string; temperature: number; weatherCode: number; isDay: boolean; rainChance: number }[];
  daily: {
    date: string;
    weatherCode: number;
    max: number;
    min: number;
    rainChance: number;
    sunrise: string;
    sunset: string;
  }[];
};

// ---------- API calls ----------

/** Search for cities by name using the Open-Meteo geocoding API. */
export async function searchCities(query: string): Promise<Place[]> {
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.searchParams.set("name", query);
  url.searchParams.set("count", "6");
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");

  const res = await fetch(url);
  if (!res.ok) throw new Error("We couldn't reach the city search right now. Please try again.");

  const data = await res.json();
  type GeoResult = {
    id: number;
    name: string;
    admin1?: string;
    country?: string;
    latitude: number;
    longitude: number;
  };
  return ((data.results ?? []) as GeoResult[]).map((r) => ({
    id: String(r.id),
    name: r.name,
    region: r.admin1,
    country: r.country,
    latitude: r.latitude,
    longitude: r.longitude,
  }));
}

/** Get current, hourly and 7-day weather for a location. Values come back in °C and km/h. */
export async function getForecast(latitude: number, longitude: number): Promise<Forecast> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set(
    "current",
    "temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,uv_index,visibility,weather_code,is_day",
  );
  url.searchParams.set("hourly", "temperature_2m,weather_code,is_day,precipitation_probability");
  url.searchParams.set(
    "daily",
    "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset",
  );
  url.searchParams.set("timezone", "auto"); // times come back in the city's local time
  url.searchParams.set("forecast_days", "8"); // 8 so the next-24-hours list never runs short

  const res = await fetch(url);
  if (!res.ok) throw new Error("The weather service didn't respond. Please try again in a moment.");
  const d = await res.json();

  // Hourly: start at the current hour and keep the next 24 hours.
  const currentHour = String(d.current.time).slice(0, 13); // "2026-11-13T05"
  let start = (d.hourly.time as string[]).findIndex((t) => t.slice(0, 13) === currentHour);
  if (start < 0) start = 0;

  const hourly = (d.hourly.time as string[]).slice(start, start + 24).map((time, i) => ({
    time,
    temperature: d.hourly.temperature_2m[start + i],
    weatherCode: d.hourly.weather_code[start + i],
    isDay: d.hourly.is_day[start + i] === 1,
    rainChance: d.hourly.precipitation_probability[start + i] ?? 0,
  }));

  const daily = (d.daily.time as string[]).slice(0, 7).map((date, i) => ({
    date,
    weatherCode: d.daily.weather_code[i],
    max: d.daily.temperature_2m_max[i],
    min: d.daily.temperature_2m_min[i],
    rainChance: d.daily.precipitation_probability_max[i] ?? 0,
    sunrise: d.daily.sunrise[i],
    sunset: d.daily.sunset[i],
  }));

  return {
    current: {
      time: d.current.time,
      temperature: d.current.temperature_2m,
      feelsLike: d.current.apparent_temperature,
      humidity: d.current.relative_humidity_2m,
      windSpeed: d.current.wind_speed_10m,
      uvIndex: d.current.uv_index ?? 0,
      visibility: d.current.visibility ?? 0,
      weatherCode: d.current.weather_code,
      isDay: d.current.is_day === 1,
    },
    hourly,
    daily,
  };
}

// ---------- Weather codes ----------

export type IconKind =
  | "clear-day"
  | "clear-night"
  | "partly-day"
  | "partly-night"
  | "cloudy"
  | "fog"
  | "drizzle"
  | "rain"
  | "snow"
  | "storm";

/**
 * Open-Meteo uses WMO weather codes (numbers). This turns a code into a
 * readable label and an icon name.
 */
export function describeWeather(code: number, isDay = true): { label: string; icon: IconKind } {
  if (code === 0) return { label: isDay ? "Clear sky" : "Clear night", icon: isDay ? "clear-day" : "clear-night" };
  if (code === 1) return { label: "Mainly clear", icon: isDay ? "partly-day" : "partly-night" };
  if (code === 2) return { label: "Partly cloudy", icon: isDay ? "partly-day" : "partly-night" };
  if (code === 3) return { label: "Overcast", icon: "cloudy" };
  if (code === 45 || code === 48) return { label: "Foggy", icon: "fog" };
  if (code >= 51 && code <= 57) return { label: code >= 56 ? "Freezing drizzle" : "Drizzle", icon: "drizzle" };
  if (code === 61) return { label: "Light rain", icon: "rain" };
  if (code === 63) return { label: "Rain", icon: "rain" };
  if (code === 65) return { label: "Heavy rain", icon: "rain" };
  if (code === 66 || code === 67) return { label: "Freezing rain", icon: "rain" };
  if (code >= 71 && code <= 77) return { label: code === 75 ? "Heavy snow" : "Snow", icon: "snow" };
  if (code >= 80 && code <= 82) return { label: "Rain showers", icon: "rain" };
  if (code === 85 || code === 86) return { label: "Snow showers", icon: "snow" };
  if (code === 95) return { label: "Thunderstorm", icon: "storm" };
  if (code === 96 || code === 99) return { label: "Thunderstorm & hail", icon: "storm" };
  return { label: "Unknown", icon: "cloudy" };
}

// ---------- Unit conversion & formatting ----------

/** Convert a Celsius value to the chosen unit and round it. */
export function convertTemp(celsius: number, unit: Unit): number {
  const value = unit === "F" ? (celsius * 9) / 5 + 32 : celsius;
  return Math.round(value);
}

/** Wind in km/h for Celsius users, mph for Fahrenheit users. */
export function formatWind(kmh: number, unit: Unit): string {
  return unit === "F" ? `${Math.round(kmh * 0.621371)} mph` : `${Math.round(kmh)} km/h`;
}

/** Visibility in km for Celsius users, miles for Fahrenheit users. */
export function formatVisibility(metres: number, unit: Unit): string {
  const km = metres / 1000;
  const value = unit === "F" ? km * 0.621371 : km;
  const rounded = value >= 10 ? Math.round(value) : Math.round(value * 10) / 10;
  return `${rounded} ${unit === "F" ? "mi" : "km"}`;
}

/** Turn a UV index number into a word. */
export function uvLevel(uv: number): string {
  if (uv < 3) return "Low";
  if (uv < 6) return "Moderate";
  if (uv < 8) return "High";
  if (uv < 11) return "Very high";
  return "Extreme";
}

export function humidityLevel(h: number): string {
  if (h < 30) return "Dry";
  if (h < 60) return "Comfortable";
  if (h < 80) return "Humid";
  return "Very humid";
}

// Times from the API are already in the city's local time, like "2026-11-13T17:00".
// We read the numbers straight from the text so the user's own timezone never interferes.

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2026-11-13T17:30" -> "5:30 PM" */
export function formatTime(iso: string): string {
  const h = Number(iso.slice(11, 13));
  const m = Number(iso.slice(14, 16));
  const suffix = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${suffix}`;
}

/** "2026-11-13T17:00" -> "5 PM" */
export function formatHour(iso: string): string {
  const h = Number(iso.slice(11, 13));
  return `${h % 12 === 0 ? 12 : h % 12} ${h >= 12 ? "PM" : "AM"}`;
}

function parseDate(iso: string): Date {
  const y = Number(iso.slice(0, 4));
  const mo = Number(iso.slice(5, 7));
  const d = Number(iso.slice(8, 10));
  return new Date(y, mo - 1, d);
}

/** "2026-11-13" -> "Friday" */
export function formatWeekday(iso: string, short = false): string {
  const name = DAYS[parseDate(iso).getDay()] ?? "";
  return short ? name.slice(0, 3) : name;
}

/** "2026-11-13" -> "Nov 13" */
export function formatShortDate(iso: string): string {
  const date = parseDate(iso);
  return `${MONTHS[date.getMonth()]} ${date.getDate()}`;
}

/** Label shown under a place name, e.g. "England, United Kingdom". */
export function placeSubtitle(place: Place): string {
  return [place.region, place.country].filter(Boolean).join(", ");
}
