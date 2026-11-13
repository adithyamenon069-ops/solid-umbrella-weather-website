import { describe, expect, it } from "vitest";

import { convertTemp, describeWeather, formatHour, formatWind, uvLevel } from "./weather";

describe("temperature switching", () => {
  it("keeps Celsius values (rounded)", () => {
    expect(convertTemp(21.6, "C")).toBe(22);
  });

  it("converts Celsius to Fahrenheit", () => {
    expect(convertTemp(0, "F")).toBe(32);
    expect(convertTemp(100, "F")).toBe(212);
    expect(convertTemp(-40, "F")).toBe(-40);
  });

  it("shows wind in mph when Fahrenheit is chosen", () => {
    expect(formatWind(10, "C")).toBe("10 km/h");
    expect(formatWind(10, "F")).toBe("6 mph");
  });
});

describe("weather conditions", () => {
  it("maps weather codes to the right condition and icon", () => {
    expect(describeWeather(0, true)).toEqual({ label: "Clear sky", icon: "clear-day" });
    expect(describeWeather(0, false).icon).toBe("clear-night");
    expect(describeWeather(63).icon).toBe("rain");
    expect(describeWeather(95).label).toBe("Thunderstorm");
  });

  it("labels UV index levels", () => {
    expect(uvLevel(2)).toBe("Low");
    expect(uvLevel(6)).toBe("High");
    expect(uvLevel(11)).toBe("Extreme");
  });

  it("formats hours in the city's local time", () => {
    expect(formatHour("2026-11-13T00:00")).toBe("12 AM");
    expect(formatHour("2026-11-13T17:00")).toBe("5 PM");
  });
});
