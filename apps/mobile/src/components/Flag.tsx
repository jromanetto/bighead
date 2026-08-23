import { Image } from "react-native";

/**
 * Drapeau pays via flagcdn.com (images, fiable iOS + Android — contrairement aux
 * emoji drapeaux qui ne s'affichent pas sur Android). `country` = code ISO 2
 * lettres (ex "fr"). Rend null si absent/invalide.
 */
export function Flag({ country, size = 16 }: { country?: string | null; size?: number }) {
  if (!country || !/^[a-zA-Z]{2}$/.test(country)) return null;
  const code = country.toLowerCase();
  const bucket = size <= 20 ? "w40" : size <= 40 ? "w80" : "w160";
  return (
    <Image
      source={{ uri: `https://flagcdn.com/${bucket}/${code}.png` }}
      style={{ width: Math.round(size * 1.35), height: size, borderRadius: 2 }}
      resizeMode="cover"
      accessibilityLabel={`Drapeau ${code}`}
    />
  );
}

/** Fallback : dérive un code pays d'une langue UI quand le pays est inconnu. */
export function countryFromLanguage(lang?: string | null): string | null {
  switch ((lang || "").toLowerCase()) {
    case "fr": return "fr";
    case "en": return "gb";
    case "es": return "es";
    case "de": return "de";
    default: return null;
  }
}

export default Flag;
