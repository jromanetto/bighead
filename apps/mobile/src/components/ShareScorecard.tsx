import React, { useRef } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import ViewShot from "react-native-view-shot";
import * as Sharing from "expo-sharing";

interface ShareScorecardProps {
  score: number;
  streak: number;
  questionsAnswered: number;
  isNewRecord?: boolean;
  lang?: "fr" | "en";
}

export const ShareScorecard: React.FC<ShareScorecardProps> = ({
  score,
  streak,
  questionsAnswered,
  isNewRecord,
  lang = "fr",
}) => {
  const viewShotRef = useRef<ViewShot>(null);

  const handleShare = async () => {
    try {
      const uri = await viewShotRef.current?.capture?.();
      if (!uri) return;

      const available = await Sharing.isAvailableAsync();
      if (!available) return;

      await Sharing.shareAsync(uri, {
        mimeType: "image/png",
        dialogTitle: lang === "fr" ? "Partager mon score" : "Share my score",
      });
    } catch (error) {
      console.error("Error sharing scorecard:", error);
    }
  };

  const isFr = lang === "fr";

  return (
    <View style={{ alignItems: "center" }}>
      <ViewShot
        ref={viewShotRef}
        options={{ format: "png", quality: 1 }}
        style={{
          width: 320,
          padding: 24,
          backgroundColor: "#161a1d",
          borderRadius: 20,
          borderWidth: 2,
          borderColor: "#00c2cc",
        }}
      >
        <Text
          style={{
            fontSize: 28,
            fontWeight: "bold",
            color: "#00c2cc",
            textAlign: "center",
            marginBottom: 4,
          }}
        >
          BIGHEAD
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: "#9ca3af",
            textAlign: "center",
            marginBottom: 16,
          }}
        >
          Daily Brain
        </Text>

        <Text
          style={{
            fontSize: 48,
            fontWeight: "bold",
            color: "#FFD100",
            textAlign: "center",
          }}
        >
          {questionsAnswered}
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: "#9ca3af",
            textAlign: "center",
            marginBottom: 16,
          }}
        >
          {isFr ? "bonnes reponses" : "correct answers"}
        </Text>

        {isNewRecord && (
          <Text
            style={{
              fontSize: 14,
              fontWeight: "bold",
              color: "#FFD100",
              textAlign: "center",
              marginBottom: 12,
            }}
          >
            {isFr ? "Nouveau record !" : "New record!"}
          </Text>
        )}

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            marginBottom: 16,
          }}
        >
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontSize: 24, fontWeight: "bold", color: "#fff" }}>
              {streak}
            </Text>
            <Text style={{ fontSize: 12, color: "#9ca3af" }}>
              {isFr ? "jours" : "days"}
            </Text>
          </View>
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontSize: 24, fontWeight: "bold", color: "#fff" }}>
              {score.toLocaleString()}
            </Text>
            <Text style={{ fontSize: 12, color: "#9ca3af" }}>pts</Text>
          </View>
        </View>

        <Text
          style={{
            fontSize: 11,
            color: "#6b7280",
            textAlign: "center",
          }}
        >
          {isFr
            ? "Telecharge BIGHEAD sur l'App Store"
            : "Download BIGHEAD on the App Store"}
        </Text>
      </ViewShot>

      <TouchableOpacity
        onPress={handleShare}
        style={{
          marginTop: 12,
          backgroundColor: "#00c2cc",
          paddingVertical: 12,
          paddingHorizontal: 24,
          borderRadius: 12,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#161a1d", fontWeight: "bold", fontSize: 16 }}>
          {isFr ? "Partager mon score" : "Share my score"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
