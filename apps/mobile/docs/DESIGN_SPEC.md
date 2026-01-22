# BIGHEAD Design System Specification

## Overview

**App Name:** BIGHEAD - Quiz Football
**Platform:** iOS & Android (React Native / Expo)
**Theme:** Dark mode only
**Language:** French
**Target:** Mobile-first, casual gamers, football fans

---

## 1. Design Tokens

### 1.1 Color Palette

#### Brand Colors
```
Primary (Sky Blue)
├── 50:  #f0f9ff
├── 100: #e0f2fe
├── 200: #bae6fd
├── 300: #7dd3fc
├── 400: #38bdf8
├── 500: #0ea5e9  ← Main brand color
├── 600: #0284c7
├── 700: #0369a1
├── 800: #075985
└── 900: #0c4a6e

Accent (Fuchsia)
├── 500: #d946ef  ← Secondary accent
├── 600: #c026d3
└── 700: #a21caf
```

#### Semantic Colors
```
Success (Green)
├── 400: #4ade80
├── 500: #22c55e
└── 600: #16a34a

Error (Red)
├── 400: #f87171
├── 500: #ef4444
└── 600: #dc2626

Warning (Amber)
├── 400: #fbbf24
├── 500: #f59e0b
└── 600: #d97706
```

#### Chain Multiplier Colors
```
1x:  #6b7280 (Gray)
2x:  #22c55e (Green)
3x:  #3b82f6 (Blue)
5x:  #8b5cf6 (Purple)
8x:  #f97316 (Orange)
10x: #ef4444 (Red - MAX)
```

#### Background Colors
```
bg-gray-900: #111827  ← Main background
bg-gray-800: #1f2937  ← Cards, containers
bg-gray-700: #374151  ← Buttons secondary, inputs
bg-gray-600: #4b5563  ← Borders, dividers
```

#### Text Colors
```
text-white:    #ffffff  ← Primary text
text-gray-400: #9ca3af  ← Secondary text, labels
text-gray-500: #6b7280  ← Tertiary, hints
text-gray-600: #4b5563  ← Disabled text
```

### 1.2 Typography

#### Font Family
- **Primary:** System font (San Francisco on iOS, Roboto on Android)
- **Weights:** Regular (400), Medium (500), Semibold (600), Bold (700)

#### Scale
```
text-xs:   12px  ← Labels, hints
text-sm:   14px  ← Secondary text
text-base: 16px  ← Body text
text-lg:   18px  ← Section headers
text-xl:   20px  ← Card titles
text-2xl:  24px  ← Screen titles
text-3xl:  30px  ← Large numbers
text-4xl:  36px  ← Hero numbers
text-5xl:  48px  ← App title (BIGHEAD)
text-6xl:  60px  ← Emoji icons
text-7xl:  72px  ← Result emoji
text-8xl:  96px  ← Waiting screen emoji
```

### 1.3 Spacing

```
Base unit: 4px

p-2:  8px   ← Icon touch targets
p-3:  12px  ← Small padding
p-4:  16px  ← Standard padding
p-5:  20px  ← Card padding
p-6:  24px  ← Section padding
p-8:  32px  ← Large spacing

px-6: 24px  ← Horizontal screen padding
py-4: 16px  ← Vertical section spacing

gap-3: 12px ← List item spacing
gap-4: 16px ← Card grid spacing

mb-4: 16px  ← Standard margin bottom
mb-6: 24px  ← Section margin bottom
mb-8: 32px  ← Large section margin
```

### 1.4 Border Radius

```
rounded-lg:   8px   ← Buttons, inputs
rounded-xl:   12px  ← Cards small
rounded-2xl:  16px  ← Cards large
rounded-full: 50%   ← Avatars, badges
```

### 1.5 Shadows & Effects

- **Opacity variations:** 20%, 30%, 50% for overlays
- **Gradient backgrounds:** from-x/20 to-y/20 for cards
- **Border colors:** color-500/30 for highlighted cards
- **Active state:** active:opacity-80 for press feedback

---

## 2. Component Library

### 2.1 Buttons

#### Primary Button
```
bg-primary-500 rounded-xl py-4 px-6
text-white font-bold text-lg text-center
Active: active:opacity-80
Disabled: bg-primary-500/50
```

#### Secondary Button
```
bg-gray-700 rounded-xl py-4 px-6
text-white font-medium text-center
Active: active:opacity-80
```

#### Ghost Button
```
bg-color-500/20 border border-color-500/30 rounded-xl py-4 px-6
text-color-400 font-medium text-center
```

#### Danger Button
```
bg-red-500/20 rounded-xl py-4
text-red-400 font-bold text-center
```

#### Icon Button
```
p-2 (touch target 44x44)
text-white text-2xl
```

### 2.2 Cards

