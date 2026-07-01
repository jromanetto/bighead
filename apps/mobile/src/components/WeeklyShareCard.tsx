import { View, Text } from "react-native";
import { forwardRef } from "react";
import { ShareCardFrame } from "./ShareCardFrame";
import { difficultyMeta } from "../utils/difficultyLabel";

/**
 * Visuel partageable d'un résultat weekly (story Instagram / WhatsApp). Réutilise
 * le cadre premium commun (ShareCardFrame) et n'apporte que le héros : score,
 * pourcentage, badge et thème.
 */

export interface ShareCardData {
  color: string;
  emoji: string; // badge ou 🎯
  score: number;
  total: number;
  pct: number;
  badgeLabel?: string | null;
  themeLabel: string;
  difficulty?: number | null;
  language: string;
}

export const WeeklyShareCard = forwardRef<View, { data: ShareCardData }>(
  function WeeklyShareCard({ data }, ref) {
    const fr = data.language === "fr";
    const accent = data.color;
    return (
      <ShareCardFrame ref={ref} accent={accent} language={data.language}>
        <Text style={{ fontSize: 72 }}>{data.emoji}</Text>
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
          {fr ? "Mon score" : "My score"}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "baseline", marginTop: 2 }}>
          <Text style={{ color: "#fff", fontSize: 70, fontWeight: "900" }}>{data.score}</Text>
          <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 38, fontWeight: "800" }}>
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
        {(() => {
          const d = difficultyMeta(data.difficulty);
          return d ? (
            <View
              style={{
                marginTop: 8,
                borderRadius: 999,
                paddingHorizontal: 12,
                paddingVertical: 4,
                backgroundColor: d.color,
              }}
            >
              <Text
                style={{
                  color: "#0d1117",
                  fontSize: 11,
                  fontWeight: "900",
                  letterSpacing: 1,
                  textTransform: "uppercase",
                }}
              >
                {fr ? d.fr : d.en}
              </Text>
            </View>
          ) : null;
        })()}
      </ShareCardFrame>
    );
  },
);
