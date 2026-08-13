import { View, Text, ScrollView, Image } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { useAuth } from "../../src/contexts/AuthContext";
import { useTranslation } from "../../src/contexts/LanguageContext";
import { IconButton } from "../../src/components/ui";
import { Skeleton } from "../../src/components/Skeleton";
import { COUNTRIES, CONTINENTS } from "../../src/data/geography";
import { collectionByContinent, totalCaught, completedContinents } from "../../src/utils/geoCollectionStats";
import { getCaughtCodes, awardContinentCompletions } from "../../src/services/geoCollection";

const COLORS = { bg: "#161a1d", surface: "#1E2529", primary: "#00c2cc", text: "#ffffff", textMuted: "#9ca3af" };
const flagSmall = (code: string) => `https://flagcdn.com/w160/${code}.png`;

export default function GeoCollectionScreen() {
  const { user } = useAuth();
  const { language } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [caught, setCaught] = useState<Set<string>>(new Set());
  const fr = language === "fr";

  useEffect(() => {
    (async () => {
      if (!user?.id) { setLoading(false); return; }
      const codes = await getCaughtCodes(user.id);
      setCaught(codes);
      // Pay the one-time bonus for any completed continent (idempotent).
      const done = completedContinents(codes);
      if (done.length) void awardContinentCompletions(user.id, done);
      setLoading(false);
    })();
  }, [user?.id]);

  const overall = totalCaught(caught);
  const byCont = collectionByContinent(caught);
  const pct = overall.total ? Math.round((overall.caught / overall.total) * 100) : 0;
  const completedCount = completedContinents(caught).length;

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
      <View className="flex-row items-center px-5 pt-4 mb-4">
        <IconButton name="ArrowLeft" onPress={() => router.back()} variant="glass" size={40} style={{ marginRight: 12 }} />
        <View>
          <Text className="text-white text-2xl font-black">🗺️ {fr ? "Ma collection" : "My collection"}</Text>
          <Text style={{ color: COLORS.textMuted }} className="text-xs">
            {fr ? "Attrape tous les drapeaux du monde" : "Catch every flag in the world"}
          </Text>
        </View>
      </View>

      {loading ? (
        <View className="px-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} width="100%" height={90} rounded={16} />)}
        </View>
      ) : (
        <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          {/* Overall */}
          <View className="rounded-2xl p-5 mb-5 items-center" style={{ backgroundColor: COLORS.surface, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" }}>
            <Text style={{ color: COLORS.textMuted, fontSize: 12 }}>{fr ? "Drapeaux collectionnés" : "Flags collected"}</Text>
            <Text style={{ color: COLORS.primary, fontSize: 40, fontWeight: "900" }}>
              {overall.caught}<Text style={{ color: COLORS.textMuted, fontSize: 24 }}> / {overall.total}</Text>
            </Text>
            <View className="w-full h-2 rounded-full mt-2" style={{ backgroundColor: "rgba(0,0,0,0.3)" }}>
              <View style={{ width: `${pct}%`, height: "100%", borderRadius: 999, backgroundColor: COLORS.primary }} />
            </View>
            <Text style={{ color: completedCount > 0 ? "#22c55e" : COLORS.textMuted, marginTop: 8, fontSize: 12, fontWeight: "700" }}>
              🏆 {completedCount}/{CONTINENTS.length} {fr ? "continents complétés" : "continents completed"}
            </Text>
          </View>

          {CONTINENTS.map((cont) => {
            const stat = byCont.find((c) => c.id === cont.id)!;
            const countries = COUNTRIES.filter((k) => k.continent === cont.id);
            return (
              <View key={cont.id} className="mb-6">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-white font-bold text-base">{cont.emoji} {fr ? cont.fr : cont.en}</Text>
                  <Text style={{ color: stat.caught === stat.total ? "#22c55e" : COLORS.textMuted, fontWeight: "700", fontSize: 13 }}>
                    {stat.caught === stat.total ? "✅ " : ""}{stat.caught}/{stat.total}
                  </Text>
                </View>
                <View className="flex-row flex-wrap" style={{ gap: 6 }}>
                  {countries.map((k) => {
                    const has = caught.has(k.code);
                    return (
                      <View key={k.code} style={{ width: 46, alignItems: "center", opacity: has ? 1 : 0.18 }}>
                        <Image
                          source={{ uri: flagSmall(k.code) }}
                          style={{ width: 44, height: 30, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.05)" }}
                          resizeMode="cover"
                        />
                      </View>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