#### Standard Card
```
bg-gray-800 rounded-2xl p-6
```

#### Highlighted Card (with gradient)
```
bg-gradient-to-r from-color-500/20 to-color-500/20
border border-color-500/30 rounded-2xl p-4
```

#### Game Mode Card
```
bg-color-600 rounded-2xl p-5
Icon: text-3xl
Title: text-white text-xl font-bold
Description: text-white/80 text-sm
```

#### Stat Card
```
bg-gray-800 rounded-xl p-4 items-center
Value: text-color-400 text-2xl font-bold
Label: text-gray-400 text-xs
```

### 2.3 Navigation

#### Header
```
flex-row items-center px-6 pt-4 mb-4
Back: ← text-white text-2xl
Title: text-white text-2xl font-bold
```

#### Bottom Tab Bar
```
flex-row justify-around py-4
border-t border-gray-800 bg-gray-900
Active: text-primary-400
Inactive: text-gray-400
Icon: text-2xl mb-1
Label: text-xs
```

#### Tab Switcher
```
flex-row
Active tab: bg-primary-500 rounded-l-xl or rounded-r-xl py-3
Inactive: bg-gray-700
Text active: text-white font-bold
Text inactive: text-gray-400
```

### 2.4 Lists

#### Achievement Row
```
flex-row items-center p-4 rounded-xl mb-3
Unlocked: bg-primary-500/20 border border-primary-500/30
Locked: bg-gray-800
Icon container: w-14 h-14 rounded-xl items-center justify-center
```

#### Leaderboard Row
```
flex-row items-center py-3 px-3 rounded-xl mb-1
Current user: bg-primary-500/20
Rank: w-10 text-gray-500
Avatar: w-10 h-10 rounded-full bg-gray-700
```

#### Setting Row
```
flex-row items-center py-4
border-b border-gray-700
Icon: text-2xl mr-4
Toggle: Switch component
```

### 2.5 Form Elements

#### Text Input
```
bg-gray-700 text-white px-4 py-3 rounded-xl text-base
Placeholder: text-gray-500
Label: text-gray-400 mb-2
```

#### Switch
```
trackColor: false=#374151, true=#0ea5e9
thumbColor: #ffffff
```

#### Segmented Control (Tabs)
```
flex-row
Segment: flex-1 py-3
Active: bg-primary-500 rounded-l-xl or rounded-r-xl
Inactive: bg-gray-700
```

### 2.6 Overlays

#### Bottom Sheet (Auth Modal)
```
backgroundColor: #1f2937
handleIndicatorStyle: backgroundColor=#6b7280
snapPoints: 70%
```

#### Error Banner
```
bg-red-500/20 border border-red-500 rounded-xl p-3
text-red-400 text-center
```

### 2.7 Progress Indicators

#### Progress Bar
```
Container: h-2 or h-3 bg-gray-700 rounded-full overflow-hidden
Fill: h-full bg-primary-500 rounded-full
```

#### Timer Circle
```
w-16 h-16 rounded-full items-center justify-center
Normal: bg-gray-700
Danger (<5s): bg-red-500
Text: text-white text-2xl font-bold
```

#### Loading Spinner
```
ActivityIndicator size="large" color="#0ea5e9"
```

### 2.8 Badges

#### NEW Badge
```
bg-color-500/30 rounded-full px-2 py-1
text-color-400 text-xs font-bold
```

#### XP Badge
```
bg-yellow-500/20 rounded-full px-4 py-2
text-yellow-400 font-bold
```

#### Streak Badge
```
bg-orange-500/20 rounded-full px-3 py-1
Icon: 🔥 text-lg
Value: text-orange-400 font-bold
```

### 2.9 Game HUD

#### Chain Multiplier
```
rounded-full px-4 py-2 min-w-[60px] items-center
Colors based on chain value (see 1.1)
text-white font-bold text-lg
```

#### Score Display
```
Label: text-gray-400 text-sm
Value: text-white text-3xl font-bold
```

#### Answer Button
```
Default: bg-gray-700 border-2 border-transparent rounded-xl py-4 px-6
Correct: bg-green-600 border-green-400
Wrong: bg-red-600 border-red-400
Disabled: disabled opacity
```

#### Result Feedback
```
Correct: bg-green-900/50 rounded-xl py-3 px-4
         text-green-400 font-bold text-lg
Wrong: bg-red-900/50 rounded-xl py-3 px-4
       text-red-400 font-bold text-lg
```

---

## 3. Screen States

### 3.1 Loading State
```jsx
<SafeAreaView className="flex-1 bg-gray-900 items-center justify-center">
  <ActivityIndicator size="large" color="#0ea5e9" />
  <Text className="text-white mt-4 text-lg">Chargement...</Text>
</SafeAreaView>
```

