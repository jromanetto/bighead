import { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  ImageStyle,
  StyleProp,
} from "react-native";

type QuestionImageProps = {
  uri: string;
  style?: StyleProp<ImageStyle>;
  credit?: string | null;
  onImageBroken?: () => void;
  fallbackText?: string;
  /** Used to build a richer fallback (e.g. the correct_answer, first char rendered) */
  correctAnswer?: string;
  /** Used to pick a fallback emoji by category */
  category?: string | null;
  /** Network timeout in ms before considering the image broken (default 10s) */
  timeoutMs?: number;
};

const CATEGORY_EMOJI: Record<string, string> = {
  geography: "\u{1F30D}", // 🌍
  geo: "\u{1F30D}",
  cinema: "\u{1F3AC}", // 🎬
  movie: "\u{1F3AC}",
  film: "\u{1F3AC}",
  music: "\u{1F3B5}", // 🎵
  sport: "⚽", // ⚽
  sports: "⚽",
  football: "⚽",
  history: "\u{1F4DC}", // 📜
  science: "\u{1F9EA}", // 🧪
  tech: "\u{1F4BB}", // 💻
  art: "\u{1F3A8}", // 🎨
  literature: "\u{1F4DA}", // 📚
  food: "\u{1F37D}️", // 🍽️
  animal: "\u{1F43E}", // 🐾
  animals: "\u{1F43E}",
  nature: "\u{1F33F}", // 🌿
  logo: "\u{1F3F7}️", // 🏷️
  brand: "\u{1F3F7}️",
  general: "\u{1F4A1}", // 💡
  default: "\u{1F5BC}️", // 🖼️
};

// App's primary color (sky blue from tailwind config)
const PRIMARY = "#0ea5e9";

/**
 * Image component with automatic retry/fallback logic for quiz questions.
 *
 * Handles Clearbit logos, flagcdn flags, and Unsplash photos gracefully:
 * - Clearbit: tries multiple sizes, Google favicon, Brandfetch
 * - flagcdn: tries FlagsAPI fallback
 * - Unsplash: tries with different width params
 *
 * Shows a loading indicator while loading, a stylized placeholder on final
 * failure (initial of `correctAnswer` or category emoji), and an optional
 * credit overlay. Calls `onImageBroken` once all alternatives are exhausted.
 *
 * Network timeout: if no image loads within `timeoutMs` (default 10s),
 * treats it as an error and advances to the next alternative.
 */
