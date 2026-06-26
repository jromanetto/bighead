import { View, Text, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { forwardRef } from "react";
import { mixHex } from "../utils/colors";

// Logo de l'app (cerveau néon) — reconnaissance de marque sur le visuel partagé.
const APP_ICON = require("../../assets/icon.png");

/**
 * Visuel partageable "Premium brand" (story Instagram / WhatsApp), capturé en
 * image via react-native-view-shot. Fond sombre façon icône + halo couleur du
 * thème, logo de l'app + tagline "Quiz culture générale" (pour qu'un inconnu
 * comprenne que c'est une app de quiz), score héros, CTA gratuit. Le lien de
 * download est imprimé en dur (une image n'est pas cliquable).
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

const CARD_W = 380;
const CARD_H = 475;
const BG = "#0d1117";

export const WeeklyShareCard = forwardRef<View, { data: ShareCardData }>(
  function WeeklyShareCard({ data }, ref) {
    const fr = data.language === "fr";
    const accent = data.color;

    return (
      // collapsable={false} : indispensable pour que view-shot capture la View sur Android.
      <View
        ref={ref}
        collapsable={false}
        style={{ width: CARD_W, height: CARD_H, backgroundColor: BG, overflow: "hidden" }}
      >
        {/* Halo couleur du thème, derrière le score */}
        <View
          style={{
            position: "absolute",
            top: 150,
            alignSelf: "center",
            width: 300,
            height: 300,
            borderRadius: 150,
            backgroundColor: accent,
            opacity: 0.22,
          }}
        />
        {/* Teinte douce en haut */}
        <LinearGradient
          colors={[mixHex(accent, BG, 0.8), BG]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{ position: "absolute", top: 0, left: 0, right: 0, height: 180 }}
        />

        <View style={{ flex: 1, padding: 26, justifyContent: "space-between" }}>
          {/* Header : logo + marque + tagline */}
          <View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image
                source={APP_ICON}
                style={{ width: 34, height: 34, borderRadius: 9 }}
                resizeMode="cover"
              />
              <Text style={{ color: "#fff", fontSize: 22, fontWeight: "900", letterSpacing: 1.5, marginLeft: 10 }}>
                BIGHEAD
              </Text>
            </View>
            <Text
              style={{
                color: "rgba(255,255,255,0.65)",
                fontSize: 11,
                fontWeight: "700",
                letterSpacing: 2,
                textTransform: "uppercase",
                marginTop: 6,
                marginLeft: 2,
              }}
            >
              {fr ? "App de quiz · Culture générale" : "Quiz app · General knowledge"}
            </Text>
          </View>

          {/* Score héros */}
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontSize: 76 }}>{data.emoji}</Text>
            <Text
              style={{
                color: "rgba(255,255,255,0.6)",
                fontSize: 11,
                fontWeight: "800",
                letterSpacing: 3,
                textTransform: "uppercase",
                marginTop: 6,
              }}
            >
              {fr ? "Mon score" : "My score"}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "baseline", marginTop: 2 }}>
              <Text style={{ color: "#fff", fontSize: 74, fontWeight: "900" }}>{data.score}</Text>
              <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 40, fontWeight: "800" }}>
                /{data.total}
              </Text>
            </View>
            <Text style={{ color: accent, fontSize: 20, fontWeight: "900", marginTop: -2 }}>
              {data.pct}%
            </Text>
            {data.badgeLabel ? (
              <View
                style={{
                  backgroundColor: accent,
                  borderRadius: 999,
                  paddingHorizontal: 16,
                  paddingVertical: 6,
                  marginTop: 12,
                }}
              >
                <Text
                  style={{
                    color: "#0d1117",
                    fontSize: 12,
                    fontWeight: "900",
                    letterSpacing: 1.5,
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
                fontSize: 16,
                fontWeight: "700",
                marginTop: 14,
                textAlign: "center",
              }}
            >
              Quiz « {data.themeLabel} »
            </Text>
          </View>

          {/* CTA */}
          <View style={{ alignItems: "center" }}>
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "900" }}>
              {fr ? "Tu fais mieux ? 🔥" : "Can you beat it? 🔥"}
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: "600", marginTop: 6 }}>
              {fr ? "📲 App iPhone gratuite — télécharge sur" : "📲 Free iPhone app — download on"}
            </Text>
            <View
              style={{
                marginTop: 6,
                borderColor: accent,
                borderWidth: 1.5,
                borderRadius: 999,
                paddingHorizontal: 18,
                paddingVertical: 7,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 15, fontWeight: "900", letterSpacing: 0.5 }}>
                bighead-quizz.com
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  },
);
