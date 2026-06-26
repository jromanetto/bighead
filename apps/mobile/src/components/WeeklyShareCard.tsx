import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { forwardRef } from "react";
import { mixHex } from "../utils/colors";

/**
 * Visuel partageable (story Instagram / WhatsApp) capturé en image via
 * react-native-view-shot. Rendu hors-écran dans l'écran de résultat. Format
 * portrait ~4:5, pensé pour les stories. Le lien de download est affiché en
 * dur (une image n'est pas cliquable) : les gens tapent bighead-quizz.com.
 */

export interface ShareCardData {
  color: string;
  emoji: string; // badge ou 🎯
  score: number;
  total: number;
  pct: number;
  badgeLabel?: string | null;
  themeLabel: string;
  language: string;
}

const CARD_W = 360;
const CARD_H = 450;

export const WeeklyShareCard = forwardRef<View, { data: ShareCardData }>(
  function WeeklyShareCard({ data }, ref) {
    const fr = data.language === "fr";
    return (
      // collapsable={false} : indispensable pour que view-shot capture la View sur Android.
      <View ref={ref} collapsable={false} style={{ width: CARD_W, height: CARD_H }}>
        <LinearGradient
          colors={[data.color, mixHex(data.color, "#000000", 0.6)]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1, padding: 28, justifyContent: "space-between" }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text style={{ color: "#fff", fontSize: 22, fontWeight: "900", letterSpacing: 2 }}>
              BIGHEAD
            </Text>
            <Text style={{ fontSize: 24 }}>🧠</Text>
          </View>

          <View style={{ alignItems: "center" }}>
            <Text style={{ fontSize: 84 }}>{data.emoji}</Text>
            <Text
              style={{
                color: "rgba(255,255,255,0.85)",
                fontSize: 12,
                fontWeight: "800",
                letterSpacing: 3,
                textTransform: "uppercase",
                marginTop: 8,
              }}
            >
              {fr ? "Mon score" : "My score"}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "baseline", marginTop: 2 }}>
              <Text style={{ color: "#fff", fontSize: 72, fontWeight: "900" }}>{data.score}</Text>
              <Text style={{ color: "#fff", fontSize: 46, fontWeight: "800" }}>/{data.total}</Text>
            </View>
            <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: 18, fontWeight: "700" }}>
              {data.pct}%
            </Text>
            {data.badgeLabel ? (
              <View
                style={{
                  backgroundColor: "rgba(0,0,0,0.35)",
                  borderRadius: 999,
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                  marginTop: 12,
                }}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: "800",
                    letterSpacing: 1,
                    textTransform: "uppercase",
                  }}
                >
                  {data.emoji} {data.badgeLabel}
                </Text>
              </View>
            ) : null}
            <Text
              style={{
                color: "rgba(255,255,255,0.92)",
                fontSize: 15,
                fontWeight: "600",
                marginTop: 14,
                textAlign: "center",
              }}
            >
              Quiz {data.themeLabel}
            </Text>
          </View>

          <View style={{ alignItems: "center" }}>
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "800" }}>
              {fr ? "Tu fais mieux ? 🔥" : "Can you beat it? 🔥"}
            </Text>
            <Text
              style={{
                color: "rgba(255,255,255,0.85)",
                fontSize: 13,
                fontWeight: "600",
                marginTop: 3,
              }}
            >
              {fr ? "Joue gratuit sur " : "Play free on "}
              <Text style={{ fontWeight: "900", color: "#fff" }}>bighead-quizz.com</Text>
            </Text>
          </View>
        </LinearGradient>
      </View>
    );
  },
);