### 3.2 Empty State
```jsx
<View className="flex-1 items-center justify-center px-6">
  <Text className="text-6xl mb-4">{emoji}</Text>
  <Text className="text-white text-xl font-bold text-center mb-2">
    {title}
  </Text>
  <Text className="text-gray-400 text-center mb-6">
    {description}
  </Text>
  <Pressable className="bg-primary-500 rounded-xl py-3 px-8">
    <Text className="text-white font-bold">{actionLabel}</Text>
  </Pressable>
</View>
```

### 3.3 Error State
```jsx
<View className="bg-red-500/20 border border-red-500 rounded-xl p-3 mb-4">
  <Text className="text-red-400 text-center">{errorMessage}</Text>
</View>
```

### 3.4 Anonymous User Prompt
```jsx
<Pressable className="bg-gradient-to-r from-primary-500/20 to-accent-500/20 rounded-xl p-4">
  <Text className="text-white font-bold mb-1">Crée un compte</Text>
  <Text className="text-gray-400 text-sm">{message}</Text>
</Pressable>
```

---

## 4. Animations & Interactions

### 4.1 React Native Reanimated

#### Pulse Animation (Waiting screen)
```typescript
const scale = useSharedValue(1);
scale.value = withRepeat(
  withTiming(1.1, { duration: 1000 }),
  -1,
  true
);
```

#### Slide Animation (Onboarding)
```typescript
const translateX = useSharedValue(0);
translateX.value = withSpring(-index * width, { damping: 20 });
```

### 4.2 Haptic Feedback
- **light:** Toggle switches, navigation
- **medium:** Button press
- **success:** Correct answer, achievement unlocked
- **error:** Wrong answer

### 4.3 Transitions
- **Screen navigation:** Default expo-router transitions
- **Bottom sheet:** Spring animation with pan-to-close
- **List items:** No animation (performance)

---

## 5. Iconography

### 5.1 Emoji Icons (Primary)
```
Navigation:
🏠 Home    🏅 Achievements    📊 Leaderboard
👤 Profile ⚙️ Settings        ← Back

Game Modes:
⚡ Quick Play    🔗 Chain Reaction    🎉 Party Mode
⚔️ Duel 1v1     🏆 Tournament        🎯 Daily Challenge

Status:
✅ Completed    🔒 Locked    ✓ Unlocked
🔔 Notifications 🔊 Sound   📳 Vibration

Feedback:
🏆 Excellent (90%+)    ⭐ Very good (70%+)
👍 Good (50%+)         💪 Keep trying
🔥 Streak              ⏳ Waiting
```

### 5.2 Text Symbols
```
← Back arrow
× Close button
→ Chevron right
```

---

## 6. Layout Patterns

### 6.1 Screen Structure
```
SafeAreaView (bg-gray-900)
├── Header (px-6 pt-4 mb-4)
│   ├── Back button
│   └── Title
├── Content (ScrollView px-6)
│   ├── Section title
│   ├── Cards/Lists
│   └── Spacing (mb-6)
└── Bottom element (fixed)
    └── Tab bar / Action button
```

### 6.2 Card Grid
```
flex-row gap-3 or gap-4
flex-1 for equal width
```

### 6.3 Stats Row
```
flex-row justify-between or justify-around
Dividers: w-px bg-gray-700
```

---

## 7. Responsive Guidelines

### 7.1 Safe Areas
- Use `SafeAreaView` for all screens
- `pt-4` for content below status bar
- `pb-6` for content above home indicator

### 7.2 Touch Targets
- Minimum: 44x44 pixels
- Buttons: py-4 (16px top/bottom)
- Icon buttons: p-2 minimum

### 7.3 Text Truncation
- Use `numberOfLines={1}` for usernames
- Ellipsis for overflow

---

## 8. Accessibility

### 8.1 Colors
- All text meets WCAG AA contrast ratio
- Color is not the only indicator (icons + color)

### 8.2 Interactive Elements
- Clear touch targets
- Disabled states clearly visible (opacity-50)

---

## Appendix: Tailwind Classes Quick Reference

```
/* Backgrounds */
bg-gray-900    /* Screen background */
bg-gray-800    /* Card background */
bg-gray-700    /* Input background */
bg-primary-500 /* Primary button */

/* Text */
text-white     /* Primary text */
text-gray-400  /* Secondary text */
text-primary-400 /* Highlighted text */

/* Borders */
border-gray-700    /* Dividers */
border-color-500/30 /* Card highlights */
rounded-xl      /* Standard radius */
rounded-2xl     /* Large radius */

/* Spacing */
px-6 py-4      /* Screen padding */
gap-3          /* List spacing */
mb-4 mb-6      /* Margins */

/* Layout */
flex-1         /* Flex grow */
flex-row       /* Horizontal layout */
items-center   /* Center align */
justify-between /* Space between */
```
