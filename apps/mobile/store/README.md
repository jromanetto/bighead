# Store Assets Guide

## Assets à créer pour le lancement

### App Icon
- **icon.png**: 1024x1024px (iOS App Store)
- **adaptive-icon.png**: 1024x1024px (Android foreground)
- **notification-icon.png**: 96x96px (Android notifications, blanc sur transparent)

### Splash Screen
- **splash-icon.png**: 288x288px (logo centré)
- Couleur de fond: #111827 (gray-900)

### Screenshots App Store (iPhone)
Tailles requises pour iPhone 6.7":
- 1290 x 2796 px

Screenshots à créer:
1. Écran d'accueil avec le nom BIGHEAD
2. Mode Chain Reaction en jeu
3. Défi du jour
4. Classement
5. Mode Duel 1v1

### Screenshots Play Store (Android)
Taille recommandée:
- 1080 x 1920 px (minimum)

### Feature Graphic (Play Store)
- 1024 x 500 px

## Commandes EAS Build

### Build de développement
```bash
eas build --profile development --platform ios
eas build --profile development --platform android
```

### Build de preview (TestFlight / Internal Testing)
```bash
eas build --profile preview --platform ios
eas build --profile preview --platform android
```

### Build de production
```bash
eas build --profile production --platform ios
eas build --profile production --platform android
```

### Soumettre aux stores
```bash
eas submit --platform ios
eas submit --platform android
```

## Configuration requise

### iOS (App Store Connect)
1. Créer une app sur App Store Connect
2. Configurer les métadonnées (voir metadata.json)
3. Ajouter les screenshots
4. Configurer l'Apple ID dans eas.json

### Android (Google Play Console)
1. Créer une app sur Google Play Console
2. Générer une clé de service Google (google-services-key.json)
3. Configurer le track (internal/alpha/beta/production)
4. Ajouter les screenshots et feature graphic

## Variables d'environnement

Configurer dans EAS Secrets:
- EXPO_PUBLIC_SUPABASE_URL
- EXPO_PUBLIC_SUPABASE_ANON_KEY
