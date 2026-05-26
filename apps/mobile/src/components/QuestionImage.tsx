import { memo, useCallback, useEffect, useState } from "react";
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
};

/**
 * Image component with automatic retry/fallback logic for quiz questions.
 *
 * Handles Clearbit logos, flagcdn flags, and Unsplash photos gracefully:
 * - Clearbit: tries multiple sizes, Google favicon, Brandfetch
 * - flagcdn: tries FlagsAPI fallback
 * - Unsplash: tries with different width params
 *
 * Shows a loading indicator while loading, a fallback UI on final failure,
 * and an optional credit overlay.
 */
function QuestionImageInner({
  uri,
  style,
  credit,
  onImageBroken,
  fallbackText = "\u{1F5BC}\uFE0F",
}: QuestionImageProps) {
  const [loading, setLoading] = useState(true);
  const [currentUri, setCurrentUri] = useState(uri);
  const [attemptIndex, setAttemptIndex] = useState(0);
  const [finalError, setFinalError] = useState(false);

  // Reset state when uri changes (new question)
  useEffect(() => {
    setCurrentUri(uri);
    setAttemptIndex(0);
    setFinalError(false);
    setLoading(true);
  }, [uri]);

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

  const handleError = useCallback(() => {
    const nextIndex = attemptIndex + 1;
    if (nextIndex < alternativeUrls.length) {
      setAttemptIndex(nextIndex);
      setCurrentUri(alternativeUrls[nextIndex]);
      setLoading(true);
    } else {
      // All alternatives exhausted
      setLoading(false);
      setFinalError(true);
      onImageBroken?.();
    }
  }, [attemptIndex, alternativeUrls, onImageBroken]);

  if (finalError) {
    return (
      <View
        style={[
          style,
          {
            backgroundColor: "rgba(255,255,255,0.1)",
            alignItems: "center",
            justifyContent: "center",
          },
        ]}
      >
        <Text style={{ fontSize: 40 }}>{fallbackText}</Text>
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
        onLoadEnd={() => setLoading(false)}
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

// Custom equality: only re-render when uri or credit actually change.
// onImageBroken is a function ref — caller should memoize.
export const QuestionImage = memo(
  QuestionImageInner,
  (prev, next) =>
    prev.uri === next.uri &&
    prev.credit === next.credit &&
    prev.fallbackText === next.fallbackText,
);
