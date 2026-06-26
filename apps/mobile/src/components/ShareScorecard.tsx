import React, { useRef, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ShareCardFrame } from "./ShareCardFrame";
import { shareResultCard } from "../services/shareResult";

interface ShareScorecardProps {
  score: number;
  streak: number;
  questionsAnswered: number;
  isNewRecord?: boolean;
  lang?: "fr" | "en";
}

const ACCENT = "#00c2cc";

/**
 * Carte partageable du Daily Brain. Même cadre premium que le weekly
 * (ShareCardFrame : logo App Store + marque + CTA download). La carte est rendue
 * hors-écran et capturée à la demande (shareResultCard) — l'utilisateur voit le
 * visuel dans l'aperçu de la feuille de partage. Héros = bonnes réponses +
 * streak + points.
 */
export const ShareScorecard: React.FC<ShareScorecardProps> = ({
  score,
  streak,
  questionsAnswered,
  isNewRecord,
  lang = "fr",
}) => {
  const isFr = lang === "fr";
  const cardRef = useRef<View>(null);
  const [sharing, setSharing] = useState(false);

  const handleShare = async () => {
    setSharing(true);
    await shareResultCard(cardRef, isFr ? "Partager mon score" : "Share my score");
    setSharing(false);
  };

  return (
    <View style={{ alignItems: "center" }}>
      <TouchableOpacity
        onPress={handleShare}
        disabled={sharing}
        style={{
          backgroundColor: ACCENT,
          paddingVertical: 14,
          paddingHorizontal: 32,
          borderRadius: 14,
          alignItems: "center",
          opacity: sharing ? 0.6 : 1,
        }}
        accessibilityRole="button"
        accessibilityLabel={isFr ? "Partager mon score" : "Share my score"}
      >
        <Text style={{ color: "#0d1117", fontWeight: "900", fontSize: 16 }}>
          {isFr ? "📸 Partager mon score" : "📸 Share my score"}
        </Text>
      </TouchableOpacity>

      {/* Carte hors-écran, capturée à la demande (jamais visible). */}
      <View style={{ position: "absolute", left: -10000, top: 0 }} pointerEvents="none">
        <ShareCardFrame ref={cardRef} accent={ACCENT} language={lang}>
          <Text style={{ fontSize: 62 }}>🧠</Text>
          <Text
            style={{
              color: "rgba(255,255,255,0.6)",
              fontSize: 11,
              fontWeight: "800",
              letterSpacing: 3,
              textTransform: "uppercase",
              marginTop: 4,
            }}
          >
            {isFr ? "Bonnes réponses" : "Correct answers"}
          </Text>
          <Text style={{ color: "#fff", fontSize: 70, fontWeight: "900", marginTop: 2 }}>
            {questionsAnswered}
          </Text>
          {isNewRecord ? (
            <View
              style={{
                backgroundColor: ACCENT,
                borderRadius: 999,
                paddingHorizontal: 16,
                paddingVertical: 6,
                marginTop: 10,
              }}
            >
              <Text
                style={{
                  color: "#0d1117",
                  fontSize: 12,
                  fontWeight: "900",
                  letterSpacing: 1,
                  textTransform: "uppercase",
                }}
              >
                🏆 {isFr ? "Nouveau record" : "New record"}
              </Text>
            </View>
          ) : null}
          <View style={{ flexDirection: "row", marginTop: 16, gap: 28 }}>
            <View style={{ alignItems: "center" }}>
              <Text style={{ color: "#fff", fontSize: 24, fontWeight: "900" }}>🔥 {streak}</Text>
              <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 11 }}>
                {isFr ? "jours" : "days"}
              </Text>
            </View>
            <View style={{ alignItems: "center" }}>
              <Text style={{ color: "#fff", fontSize: 24, fontWeight: "900" }}>
                {score.toLocaleString()}
              </Text>
              <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 11 }}>pts</Text>
            </View>
          </View>
        </ShareCardFrame>
      </View>
    </View>
  );
};
