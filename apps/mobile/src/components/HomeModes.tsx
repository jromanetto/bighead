import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { useTranslation } from "../contexts/LanguageContext";
import { COLORS } from "../theme/colors";
import { buttonPressFeedback } from "../utils/feedback";

/** Applique une opacité à une couleur hex #RRGGBB (pour teinter les icônes). */
function alpha(hex: string, a: number): string {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return hex;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, a))})`;
}

/**
 * Grille de modes "allégée" (direction Mix) — remplace la pile de grosses cartes
 * en dégradé criard par des tuiles PLATES cohérentes : un carré d'icône teinté +
 * titre + sous-titre. Calme, scannable, dans le même langage que le bento.
 */

interface ModeDef {
  route: string;
  icon: string;
  title: { fr: string; en: string };
  sub: { fr: string; en: string };
  accent: string; // couleur d'accent de l'icône
  badge?: string;
}

const MODES: ModeDef[] = [
  { route: "/game/adventure", icon: "🏔️", title: { fr: "Aventure", en: "Adventure" }, sub: { fr: "Grimpe la montagne", en: "Climb the mountain" }, accent: "#3b82f6" },
  { route: "/game/chain", icon: "⚡", title: { fr: "Solo Run", en: "Solo Run" }, sub: { fr: "Mode infini", en: "Endless" }, accent: "#5eead4" },
  { route: "/recall/play", icon: "⌨️", title: { fr: "Cite tout", en: "Name them all" }, sub: { fr: "Format saisie", en: "Typed format" }, accent: "#00c2cc", badge: "NEW" },
  { route: "/duel", icon: "⚔️", title: { fr: "Duel", en: "Versus" }, sub: { fr: "1 v 1", en: "1 v 1" }, accent: "#ff6b6b" },
  { route: "/party/setup", icon: "🎉", title: { fr: "Party", en: "Party" }, sub: { fr: "Multi local", en: "Local multi" }, accent: "#a880ff" },
  { route: "/game/family", icon: "👨‍👩‍👧‍👦", title: { fr: "Famille", en: "Family" }, sub: { fr: "En groupe", en: "In a group" }, accent: "#fb923c" },
  { route: "/audio/play", icon: "🎧", title: { fr: "Audio", en: "Audio" }, sub: { fr: "Devine le son", en: "Guess the sound" }, accent: "#06b6d4" },
  { route: "/geography", icon: "🌍", title: { fr: "Géographie", en: "Geography" }, sub: { fr: "Collection drapeaux", en: "Flag collection" }, accent: "#22c55e" },
  { route: "/game/mode-select", icon: "🎭", title: { fr: "Plus de modes", en: "More modes" }, sub: { fr: "Traître, Enchères…", en: "Traitor, Auction…" }, accent: "#94a2a8" },
];

export function HomeModes() {
  const { language } = useTranslation();
  const lang = language === "fr" ? "fr" : "en";

  return (
    <View className="flex-row flex-wrap" style={{ gap: 10 }}>
      {MODES.map((m) => (
        <Pressable
          key={m.route}
          onPress={() => {
            buttonPressFeedback();
            router.push(m.route as any);
          }}
          className="rounded-2xl p-3.5 active:opacity-90"
          style={{ flexBasis: "48%", flexGrow: 1, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" }}
          accessibilityRole="button"
          accessibilityLabel={m.title[lang]}
        >
          <View className="flex-row items-center justify-between mb-2">
            <View className="rounded-xl items-center justify-center" style={{ width: 40, height: 40, backgroundColor: alpha(m.accent, 0.16) }}>
              <Text style={{ fontSize: 20 }}>{m.icon}</Text>
            </View>
            {m.badge ? (
              <View className="rounded-md px-1.5 py-0.5" style={{ backgroundColor: alpha(m.accent, 0.2) }}>
                <Text className="text-[9px] font-black" style={{ color: m.accent }}>{m.badge}</Text>
              </View>
            ) : null}
          </View>
          <Text className="font-bold text-white" numberOfLines={1}>{m.title[lang]}</Text>
          <Text className="text-[11px]" style={{ color: COLORS.textMuted }} numberOfLines={1}>{m.sub[lang]}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export default HomeModes;
