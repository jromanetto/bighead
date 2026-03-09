import { Share, Platform } from "react-native";

interface ShareScoreParams {
  score: number;
  maxChain: number;
  correctCount: number;
  totalQuestions: number;
  mode: "chain" | "party";
}

/**
 * Share game score on social media
 */
export const shareScore = async (params: ShareScoreParams): Promise<boolean> => {
  const { score, maxChain, correctCount, totalQuestions, mode } = params;

  const accuracy = Math.round((correctCount / totalQuestions) * 100);

  let message: string;

  if (mode === "chain") {
    message = `🧠 BIGHEAD - Quiz Culture Gé\n\n` +
      `Score: ${score.toLocaleString()} pts\n` +
      `🔥 Chaîne max: ${maxChain}x\n` +
      `✅ Précision: ${accuracy}%\n\n` +
      `Tu peux faire mieux ? Télécharge BIGHEAD !`;
  } else {
    message = `🎉 BIGHEAD - Mode Party\n\n` +
      `On a joué ensemble !\n` +
      `✅ ${correctCount}/${totalQuestions} bonnes réponses\n\n` +
      `Télécharge BIGHEAD pour jouer !`;
  }

  try {
    const result = await Share.share({
      message,
      title: "Mon score BIGHEAD",
    });

    return result.action === Share.sharedAction;
  } catch (error) {
    console.error("Error sharing:", error);
    return false;
  }
};

/**
 * Share achievement unlock
 */
export const shareAchievement = async (
  achievementName: string,
  achievementIcon: string
): Promise<boolean> => {
  const message = `🏆 J'ai débloqué "${achievementName}" ${achievementIcon} sur BIGHEAD !\n\n` +
    `Rejoins-moi sur le quiz le plus addictif !`;

  try {
    const result = await Share.share({
      message,
      title: `Succès débloqué : ${achievementName}`,
    });

    return result.action === Share.sharedAction;
  } catch (error) {
    console.error("Error sharing achievement:", error);
    return false;
  }
};

/**
 * Share leaderboard position
 */
export const shareLeaderboardPosition = async (
  rank: number,
  totalXp: number
): Promise<boolean> => {
  const message = `🏆 Je suis #${rank} sur BIGHEAD avec ${totalXp.toLocaleString()} XP !\n\n` +
    `Tu peux me battre ? Télécharge BIGHEAD !`;

  try {
    const result = await Share.share({
      message,
      title: "Mon classement BIGHEAD",
    });

    return result.action === Share.sharedAction;
  } catch (error) {
    console.error("Error sharing leaderboard:", error);
    return false;
  }
};

/**
 * Share daily challenge result
 */
export const shareDailyChallenge = async (
  isCorrect: boolean,
  streak: number
): Promise<boolean> => {
  const message = isCorrect
    ? `✅ J'ai réussi le défi du jour sur BIGHEAD !\n🔥 Série: ${streak} jours\n\nEssaie toi aussi !`
    : `😅 J'ai raté le défi du jour sur BIGHEAD...\nMais je garde ma série de ${streak} jours !\n\nEssaie toi aussi !`;

  try {
    const result = await Share.share({
      message,
      title: "Défi du jour BIGHEAD",
    });

    return result.action === Share.sharedAction;
  } catch (error) {
    console.error("Error sharing daily challenge:", error);
    return false;
  }
};

/**
 * Invite friends to play
 */
export const inviteFriends = async (): Promise<boolean> => {
  const message = `🧠 BIGHEAD - Le quiz culture gé ultime !\n\n` +
    `Plus de 10 000 questions dans 11 catégories !\n\n` +
    `Rejoins-moi sur BIGHEAD !`;

  try {
    const result = await Share.share({
      message,
      title: "Joue à BIGHEAD avec moi !",
    });

    return result.action === Share.sharedAction;
  } catch (error) {
    console.error("Error inviting:", error);
    return false;
  }
};
