# UI Glassmorphism + Lucide Icons - Design Document

**Date**: 2026-02-03
**Status**: Approved
**Approach**: Progressive evolution (Phase by phase)

---

## Overview

Upgrade BIGHEAD UI to "App Store Featured" quality with:
1. **Lucide Icons** - Replace all emojis with consistent vector icons
2. **Glassmorphism** - Modern iOS-style design with blur, transparency, subtle neons

---

## Phase 1: Lucide Icons Setup

### Installation

```bash
npx expo install lucide-react-native react-native-svg
```

### Icon Wrapper Component

**File**: `src/components/ui/Icon.tsx`

```tsx
import { icons } from 'lucide-react-native';

type IconName = keyof typeof icons;

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export function Icon({
  name,
  size = 24,
  color = '#ffffff',
  strokeWidth = 2
}: IconProps) {
  const LucideIcon = icons[name];
  return <LucideIcon size={size} color={color} strokeWidth={strokeWidth} />;
}
```

### Complete Icon Mapping

#### Navigation & UI
| Emoji | Lucide | Usage |
|-------|--------|-------|
| ← | `ArrowLeft` | Back buttons |
| → | `ChevronRight` | Navigation links |
| ▶ | `Play` | Play buttons |
| ✓ | `Check` | Success states |
| ✗ | `X` | Error/wrong |
| ❓ | `HelpCircle` | Unknown/locked |

#### Game Modes
| Emoji | Lucide | Usage |
|-------|--------|-------|
| 🧠 | `Brain` | Daily Brain, Quiz |
| 🏔️ | `Mountain` | Adventure mode |
| 🎡 | `Disc3` | Category wheel |
| ⚔️ | `Swords` | Versus mode |
| 🎮 | `Gamepad2` | Party mode |
| 🏆 | `Trophy` | Leaderboard |

#### Categories
| Emoji | Lucide | Usage |
|-------|--------|-------|
| 🌍 | `Globe` | Geography |
| 🏛️ | `Landmark` | History |
| 🔬 | `FlaskConical` | Science |
| ⚽ | `Circle` | Sports |
| 🎬 | `Clapperboard` | Entertainment |
| 📚 | `BookOpen` | General knowledge |

#### Premium & Rewards
| Emoji | Lucide | Usage |
|-------|--------|-------|
| 👑 | `Crown` | Premium badge |
| 🎯 | `Target` | Daily limits |
| ⭐ | `Star` | Ratings |
| 💎 | `Gem` | Premium features |
| 🔥 | `Flame` | Streaks |
| ⚡ | `Zap` | Power-ups |

#### Medals (with colors)
| Emoji | Lucide | Color | Usage |
|-------|--------|-------|-------|
| 🥇 | `Medal` | `#FFD700` | 1st place |
| 🥈 | `Medal` | `#C0C0C0` | 2nd place |
| 🥉 | `Medal` | `#CD7F32` | 3rd place |

#### Social & Settings
| Emoji | Lucide | Usage |
|-------|--------|-------|
| 👤 | `User` | Profile |
| 🤝 | `Users` | Friends/invite |
| 🔔 | `Bell` | Notifications |
| ⚙️ | `Settings` | Settings |
| 🔒 | `Lock` | Locked content |
| 📊 | `BarChart3` | Statistics |

#### Misc
| Emoji | Lucide | Usage |
|-------|--------|-------|
| 💡 | `Lightbulb` | Tips/hints |
| 📅 | `Calendar` | Daily challenge |
| 🎵 | `Music` | Sound settings |
| 💪 | `Dumbbell` | Achievements |
| 🚀 | `Rocket` | Launch/boost |
| 📍 | `MapPin` | Current position |
| 🏁 | `Flag` | Finish/summit |
| ☁️ | `Cloud` | Clouds decoration |

---

## Phase 2: Design System Components

### Color Tokens

```tsx
// src/design-system/colors.ts
export const COLORS = {
  // Background
  bg: "#0a0a1a",
  bgLight: "#1a1035",

  // Glass surfaces
  glass: "rgba(255, 255, 255, 0.05)",
  glassBorder: "rgba(255, 255, 255, 0.1)",
  glassHover: "rgba(255, 255, 255, 0.08)",

  // Primary
  primary: "#00c2cc",
  primaryGlow: "#00e5ff",
  primaryDim: "rgba(0, 194, 204, 0.15)",

  // Premium
  gold: "#FFD700",
  goldDim: "rgba(255, 209, 0, 0.15)",

  // Feedback
  success: "#22c55e",
  successDim: "rgba(34, 197, 94, 0.15)",
  error: "#ef4444",
  errorDim: "rgba(239, 68, 68, 0.15)",

  // Text
  text: "#ffffff",
  textMuted: "#9ca3af",
  textDim: "rgba(255, 255, 255, 0.6)",
};
```

### GlassCard Component

**File**: `src/components/ui/GlassCard.tsx`

