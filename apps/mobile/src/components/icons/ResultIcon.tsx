import Svg, { Path, Circle } from "react-native-svg";

/**
 * Icônes d'écran de résultat — même langage que ModeIcon (grille 24, trait 2
 * arrondi, duotone). Remplacent les emoji "de base" (🏆/💪/🧠) par un set propre
 * et cohérent, recolorable.
 */
export type ResultIconName = "trophy" | "medal" | "idea" | "gameover" | "brain";

export function ResultIcon({ name, color, size = 56 }: { name: ResultIconName; color: string; size?: number }) {
  const s = { width: size, height: size };
  switch (name) {
    case "trophy":
      return (
        <Svg {...s} viewBox="0 0 24 24" fill="none">
          <Path d="M7 4 H17 V9 a5 5 0 0 1 -10 0 Z" fill={color} fillOpacity={0.18} stroke={color} strokeWidth={2} strokeLinejoin="round" />
          <Path d="M7 5 H4.5 a2.2 2.2 0 0 0 0 4.4 H6" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" />
          <Path d="M17 5 H19.5 a2.2 2.2 0 0 1 0 4.4 H18" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" />
          <Path d="M12 14 v3 M8.5 20 h7 M10 17 h4" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    case "medal":
      return (
        <Svg {...s} viewBox="0 0 24 24" fill="none">
          <Path d="M8.5 3 L12 8.5 L15.5 3" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          <Circle cx={12} cy={15} r={6} fill={color} fillOpacity={0.18} stroke={color} strokeWidth={2} />
          <Path d="M12 12.2 L12.9 14 L14.8 14.3 L13.4 15.6 L13.8 17.5 L12 16.6 L10.2 17.5 L10.6 15.6 L9.2 14.3 L11.1 14 Z" fill={color} stroke={color} strokeWidth={1} strokeLinejoin="round" />
        </Svg>
      );
    case "idea":
      return (
        <Svg {...s} viewBox="0 0 24 24" fill="none">
          <Path d="M8.5 14.5 a5 5 0 1 1 7 0 c-.7 .6 -1.1 1.3 -1.2 2.2 H9.7 c-.1 -.9 -.5 -1.6 -1.2 -2.2 Z" fill={color} fillOpacity={0.18} stroke={color} strokeWidth={2} strokeLinejoin="round" />
          <Path d="M9.8 19 h4.4 M10.5 21 h3" stroke={color} strokeWidth={2} strokeLinecap="round" />
        </Svg>
      );
    case "gameover":
      return (
        <Svg {...s} viewBox="0 0 24 24" fill="none">
          <Circle cx={12} cy={12} r={9} fill={color} fillOpacity={0.15} stroke={color} strokeWidth={2} />
          <Path d="M9 9 L15 15 M15 9 L9 15" stroke={color} strokeWidth={2} strokeLinecap="round" />
        </Svg>
      );
    case "brain":
      return (
        <Svg {...s} viewBox="0 0 24 24" fill="none">
          <Path d="M11 5 a3 3 0 0 0 -3 2.8 a2.6 2.6 0 0 0 -1.2 4.9 A3 3 0 0 0 8.4 18 H11 Z" fill={color} fillOpacity={0.18} stroke={color} strokeWidth={2} strokeLinejoin="round" />
          <Path d="M13 5 a3 3 0 0 1 3 2.8 a2.6 2.6 0 0 1 1.2 4.9 A3 3 0 0 1 15.6 18 H13 Z" fill={color} fillOpacity={0.18} stroke={color} strokeWidth={2} strokeLinejoin="round" />
          <Path d="M12 5 V18" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
        </Svg>
      );
  }
}

export default ResultIcon;
