# Instagram Quiz Video Pipeline - Design

## Date: 2026-02-18

## Overview

Pipeline automatisé qui génère quotidiennement une vidéo quiz avec avatar IA (HeyGen) et la publie sur Instagram Reels.

## Architecture

```
Cron quotidien (VPS 77.87.110.100) - 10h Paris
         │
         ▼
  1. Claude API → Génère question virale (JSON structuré)
         │
         ▼
  2. HeyGen Template API → Génère vidéo avec avatar Mia
     (template_id + variables : question, choix, réponse)
         │
         ▼
  3. Poll HeyGen status (~2-5 min)
         │
         ▼
  4. Download vidéo → Upload Supabase Storage (bucket public)
         │
         ▼
  5. Instagram Graph API → Publie comme Reel
     (URL publique vidéo + caption + hashtags)
         │
         ▼
  6. Log dans table Supabase `instagram_posts`
```

## Stack technique

| Composant | Technologie |
|-----------|-------------|
| Script principal | Node.js (TypeScript) |
| Génération questions | Claude API (Anthropic) |
| Génération vidéo | HeyGen Template API v2/v3 |
| Stockage vidéo | Supabase Storage (bucket public) |
| Publication Instagram | Instagram Graph API (Reels) |
| Scheduling | Cron sur VPS existant |
| Base de données | Supabase (table instagram_posts) |
| Hébergement | VPS 77.87.110.100 |

## Format vidéo

- **Ratio** : 9:16 (Portrait / Reels)
- **Durée** : ~25-35 secondes
- **Avatar** : Mia (HeyGen stock, Engine IV)
- **Langue** : Français
- **Structure** :
  1. Hook accrocheur (3s)
  2. Question + 4 choix (8s)
  3. "Mettez votre réponse en commentaire !" (3s)
  4. Pause (3s)
  5. Réponse + fun fact (8s)
  6. CTA "Abonne-toi + télécharge BigHead" (5s)

## Template HeyGen

- **Template ID** : `6e56982b677f4f1ab79175d4d750801a`
- **Variables** (à configurer dans l'éditeur) :
  - `{{hook}}` - Phrase d'accroche
  - `{{question}}` - La question
  - `{{choix_a}}` - Choix A
  - `{{choix_b}}` - Choix B
  - `{{choix_c}}` - Choix C
  - `{{choix_d}}` - Choix D
  - `{{reponse}}` - La bonne réponse
  - `{{fun_fact}}` - Anecdote

## Prompt Claude (génération question)

```
Tu es un créateur de contenu quiz sport/foot viral pour Instagram Reels.
Génère UNE question quiz en français, optimisée pour l'engagement.

Règles :
- Thème : football, culture sport, records, anecdotes
- Ton : accrocheur, "le saviez-vous", débat possible
- 4 choix dont 1 seule bonne réponse
- Les mauvaises réponses doivent être crédibles
- Un fun fact surprenant pour la révélation
- Un hook qui donne envie de regarder

Format JSON strict :
{
  "hook": "phrase d'accroche courte et percutante",
  "question": "la question",
  "choices": { "a": "choix A", "b": "choix B", "c": "choix C", "d": "choix D" },
  "answer": "a|b|c|d",
  "answer_text": "texte de la bonne réponse",
  "fun_fact": "anecdote surprenante liée à la réponse",
  "hashtags": ["#tag1", "#tag2", ...],
  "caption": "texte pour la description Instagram"
}
```

## Table Supabase `instagram_posts`

```sql
CREATE TABLE instagram_posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  question jsonb NOT NULL,
  heygen_video_id text,
  video_url text,
  supabase_storage_path text,
  instagram_media_id text,
  instagram_permalink text,
  status text DEFAULT 'pending',
  error text
);
```

## Instagram Graph API Flow

1. `POST /{ig-user-id}/media` avec :
   - `media_type=REELS`
   - `video_url` = URL publique Supabase Storage
   - `caption` = texte + hashtags
2. Poll `GET /{container_id}?fields=status_code` → `FINISHED`
3. `POST /{ig-user-id}/media_publish` avec `creation_id`

## Secrets (VPS env vars)

```bash
HEYGEN_API_KEY=xxx
ANTHROPIC_API_KEY=xxx
SUPABASE_URL=xxx
SUPABASE_SERVICE_KEY=xxx
INSTAGRAM_ACCESS_TOKEN=xxx
INSTAGRAM_USER_ID=xxx
```

## Cron

```
0 10 * * * cd /home/script/bighead/instagram-pipeline && node dist/index.js >> /home/script/bighead/instagram-pipeline.log 2>&1
```

## Prérequis

- [x] Compte HeyGen avec avatar Mia
- [x] Template HeyGen en Portrait 9:16 avec variables
- [ ] Template HeyGen configuré avec textes et variables (user)
- [ ] Clé API HeyGen
- [ ] Clé API Anthropic
- [ ] Compte Instagram Business lié à Facebook Page
- [ ] Token Instagram Graph API (long-lived)
- [ ] Table `instagram_posts` créée en Supabase
- [ ] Script déployé sur VPS
- [ ] Cron configuré
