import { useMemo, useRef, useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useTranslation } from "../../src/contexts/LanguageContext";
import { COLORS } from "../../src/theme/colors";
import { buttonPressFeedback } from "../../src/utils/feedback";
import { playJuice } from "../../src/utils/juice";
import { gradeRecall, recallProgress } from "../../src/utils/recall";
import { recallQuestionForDay } from "../../src/data/recallQuestions";

/**
 * Recall — format saisie (Vague 3). Le joueur TAPE les réponses ; on note avec
 * tolérance (accents/casse/articles/1 faute) via `gradeRecall`, et un compteur
 * de complétion se remplit (le moteur à dopamine de Sporcle).
 */
export default function RecallPlayScreen() {
  const { language } = useTranslation();
  const lang = language === "fr" ? "fr" : "en";

  const question = useMemo(() => {
    const dayIndex = Math.floor(Date.now() / 86_400_000);
    return recallQuestionForDay(dayIndex);
  }, []);

  const [found, setFound] = useState<Set<string>>(new Set());
  const [value, setValue] = useState("");
  const [flash, setFlash] = useState<null | "ok" | "dup" | "no">(null);
  const inputRef = useRef<TextInput>(null);

  const progress = recallProgress(found.size, question.items.length);
  const done = found.size >= question.items.length;

  const submit = () => {
    const raw = value.trim();
    if (!raw) return;
    setValue("");
    const result = gradeRecall(raw, question.items.flatMap((it) => [it.label, ...it.accepted]));
    if (!result.correct) {
      setFlash("no");
      playJuice("answer_wrong");
      return;
    }
    // Retrouve l'item correspondant au libellé/variante matché.
    const item = question.items.find(
      (it) => it.label === result.matched || it.accepted.includes(result.matched as string),
    );
    if (!item) return;
    if (found.has(item.label)) {
      setFlash("dup");
      return;
    }
    const next = new Set(found);
    next.add(item.label);
    setFound(next);
    setFlash("ok");
    playJuice(next.size >= question.items.length ? "unlock" : "answer_correct");
  };

  const flashColor = flash === "ok" ? COLORS.success : flash === "no" ? COLORS.coral : COLORS.gold;
  const flashText =
    flash === "ok"
      ? lang === "fr" ? "Trouvé !" : "Found!"
      : flash === "dup"
        ? lang === "fr" ? "Déjà trouvé" : "Already found"
        : flash === "no"
          ? lang === "fr" ? "Pas ça…" : "Not it…"
          : "";

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
      <View className="px-4 pt-2 pb-3 flex-row items-center justify-between">
        <Pressable
          onPress={() => {
            buttonPressFeedback();
            router.back();
          }}
          accessibilityRole="button"
          accessibilityLabel={lang === "fr" ? "Retour" : "Back"}
        >
          <Text className="text-2xl" style={{ color: COLORS.textMuted }}>✕</Text>
        </Pressable>
        <Text className="font-black text-lg text-white">{lang === "fr" ? "Cite tout" : "Name them all"}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View className="px-4">
        <Text className="text-xl font-black text-white mb-3">{lang === "fr" ? question.promptFr : question.promptEn}</Text>

        {/* Compteur de complétion */}
        <View className="flex-row items-center justify-between mb-2">
          <Text className="font-bold" style={{ color: COLORS.primary }}>
            {progress.found} / {progress.total}
          </Text>
          <Text className="text-xs" style={{ color: COLORS.textMuted }}>{progress.pct}%</Text>
        </View>
        <View className="h-2 rounded-full overflow-hidden mb-4" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
          <View style={{ width: `${progress.pct}%`, height: "100%", backgroundColor: COLORS.primary }} />
        </View>

        {!done ? (
          <View className="flex-row gap-2 mb-2">
            <TextInput
              ref={inputRef}
              value={value}
              onChangeText={setValue}
              onSubmitEditing={submit}
              autoFocus
              autoCorrect={false}
              returnKeyType="done"
              placeholder={lang === "fr" ? "Tape une réponse…" : "Type an answer…"}
              placeholderTextColor={COLORS.textMuted}
              className="flex-1 rounded-xl px-4 py-3 text-white"
              style={{ backgroundColor: COLORS.surface, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" }}
            />
            <Pressable
              onPress={submit}
              className="rounded-xl px-5 items-center justify-center"
              style={{ backgroundColor: COLORS.primary }}
              accessibilityRole="button"
              accessibilityLabel={lang === "fr" ? "Valider" : "Submit"}
            >
              <Text className="font-black" style={{ color: COLORS.bg }}>→</Text>
            </Pressable>
          </View>
        ) : (
          <View className="rounded-xl p-4 mb-2 items-center" style={{ backgroundColor: "rgba(34,197,94,0.12)", borderWidth: 1, borderColor: "rgba(34,197,94,0.4)" }}>
            <Text className="font-black text-lg" style={{ color: COLORS.success }}>{lang === "fr" ? "🎉 Sans faute !" : "🎉 Full clear!"}</Text>
          </View>
        )}

        <Text className="text-sm h-5 mb-2" style={{ color: flashColor }}>{flashText}</Text>
      </View>

      {/* Grille des réponses (trouvées révélées, sinon masquées) */}
      <ScrollView className="flex-1 px-4" contentContainerClassName="pb-8">
        <View className="flex-col gap-2">
          {question.items.map((it, idx) => {
            const isFound = found.has(it.label);
            return (
              <View
                key={it.label}
                className="rounded-lg px-4 py-3 flex-row items-center justify-between"
                style={{ backgroundColor: isFound ? "rgba(0,194,204,0.12)" : COLORS.surface, borderWidth: 1, borderColor: isFound ? "rgba(0,194,204,0.4)" : "rgba(255,255,255,0.05)" }}
              >
                <Text className="font-semibold" style={{ color: isFound ? COLORS.text : COLORS.textMuted }}>
                  {isFound ? it.label : `${idx + 1}. ${done ? it.label : "•••••"}`}
                </Text>
                {isFound && <Text style={{ color: COLORS.success }}>✓</Text>}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
