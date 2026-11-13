import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudMoon,
  CloudRain,
  CloudSnow,
  CloudSun,
  Moon,
  Sun,
  type LucideIcon,
} from "lucide-react";

import { describeWeather, type IconKind } from "@/lib/weather";
import { cn } from "@/lib/utils";

// Which icon and colour to use for each kind of weather.
const ICONS: Record<IconKind, { Icon: LucideIcon; color: string }> = {
  "clear-day": { Icon: Sun, color: "text-sun" },
  "clear-night": { Icon: Moon, color: "text-moon" },
  "partly-day": { Icon: CloudSun, color: "text-sun" },
  "partly-night": { Icon: CloudMoon, color: "text-moon" },
  cloudy: { Icon: Cloud, color: "text-cloud" },
  fog: { Icon: CloudFog, color: "text-cloud" },
  drizzle: { Icon: CloudDrizzle, color: "text-rain" },
  rain: { Icon: CloudRain, color: "text-rain" },
  snow: { Icon: CloudSnow, color: "text-snow" },
  storm: { Icon: CloudLightning, color: "text-storm" },
};

type Props = { code: number; isDay?: boolean; className?: string; strokeWidth?: number };

export function WeatherIcon({ code, isDay = true, className, strokeWidth = 1.75 }: Props) {
  const { icon, label } = describeWeather(code, isDay);
  const { Icon, color } = ICONS[icon];
  return <Icon className={cn(color, className)} strokeWidth={strokeWidth} aria-label={label} role="img" />;
}
