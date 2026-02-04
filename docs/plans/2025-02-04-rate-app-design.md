# Rate the App - Design

## Overview

Système de notation in-app pour BIGHEAD avec redirection intelligente vers l'App Store.

## Comportement

### Déclenchement automatique
- Popup après **10 parties jouées**
- Si fermé ou note < 5 étoiles → redemander après **20 parties supplémentaires**
- Si 5 étoiles → ne plus jamais demander

### Flow utilisateur

```
[Popup "Tu aimes BIGHEAD ?"]
        ↓
[5 étoiles cliquables]
        ↓
   ┌────┴────┐
   ↓         ↓
[5 ★]    [< 5 ★]
   ↓         ↓
[Merci!]  [Feedback texte]
   ↓         ↓
[→ App Store] [→ Edge Function]
```

### Bouton Settings
- Ouvre le même modal directement
- Même logique de redirection

## Architecture

### Fichiers

| Fichier | Description |
|---------|-------------|
| `src/components/RatingModal.tsx` | Modal avec étoiles + feedback |
| `src/hooks/useRatingPrompt.ts` | Hook tracking + déclenchement |
| `src/services/rating.ts` | AsyncStorage + API calls |
| `supabase/functions/submit-feedback/` | Edge Function feedback |
| `supabase/migrations/xxx_app_feedback.sql` | Table feedback |

### Données AsyncStorage

```typescript
interface RatingData {
  games_played: number;
  rating_state: "pending" | "rated" | "dismissed" | "feedback_sent";
  rating_milestone: number; // 10, 30, 50...
  last_rating_prompt: string | null; // ISO timestamp
}
```

### Table `app_feedback`

```sql
CREATE TABLE app_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 4),
  feedback_text TEXT,
  app_version TEXT,
  device_info TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Edge Function `submit-feedback`

**Input:**
```json
{
  "rating": 3,
  "feedback_text": "Les questions sont trop faciles",
  "app_version": "1.1.0",
  "device_info": "iOS 17.2"
}
```

**Actions:**
1. Insert dans `app_feedback`
2. Envoyer email à contact@jrmanagement.org
3. Retourner success

## Intégration

### Écrans de résultats
Appeler `checkAndShowRating()` après:
- `app/game/results.tsx`
- `app/daily.tsx` (après réponse)

### Settings
Connecter le bouton existant "Rate the App" au modal.

## Dépendance

```bash
npx expo install expo-store-review
```

Utilise `StoreReview.requestReview()` pour l'API native iOS/Android.
