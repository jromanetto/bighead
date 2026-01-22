# BIGHEAD - Mobile App

Quiz football mobile app built with Expo + React Native.

## Tech Stack

- **Framework**: Expo SDK 54 + React Native
- **Navigation**: expo-router (file-based)
- **Styling**: NativeWind (Tailwind CSS)
- **Backend**: Supabase (auth, database, realtime)
- **Animations**: React Native Reanimated + Gesture Handler
- **Effects**: @shopify/react-native-skia (installed)

## Project Structure

```
apps/mobile/
├── app/                    # Expo Router screens
│   ├── index.tsx          # Home
│   ├── game/              # Chain game, results
│   ├── party/             # Local multiplayer
│   ├── duel/              # 1v1 online
│   ├── tournament/        # Weekly tournaments
│   └── ...
├── src/
│   ├── components/        # Reusable components
│   │   ├── effects/       # Visual effects (ConfettiEffect)
│   │   ├── AuthModal.tsx
│   │   └── UpgradePrompt.tsx
│   ├── contexts/          # AuthContext
│   ├── services/          # Supabase services
│   └── lib/               # Utilities
├── docs/                  # Design documentation
│   ├── DESIGN_SPEC.md     # Complete design system
│   ├── SCREEN_MAP.json    # Routes/components map
│   ├── FIGMA_MAKE_PROMPT.txt  # Prompt for Figma Make AI
│   ├── ADVANCED_EFFECTS.md    # Animations guide
│   └── screenshots/       # UI screenshots
└── tailwind.config.js     # Design tokens
```

## Design System

Colors defined in `tailwind.config.js`:
- **Primary**: Sky blue (#0ea5e9)
- **Accent**: Fuchsia (#d946ef)
- **Success**: Green (#22c55e)
- **Error**: Red (#ef4444)
- **Background**: Gray-900 (#111827)

## Current Features

- [x] Anonymous + authenticated users
- [x] Chain Reaction game mode
- [x] Score saving to Supabase
- [x] Leaderboard (weekly/all-time)
- [x] Achievements system
- [x] Daily challenge
- [x] Duel 1v1 (realtime)
- [x] Tournaments
- [x] Push notifications
- [x] Confetti effect on good results

## MCP Servers

### Figma MCP (configured)
- Remote: `https://mcp.figma.com/mcp` (needs auth)
- Desktop: `http://127.0.0.1:3845/mcp`

Use `/figma:implement-design` with Figma URLs to import designs.

## Figma MCP Integration Rules

### Component Organization
- UI components are in `src/components/`
- Use NativeWind (Tailwind) for styling

### Figma Implementation Flow
1. Run get_design_context for the node
2. Run get_screenshot for visual reference
3. Map Figma colors to Tailwind tokens in `tailwind.config.js`
4. Reuse components from `src/components/` when possible
5. Validate against screenshot before completing

### Asset Rules
- IMPORTANT: Use localhost sources from Figma MCP server directly
- DO NOT install new icon libraries

## Custom Skills

- `mobile-design-system` - Bidirectional Code ↔ Figma workflow
  - Location: `~/.claude/skills/mobile-design-system/SKILL.md`

## Dev Commands

```bash
# Start dev server
npx expo start --web

# Build
eas build --profile preview --platform ios

# Deploy
eas submit --platform ios
```
