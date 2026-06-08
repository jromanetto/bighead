# In-App Events — copy-paste pack pour App Store Connect

Les 4 events à créer dans **App Store Connect → Distribution → In-App Events**.

Pour chaque event, Apple demande :
- **Event Name** (30 chars max) — affiché gras dans la liste
- **Short Description** (50 chars max) — sous le nom
- **Long Description** (120 chars max) — page event détaillée
- **Event Card** (1920×1080 PNG/JPG) — image principale
- **Event Card Short** (1080×1080 — optionnel, square)
- **Event Type** : choisir dans la liste Apple
- **Priority** : Standard / Special Event / Major Update
- **Region** : sélectionner FR + EN minimum
- **Schedule** : Start date / Publish date / End date

---

## 🥇 Event 1 — Async Duel Launch (priorité 1, à publier en premier)

**Image** : [docs/aso-events/01-async-duel-fr.png](aso-events/01-async-duel-fr.png) + EN
**Event Type** : `New Feature`
**Priority** : `Major Update`
**Schedule** : publier dès que ASC l'approuve, durée 4 semaines

### FR
| Champ | Texte | Caract. |
|---|---|---|
| Event Name | `Duels Async 1v1` | 15 |
| Short Description | `Défie tes amis sur 10 questions, 48h` | 38 |
| Long Description | `Nouveau mode duel asynchrone : 10 questions, 48h pour répondre. Le score apparaît à la fin !` | 96 |

### EN
| Champ | Texte | Caract. |
|---|---|---|
| Event Name | `Async 1v1 Duels` | 15 |
| Short Description | `Challenge friends on 10 questions, 48h` | 39 |
| Long Description | `New async duel mode: 10 questions, 48h to answer. Score reveals at the end!` | 76 |

---

## 🥈 Event 2 — Weekly Themed Quiz (récurrent, relancé chaque vendredi)

**Image** : `docs/aso-events/02-weekly-belgique-fr.png` + EN
**Event Type** : `Special Event`
**Priority** : `Standard`
**Schedule** : démarre chaque vendredi 08h00, dure 7 jours
**Stratégie** : créer 1 event par thème en avance (Belgique, Espace, Japon, Tour de France, etc.) → tu en as 5 stockés, planifie 5 events à la suite.

### FR (Belgique exemple, à dupliquer par thème)
| Champ | Texte | Caract. |
|---|---|---|
| Event Name | `Quiz Belgique 🇧🇪` | 17 |
| Short Description | `30 questions sur le plat pays` | 30 |
| Long Description | `Cette semaine sur BigHead : 30 questions sur la Belgique. Frites, BD, Tintin, géographie & plus.` | 96 |

### EN
| Champ | Texte | Caract. |
|---|---|---|
| Event Name | `Belgium Quiz 🇧🇪` | 15 |
| Short Description | `30 trivia questions on Belgium` | 31 |
| Long Description | `This week on BigHead: 30 questions about Belgium. Fries, comics, Tintin, geography & more.` | 90 |

### Thèmes à dupliquer (mêmes copies, juste change le pays)
- 🚀 Espace (15-21 juin)
- 🇯🇵 Japon (22-28 juin)
- 🚴 Tour de France (29 juin - 5 juillet)
- 🍜 Cuisines du monde (6-12 juillet)
- 🦖 Dinosaures (13-19 juillet)

---

## 🥉 Event 3 — News Quiz (récurrent hebdo perpétuel)

**Image** : `docs/aso-events/03-news-quiz-fr.png` + EN
**Event Type** : `Live Event` (ou `Special Event` si Live indisponible)
**Priority** : `Standard`
**Schedule** : chaque dimanche soir → vendredi suivant (1 semaine)

### FR
| Champ | Texte | Caract. |
|---|---|---|
| Event Name | `Quiz Actu de la semaine` | 24 |
| Short Description | `T'as suivi l'info ? Teste-toi !` | 32 |
| Long Description | `Quiz hebdo sur l'actu de la semaine. 10 questions, mis à jour chaque dimanche. Tu sais ce qui s'est passé ?` | 110 |

### EN
| Champ | Texte | Caract. |
|---|---|---|
| Event Name | `Weekly News Quiz` | 16 |
| Short Description | `Did you follow the news?` | 24 |
| Long Description | `Weekly news quiz. 10 questions, refreshed every Sunday. Did you keep up with this week's events?` | 96 |

---

## 🏅 Event 4 — Daily Streak Challenge (perpétuel)

**Image** : `docs/aso-events/04-streak-fr.png` + EN
**Event Type** : `Challenge`
**Priority** : `Standard`
**Schedule** : perpétuel (renouveler tous les 30 jours pour rester visible)

### FR
| Champ | Texte | Caract. |
|---|---|---|
| Event Name | `Défi Streak Quotidien 🔥` | 24 |
| Short Description | `Combien de jours d'affilée ?` | 29 |
| Long Description | `Réponds à la question du jour chaque jour. Construis ton streak, débloque des récompenses XP exclusives.` | 105 |

### EN
| Champ | Texte | Caract. |
|---|---|---|
| Event Name | `Daily Streak Challenge 🔥` | 25 |
| Short Description | `How many days in a row?` | 23 |
| Long Description | `Answer one question every single day. Build your streak, unlock exclusive XP rewards.` | 84 |

---

## Procédure dans App Store Connect

1. **My Apps → BIGHEAD → Distribution → In-App Events → Create In-App Event**
2. Remplir l'Event Reference Name (interne, pas visible publiquement)
3. Choisir Event Type, Event Priority, Event Visibility
4. **Localizations** :
   - Ajouter `French (France)` + `English (U.S.)`
   - Coller les copies depuis ce doc
   - Upload de l'image (drag-and-drop le PNG correspondant)
5. **Event Details** :
   - Event Time : Start / Publish / End dates
   - Deep link : `bighead://duel` (pour event 1), `bighead://weekly` (event 2), `bighead://weekly?type=news` (event 3), `bighead://daily` (event 4)
6. **Submit for Review** → 24-72h de review

## Calendrier de publication recommandé

| Event | Submit | Publish | Durée |
|---|---|---|---|
| 1. Async Duel Launch | Aujourd'hui | 1.2.3 release | 28 jours |
| 2. Belgique | Aujourd'hui | Vendredi 13 juin | 7 jours |
| 2. Espace | Mardi 10 juin | Vendredi 20 juin | 7 jours |
| 3. News Quiz | Aujourd'hui | Dimanche 14 juin | 7 jours (rolling) |
| 4. Streak Challenge | Cette semaine | Dès approuvé | 30 jours |

## Quotas Apple

- 15 events approuvés max simultanément
- 10 events publiés visibles à la fois sur la fiche
- Submit en avance — c'est la review qui est lente