```tsx
interface GlassCardProps {
  variant?: 'default' | 'primary' | 'premium' | 'success' | 'error';
  children: React.ReactNode;
  style?: ViewStyle;
}

const VARIANTS = {
  default: {
    bg: "rgba(255, 255, 255, 0.05)",
    border: "rgba(255, 255, 255, 0.1)",
  },
  primary: {
    bg: "rgba(0, 194, 204, 0.1)",
    border: "rgba(0, 194, 204, 0.3)",
  },
  premium: {
    bg: "rgba(255, 209, 0, 0.1)",
    border: "rgba(255, 209, 0, 0.3)",
  },
  success: {
    bg: "rgba(34, 197, 94, 0.1)",
    border: "rgba(34, 197, 94, 0.3)",
  },
  error: {
    bg: "rgba(239, 68, 68, 0.1)",
    border: "rgba(239, 68, 68, 0.3)",
  },
};
```

**Visual properties:**
- `borderRadius: 20`
- `borderWidth: 1`
- `backdropBlur: 12` (via expo-blur or Skia)
- `shadowColor: "#000"`
- `shadowOffset: { width: 0, height: 8 }`
- `shadowOpacity: 0.15`
- `shadowRadius: 24`

### Button Components

#### PrimaryButton

```tsx
// Gradient background
background: LinearGradient(["#00c2cc", "#00a8b3"])
borderRadius: 16
paddingVertical: 16

// Glow effect
shadowColor: "#00c2cc"
shadowOffset: { width: 0, height: 4 }
shadowOpacity: 0.4
shadowRadius: 12

// Press animation
scale: 0.98 (withSpring)
opacity: 0.85
```

#### SecondaryButton

```tsx
backgroundColor: "rgba(255, 255, 255, 0.08)"
borderWidth: 1
borderColor: "rgba(255, 255, 255, 0.15)"
borderRadius: 16
```

#### IconButton

```tsx
width: 44
height: 44
borderRadius: 22
backgroundColor: "rgba(255, 255, 255, 0.08)"
borderWidth: 1
borderColor: "rgba(255, 255, 255, 0.1)"
```

---

## Phase 3: Mountain Glassmorphism

### Visual Elements

#### 1. Background Sky
- Gradient: `#0a0a1a` → `#1a1035` → `#0f0f25`
- Stars with pulse animation (opacity 0.3 → 0.8)
- Moon with halo blur (`blur={20}`)

#### 2. Main Mountain
- Smooth Bézier curves (less angular)
- Fill: semi-transparent gradient `rgba(30, 40, 60, 0.7)`
- Stroke: 1px luminous gradient border
- Glass effect: `<Blur blur={2}>` on fill

#### 3. Snow Cap
- Gradient: white → light blue, `opacity: 0.9`
- External white glow (`blur={15}`)

#### 4. Progress Trail
- Background: dotted line `rgba(255, 255, 255, 0.1)`
- Progress: neon gradient `#00c2cc` → `#00e5ff` with glow
- Step markers: glass circles
  ```
  backgroundColor: rgba(255, 255, 255, 0.1)
  borderColor: rgba(255, 255, 255, 0.3)
  backdropBlur: 10
  ```

#### 5. Step Icons (Lucide)
- Completed: Category Lucide icon + color glow
- Next: `<Icon name="MapPin" />` with pulse
- Locked: `<Icon name="Lock" />` semi-transparent

#### 6. Player Avatar
- Glass border with tier color glow
- Soft drop shadow
- Pulsing animated ring

---

## Phase 4: Files to Update

### Priority 1 - Navigation icons (24 files)
- `app/(tabs)/index.tsx` - Home
- `app/(tabs)/settings.tsx` - Settings
- `app/(tabs)/leaderboard.tsx` - Leaderboard
- `app/(tabs)/profile.tsx` - Profile
- `app/game/adventure/index.tsx` - Adventure
- `app/duel/index.tsx` - Duel
- `app/party/setup.tsx` - Party
- All other screens with ← → ✓ icons

### Priority 2 - Game mode icons
- Category icons in questions
- Mode selection buttons on home
- Achievement icons

### Priority 3 - Mountain component
- `src/components/MountainProgress.tsx` - Full glassmorphism redesign

---

## Implementation Order

1. Install Lucide + create `Icon.tsx` wrapper
2. Create `GlassCard.tsx`, `IconButton.tsx`, `PrimaryButton.tsx`
3. Replace navigation icons (←, →) across all screens
4. Replace game mode emojis with Lucide
5. Update category icons
6. Redesign MountainProgress with glassmorphism
7. Polish remaining UI elements

---

## Success Criteria

- [ ] All emojis replaced with Lucide icons
- [ ] Consistent glass card style across app
- [ ] Mountain looks "App Store Featured" quality
- [ ] Smooth animations and transitions
- [ ] No visual regressions
- [ ] TypeScript compiles without errors
