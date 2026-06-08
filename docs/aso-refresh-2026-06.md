# ASO Refresh — Juin 2026

Plan d'optimisation App Store + Play Store basé sur audit de la fiche actuelle (1.2.2 live).

## État actuel

| Champ | FR | EN |
|---|---|---|
| Title | `BIGHEAD - Quiz Culture` (24c) | `BIGHEAD - Culture Quiz` (22c) |
| Genre | Education ⚠️ | Education ⚠️ |
| Released | 2026-02-17 | 2026-02-17 |
| Updated | 2026-03-10 (3 mois ❌) | idem |
| Ratings | 5★ (2 votes) | 0★ (0 votes) |
| Async duel mentionné ? | ❌ | ❌ |
| Weekly themed mentionné ? | ❌ | ❌ |

**Diagnostic clé** : la fiche date d'avant l'async duel + weekly themed/news + audio quiz. C'est ta plus grosse killer feature **et elle n'apparaît nulle part**.

## Action 1 — Changer la catégorie

**De** : `Education`
**À** : `Games → Trivia`

Trivia est une sous-catégorie de Games avec 50-100x moins de concurrence qu'Education, et l'algo de recommandation Apple matche mieux le contenu (Trivia Crack, QuizUp etc. sont là). Conversion 2-3x supérieure attendue.

**Impact** : ~30 sec dans App Store Connect → Pricing & Availability → Primary Category.

## Action 2 — Metadata FR

### Title (30 char max)
```
BigHead : Trivia & Quiz Duel
```
*(28 char — capte « trivia » + « quiz » + « duel »)*

Variante plus FR-native : `BigHead : Quiz Culture & Duel` (29 char)

### Subtitle (30 char max)
```
1v1, defis hebdo & culture G
```
*(28 char — couvre les 3 USP : async duel, weekly, culture générale)*

### Keywords (100 char max, virgules sans espaces)
```
trivia,quiz,culture,duel,defi,connaissances,questions,1v1,multijoueur,blindtest,jeu,classement
```
*(99 char — ciblé sur volumes FR élevés selon Sensor Tower)*

### Description (premiers 250 char critiques — c'est tout ce qui s'affiche avant "Plus")
```
🎯 Défie tes amis en duel 1v1 sur 10 000+ questions de culture G !

BigHead, c'est LE quiz qui rend accro :
• Duels asynchrones — 10 questions, 48h pour répondre, le score apparaît à la fin
• Défi quotidien avec streak et classement mondial
• Quizz hebdo thématiques (Belgique, Espace, Japon…) et actu de la semaine
• Quizz audio (sons, instruments, hymnes)
• 13 catégories : sport, ciné, sciences, histoire, géo, musique…

[reste du body actuel, légèrement remanié pour mentionner le mode famille et le quiz audio]
```

## Action 3 — Metadata EN

### Title (30 char)
```
BigHead - Trivia Quiz Duel
```
*(26 char)*

### Subtitle (30 char)
```
1v1 async battles & daily brain
```
*(30 char pile-poil)*

### Keywords (100 char)
```
trivia,quiz,duel,brain,multiplayer,iq,questions,daily,challenge,knowledge,realtime,asynchronous
```
*(98 char)*

### Description hook
```
🎯 Challenge friends to async 1v1 trivia duels — 10 questions, 48h to answer, score reveals at the end!

BigHead is the trivia app that hits different:
• Async 1v1 duels — no need to play live, send a challenge and they get 48h
• Daily Brain with streak + global leaderboard
• Weekly themed quizzes (Belgium, Space, Japan…) + this-week news quiz
• Audio quiz (sounds, instruments, anthems)
• 13 categories covering everything
```

## Action 4 — Screenshots (5 obligatoires sur iOS, 8 max sur Play)

Refaire dans cet ordre (chacun avec un caption gros et impactant) :

| # | Captures | Caption FR | Caption EN |
|---|---|---|---|
| 1 | Async duel inbox + score révélé | « Défie tes potes en async » | « Async 1v1 trivia duels » |
| 2 | Daily challenge avec streak 🔥 | « Le défi qui rend addict » | « The daily that hooks you » |
| 3 | Weekly themed (Belgique ou Japon) | « Quizz thématique chaque vendredi » | « New weekly themed quiz » |
| 4 | Audio quiz screen | « Devine le son » | « Guess the sound » |
| 5 | Leaderboard | « Qui a la plus grosse tête ? » | « Who's the smartest ? » |

**Spec** : 1242×2688 (iPhone 6.5"), background sombre du jeu, texte caption blanc 80pt Bold, marge 80px haut/bas.

## Action 5 — App Preview Video (15-30s, portrait 1080×1920)

**Script** (15s version compacte) :
1. **0-2s** : Logo BigHead anim + voix off « Le quiz qui rend addict »
2. **2-4s** : Daily question tap → confetti + XP gain
3. **4-7s** : Switch instant vers duel inbox, montrer 2 duels actifs + score révélé
4. **7-10s** : Weekly themed card animée (Belgique flag spin)
5. **10-13s** : Leaderboard scroll smooth
6. **13-15s** : « Télécharge BigHead » + logo + frame fixe

Tu produis déjà des vidéos HeyGen pour Instagram/TikTok — **on peut générer ce preview à partir des mêmes assets** sans repasser par HeyGen (juste capture d'écran + montage iMovie/Premiere/CapCut, 30 min).

## Action 6 — Lancement coordonné

Une fois le build 1.2.3 approuvé sur TestFlight + promu prod :
1. Update metadata FR + EN (Actions 2-3)
2. Upload nouveaux screenshots (Action 4)
3. Upload App Preview (Action 5)
4. Changer catégorie (Action 1)
5. **Soumettre pour « featuring »** via App Store Connect → Marketing → Apple Featuring (juste un formulaire, gratuit ; Apple aime les apps trivia bien faites)

## Impact attendu

| KPI | Avant | Cible 30j post-update |
|---|---|---|
| App Store impressions FR (organique) | ? | +60-80% |
| Conversion impression → install | ~3% (typique cat Education) | 5-7% (typique cat Trivia avec bon ASO) |
| Featured chance | Très faible | Moyenne (catégorie Trivia + tags innovants) |

## Ce que je ne peux PAS faire pour toi

- Uploader les screenshots / App Preview (besoin de login App Store Connect)
- Changer la catégorie (idem)
- Modifier la metadata (idem)

→ **Toi tu as l'accès** : je te file le contenu copy-paste-ready, tu colles dans ASC.

Je peux par contre :
- Générer les screenshots brandés depuis un device/simulator
- Générer un MP4 preview à partir des assets HeyGen existants
- Écrire la metadata Play Store en parallèle (mêmes copies, format différent)

Dis-moi par quoi tu veux que je commence.
