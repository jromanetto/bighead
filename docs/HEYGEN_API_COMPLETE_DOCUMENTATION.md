# HeyGen API - Documentation Complète

*Document généré le 2026-02-20*

## Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Authentification](#authentification)
3. [Endpoints principaux](#endpoints-principaux)
4. [Video Agent API](#video-agent-api)
5. [Génération de vidéos (V2)](#génération-de-vidéos-v2)
6. [Template API (V3)](#template-api-v3)
7. [Avatars](#avatars)
8. [Voix](#voix)
9. [Video Translation](#video-translation)
10. [Text-to-Speech (Starfish)](#text-to-speech-starfish)
11. [Assets](#assets)
12. [Webhooks](#webhooks)
13. [Streaming API](#streaming-api)
14. [Limites et crédits](#limites-et-crédits)
15. [Changelog récent](#changelog-récent)

---

## Vue d'ensemble

**Base URL:** `https://api.heygen.com`

### Trois chemins d'intégration principaux

#### Option A: Video Agent (le plus rapide)
- Génération vidéo en un seul appel à partir d'un prompt texte
- Pas besoin d'avatars ou templates préalables
- Endpoint: `POST /v1/video_agent/generate`

#### Option B: Video Translation
- Conversion de vidéos existantes en d'autres langues
- Endpoint: `POST /v2/video_translate`

#### Option C: Avatar-Based Videos
- Créer un avatar personnalisé d'abord (via web ou API)
- Utiliser son ID pour générer des vidéos cohérentes
- Endpoint: `POST /v2/video` (Create Avatar Video V2)

---

## Authentification

**Méthode:** Header HTTP avec clé API

**Header requis:**
```
X-Api-Key: <your-api-key>
```

**Obtenir votre clé:**
1. Se connecter à HeyGen
2. Aller dans Settings → API token
3. Copier la clé

**Sécurité:**
- Traiter la clé comme un mot de passe
- Ne jamais l'exposer côté client
- En cas de compromission: contacter contact@heygen.com

---

## Endpoints principaux

### Catalogue complet des endpoints

#### Génération de vidéos

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/v1/video_agent/generate` | Video Agent (prompt → vidéo) |
| POST | `/v2/video` | Create Avatar Video (V2) |
| GET | `/v2/video/{video_id}` | Status/détails de la vidéo |
| POST | `/v2/video_webm` | Create WebM Video |
| GET | `/v2/videos` | Liste des vidéos |
| POST | `/v2/video_url` | Obtenir URL partageable |
| DELETE | `/v2/video/{video_id}` | Supprimer une vidéo |

#### Text-to-Speech

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/v2/tts` | Text-to-Speech (Starfish) |
| GET | `/v2/tts_voices` | Liste des voix compatibles |

#### Photo Avatar

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/v2/photo_avatar` | Créer un Photo Avatar |
| POST | `/v2/photo_avatar_group` | Créer un Avatar Group |
| POST | `/v2/photo_avatar_group/{group_id}/looks` | Ajouter des looks |
| POST | `/v2/photo_avatar/{avatar_id}/looks` | Générer des looks |
| GET | `/v2/photo_avatar/{avatar_id}/status` | Status génération |
| GET | `/v2/photo_avatar/{avatar_id}` | Détails photo avatar |
| POST | `/v2/photo_avatar_group/{group_id}/train` | Entraîner l'avatar group |
| GET | `/v2/photo_avatar_group/{group_id}/train_status` | Status entraînement |
| POST | `/v2/photo_avatar/{avatar_id}/motion` | Ajouter mouvement |
| DELETE | `/v2/photo_avatar/{avatar_id}` | Supprimer photo avatar |
| DELETE | `/v2/photo_avatar_group/{group_id}` | Supprimer avatar group |

#### Digital Twin

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/v2/video_avatar` | Créer Digital Twin |
| GET | `/v2/video_avatar/{avatar_id}/status` | Status génération |
| DELETE | `/v2/video_avatar/{avatar_id}` | Supprimer digital twin |

#### Video Translation

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/v2/video_translate` | Traduire une vidéo |
| GET | `/v2/video_translate_languages` | Langues supportées |
| GET | `/v2/video_translate/{task_id}` | Status traduction |
| POST | `/v2/video_translate_proofread` | Générer relecture |
| GET | `/v2/video_translate_proofread/{task_id}` | Status relecture |
| GET | `/v2/video_translate_proofread_srt/{task_id}` | Télécharger SRT |
| POST | `/v2/video_translate_proofread_srt` | Upload SRT |
| POST | `/v2/video_translate_from_proofread` | Traduire depuis relecture |
| GET | `/v2/video_translate_caption/{task_id}` | Sous-titres traduction |

#### Voix

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/v2/voices` | Liste toutes les voix |
| GET | `/v2/voice_locales` | Liste locales voix |
| GET | `/v2/brand_voices` | Liste glossaire marque |
| POST | `/v2/brand_voices` | Mettre à jour glossaire |

#### Avatars

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/v2/avatars` | Liste tous les avatars |
| GET | `/v2/avatar_groups` | Liste avatar groups |
| GET | `/v2/avatar_group/{group_id}/avatars` | Avatars dans un group |
| GET | `/v2/avatar/{avatar_id}` | Détails d'un avatar |

#### Assets

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/v2/asset` | Upload asset |
| GET | `/v2/assets` | Liste assets |
| POST | `/v2/asset/{asset_id}/delete` | Supprimer asset |

**Upload endpoint:** `https://upload.heygen.com/v1/asset`

#### Folders

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/v2/folders` | Liste folders |
| POST | `/v2/folder` | Créer folder |
| POST | `/v2/folder/{folder_id}` | Mettre à jour folder |
| POST | `/v2/folder/{folder_id}/trash` | Mettre à la corbeille |
| POST | `/v2/folder/{folder_id}/restore` | Restaurer folder |

#### User & Quota

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/v2/quota` | Quota restant |
| GET | `/v2/user` | Infos utilisateur |

#### Webhooks

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/v2/webhook_endpoints` | Liste webhooks |
| POST | `/v2/webhook_endpoint` | Ajouter webhook |
| PATCH | `/v2/webhook_endpoint/{endpoint_id}` | Mettre à jour webhook |
| DELETE | `/v2/webhook_endpoint/{endpoint_id}` | Supprimer webhook |
| GET | `/v2/webhook_events` | Liste événements |

#### Templates

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/v2/templates` | Liste templates |
| GET | `/v2/template/{template_id}` | Détails template |
| GET | `/v2/template/{template_id}/v3` | Détails template V3 |
| POST | `/v2/template/{template_id}/generate` | Générer depuis template |

#### Streaming API (Legacy)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/v1/session` | Nouvelle session |
| POST | `/v1/session/{session_id}/start` | Démarrer session |
| GET | `/v1/sessions` | Sessions actives |
| GET | `/v1/sessions/history` | Historique sessions |
| POST | `/v1/session/{session_id}/task` | Envoyer tâche |
| POST | `/v1/session/{session_id}/close` | Fermer session |
| POST | `/v1/session/{session_id}/interrupt` | Interrompre tâche |
| POST | `/v1/session_token` | Créer token session |
| GET | `/v1/streaming_avatars` | Liste avatars streaming |
| POST | `/v1/session/{session_id}/keep_alive` | Keep alive |

#### Knowledge Base (Legacy)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/v1/knowledge_bases` | Liste knowledge bases |
| POST | `/v1/knowledge_base` | Créer knowledge base |
| POST | `/v1/knowledge_base/{kb_id}` | Mettre à jour KB |
| POST | `/v1/knowledge_base/{kb_id}/delete` | Supprimer KB |

---

## Video Agent API

### Endpoint
**POST** `https://api.heygen.com/v1/video_agent/generate`

### Description
Génération vidéo "one-shot" à partir d'un prompt texte. L'IA gère automatiquement l'écriture du script et l'assemblage visuel.

### Paramètres de requête

```json
{
  "prompt": "string (required)",
  "config": {
    "avatar_id": "string (talking photo ID)",
    "model_id": "string (optional)"
  },
  "test": boolean
}
```

**Paramètres clés:**
- `prompt` (requis): Description du contenu vidéo à générer
- `config.avatar_id`: ID du talking photo (PAS l'avatar group ID)
- `model_id`: Modèle IA à utiliser
- `test`: Active le mode test (avec watermark, sans consommer de crédits)

### Réponse

```json
{
  "error": null,
  "data": {
    "video_id": "unique_identifier"
  }
}
```

### Comportement test vs production

- **test: true**: Watermark appliqué, aucun crédit consommé
- **test: false**: Pas de watermark, crédits consommés (2 crédits/minute)

### Temps de rendu
~15-20 minutes pour une vidéo de 30 secondes

### Points importants
- Accepte l'ID de talking photo (ex: `58b38887a8524c82b94164b14b0119b8`)
- N'accepte PAS l'avatar group ID (ex: `a621594c6c294e5ab4ebd4ad8d1c1f84`)
- Génère automatiquement scènes, overlays, transitions

### Coût
**2 crédits par minute** (réduit de 6 à 2 il y a 9 jours)

---

## Génération de vidéos (V2)

### Endpoint
**POST** `https://api.heygen.com/v2/video`

### Description
Créer des vidéos avatar avec contrôle précis sur les scènes, voix, backgrounds.

### Contraintes
- Texte maximum: 5000 caractères
- Résolution plan gratuit: 720p max
- Résolution par défaut: 1080p

### Paramètres principaux

```json
{
  "test": boolean,
  "title": "string",
  "video_inputs": [
    {
      "character": {
        "type": "avatar" | "talking_photo",
        "avatar_id": "string",
        "talking_photo_id": "string"
      },
      "voice": {
        "voice_id": "string",
        "speed": number,
        "pitch": number
      },
      "background": {
        "type": "color" | "image" | "video",
        "value": "string (hex color)",
        "url": "string",
        "image_asset_id": "string",
        "video_asset_id": "string",
        "play_style": "fit_to_scene" | "freeze" | "loop" | "full_video"
      }
    }
  ],
  "dimension": {
    "width": number,
    "height": number
  },
  "aspect_ratio": "16:9" | "9:16" | "1:1"
}
```

### Configuration du background

#### 1. Couleur unie
```json
{
  "type": "color",
  "value": "#FAFAFA"  // Code hex
}
```

#### 2. Image
```json
{
  "type": "image",
  "url": "https://..."  // OU
  "image_asset_id": "xxx"  // Exactement un des deux
}
```

#### 3. Vidéo
```json
{
  "type": "video",
  "url": "https://..." | "video_asset_id": "xxx",
  "play_style": "loop"  // fit_to_scene, freeze, loop, full_video
}
```

### Configuration de la voix

```json
{
  "voice_id": "xxx",
  "speed": 1.0,  // Vitesse
  "pitch": 0     // Tonalité
}
```

### Réponse

```json
{
  "error": null,
  "data": {
    "video_id": "xxx"
  }
}
```

### Status de la vidéo

**GET** `/v2/video/{video_id}`

**Status possibles:**
- `pending`: En file d'attente
- `waiting`: État intermédiaire
- `processing`: En cours de rendu
- `completed`: Prêt
- `failed`: Erreur

**Important:** Les URLs de vidéo expirent après **7 jours**. Elles sont régénérées à chaque vérification du status.

---

## Template API (V3)

### Récupérer les détails d'un template

**GET** `https://api.heygen.com/v3/template/{template_id}`

Retourne la structure du template avec:
- Variables disponibles
- Scènes et leurs variables
- Métadonnées

### Générer une vidéo depuis un template

**POST** `https://api.heygen.com/v2/template/{template_id}/generate`

#### Paramètres

```json
{
  "caption": boolean,
  "title": "string",
  "variables": {
    "variable_name": {
      "name": "variable_name",
      "type": "text",
      "properties": {
        "content": "John"
      }
    }
  }
}
```

#### Structure des variables

Chaque variable contient 3 composants:
1. **name**: Identifiant de la variable
2. **type**: Type de données (ex: "text")
3. **properties**: Objet contenant la valeur actuelle

#### Réponse

```json
{
  "error": null,
  "data": {
    "video_id": "xxx"
  }
}
```

### Scènes et variables

Les templates contiennent plusieurs scènes:
```json
{
  "scenes": [
    {
      "id": "scene_id",
      "script": "",
      "variables": {...}
    }
  ]
}
```

### V3 vs V2

- **V3**: Supporte le "New AI Studio"
- Système de variables amélioré
- Meilleure flexibilité et cohérence des endpoints
- **Note**: La documentation se concentre sur V3, V2 semble déprécié

---

## Avatars

### Liste des avatars

**GET** `https://api.heygen.com/v2/avatars`

#### Réponse

```json
{
  "error": null,
  "data": {
    "avatars": [
      {
        "avatar_id": "Abigail_expressive_2024112501",
        "avatar_name": "Abigail",
        "gender": "Female",
        "preview_image_url": "...",
        "preview_video_url": "...",
        "premium": false,
        "type": "...",
        "tags": ["NEW", "AVATAR_IV"],
        "default_voice_id": "..."
      }
    ],
    "talking_photos": [
      {
        "talking_photo_id": "6013fc758b5446a2ba17d8c459538bb4",
        "talking_photo_name": "Emma",
        "preview_image_url": "..."
      }
    ]
  }
}
```

### Types d'ID

- **avatar_id**: Pour les avatars standards
- **talking_photo_id**: Pour les photo avatars
- **avatar_group_id**: Pour les groupes de photo avatars

### Distinction importante

Dans les requêtes de génération vidéo:
```json
{
  "character": {
    "type": "avatar",
    "avatar_id": "xxx"
  }
}
```

OU

```json
{
  "character": {
    "type": "talking_photo",
    "talking_photo_id": "xxx"
  }
}
```

### Photo Avatar - Workflow complet

#### 1. Upload d'asset

**POST** `https://upload.heygen.com/v1/asset`

Headers:
- `X-API-KEY: <key>`
- `Content-Type: image/png | image/jpeg | video/mp4 | audio/mpeg | video/webm`

Body: Raw binary data

Limite: **10 MB**

Réponse:
```json
{
  "code": 100,
  "data": {
    "id": "asset_id",
    "file_type": "image",
    "url": "...",
    "created_ts": 1234567890,
    "image_key": "..." // pour images uniquement
  }
}
```

#### 2. Créer un Avatar Group

**POST** `/v2/photo_avatar_group`

Crée un groupe contenant plusieurs photos du même sujet (photos générées par IA ou uploadées).

Réponse:
```json
{
  "error": null,
  "data": {
    "avatar_group_id": "xxx"
  }
}
```

#### 3. Entraîner le groupe

**POST** `/v2/photo_avatar_group/{group_id}/train`

Lance l'entraînement du modèle IA pour reconnaître les caractéristiques du sujet.

#### 4. Vérifier le status d'entraînement

**GET** `/v2/photo_avatar_group/{group_id}/train_status`

États possibles:
- `in_progress`: En cours
- `complete`: Terminé et prêt
- `failed`: Erreur

#### 5. Générer des looks

**POST** `/v2/photo_avatar/look/generate`

Génère des variations (vêtements, scènes, poses) pour l'avatar entraîné.

### Digital Twin

#### Endpoint
**POST** `/v2/video_avatar`

#### Paramètres requis
```json
{
  "training_footage_url": "https://...",
  "video_consent_url": "https://...",
  "avatar_name": "string"
}
```

#### Exigences vidéo

- **Format**: MP4
- **Durée**: Au moins 2 minutes
- **Résolution**: 720p ou plus
- **Qualité**: Enregistrement clair de la personne qui parle
- **Éclairage**: Bien éclairé, stable

#### Vidéo de consentement

Vidéo séparée où la personne "accorde explicitement à HeyGen la permission d'utiliser la vidéo pour créer l'avatar".

#### Hébergement

Les URLs doivent être publiquement accessibles (AWS S3, Google Cloud Storage, etc.)

#### Status

**GET** `/v2/video_avatar/{avatar_id}/status`

États:
- `in_progress`: En cours de création
- `complete`: Prêt à utiliser
- `failed`: Erreur (Invalid Training Footage Format, Object Download Failed)

---

## Voix

### Liste des voix

**GET** `https://api.heygen.com/v2/voices`

#### Réponse

```json
{
  "error": null,
  "data": {
    "voices": [
      {
        "voice_id": "xxx",
        "language": "English" | "Multilingual",
        "gender": "Female" | "Male" | "Unknown",
        "name": "Cerise - Cheerful",
        "preview_audio": "https://...",
        "support_pause": true,
        "emotion_support": true,
        "support_interactive_avatar": true,
        "support_locale": true
      }
    ]
  }
}
```

#### Attributs des voix

- **voice_id**: Identifiant unique
- **language**: Langue principale ou Multilingual
- **gender**: Genre de la voix
- **name**: Nom avec descripteur
- **preview_audio**: URL d'échantillon
- **support_pause**: Peut insérer des pauses
- **emotion_support**: Supporte les variations émotionnelles
- **support_interactive_avatar**: Pour avatars conversationnels temps réel
- **support_locale**: Variantes par locale

### Locales

**GET** `/v2/voice_locales`

Liste les variantes régionales disponibles pour les voix.

### Glossaire de marque

**GET** `/v2/brand_voices`
**POST** `/v2/brand_voices`

Gère le glossaire de prononciation personnalisé de la marque.

---

## Video Translation

### Traduire une vidéo

**POST** `https://api.heygen.com/v2/video_translate`

#### Paramètres

```json
{
  "video_url": "https://...",  // required
  "output_language": "es",     // pour une langue
  "output_languages": ["es", "fr", "en"],  // pour plusieurs (incompatible avec output_language)
  "title": "string"  // optional
}
```

**Important**: `output_language` et `output_languages` ne peuvent pas être utilisés ensemble.

#### Réponse

```json
{
  "error": null,
  "data": {
    "video_translate_id": "xxx"  // langue unique
    // OU
    "video_translate_ids": ["id1", "id2"]  // plusieurs langues
  }
}
```

### Vérifier le status

**GET** `/v2/video_translate/{task_id}`

### Langues supportées

**GET** `/v2/video_translate_languages`

### Modes de qualité

Basé sur le changelog:
- **Fast**: 3 crédits/min
- **Quality**: 6 crédits/min (lip-sync naturel)

### Caractéristiques

- Maintient "le ton et le style originaux du locuteur"
- Clonage vocal naturel
- Traduction batch (un source → plusieurs langues simultanées)
- URLs expirées après **7 jours**

### Workflow de relecture (Proofread)

1. **Générer relecture**: `POST /v2/video_translate_proofread`
2. **Status relecture**: `GET /v2/video_translate_proofread/{task_id}`
3. **Télécharger SRT**: `GET /v2/video_translate_proofread_srt/{task_id}`
4. **Upload SRT modifié**: `POST /v2/video_translate_proofread_srt`
5. **Traduire depuis relecture**: `POST /v2/video_translate_from_proofread`

---

## Text-to-Speech (Starfish)

### Description
Modèle TTS propriétaire de HeyGen.

### Endpoint
**POST** `https://api.heygen.com/v1/audio/text_to_speech`

### Paramètres

```json
{
  "text": "string (required)",
  "voice_id": "string (required)"
}
```

### Liste des voix compatibles

**GET** `https://api.heygen.com/v1/audio/voices`

Retourne les voix publiques et personnalisées compatibles avec Starfish.

### Notes

- La documentation ne spécifie pas les paramètres avancés (speed, pitch, emotion)
- Format audio de sortie non spécifié (probablement MP3)
- Utilisable pour génération vidéo ou lecture directe

### Nouveauté

Disponible via API depuis récemment (auparavant web uniquement).

---

## Assets

### Upload

**POST** `https://upload.heygen.com/v1/asset`

#### Headers requis
```
X-API-KEY: <your_key>
Content-Type: image/png | image/jpeg | audio/mpeg | video/mp4 | video/webm
```

#### Body
Raw binary data (pas de form fields)

#### Limite
**10 MB maximum**

#### Types supportés
- Images: PNG, JPEG
- Audio: MP3
- Vidéo: MP4, WebM

#### Réponse

```json
{
  "code": 100,
  "data": {
    "id": "asset_id",
    "file_type": "image" | "video" | "audio",
    "url": "https://...",
    "created_ts": 1234567890,
    "image_key": "..." // null pour vidéo/audio
  }
}
```

### Liste

**GET** `/v2/assets`

Avec pagination et filtres.

### Supprimer

**POST** `/v2/asset/{asset_id}/delete`

### Utilisation

Les `asset_id` peuvent être utilisés dans:
- Photo avatars
- Backgrounds (image/vidéo)
- Audio source as voice

---

## Webhooks

### Configuration

**POST** `/v2/webhook_endpoint`

Paramètres:
```json
{
  "url": "https://your-endpoint.com/webhook",
  "events": ["avatar_video.success", "avatar_video.fail"]
}
```

### Validation

Le système envoie une requête OPTIONS (timeout 1 seconde). Assurez-vous de répondre rapidement.

### Événements supportés

**Génération vidéo:**
- `avatar_video.success` / `avatar_video.fail`
- `avatar_video_gif.success` / `avatar_video_gif.fail`
- `video_agent.success` / `video_agent.fail`
- `video_translate.success` / `video_translate.fail`

**Avatars:**
- `instant_avatar.success` / `instant_avatar.fail`
- `photo_avatar_generation.success` / `photo_avatar_generation.fail`
- `photo_avatar_train.success` / `photo_avatar_train.fail`
- `photo_avatar_add_motion.success` / `photo_avatar_add_motion.fail`

**Autres:**
- `personalized_video`
- `proofread_creation.success` / `proofread_creation.fail`
- `live_avatar.success` / `live_avatar.fail`

### Format du payload

```json
{
  "event_type": "avatar_video.success",
  "event_data": {
    // Varie selon l'événement
    // Success: contient URLs et identifiants
    // Fail: contient messages d'erreur
  }
}
```

### Méthode
Tous les webhooks arrivent via **POST**

### Sécurité et retry

La documentation ne spécifie pas:
- Mécanisme d'authentification (signatures, clés)
- Logique de retry
→ Consulter la référence complète

### Gestion

- **Liste**: `GET /v2/webhook_endpoints`
- **Mettre à jour**: `PATCH /v2/webhook_endpoint/{endpoint_id}`
- **Supprimer**: `DELETE /v2/webhook_endpoint/{endpoint_id}`
- **Liste événements**: `GET /v2/webhook_events`

---

## Streaming API

### Description
API legacy pour avatars conversationnels en temps réel.

### Endpoints principaux

| Endpoint | Description |
|----------|-------------|
| `POST /v1/session` | Créer nouvelle session |
| `POST /v1/session/{session_id}/start` | Démarrer session |
| `GET /v1/sessions` | Sessions actives |
| `GET /v1/sessions/history` | Historique |
| `POST /v1/session/{session_id}/task` | Envoyer tâche |
| `POST /v1/session/{session_id}/interrupt` | Interrompre |
| `POST /v1/session/{session_id}/close` | Fermer |
| `POST /v1/session/{session_id}/keep_alive` | Keep alive |
| `POST /v1/session_token` | Token de session |
| `GET /v1/streaming_avatars` | Liste avatars streaming |

### Notes
- Marqué comme **[LEGACY]**
- SDK disponible
- Demos: Vite, iOS, Next.js
- Configuration firewall disponible

---

## Limites et crédits

### Coûts par feature

**Video Agent:**
- 2 crédits/minute (réduit de 6 → 2 récemment)

**Video Translation:**
- Fast mode: 3 crédits/min
- Quality mode: 6 crédits/min (lip-sync naturel)

### Plans

- **Free**: Limité à 720p
- **Pro**: Accès complet
- **Scale**: Volumes plus élevés
- **Enterprise**: Personnalisé

### Résolutions

- **Par défaut**: 1080p
- **Free plan**: 720p max

### Limitations

- **Texte vidéo**: 5000 caractères max
- **Upload assets**: 10 MB max
- **URLs vidéo**: Expirent après 7 jours
- **Rate limiting**: Non spécifié dans la doc (voir référence complète)

### Mode test

- **test: true**: Watermark appliqué, pas de consommation de crédits
- **test: false**: Pas de watermark, crédits consommés

### Quota

**GET** `/v2/quota`

Vérifier les crédits restants et infos plan.

---

## Changelog récent

### Video Agent API
- **Prix réduit**: 6 → 2 crédits/minute (il y a 9 jours)
- **Nouveau endpoint**: `/v1/video_agent/generate` pour génération "one-shot"
- Gère automatiquement écriture + assemblage visuel

### Text-to-Speech
- **Starfish TTS**: Disponible via API
- Nouveaux endpoints: `GET /v1/audio/voices` et `POST /v1/audio/text_to_speech`

### Video Translation
- **Étendu à tous les plans**: Free, Pro, Scale, Enterprise
- 2 modes: Fast (3 cr/min), Quality (6 cr/min)

### Avatars
- **Avatar IV**: Supporté pour Talking Photos
- **Nouvelle voix**: ElevenLabs V3 model
- **Résolution par défaut**: 1080p (avant 720p)

### Assets
- **Nouveaux endpoints**: `/v1/asset/list` (pagination/filtres) et `/v1/asset/<id>/delete`

### Templates
- **Nouveau endpoint V3**: `v3/template/<template_id>` pour récupérer variables et schéma

---

## Points importants pour BigHead

### Pour le pipeline Instagram

1. **Video Agent est le bon choix**
   - Génération rapide via prompt
   - Pas besoin de template complexe
   - Supporte overlays/texte via prompt

2. **Avatar ID à utiliser**
   - Utiliser `talking_photo_id` (ex: `58b38887a8524c82b94164b14b0119b8`)
   - **NE PAS** utiliser `avatar_group_id`

3. **Test mode**
   - `test: true` pour dev (watermark, pas de crédits)
   - `test: false` pour production

4. **Coût**
   - 2 crédits/minute (très bon prix)
   - Vidéo 30s = 1 crédit

5. **Temps de rendu**
   - ~15-20 minutes
   - Prévoir polling régulier du status

6. **Workflow complet**
   ```
   1. Claude génère question + prompt HeyGen
   2. POST /v1/video_agent/generate
   3. Polling GET /v2/video/{video_id} jusqu'à "completed"
   4. Download video_url
   5. Upload Supabase
   6. Publish Instagram
   ```

7. **Webhooks recommandés**
   - S'abonner à `video_agent.success` et `video_agent.fail`
   - Évite le polling intensif

### Limitations connues

- Template V4 canvas text overlays ≠ API variables
- Avatar group ID rejeté par Video Agent
- URLs expirent après 7 jours (OK pour notre pipeline)

### Variables d'environnement

```bash
HEYGEN_API_KEY=xxx
HEYGEN_AVATAR_ID=58b38887a8524c82b94164b14b0119b8  # talking photo ID
```

---

## Ressources supplémentaires

- **Postman Collection**: Collections pré-construites disponibles
- **OAuth**: Nécessite approbation via formulaire d'intégration
- **MCP Server**: Disponible pour intégrations
- **Intégrations tierces**: Zapier, HubSpot, Slack, Google Sheets, Gmail

---

*Document compilé à partir de l'exploration complète de la documentation HeyGen le 2026-02-20*
