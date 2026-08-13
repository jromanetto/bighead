import { View, Text, ScrollView } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { useAuth } from "../src/contexts/AuthContext";
import { useTranslation } from "../src/contexts/LanguageContext";
import { IconButton } from "../src/components/ui";
import { EmptyState } from "../src/components/EmptyState";
import { Skeleton } from "../src/components/Skeleton";
import { ProfileAvatar } from "../src/components/ProfileAvatar";
import { getWeeklyLeaderboard, type LeaderboardEntry } from "../src/services/games";
import { divisionOf, tierForDivision, sliceDivision, zoneForIndex, DIVISION_SIZE } from "../src/utils/league";

const COLORS = {
  bg: "#161a1d", surface: "#1E2529", primary: "#00c2cc", text: "#ffffff", textMuted: "#9ca3af",
  green: "#22c55e", greenDim: "rgba(34,197,94,0.12)", red: "#ef4444", redDim: "rgba(239,68,68,0.10)",
};

const TIER_FR: Record<string, string> = {
  Diamond: "Diamant", Platinum: "Platine", Gold: "Or", Silver: "Argent", Bronze: "Bronze",
};

export default function LeagueScreen() {
  const { user } = useAuth();
  const { language } = useTranslation();
  const fr = language === "fr";
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    (async () => {
      try {
        setEntries(await getWeeklyLeaderboard(150));
      } catch {
        setEntries([]);
      }
      setLoading(false);
    })();
  }, []);

  const myIndex = entries.findIndex((e) => e.id === user?.id);
  const myRank = myIndex >= 0 ? myIndex + 1 : -1;
  const divIndex = myRank > 0 ? divisionOf(myRank, DIVISION_SIZE) : 0;
  const tier = tierForDivision(divIndex);
  const division = sliceDivision(entries, divIndex, DIVISION_SIZE);
  const totalDivisions = Math.max(1, Math.ceil(entries.length / DIVISION_SIZE));
  const isTop = divIndex === 0;
  const isLast = divIndex === totalDivisions - 1;
  const promoteN = Math.max(1, Math.floor(division.length * 0.2));
  const relegateN = Math.max(1, Math.floor(division.length * 0.2));

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
      <View className="flex-row items-center px-5 pt-4 mb-4">
        <IconButton name="ArrowLeft" onPress={() => router.back()} variant="glass" size={40} style={{ marginRight: 12 }} />
        <View>
          <Text className="text-white text-2xl font-black">🏆 {fr ? "Ta ligue" : "Your league"}</Text>
          <Text style={{ color: COLORS.textMuted }} className="text-xs">{fr ? "Classement de la semaine" : "This week's ranking"}</Text>
        </View>
      </View>

      {loading ? (
        <View className="px-5 gap-3">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} width="100%" height={56} rounded={14} />)}</View>
      ) : myRank < 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <EmptyState
            emoji="🏆"
            title={fr ? "Pas encore dans la ligue" : "Not in the league yet"}
            subtitle={fr ? "Joue cette semaine pour entrer dans une division et grimper." : "Play this week to join a division and climb."}
            cta={{ label: fr ? "Jouer" : "Play", onPress: () => router.replace("/") }}
          />
        </View>
      ) : (
        <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          {/* Tier header */}
          <View className="rounded-2xl p-5 mb-4 items-center" style={{ backgroundColor: COLORS.surface, borderWidth: 1, borderColor: `${tier.color}44` }}>
            <Text style={{ fontSize: 40 }}>{tier.emoji}</Text>
            <Text style={{ color: tier.color, fontWeight: "900", fontSize: 20 }}>
              {fr ? `Ligue ${TIER_FR[tier.name]}` : `${tier.name} League`}
            </Text>
            <Text style={{ color: COLORS.textMuted, fontSize: 12, marginTop: 4, textAlign: "center" }}>
              {isTop
                ? (fr ? `Bottom ${relegateN} relégués · reste au sommet` : `Bottom ${relegateN} relegated · stay on top`)
                : isLast
                ? (fr ? `Top ${promoteN} promus vers la division supérieure` : `Top ${promoteN} promoted to the division above`)
                : (fr ? `Top ${promoteN} promus · bottom ${relegateN} relégués` : `Top ${promoteN} promoted · bottom ${relegateN} relegated`)}
            </Text>
          </View>

          {/* Division list */}
          <View className="gap-2">
            {division.map((e, i) => {
              const zone = zoneForIndex(i, division.length, { isTopDivision: isTop, isLastDivision: isLast, promote: promoteN, relegate: relegateN });
              const isMe = e.id === user?.id;
              const rowBg = isMe ? "rgba(0,194,204,0.15)" : zone === "promote" ? COLORS.greenDim : zone === "relegate" ? COLORS.redDim : COLORS.surface;
              const rowBorder = isMe ? COLORS.primary : zone === "promote" ? "rgba(34,197,94,0.35)" : zone === "relegate" ? "rgba(239,68,68,0.3)" : "rgba(255,255,255,0.06)";
              return (
                <View key={e.id} className="flex-row items-center rounded-xl px-3 py-2.5" style={{ backgroundColor: rowBg, borderWidth: 1, borderColor: rowBorder }}>
                  <Text style={{ color: COLORS.textMuted, width: 28, fontWeight: "800", fontSize: 13 }}>{i + 1}</Text>
                  <Text style={{ width: 16 }}>{zone === "promote" ? "⬆️" : zone === "relegate" ? "⬇️" : ""}</Text>
                  <View className="mr-2"><ProfileAvatar username={e.username} avatarUrl={e.avatar_url} size={30} /></View>
                  <Text className="flex-1 font-semibold" style={{ color: isMe ? COLORS.primary : COLORS.text }} numberOfLines={1}>
                    {e.username || "Player"}{isMe ? (fr ? " (toi)" : " (you)") : ""}
                  </Text>
                  <Text style={{ color: COLORS.text, fontWeight: "800" }}>{e.total_xp?.toLocaleString() || 0}</Text>
                  <Text style={{ color: COLORS.textMuted, fontSize: 11, marginLeft: 3 }}>XP</Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
