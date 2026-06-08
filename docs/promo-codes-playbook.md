# Promo Codes Playbook

Apple t'accorde **100 codes promo Premium par trimestre** (gratuit, illimité dans le temps une fois généré, expire 28 jours après émission). Utilisable pour offrir l'abonnement Premium sans paiement.

## Comment générer

1. **App Store Connect → My Apps → BIGHEAD → Distribution → Promo Codes**
2. Choisir l'IAP/Subscription concerné (ton produit Premium RevenueCat)
3. Définir la quantité (max 100 / trimestre)
4. Télécharger le CSV des codes

Chaque code est valable **28 jours** après génération — donc générer juste avant l'usage.

## Cas d'usage à fort ROI

### 1. Seeding micro-influenceurs FR (priorité 1)

**Cible** : créateurs IG/TT avec 10k-100k abonnés dans niche quiz/devinettes/educational

**Pitch DM type** :

> Salut [name], je suis Julien, dev solo de BigHead — l'app de quiz culture G qui cartonne en FR (10k+ questions, duels async type Trivia Crack). J'ai vu ta vidéo sur [topic], ton audience matche pile.
>
> Je t'envoie un code Premium gratuit (3 mois) — si tu veux tester et partager honnêtement ton avis avec tes abonnés, ça serait fou. Pas de contrat, pas d'obligation, juste un essai gratuit.
>
> Code : `XXXX-YYYY-ZZZZ`
> Lien dl : https://apps.apple.com/app/id6758253365

**Volume** : 20 codes / mois sur 5 niches (food, sport, ciné, culture G, voyage)
**CPI implicite** : 0€ (juste du temps de DM)
**Conversion typique** : 1/20 créateurs accepte de tester + parle de l'app → 1-3k installs par mention

### 2. Récompense beta testers TestFlight (priorité 2)

Les users actuels en TestFlight qui ont laissé des feedbacks → leur offrir Premium en remerciement.

```
Salut, merci pour ton feedback sur BigHead. Voici un code Premium 1 an :
XXXX-YYYY-ZZZZ
Profite ! 🎯
```

**Volume** : 5-10 codes

### 3. Réviewers presse FR (priorité 3 — après ASO refresh)

Cible : journalistes Frandroid, Numerama, Presse-Citron, Maddyness qui couvrent les apps trivia/casual.

**Pitch email** :
> Sujet : BigHead — l'app de quiz culture G qui réinvente Trivia Crack pour le marché FR
>
> Bonjour [name],
> Je suis le créateur de BigHead, app trivia FR/EN sortie en février qui vient de shipper le mode duel async (10 questions, 48h pour répondre). J'aimerais te proposer un test du Premium pour ton article.
>
> Code Premium : XXXX-YYYY-ZZZZ
> Press kit : https://bighead.jrmanagement.org/press
>
> Dispo pour répondre à toute question.

**Volume** : 5-10 codes ciblés

### 4. Giveaways communautés Reddit / Discord

Reddit r/AskFrance, r/france, r/jeuxvideo, Discord serveurs trivia → giveaways avec 5-10 codes par campagne.

**Format** : « Tu écris ta meilleure anecdote de culture G en commentaire → 10 codes Premium 3 mois aux 10 meilleurs »

**Volume** : 50 codes / trimestre

---

## Tracking

Comme les codes promo passent par App Store (et non par RevenueCat directement), tu peux les tracker via :

1. **App Store Connect Reports** → Redeem code activity (par trimestre)
2. **Tag chaque batch** : note dans un Google Sheet quel code a été donné à qui + canal → permet de mesurer la conversion par canal

Format suggéré :
| Code | Canal | Recipient | Date émis | Date redeem | Active subscription? |
|---|---|---|---|---|---|
| XXXX-1 | Influencer-FR-IG-quiz | @mia_trivia | 2026-06-10 | 2026-06-12 | ✅ |
| XXXX-2 | Press-FR | Frandroid | 2026-06-10 | — | ❌ |

---

## Calendrier 2026 Q3 (juin-août)

| Mois | Allocation | Cible |
|---|---|---|
| Juin | 30 codes | 20 influenceurs + 10 beta testers |
| Juillet | 35 codes | 25 influenceurs + 10 reddit giveaway |
| Août | 35 codes | 25 influenceurs + 10 presse |
| **Total** | **100/100** | — |

---

## ⚠️ Ce qu'il NE faut PAS faire

- ❌ Distribuer publiquement les codes sur Twitter / Reddit ouvert (sera scraped en 5 min)
- ❌ Demander un review en échange (interdit Apple guidelines + risque ban)
- ❌ Garder les codes en stock — ils expirent 28 jours après émission

---

## Mesure du succès (KPI à 30j post-distribution)

| Métrique | Cible |
|---|---|
| Codes utilisés | >70% |
| Conversion vers Premium payant après les 3 mois offerts | >15% |
| Posts/mentions générés par influenceurs | >10/mois |
| Installs attribuables (via referral attribution si configurée) | >500/mois |
