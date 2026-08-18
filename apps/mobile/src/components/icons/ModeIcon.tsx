import Svg, { Path, Rect, Circle, Ellipse } from "react-native-svg";

/**
 * Set d'icônes des modes / bento — SVG dessiné main, cohérent (grille 24, trait 2
 * arrondi, duotone : remplissage doux à l'accent + contour net). Remplace les
 * emoji. Recolorable par `color`. Portage 1:1 des chemins validés dans la planche.
 */
export type ModeIconName =
  | "adventure" | "solo" | "recall" | "duel" | "party" | "family" | "audio" | "geo" | "more"
  | "streak" | "league" | "club" | "prime";

export function ModeIcon({ name, color, size = 24 }: { name: ModeIconName; color: string; size?: number }) {
  const s = { width: size, height: size };
  const st = { stroke: color, strokeWidth: 2, fill: "none" as const };
  switch (name) {
    case "adventure":
      return (
        <Svg {...s} viewBox="0 0 24 24" fill="none">
          <Path d="M2.5 19 L9 7.5 L12.5 13.5 L15.5 8.5 L21.5 19 Z" fill={color} fillOpacity={0.18} />
          <Path d="M2.5 19 L9 7.5 L12.5 13.5 L15.5 8.5 L21.5 19 Z" {...st} strokeLinejoin="round" />
          <Path d="M7.4 11 L9 7.5 L10.6 11" stroke={color} strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    case "solo":
      return (
        <Svg {...s} viewBox="0 0 24 24" fill="none">
          <Path d="M13.5 2 L5 13 H11 L10.5 22 L19 10.5 H12.5 L13.5 2 Z" fill={color} fillOpacity={0.18} stroke={color} strokeWidth={2} strokeLinejoin="round" />
        </Svg>
      );
    case "recall":
      return (
        <Svg {...s} viewBox="0 0 24 24" fill="none">
          <Rect x={2.5} y={6} width={19} height={12} rx={3.2} fill={color} fillOpacity={0.14} stroke={color} strokeWidth={2} />
          <Path d="M6 9.6 h.01 M9.5 9.6 h.01 M13 9.6 h.01 M16.5 9.6 h.01 M18 9.6 h.01 M6 12.6 h.01" stroke={color} strokeWidth={2.2} strokeLinecap="round" />
          <Path d="M8 15 H16" stroke={color} strokeWidth={2} strokeLinecap="round" />
        </Svg>
      );
    case "duel":
      return (
        <Svg {...s} viewBox="0 0 24 24" fill="none">
          <Path d="M3.5 3.5 L13 13" stroke={color} strokeWidth={2} strokeLinecap="round" />
          <Path d="M20.5 3.5 L11 13" stroke={color} strokeWidth={2} strokeLinecap="round" />
          <Path d="M13 13 L10.5 15.5 L8.5 20 M11 13 L13.5 15.5 L15.5 20" stroke={color} strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    case "party":
      return (
        <Svg {...s} viewBox="0 0 24 24" fill="none">
          <Path d="M3 21 L8.5 9.5 L15 16 Z" fill={color} fillOpacity={0.18} stroke={color} strokeWidth={2} strokeLinejoin="round" />
          <Path d="M16 4 v2 M20 8 h-2 M18.6 4.6 l-1.4 1.4" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
          <Circle cx={19.5} cy={12.5} r={1} fill={color} />
          <Circle cx={13.5} cy={4.5} r={1} fill={color} />
        </Svg>
      );
    case "family":
      return (
        <Svg {...s} viewBox="0 0 24 24" fill="none">
          <Circle cx={8.5} cy={8} r={3.2} fill={color} fillOpacity={0.16} stroke={color} strokeWidth={2} />
          <Path d="M3 20 a5.5 5.5 0 0 1 11 0" fill={color} fillOpacity={0.16} stroke={color} strokeWidth={2} strokeLinecap="round" />
          <Path d="M15.5 6.2 a3 3 0 0 1 0 5.6 M15.5 15.2 a5.2 5.2 0 0 1 5 4.8" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" />
        </Svg>
      );
    case "audio":
      return (
        <Svg {...s} viewBox="0 0 24 24" fill="none">
          <Path d="M4 14 v-2 a8 8 0 0 1 16 0 v2" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" />
          <Rect x={2.6} y={13} width={4.4} height={7} rx={2.2} fill={color} fillOpacity={0.18} stroke={color} strokeWidth={2} />
          <Rect x={17} y={13} width={4.4} height={7} rx={2.2} fill={color} fillOpacity={0.18} stroke={color} strokeWidth={2} />
        </Svg>
      );
    case "geo":
      return (
        <Svg {...s} viewBox="0 0 24 24" fill="none">
          <Circle cx={12} cy={12} r={9} fill={color} fillOpacity={0.13} stroke={color} strokeWidth={2} />
          <Path d="M3 12 H21" stroke={color} strokeWidth={2} />
          <Ellipse cx={12} cy={12} rx={4} ry={9} fill="none" stroke={color} strokeWidth={2} />
        </Svg>
      );
    case "more":
      return (
        <Svg {...s} viewBox="0 0 24 24" fill="none">
          <Rect x={3.5} y={3.5} width={7} height={7} rx={2.2} fill={color} fillOpacity={0.18} stroke={color} strokeWidth={2} />
          <Rect x={13.5} y={3.5} width={7} height={7} rx={2.2} fill="none" stroke={color} strokeWidth={2} />
          <Rect x={3.5} y={13.5} width={7} height={7} rx={2.2} fill="none" stroke={color} strokeWidth={2} />
          <Rect x={13.5} y={13.5} width={7} height={7} rx={2.2} fill={color} fillOpacity={0.18} stroke={color} strokeWidth={2} />
        </Svg>
      );
    case "streak":
      return (
        <Svg {...s} viewBox="0 0 24 24" fill="none">
          <Path d="M12 3 C13 6 16 7 16 11 a4 4 0 0 1 -8 0 c0 -2 1 -3 2 -4 c0 2 1 2 2 3 c1 -1.5 0 -4.5 0 -7 Z" fill={color} fillOpacity={0.2} stroke={color} strokeWidth={2} strokeLinejoin="round" />
        </Svg>
      );
    case "league":
      return (
        <Svg {...s} viewBox="0 0 24 24" fill="none">
          <Path d="M12 3 L14.6 8.3 L20.5 9.2 L16.2 13.3 L17.3 19 L12 16.2 L6.7 19 L7.8 13.3 L3.5 9.2 L9.4 8.3 Z" fill={color} fillOpacity={0.18} stroke={color} strokeWidth={2} strokeLinejoin="round" />
        </Svg>
      );
    case "club":
      return (
        <Svg {...s} viewBox="0 0 24 24" fill="none">
          <Circle cx={9} cy={9} r={3} fill={color} fillOpacity={0.16} stroke={color} strokeWidth={2} />
          <Circle cx={16.5} cy={10.5} r={2.4} fill="none" stroke={color} strokeWidth={2} />
          <Path d="M3.5 19 a5.5 5.5 0 0 1 11 0 M15 19 a4.5 4.5 0 0 1 5.5 -0.5" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" />
        </Svg>
      );
    case "prime":
      return (
        <Svg {...s} viewBox="0 0 24 24" fill="none">
          <Circle cx={12} cy={13} r={8} fill={color} fillOpacity={0.13} stroke={color} strokeWidth={2} />
          <Path d="M12 9 V13 L15 15" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M9 3 H15" stroke={color} strokeWidth={2} strokeLinecap="round" />
        </Svg>
      );
  }
}

export default ModeIcon;
