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
