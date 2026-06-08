# BIGHEAD Web — Design

> Date : 2026-06-08
> Statut : validé (brainstorm), prêt pour plan d'implémentation
> Domaine : `play.bighead-quizz.com` (landing marketing reste sur `bighead-quizz.com`)

## Objectif

Version **web** de BIGHEAD (app quiz mobile Expo/RN). Double but :

1. **Canal d'acquisition pour l'app mobile** — try-before-install, CTA install aux pics d'engagement.
2. **Jeu complet jouable sur le web** — aucune feature verrouillée derrière l'install. Monétisation des users web = plus tard (place archi laissée, non buildée en v1).

Principe : assez de jeu gratuit pour accrocher, conversion vers l'app à chaque pic de dopamine, sans jamais brider l'expérience web.

## Décisions verrouillées

| Sujet | Décision |
|-------|----------|
| Framework | **TanStack Start** (Vite + Nitro, SSR) |
| Data | **TanStack Query** (cache/invalidation des RPC Supabase) |
| Anim | **Framer Motion** + `canvas-confetti` |
| Styling | **Tailwind**, tokens repris du mobile |
| Repo | `apps/web` dans le monorepo `bighead` existant |
| Backend | **Réutilise le Supabase de prod** (mobile + web partagent tout) |
| Auth | `@supabase/ssr` (cookie sessions) + **auto sign-in anonyme** |
| Scope v1 | **Core web-first** (voir ci-dessous) |
| Déploiement | **Node sur le VPS derrière nginx** (`play.bighead-quizz.com`) |

## Backend (réutilisé, rien à recréer)

- URL : `https://dqhhpoxqrtlmhosrsdxp.supabase.co` (project ref `dqhhpoxqrtlmhosrsdxp`, eu-west-1)
- Clé publique : `sb_publishable_qUEpzxNw_Sn8CGk3EiIaXw_lJiio6rt` (ou legacy anon JWT)
- Logique jeu déjà serveur-side en **RPC `SECURITY DEFINER`** : `get_adaptive_questions`, `get_daily_challenge`, `create_duel`, `join_duel`, `submit_duel_answer`, `finish_duel`, `get_duel_questions`, `get_weekly_leaderboard`, `get_tournament_leaderboard`, `check_achievements`, `record_answer_and_update_ratings`, `mark_question_seen`…
- Le web **mirror les appels exacts** du mobile (`apps/mobile/src/services/`).
- Anti-triche : scoring critique (duels/tournois) tranché côté serveur ; le client envoie réponse + temps (ms).

## Auto-signin & gate free-play

- Arrivée → `signInAnonymously()` silencieux. Zéro friction. Supabase crée un vrai user → XP/historique persistés sur le compte anon.
- Compteur de questions répondues. **Seuil v1 : `FREE_QUESTIONS_LIMIT = 20`** → 1re invite *soft* (modale dismissable) ; re-prompt à 50.
- La modale propose **2 voies** : créer un compte web **ou** télécharger l'app (mise en avant).
- Features sociales/compétitives (duels, tournois, ranking) : prérequis = **avoir un compte** (web *ou* app), pas forcer l'install.
- Upgrade = **même user id** (anonymous → permanent). Rien n'est perdu.

## UX d'un round (commun à tous les modes)

1. RPC renvoie les questions (texte, bonne réponse + 3 mauvaises, catégorie, difficulté, langue, image optionnelle).
2. Réponses mélangées client, **TimerRing** Framer Motion (20s Chain / 15s Daily).
3. Tap → feedback animé (vert/rouge), révèle la bonne, **temps de réponse mesuré (ms)**.
4. Chain Reaction : multiplicateur `1×→2×→3×→5×→8×→10×` (client, affichage temps réel).
5. Fin de manche → ResultScreen (score, max chain, perfect) → écrit `game_result` + `record_answer_and_update_ratings` (ELO) + `check_achievements`.

Data flow : TanStack Query wrap chaque RPC (`useQuery` lectures, `useMutation` + invalidation pour soumissions). SSR pour landing/shell ; le jeu est client (timers, interactivité). Petit store Zustand pour l'état de manche en cours.

## Funnel web → install mobile

- CTA install contextuels : fin de perfect game, achievement, level up, vue leaderboard.
- Smart App Banner iOS + bannière Android (deep link store), persistants mais **non-bloquants**, dismissables.
- Deep / Universal Links : `/invite/duel/$code` ouvre l'app si installée, sinon fallback web + prompt install. Branché sur l'AASA + bridge `/invite/duel/` déjà sur le VPS.
- Attribution : UTM + réutilisation des **referral codes** existants pour tracer web→install.
- SSR/SEO = découverte organique → essai web → install (justifie le SSR).

## Routes (`app/routes/`)

- `/` — landing SSR (hero, démo jouable inline, CTA stores)
- `/play` — hub de jeu
- `/play/chain` — Chain Reaction
- `/play/daily` — Daily Brain (5 Q)
- `/duels` — inbox (`my_turn`/`waiting`/`finished`) + create/join code
- `/duels/$code` — partie de duel
- `/weekly` — Weekly Challenge (30 Q)
- `/tournaments`, `/tournaments/$id`
- `/leaderboard` — weekly / all-time
- `/profile` — XP, niveau, achievements, historique
- `/invite/duel/$code` — bridge deep-link
- `/auth` — signup/login (upgrade depuis anon)

## Composants (`app/components/`)

`QuizCard`, `TimerRing`, `ChainMeter`, `ResultScreen` (+CTA install), `AccountPrompt` (gate 20/50), `AppPromoBanner`, `Leaderboard`, `DuelInboxItem`, `XPBar`, `AchievementToast`, `LangProvider` (FR/EN, reprend `translations.ts`).

## Tokens design (repris du mobile)

primary `#00c2cc` · bg `#161a1d` · surface `#1E2529` · success `#22c55e` · error `#ef4444` · accent `#d946ef` / `#A16EFF`.

## Déploiement

- Node (TanStack Start/Nitro) sur le VPS `77.87.110.100`, `127.0.0.1:3000`, géré par systemd/pm2.
- Vhost nginx reverse-proxy + cert Let's Encrypt. DNS A `play.bighead-quizz.com` → `77.87.110.100`.
- CI GitHub Actions : build → rsync → restart.
- Alt future : Cloudflare Workers (preset Nitro CF, DNS déjà chez CF).

## Phasing

- **P0 — Scaffold** : `apps/web`, Start + Tailwind (tokens) + `@supabase/ssr` (auto-signin anon) + types Supabase générés + layout/nav + i18n. Vhost + DNS `play.` + CI.
- **P1 — Solo jouable** : Chain Reaction + Daily Brain, écriture `game_result` + ELO + achievements. → 1er deploy public jouable.
- **P2 — Progression** : profil, XP/niveau, achievements, leaderboard. Gate free-play + AccountPrompt + AppPromoBanner.
- **P3 — Social** : duels async (create/join/inbox/partie/finish) + bridge invite ↔ AASA.
- **P4 — Compétitif** : Weekly Challenge + Tournaments.

## Tests (non négociable)

- Vitest : scoring, hooks, logique du gate free-play.
- Playwright E2E : auto-signin → jouer une manche Chain → résultat ; flow upgrade compte.
- CI rouge = fix avant deploy.

## Différé (post-v1)

Party / Traitor / Auction / Audio ; monétisation web.
