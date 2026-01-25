# Mountain & Wheel Redesign

## Overview

Redesign the Adventure mode visuals to be more professional and engaging, with progressive difficulty through tiered question counts.

## 1. Tiered Question Count System

### Configuration

| Tier Level | Tiers | Questions per Category |
|------------|-------|----------------------|
| Easy | Coton, Carton, Bois, Bronze | 5 |
| Medium | Argent, Gold, Platinium, Titane | 8 |
| Hard | Diamant, Mythique, Legendaire | 10 |

### Implementation

- New function `getQuestionsForTier(tier: Tier): number`
- Dynamic display in CategoryWheel result
- Faster early progression to hook new players

## 2. Mountain "Altitude" Design

### Visual Structure (bottom to top)

```
SUMMIT - Golden star (animated pulse + slow rotation)
         Snow with sparkle particles

CAMP 3 - Glacial Zone (Diamant → Legendaire)
         White/blue tents, flags, animated wind

CAMP 2 - Rocky Zone (Argent → Titane)
         Gray tents, rocks, passing clouds

CAMP 1 - Forest Zone (Coton → Bronze)
         Green/brown tents, trees, animated birds

BASE -   Starting village
         Campfire with animated smoke
```

### Zigzag Trail

- Visible path winding between camps
- Completed section = illuminated (cyan glow)
- Upcoming section = gray dotted line
- Character positioned on path based on progress

### Skia Effects

- **Parallax**: clouds move at different speed than background
- **Snow particles**: falling at mountain top
- **Animated smoke**: rising from base camp
- **Atmospheric gradient**: lighter/bluer as altitude increases
- **Golden glow**: around summit

### Tier Indicators

- Small flags on trail with tier icon
- Current flag is larger and glows

## 3. Premium Fortune Wheel (Skia)

### Wheel Structure

- 11 colored segments (one per category)
- Each segment has radial gradient (bright → dark)
- Golden border between segments (1px with glow)
- Completed categories = grayed segment + checkmark

### Center

- Chrome metallic effect (circular gradient)
- Wheel emoji or logo
- Pulsing light ring

### Outer Border

- Double ring: inner cyan, outer gold
- Beveled 3D effect with shadows
- Decorative notches between segments

### Spin Animation

- Motion blur during fast rotation (Skia Blur)
- Realistic easing (fast start, slow end)
- Subtle bounce at stop

### Selection Effects

- Winning segment illuminates (intense glow)
- Golden particle explosion
- Segment scales up (1.1x)
- Haptic feedback

## Files to Modify

1. `src/types/adventure.ts` - Add `getQuestionsForTier()` function
2. `src/components/MountainProgress.tsx` - Complete redesign
3. `src/components/CategoryWheel.tsx` - Complete redesign with Skia
4. `app/game/adventure/play.tsx` - Use dynamic question count
5. `app/game/adventure/index.tsx` - Minor UI updates

## Design Tokens

```typescript
const MOUNTAIN_COLORS = {
  sky: ['#0f0c29', '#302b63', '#24243e'],
  snow: ['#ffffff', '#e8f4f8', '#c9d6df'],
  rock: ['#4a4a4a', '#2d2d2d', '#1a1a1a'],
  forest: ['#1a472a', '#2d5a3d', '#0f2d1a'],
  trail: {
    completed: '#00c2cc',
    upcoming: 'rgba(255,255,255,0.2)',
  },
};

const WHEEL_COLORS = {
  border: {
    inner: '#00c2cc',
    outer: '#FFD700',
  },
  chrome: ['#e8e8e8', '#b8b8b8', '#888888', '#b8b8b8', '#e8e8e8'],
  glow: 'rgba(255, 215, 0, 0.6)',
};
```
