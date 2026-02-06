# Lessons Learned

## 2026-02-03: NativeWind styles not applying (30min debug)

### Symptôme
- Tous les styles Tailwind/NativeWind disparaissent
- L'app affiche du texte brut sans coins arrondis, sans grille, sans styles CSS
- Erreur dans les logs: `Cannot update a component while rendering` avec `CssInterop.Text`

### Cause racine
**`react-native-css-interop` manquait dans les dépendances.**

NativeWind 4.x dépend de `react-native-css-interop` mais ne l'installe pas automatiquement comme peer dependency. Après un `pnpm install` ou une réinstallation des node_modules, ce package peut disparaître.

### Solution
```bash
pnpm add react-native-css-interop
```

### Comment détecter
1. L'erreur `Unable to resolve "react-native-css-interop/jsx-runtime"` apparaît dans Metro
2. Ou l'erreur `CssInterop.Text` dans les logs React

### Prévention
- S'assurer que `react-native-css-interop` est bien dans `package.json` (pas juste installé en transitive)
- Après tout `pnpm install`, vérifier que les styles s'appliquent

---

## 2026-02-03: React error "Cannot update component while rendering"

### Symptôme
- Erreur: `Cannot update a component while rendering a different component`
- Pointe vers `Animated.Text` avec `className`

### Cause
Modifier une `sharedValue` de Reanimated directement dans le corps du composant (pendant le render) au lieu d'un `useEffect`.

### Mauvais code
```tsx
function TabBarIcon({ focused }) {
  const scale = useSharedValue(1);

  // ❌ MAUVAIS: modification pendant le render
  if (focused) {
    scale.value = withSpring(1.1);
  }
}
```

### Bon code
```tsx
function TabBarIcon({ focused }) {
  const scale = useSharedValue(1);

  // ✅ BON: modification dans useEffect
  useEffect(() => {
    scale.value = withSpring(focused ? 1.1 : 1);
  }, [focused]);
}
```

### Note additionnelle
Éviter `className` sur `Animated.Text` avec NativeWind 4.x - utiliser `style` directement pour les composants animés.

---

## 2026-02-03: Système i18n BigHead

### Architecture
```
src/i18n/translations.ts     - Toutes les traductions EN/FR
src/contexts/LanguageContext.tsx - Provider + hooks
```

### Usage dans un component
```tsx
import { useTranslation } from "../src/contexts/LanguageContext";

export default function MyScreen() {
  const { t } = useTranslation();

  return <Text>{t("keyName")}</Text>;
}
```

### Pour un sous-component sans hook
Passer `t` en prop :
```tsx
function SubComponent({ t }: { t: (key: TranslationKey) => string }) {
  return <Text>{t("locked")}</Text>;
}

// Dans le parent:
import type { TranslationKey } from "../src/i18n/translations";
<SubComponent t={t} />
```

### Règles
- Langue par défaut : FR
- Fallback : EN si clé manquante, puis la clé elle-même
- Persistance : Supabase user settings
- Changement : `setLanguage("en")` ou `setLanguage("fr")`

### Screens traduits
- Homepage (`app/(tabs)/index.tsx`)
- Achievements (`app/achievements.tsx`)
- Party Setup (`app/party/setup.tsx`)
- Invite (`app/invite.tsx`)
- Settings (`app/(tabs)/settings.tsx`)

---

## 2026-02-03: Calcul de niveau XP

### Formule
```typescript
// XP requis pour atteindre le niveau N
const getXPForLevel = (level: number): number => {
  return Math.floor(100 * Math.pow(1.5, level - 1));
};

// Calcul niveau depuis XP total
const calculateLevel = (totalXP: number) => {
  let level = 1;
  let xpRemaining = totalXP;

  while (xpRemaining >= getXPForLevel(level)) {
    xpRemaining -= getXPForLevel(level);
    level++;
  }

  const nextLevelXP = getXPForLevel(level);
  const progress = (xpRemaining / nextLevelXP) * 100;

  return { level, currentXP: xpRemaining, nextLevelXP, progress };
};
```

### Table XP par niveau
- Level 1: 100 XP
- Level 2: 150 XP
- Level 3: 225 XP
- Level 4: 337 XP
- Level 5: 506 XP
- ...

### Source de l'XP
- `profile.total_xp` dans Supabase
- Gagné via achievements (xp_reward de chaque achievement)
