import { Redirect, useLocalSearchParams } from "expo-router";

/**
 * Deep-link redeem route: bighead://challenge/<code> (or the web equivalent)
 * lands here and forwards into the challenge play screen with the code.
 * Static sibling routes (play, leaderboard, index) take precedence, so this
 * only catches an actual challenge code.
 */
export default function ChallengeCodeRedirect() {
  const { code } = useLocalSearchParams<{ code: string }>();
  if (!code) return <Redirect href="/challenge" />;
  return (
    <Redirect
      href={{ pathname: "/challenge/play", params: { code: String(code).toUpperCase() } }}
    />
  );
}
