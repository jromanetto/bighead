import { View, Text, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { forwardRef } from "react";
import type { ReactNode } from "react";
import { mixHex } from "../utils/colors";

// Logo App Store de l'app (cerveau néon) — reconnaissance + recherche de l'app.
const APP_ICON = require("../../assets/icon.png");

const BG = "#0d1117";
const CARD_W = 360;
const CARD_H = 450;

/**
 * Cadre "Premium brand" commun aux visuels partageables (daily + weekly).
 * Fond sombre façon icône + halo couleur d'accent, header (logo App Store +
 * BIGHEAD + tagline "App de quiz"), zone héros (children) et CTA download. Le
 * lien est imprimé en dur (une image n'est pas cliquable).
 */
export const ShareCardFrame = forwardRef<
  View,
  { accent: string; language: string; children: ReactNode }
>(function ShareCardFrame({ accent, language, children }, ref) {
  const fr = language === "fr";
  return (
    // collapsable={false} : requis pour la capture view-shot sur Android.
    <View
      ref={ref}
      collapsable={false}
      style={{ width: CARD_W, height: CARD_H, backgroundColor: BG, overflow: "hidden" }}
    >
      {/* Halo couleur d'accent, derrière le héros */}
      <View
        style={{
          position: "absolute",
          top: 140,
          alignSelf: "center",
          width: 290,
          height: 290,
          borderRadius: 145,
          backgroundColor: accent,
          opacity: 0.22,
        }}
      />
      {/* Teinte douce en haut */}
      <LinearGradient
        colors={[mixHex(accent, BG, 0.8), BG]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ position: "absolute", top: 0, left: 0, right: 0, height: 170 }}
      />

      <View style={{ flex: 1, padding: 24, justifyContent: "space-between" }}>
        {/* Header */}
        <View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                borderRadius: 10,
                overflow: "hidden",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.18)",
              }}
            >
              <Image source={APP_ICON} style={{ width: 36, height: 36 }} resizeMode="cover" />
            </View>
            <Text
              style={{ color: "#fff", fontSize: 22, fontWeight: "900", letterSpacing: 1.5, marginLeft: 10 }}
            >
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
              marginTop: 7,
              marginLeft: 2,
            }}
          >
            {fr ? "App de quiz · Culture générale" : "Quiz app · General knowledge"}
          </Text>
        </View>

        {/* Héros */}
        <View style={{ alignItems: "center" }}>{children}</View>

        {/* CTA download */}
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
});
