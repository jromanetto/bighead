# BigHead - Refonte Premium & Freemium

**Date:** 3 Février 2026
**Statut:** Validé
**Contexte:** Rejet Apple App Store (IAP non trouvés) + refonte du modèle de monétisation

---

## 1. Contexte

Apple a rejeté la version 1.0 car :
- Les IAP ont le statut "Métadonnées manquantes" (screenshot review manquant)
- Les product IDs ne matchaient pas entre le code et App Store Connect

De plus, la page Premium actuelle affiche des features qui n'existent pas/plus (No Ads, Exclusive Themes, Duel réservé Premium).

---

## 2. Nouveau modèle Freemium

### Limites quotidiennes

| Mode | Gratuit | Premium |
|------|---------|---------|
| Daily Brain | 1x/jour (par design) | 1x/jour |
| Aventure | 2/jour | ♾️ Illimité |
| Solo Run | 2/jour | ♾️ Illimité |
| Famille | 3/jour | ♾️ Illimité |
| Party | 2/jour | ♾️ Illimité |
| Versus | 3/jour | ♾️ Illimité |

### Features Premium

1. **♾️ Parties illimitées** — Joue sans limite, tous les modes
2. **📊 Stats avancées** — Analyse détaillée de ta progression
3. **⚡ Accès anticipé** — Nouveaux modes en avant-première
4. **🏆 Badge Premium** — Visible dans les classements

---

## 3. Architecture technique

### 3.1 Stockage des limites (AsyncStorage)

```typescript
// Clé: "daily_usage"
{
  date: "2026-02-03",  // Reset auto si date différente
  adventure: 0,        // max 2
  solo_run: 0,         // max 2
  family: 0,           // max 3
  party: 0,            // max 2
  versus: 0            // max 3
}
```

### 3.2 Service de limites

**Fichier:** `src/services/dailyLimits.ts`

```typescript
const LIMITS = {
  adventure: 2,
  solo_run: 2,
  family: 3,
  party: 2,
  versus: 3,
};

// API
canPlay(mode: string): Promise<boolean>
getRemainingPlays(mode: string): Promise<number>
recordPlay(mode: string): Promise<void>
getAllLimits(): Promise<Record<string, {used: number, max: number}>>
```

### 3.3 Intégration dans les écrans de jeu

```typescript
// Avant de lancer une partie
const remaining = await getRemainingPlays("adventure");
if (remaining <= 0 && !isPremium) {
  showLimitReachedModal("adventure");
  return;
}

// Après la partie terminée
await recordPlay("adventure");
```

---

## 4. UI Components

### 4.1 Page Premium refaite

- Hero card doré (style existant)
- Section features (4 items)
- **Nouvelle section** "Tes limites aujourd'hui" avec barres de progression
- Boutons Subscribe / Restore

### 4.2 Modal "Limite atteinte"

**Composant:** `LimitReachedModal`

**Props:**
- `mode: string`
- `isVisible: boolean`
- `onClose: () => void`
- `onGoPremium: () => void`

**Contenu:**
- Emoji 😅
- Titre "Limite atteinte !"
- Message avec le nombre de parties utilisées
- Bouton principal "👑 Passer Premium"
- Bouton secondaire "Revenir demain"

---

## 5. Corrections App Store Connect

### 5.1 Product ID corrigé

```typescript
// monetization.ts - CORRIGÉ
PREMIUM_MONTHLY: "bighead_premium_month"  // était "bighead_premium_monthly"
```

### 5.2 Métadonnées à compléter

Pour chaque abonnement dans App Store Connect :
1. Ajouter screenshot de review (page Premium de l'app)
2. Vérifier durée et prix
3. Lier les IAP à la version 1.0 de l'app

---

## 6. Todos

### Priorité haute (bloque App Store)
- [ ] Implémenter service de limites quotidiennes
- [ ] Refaire page Premium avec nouvelles features
- [ ] Créer modal "Limite atteinte"
- [ ] Prendre screenshot page Premium pour App Store Connect
- [ ] Compléter métadonnées IAP dans App Store Connect
- [ ] Rebuild et resoumettre

### Priorité moyenne
- [ ] Fixer notifications Daily Brain
- [ ] Traduire nouveaux textes EN/FR (limites, modal, features)

### À explorer
- [ ] Revoir système de difficulté (adapter au mode: Famille=facile, etc.)
- [ ] Générer plus de questions (toutes catégories, 2 langues, sans répétition)
- [ ] Génération auto de questions quand user a fait le tour

---

## 7. Ordre d'implémentation recommandé

1. **Service dailyLimits.ts** — base technique
2. **LimitReachedModal** — composant réutilisable
3. **Page Premium** — refonte complète
4. **Intégration** — ajouter checks dans chaque mode de jeu
5. **Traductions** — EN/FR
6. **Screenshot** — capturer pour Apple
7. **App Store Connect** — finaliser métadonnées
8. **Build & Submit**
