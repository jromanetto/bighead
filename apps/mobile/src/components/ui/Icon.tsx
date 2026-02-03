import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  X,
  Menu,
  Play,
  Check,
  HelpCircle,
  Brain,
  Mountain,
  Disc3,
  Swords,
  Gamepad2,
  Trophy,
  Globe,
  Landmark,
  FlaskConical,
  Circle,
  Clapperboard,
  BookOpen,
  Crown,
  Target,
  Star,
  Gem,
  Flame,
  Zap,
  Medal,
  User,
  Users,
  Bell,
  Settings,
  Lock,
  BarChart3,
  Lightbulb,
  Calendar,
  Music,
  Dumbbell,
  Rocket,
  MapPin,
  Flag,
  Cloud,
  Home,
  Award,
  Gift,
  Share2,
  RefreshCw,
  Timer,
  Clock,
  Percent,
  TrendingUp,
  Sparkles,
  Heart,
  ThumbsUp,
  MessageCircle,
  Send,
  LogOut,
  LogIn,
  Eye,
  EyeOff,
  Palette,
  Leaf,
  Cpu,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react-native";
import { ComponentType } from "react";

// Map of icon names to components
const iconMap: Record<string, LucideIcon> = {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  X,
  Menu,
  Play,
  Check,
  HelpCircle,
  Brain,
  Mountain,
  Disc3,
  Swords,
  Gamepad2,
  Trophy,
  Globe,
  Landmark,
  FlaskConical,
  Circle,
  Clapperboard,
  BookOpen,
  Crown,
  Target,
  Star,
  Gem,
  Flame,
  Zap,
  Medal,
  User,
  Users,
  Bell,
  Settings,
  Lock,
  BarChart3,
  Lightbulb,
  Calendar,
  Music,
  Dumbbell,
  Rocket,
  MapPin,
  Flag,
  Cloud,
  Home,
  Award,
  Gift,
  Share2,
  RefreshCw,
  Timer,
  Clock,
  Percent,
  TrendingUp,
  Sparkles,
  Heart,
  ThumbsUp,
  MessageCircle,
  Send,
  LogOut,
  LogIn,
  Eye,
  EyeOff,
  Palette,
  Leaf,
  Cpu,
  UtensilsCrossed,
};

export type IconName = keyof typeof iconMap;

interface IconProps {
  name: string;
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
  const LucideIcon = iconMap[name];

  if (!LucideIcon) {
    console.warn(`Icon "${name}" not found in icon map`);
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
