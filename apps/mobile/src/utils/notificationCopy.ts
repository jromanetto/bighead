/**
 * Copy de notifications signées Mia — personnalisé et à POV.
 *
 * Duo l'a prouvé : une notif AVEC un personnage et personnalisée (référence à la
 * série, au thème, au rang) écrase de très loin le "Vous avez un nouveau quiz".
 * Ce module produit un `{title, body}` selon l'état du joueur. 100% pur → testable.
 *
 * Ton : joueur (taquin) pour les engagés, DOUX pour les fragiles/à risque
 * (pousser un joueur qui vacille se retourne contre soi).
 */

export type NotifKind =
  | "daily_reminder" // rappel de la question du jour
  | "streak_warning" // série en danger (fin de journée)
  | "league_overtake" // quelqu'un t'a doublé en ligue
  | "prime_time" // le Prime Time va démarrer
  | "comeback"; // win-back d'un joueur absent

export interface NotifState {
  streak?: number;
  favoriteThemeFr?: string;
  favoriteThemeEn?: string;
  leagueRank?: number;
  /** Joueur fragile (peu de parties, série courte) → ton plus doux. */
  fragile?: boolean;
  daysAbsent?: number;
}

export interface NotifCopy {
  title: string;
  body: string;
}

const pick = (lang: "fr" | "en", fr: string, en: string) => (lang === "fr" ? fr : en);

export function buildNotificationCopy(
  kind: NotifKind,
  state: NotifState = {},
  lang: "fr" | "en" = "fr",
): NotifCopy {
  const streak = state.streak ?? 0;
  const theme = pick(lang, state.favoriteThemeFr ?? "", state.favoriteThemeEn ?? "");

  switch (kind) {
    case "daily_reminder": {
      if (theme) {
        return {
          title: pick(lang, "Mia 🧠", "Mia 🧠"),
          body: pick(
            lang,
            `Question ${theme} aujourd'hui — ton point fort 👀`,
            `A ${theme} question today — your strong suit 👀`,
          ),
        };
      }
      return {
        title: pick(lang, "La question du jour t'attend 🧠", "Today's question is waiting 🧠"),
        body: pick(
          lang,
          "T'as vu ? Moi je parie que tu sèches 👀",
          "Bet you can't get this one 👀",
        ),
      };
    }

    case "streak_warning": {
      if (streak <= 0) {
        return {
          title: pick(lang, "On lance une série ? 🔥", "Start a streak? 🔥"),
          body: pick(lang, "Une question, et c'est parti.", "One question, and you're off."),
        };
      }
      // Doux si fragile, taquin sinon.
      if (state.fragile) {
        return {
          title: pick(lang, `Ta série de ${streak} jours 🔥`, `Your ${streak}-day streak 🔥`),
          body: pick(
            lang,
            "Encore une petite question pour la garder ?",
            "One quick question to keep it going?",
          ),
        };
      }
      return {
        title: pick(lang, `🔥 Ne casse pas ta série de ${streak} !`, `🔥 Don't break your ${streak}-day streak!`),
        body: pick(
          lang,
          "Il te reste ce soir pour la sauver.",
          "You've got tonight to save it.",
        ),
      };
    }

    case "league_overtake": {
      const rank = state.leagueRank;
      return {
        title: pick(lang, "On t'a doublé en ligue 😤", "You just got passed 😤"),
        body: rank
          ? pick(lang, `Tu es ${rank}e — reprends ta place.`, `You're #${rank} — take your spot back.`)
          : pick(lang, "Reprends ta place au classement.", "Take your spot back on the board."),
      };
    }

    case "prime_time": {
      return {
        title: pick(lang, "🔴 Prime Time à 19h", "🔴 Prime Time at 7pm"),
        body: pick(
          lang,
          "Même question, tout le monde en même temps. Tu joues ?",
          "Same question, everyone at once. You in?",
        ),
      };
    }

    case "comeback": {
      const d = state.daysAbsent ?? 0;
      if (streak > 0) {
        return {
          title: pick(lang, "J'ai gelé ta série ❄️🔥", "I froze your streak ❄️🔥"),
          body: pick(
            lang,
            `Ta série de ${streak} jours est sauvée. Reviens la reprendre.`,
            `Your ${streak}-day streak is safe. Come pick it back up.`,
          ),
        };
      }
      return {
        title: pick(lang, "Tu me manques 🧠", "I miss you 🧠"),
        body: d >= 7
          ? pick(lang, "Une question facile pour se remettre en jambes ?", "An easy one to ease back in?")
          : pick(lang, "La question du jour est plutôt sympa aujourd'hui 👀", "Today's question is a fun one 👀"),
      };
    }
  }
}
