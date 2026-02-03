import { icons } from "lucide-react-native";

export type IconName = keyof typeof icons;

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/**
 * Wrapper component for Lucide icons
 * Provides consistent sizing and styling across the app
 *
 * @example
 * <Icon name="ArrowLeft" size={20} color="#ffffff" />
 * <Icon name="Crown" size={24} color="#FFD700" />
 */
export function Icon({
  name,
  size = 24,
  color = "#ffffff",
  strokeWidth = 2,
}: IconProps) {
  const LucideIcon = icons[name];

  if (!LucideIcon) {
    console.warn(`Icon "${name}" not found in Lucide icons`);
    return null;
  }

  return <LucideIcon size={size} color={color} strokeWidth={strokeWidth} />;
}

// Pre-defined icon mappings for common use cases
export const ICON_MAP = {
  // Navigation
  back: "ArrowLeft",
  forward: "ChevronRight",
  close: "X",
  menu: "Menu",

  // Actions
  play: "Play",
  check: "Check",
  error: "X",
  help: "HelpCircle",

  // Game modes
  brain: "Brain",
  mountain: "Mountain",
  wheel: "Disc3",
  duel: "Swords",
  gamepad: "Gamepad2",
  trophy: "Trophy",

  // Categories
  geography: "Globe",
  history: "Landmark",
  science: "FlaskConical",
  sports: "Circle",
  entertainment: "Clapperboard",
  general: "BookOpen",

  // Premium & rewards
  crown: "Crown",
  target: "Target",
  star: "Star",
  gem: "Gem",
  flame: "Flame",
  zap: "Zap",
  medal: "Medal",

  // Social & settings
  user: "User",
  users: "Users",
  bell: "Bell",
  settings: "Settings",
  lock: "Lock",
  chart: "BarChart3",

  // Misc
  lightbulb: "Lightbulb",
  calendar: "Calendar",
  music: "Music",
  dumbbell: "Dumbbell",
  rocket: "Rocket",
  mapPin: "MapPin",
  flag: "Flag",
  cloud: "Cloud",
} as const;

export type IconMapKey = keyof typeof ICON_MAP;
