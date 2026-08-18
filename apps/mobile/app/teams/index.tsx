import { useCallback, useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput, Share, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useTranslation } from "../../src/contexts/LanguageContext";
import { COLORS } from "../../src/theme/colors";
import { buttonPressFeedback } from "../../src/utils/feedback";
import { playJuice } from "../../src/utils/juice";
import {
  getMyTeam,
  createTeam,
  joinTeam,
  getTeamLeaderboard,
  teamProgressToGoal,
  suggestedWeeklyGoal,
  type Team,
} from "../../src/services/teams";

const EMOJIS = ["🧠", "🔥", "⚡", "🏆", "💎", "🚀", "🦉", "🎯", "👑", "🐉"];

/**
 * Teams / Clubs (Vague 4) — écran principal. Affiche ton club + le classement
 * des clubs, ou un flux créer/rejoindre si tu n'en as pas.
 */
export default function TeamsScreen() {
  const { language } = useTranslation();
  const lang = language === "fr" ? "fr" : "en";
  const [loading, setLoading] = useState(true);
  const [myTeam, setMyTeam] = useState<Team | null>(null);
  const [board, setBoard] = useState<Team[]>([]);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🧠");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [team, lb] = await Promise.all([getMyTeam(), getTeamLeaderboard(30)]);
      setMyTeam(team);
      setBoard(lb);
    } catch {
      // laisse l'écran s'afficher même en cas d'erreur réseau
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [load]),
  );

  const onCreate = async () => {
    if (busy) return;
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setError(lang === "fr" ? "Choisis un nom de club" : "Pick a club name");
      return;
    }
    setBusy(true);
    setError(null);
    const team = await createTeam(trimmed, emoji);
    setBusy(false);
    if (!team) {
      setError(lang === "fr" ? "Échec de création" : "Creation failed");
      return;
    }
    playJuice("unlock");
    setName("");
    await load();
  };

  const onJoin = async () => {
    if (busy) return;
    const clean = code.trim().toUpperCase();
    if (clean.length !== 6) {
      setError(lang === "fr" ? "Code à 6 caractères" : "6-character code");
      return;
    }
    setBusy(true);
    setError(null);
    const ok = await joinTeam(clean);
    setBusy(false);
    if (!ok) {
      setError(lang === "fr" ? "Code invalide ou club plein" : "Invalid code or club full");
      return;
    }
    playJuice("unlock");
    setCode("");
    await load();
  };

  const shareCode = async () => {
    if (!myTeam) return;
    buttonPressFeedback();
    const msg =
      lang === "fr"
        ? `Rejoins mon club ${myTeam.emoji} ${myTeam.name} sur BigHead ! Code : ${myTeam.join_code}`
        : `Join my club ${myTeam.emoji} ${myTeam.name} on BigHead! Code: ${myTeam.join_code}`;
    try {
      await Share.share({ message: msg });
    } catch {
      /* annulé */
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
      <View className="px-4 pt-2 pb-3 flex-row items-center justify-between">
        <Pressable onPress={() => { buttonPressFeedback(); router.back(); }} accessibilityRole="button" accessibilityLabel={lang === "fr" ? "Retour" : "Back"}>
          <Text className="text-2xl" style={{ color: COLORS.textMuted }}>✕</Text>
        </Pressable>
        <Text className="font-black text-lg text-white">{lang === "fr" ? "Clubs" : "Clubs"}</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center"><ActivityIndicator size="large" color={COLORS.primary} /></View>
      ) : (
        <ScrollView className="flex-1 px-4" contentContainerClassName="pb-12">
          {myTeam ? (
            <View className="rounded-2xl p-5 mb-4" style={{ backgroundColor: COLORS.surface, borderWidth: 1, borderColor: "rgba(0,194,204,0.3)" }}>
              <View className="flex-row items-center gap-3 mb-3">
                <Text style={{ fontSize: 40 }}>{myTeam.emoji}</Text>
                <View className="flex-1">
                  <Text className="text-xl font-black text-white">{myTeam.name}</Text>
                  <Text className="text-sm" style={{ color: COLORS.textMuted }}>
                    {myTeam.member_count} {lang === "fr" ? "membre" : "member"}{myTeam.member_count > 1 ? "s" : ""} · {myTeam.weekly_xp} XP {lang === "fr" ? "cette semaine" : "this week"}
                  </Text>
                </View>
              </View>
              {/* Progression vers l'objectif hebdo du club */}
              <View className="h-2 rounded-full overflow-hidden mb-1" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
                <View style={{ width: `${teamProgressToGoal(myTeam.weekly_xp, suggestedWeeklyGoal(myTeam.member_count))}%`, height: "100%", backgroundColor: COLORS.primary }} />
              </View>
              <Text className="text-[11px] mb-3" style={{ color: COLORS.textMuted }}>
                {lang === "fr" ? "Objectif hebdo" : "Weekly goal"} : {suggestedWeeklyGoal(myTeam.member_count)} XP
              </Text>
              <Pressable onPress={shareCode} className="rounded-xl py-3 items-center" style={{ backgroundColor: COLORS.primary }} accessibilityRole="button" accessibilityLabel={lang === "fr" ? "Inviter" : "Invite"}>
                <Text className="font-black" style={{ color: COLORS.bg }}>{lang === "fr" ? `Inviter (code ${myTeam.join_code})` : `Invite (code ${myTeam.join_code})`}</Text>
              </Pressable>
            </View>
          ) : (
            <View className="rounded-2xl p-5 mb-4" style={{ backgroundColor: COLORS.surface, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" }}>
              <Text className="text-lg font-black text-white mb-1">{lang === "fr" ? "Crée ton club" : "Create your club"}</Text>
              <Text className="text-xs mb-3" style={{ color: COLORS.textMuted }}>{lang === "fr" ? "Joue avec tes potes, visez l'objectif hebdo ensemble." : "Play with friends, hit the weekly goal together."}</Text>
              <View className="flex-row gap-2 mb-3">
                {EMOJIS.map((e) => (
                  <Pressable key={e} onPress={() => { buttonPressFeedback(); setEmoji(e); }} className="rounded-lg items-center justify-center" style={{ width: 34, height: 34, backgroundColor: emoji === e ? COLORS.primaryDim : "transparent", borderWidth: 1, borderColor: emoji === e ? COLORS.primary : "rgba(255,255,255,0.08)" }}>
                    <Text style={{ fontSize: 18 }}>{e}</Text>
                  </Pressable>
                ))}
              </View>
              <TextInput value={name} onChangeText={setName} placeholder={lang === "fr" ? "Nom du club" : "Club name"} placeholderTextColor={COLORS.textMuted} maxLength={40} className="rounded-xl px-4 py-3 text-white mb-3" style={{ backgroundColor: COLORS.bg, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" }} />
              <Pressable onPress={onCreate} disabled={busy} className="rounded-xl py-3 items-center" style={{ backgroundColor: COLORS.primary, opacity: busy ? 0.6 : 1 }} accessibilityRole="button" accessibilityLabel={lang === "fr" ? "Créer le club" : "Create club"}>
                <Text className="font-black" style={{ color: COLORS.bg }}>{lang === "fr" ? "Créer" : "Create"}</Text>
              </Pressable>

              <View className="flex-row items-center my-4">
                <View className="flex-1 h-px" style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />
                <Text className="mx-3 text-xs" style={{ color: COLORS.textMuted }}>{lang === "fr" ? "ou rejoins" : "or join"}</Text>
                <View className="flex-1 h-px" style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />
              </View>
              <View className="flex-row gap-2">
                <TextInput value={code} onChangeText={(t) => setCode(t.toUpperCase())} autoCapitalize="characters" maxLength={6} placeholder={lang === "fr" ? "Code à 6 car." : "6-char code"} placeholderTextColor={COLORS.textMuted} className="flex-1 rounded-xl px-4 py-3 text-white" style={{ backgroundColor: COLORS.bg, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" }} />
                <Pressable onPress={onJoin} disabled={busy} className="rounded-xl px-5 items-center justify-center" style={{ backgroundColor: COLORS.surfaceActive, opacity: busy ? 0.6 : 1 }} accessibilityRole="button" accessibilityLabel={lang === "fr" ? "Rejoindre" : "Join"}>
                  <Text className="font-black text-white">{lang === "fr" ? "OK" : "OK"}</Text>
                </Pressable>
              </View>
            </View>
          )}

          {error && <Text className="text-sm mb-3" style={{ color: COLORS.coral }}>{error}</Text>}

          {/* Classement des clubs */}
          <Text className="text-base font-bold text-gray-100 tracking-wide uppercase px-1 mb-2">{lang === "fr" ? "Classement des clubs" : "Club leaderboard"}</Text>
          {board.length === 0 ? (
            <Text className="text-sm px-1" style={{ color: COLORS.textMuted }}>{lang === "fr" ? "Aucun club pour l'instant — crée le premier !" : "No clubs yet — create the first!"}</Text>
          ) : (
            <View className="flex-col gap-2">
              {board.map((t, i) => {
                const mine = myTeam?.id === t.id;
                return (
                  <View key={t.id} className="rounded-xl px-4 py-3 flex-row items-center" style={{ backgroundColor: mine ? COLORS.primaryDim : COLORS.surface, borderWidth: 1, borderColor: mine ? COLORS.primary : "rgba(255,255,255,0.05)" }}>
                    <Text className="font-black w-7" style={{ color: i < 3 ? COLORS.gold : COLORS.textMuted }}>{i + 1}</Text>
                    <Text style={{ fontSize: 22 }} className="mr-2">{t.emoji}</Text>
                    <View className="flex-1">
                      <Text className="font-bold text-white">{t.name}</Text>
                      <Text className="text-[11px]" style={{ color: COLORS.textMuted }}>{t.member_count} {lang === "fr" ? "membres" : "members"}</Text>
                    </View>
                    <Text className="font-black" style={{ color: COLORS.primary }}>{t.weekly_xp} XP</Text>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