function QuestionImageInner({
  uri,
  style,
  credit,
  onImageBroken,
  fallbackText,
  correctAnswer,
  category,
  timeoutMs = 10_000,
}: QuestionImageProps) {
  const [loading, setLoading] = useState(true);
  const [currentUri, setCurrentUri] = useState(uri);
  const [attemptIndex, setAttemptIndex] = useState(0);
  const [finalError, setFinalError] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Generate alternative URLs based on image source
  const getAlternativeUrls = useCallback(
    (originalUri: string): string[] => {
      const urls = [originalUri];

      // Clearbit logo fallbacks
      if (originalUri.includes("logo.clearbit.com")) {
        const domainMatch = originalUri.match(
          /logo\.clearbit\.com\/([^/?]+)/
        );
        if (domainMatch) {
          const domain = domainMatch[1];
          urls.push(`https://logo.clearbit.com/${domain}?size=200`);
          urls.push(
            `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
          );
          urls.push(`https://cdn.brandfetch.io/${domain}/fallback/logo`);
          if (!domain.startsWith("www.")) {
            urls.push(`https://logo.clearbit.com/www.${domain}`);
          }
        }
      }

      // Flag CDN fallbacks
      if (originalUri.includes("flagcdn.com")) {
        const codeMatch = originalUri.match(/\/([a-z]{2})\.png$/);
        if (codeMatch) {
          const code = codeMatch[1];
          urls.push(
            `https://flagsapi.com/${code.toUpperCase()}/flat/64.png`
          );
        }
      }

      // Unsplash fallbacks - try different widths
      if (originalUri.includes("unsplash.com")) {
        const hasWidth = /[?&]w=\d+/.test(originalUri);
        if (hasWidth) {
          // Try a smaller width
          urls.push(originalUri.replace(/([?&]w=)\d+/, "$1400"));
          // Try without width param entirely
          urls.push(originalUri.replace(/[?&]w=\d+/, ""));
        } else {
          // Try adding a width param
          const separator = originalUri.includes("?") ? "&" : "?";
          urls.push(`${originalUri}${separator}w=600`);
        }
      }

      return urls;
    },
    []
  );

  const alternativeUrls = getAlternativeUrls(uri);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleError = useCallback(() => {
    clearTimer();
    const nextIndex = attemptIndex + 1;
    if (nextIndex < alternativeUrls.length) {
      setAttemptIndex(nextIndex);
      setCurrentUri(alternativeUrls[nextIndex]);
      setLoading(true);
    } else {
      setLoading(false);
      setFinalError(true);
      onImageBroken?.();
    }
  }, [attemptIndex, alternativeUrls, onImageBroken]);

  // Reset state when uri changes (new question)
  useEffect(() => {
    setCurrentUri(uri);
    setAttemptIndex(0);
    setFinalError(false);
    setLoading(true);
    return () => clearTimer();
  }, [uri]);

  // Network timeout: if loading takes longer than timeoutMs, trigger error chain
  useEffect(() => {
    clearTimer();
    if (!loading || finalError) return;
    timerRef.current = setTimeout(() => {
      handleError();
    }, timeoutMs);
    return () => clearTimer();
  }, [loading, currentUri, finalError, timeoutMs, handleError]);

  if (finalError) {
    // Build a richer fallback: prefer initial of correctAnswer, else category emoji, else generic
    const initial = correctAnswer?.trim()?.[0]?.toUpperCase();
    const emoji =
      (category && CATEGORY_EMOJI[category.toLowerCase()]) ||
      fallbackText ||
      CATEGORY_EMOJI.default;

    return (
      <View
        style={[
          style,
          {
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(255,255,255,0.05)",
          },
        ]}
      >
        {initial ? (
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 16,
              backgroundColor: PRIMARY,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 8,
            }}
          >
            <Text
              style={{
                color: "white",
                fontSize: 36,
                fontWeight: "700",
              }}
            >
              {initial}
            </Text>
          </View>
        ) : (
          <Text style={{ fontSize: 44 }}>{emoji}</Text>
        )}
        <Text style={{ color: "#9ca3af", fontSize: 12, marginTop: 8 }}>
          Image non disponible
        </Text>
      </View>
    );
  }

  return (
    <View style={{ position: "relative" }}>
      {loading && (
        <View
          style={[
            style,
            {
              backgroundColor: "rgba(255,255,255,0.05)",
              alignItems: "center",
              justifyContent: "center",
              position: "absolute",
              zIndex: 1,
            },
          ]}
        >
          <ActivityIndicator size="small" color="#00c2cc" />
        </View>
      )}
      <Image
        source={{ uri: currentUri }}
        style={style}
        resizeMode="contain"
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => {
          clearTimer();
          setLoading(false);
        }}
        onError={handleError}
      />
      {/* Credit overlay */}
      {!loading && credit ? (
        <View
          style={{
            position: "absolute",
            bottom: 4,
            right: 6,
            backgroundColor: "rgba(0,0,0,0.55)",
            borderRadius: 4,
            paddingHorizontal: 6,
            paddingVertical: 2,
          }}
        >
          <Text
            style={{ color: "#d1d5db", fontSize: 10 }}
            numberOfLines={1}
          >
            {credit}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

// Custom equality: only re-render when uri, credit, or fallback inputs change.
// onImageBroken is a function ref — caller should memoize.
export const QuestionImage = memo(
  QuestionImageInner,
  (prev, next) =>
    prev.uri === next.uri &&
    prev.credit === next.credit &&
    prev.fallbackText === next.fallbackText &&
    prev.correctAnswer === next.correctAnswer &&
    prev.category === next.category &&
    prev.timeoutMs === next.timeoutMs,
);
