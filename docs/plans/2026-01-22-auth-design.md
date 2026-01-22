# Auth Design - BIGHEAD

## Résumé

Authentification Supabase avec support anonymous + email, permettant de jouer sans compte puis d'upgrader pour sauvegarder les scores.

## Choix techniques

- **Méthodes auth:** Email + Anonymous avec upgrade
- **Flow upgrade:** Prompt après 1ère partie + rappel sur profil
- **UI auth:** Modal bottom sheet
- **Vérification email:** Non, accès immédiat

## Architecture

### AuthProvider (Context)

```typescript
interface AuthState {
  user: User | null;
  isAnonymous: boolean;
  isLoading: boolean;
  profile: UserProfile | null;
}

interface AuthActions {
  signInAnonymously(): Promise<void>;
  signInWithEmail(email: string, password: string): Promise<void>;
  signUpWithEmail(email: string, password: string, username: string): Promise<void>;
  upgradeAnonymousAccount(email: string, password: string, username: string): Promise<void>;
  signOut(): Promise<void>;
}
```

### Flow au lancement

1. App démarre → AuthProvider vérifie session existante
2. Si session → charger le profil
3. Si pas de session → créer automatiquement session anonyme
4. Utilisateur peut jouer immédiatement

## Fichiers à créer

```
src/
  contexts/
    AuthContext.tsx      # Provider + hook useAuth()
  components/
    AuthModal.tsx        # Bottom sheet login/signup
    UpgradePrompt.tsx    # Banner "Créer un compte"
```

## Base de données

### Table game_results (nouvelle)

```sql
CREATE TABLE game_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mode TEXT NOT NULL CHECK (mode IN ('chain_solo', 'party')),
  score INTEGER NOT NULL DEFAULT 0,
  correct_count INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 0,
  max_chain INTEGER NOT NULL DEFAULT 0,
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_game_results_user_id ON game_results(user_id);
CREATE INDEX idx_game_results_created_at ON game_results(created_at DESC);
```

### RLS Policies

```sql
ALTER TABLE game_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own results"
  ON game_results FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own results"
  ON game_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

## Flow de sauvegarde

1. Fin de partie
2. Si user connecté → sauvegarder dans Supabase
3. Si anonyme → stocker en local (AsyncStorage)
4. Afficher UpgradePrompt si anonyme
5. Si upgrade → migrer scores locaux vers Supabase

## Gestion d'erreurs

| Erreur | Message |
|--------|---------|
| Email déjà utilisé | "Cet email est déjà utilisé" |
| Email invalide | "Email invalide" |
| Mot de passe < 6 chars | "6 caractères minimum" |
| Mauvais identifiants | "Email ou mot de passe incorrect" |
| Réseau | "Connexion impossible" |

## Validation

- Email: format valide
- Mot de passe: min 6 caractères
- Pseudo: min 3 caractères
