import { Image } from "react-native";

/**
 * Rendus 3D « game icon » par mode (images générées, fond transparent) —
 * remplacent les icônes SVG plates sur les tuiles de la home pour un rendu
 * plus fun/jeu vidéo. Sous-ensemble : les modes qui ont une illustration dédiée.
 */
const MODE_ART = {
  adventure: require("../../../assets/mode-art/adventure.png"),
  solo: require("../../../assets/mode-art/solo.png"),
  recall: require("../../../assets/mode-art/recall.png"),
  duel: require("../../../assets/mode-art/duel.png"),
  party: require("../../../assets/mode-art/party.png"),
  family: require("../../../assets/mode-art/family.png"),
  audio: require("../../../assets/mode-art/audio.png"),
  geo: require("../../../assets/mode-art/geo.png"),
  daily: require("../../../assets/mode-art/daily.png"),
  more: require("../../../assets/mode-art/more.png"),
} as const;

export type ModeArtName = keyof typeof MODE_ART;

export function ModeArt({ name, size = 52 }: { name: ModeArtName; size?: number }) {
  return (
    <Image
      source={MODE_ART[name]}
      style={{ width: size, height: size }}
      resizeMode="contain"
      fadeDuration={0}
    />
  );
}

export default ModeArt;
