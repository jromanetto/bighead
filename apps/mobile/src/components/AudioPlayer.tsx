import { useEffect, useRef, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Audio, AVPlaybackStatus } from "expo-av";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  cancelAnimation,
  Easing,
} from "react-native-reanimated";

interface AudioPlayerProps {
  audioUrl: string;
  /** Reset playback state and replay count when this value changes. */
  questionId: string;
  /** Max times the user can press play per question. Default 2. */
  maxReplays?: number;
  /** Optional auto-play first time the component mounts / questionId changes. */
  autoPlay?: boolean;
}

const COLORS = {
  primary: "#00c2cc",
  primaryDim: "rgba(0, 194, 204, 0.15)",
  surface: "#1E2529",
  textMuted: "#9ca3af",
  text: "#ffffff",
};

/**
 * Single-button audio player with a pulsing circle while playing.
 * Tap to play, capped at `maxReplays` per question.
 *
 * Uses expo-av (already a project dep).
 */
export function AudioPlayer({
  audioUrl,
  questionId,
  maxReplays = 2,
  autoPlay = false,
}: AudioPlayerProps) {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playsUsed, setPlaysUsed] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const pulse = useSharedValue(1);
  const opacity = useSharedValue(0.7);

  // Cleanup + reset on question change
  useEffect(() => {
    setPlaysUsed(0);
    setIsPlaying(false);

    return () => {
      cleanupSound();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionId]);

  // Auto-play once per question if requested
  useEffect(() => {
    if (autoPlay && audioUrl && playsUsed === 0) {
      // small delay so the new question UI is on screen
      const t = setTimeout(() => {
        void play();
      }, 250);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionId, audioUrl]);

  // Pulse animation while playing
  useEffect(() => {
    if (isPlaying) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.15, { duration: 600, easing: Easing.out(Easing.ease) }),
          withTiming(1, { duration: 600, easing: Easing.in(Easing.ease) })
        ),
        -1,
        false
      );
      opacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 600 }),
          withTiming(0.7, { duration: 600 })
        ),
        -1,
        false
      );
    } else {
      cancelAnimation(pulse);
      cancelAnimation(opacity);
      pulse.value = withTiming(1, { duration: 200 });
      opacity.value = withTiming(0.7, { duration: 200 });
    }
  }, [isPlaying, pulse, opacity]);

  const cleanupSound = async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.unloadAsync();
      } catch {
        // ignore
      }
      soundRef.current = null;
    }
  };

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;
    if (status.didJustFinish) {
      setIsPlaying(false);
    }
  };

  const play = async () => {
    if (playsUsed >= maxReplays) return;
    if (!audioUrl) return;
    if (isLoading) return;

    setIsLoading(true);
    try {
      // Unload previous instance if any (replay)
      await cleanupSound();

      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true, volume: 1.0 },
        onPlaybackStatusUpdate
      );
      soundRef.current = sound;
      setIsPlaying(true);
      setPlaysUsed((n) => n + 1);
    } catch (e) {
      console.warn("[AudioPlayer] play error:", e);
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  };

  const remaining = Math.max(0, maxReplays - playsUsed);
  const disabled = remaining === 0 || isLoading;

  const outerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: opacity.value,
  }));

  return (
    <View className="items-center justify-center" style={{ paddingVertical: 8 }}>
      <View className="items-center justify-center" style={{ width: 160, height: 160 }}>
        {/* Pulsing halo */}
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: "absolute",
              width: 160,
              height: 160,
              borderRadius: 80,
              backgroundColor: COLORS.primaryDim,
            },
            outerStyle,
          ]}
        />

        <Pressable
          onPress={play}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={isPlaying ? "Playing" : "Play audio"}
          className="items-center justify-center active:opacity-90"
          style={{
            width: 112,
            height: 112,
            borderRadius: 56,
            backgroundColor: disabled ? COLORS.surface : COLORS.primary,
            borderWidth: 2,
            borderColor: disabled ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.15)",
            shadowColor: COLORS.primary,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: disabled ? 0 : 0.5,
            shadowRadius: 14,
          }}
        >
          <Text style={{ fontSize: 44, color: disabled ? COLORS.textMuted : "#0b1416" }}>
            {isPlaying ? "❚❚" : "▶"}
          </Text>
        </Pressable>
      </View>

      <Text style={{ color: COLORS.textMuted, fontSize: 12, marginTop: 12 }}>
        {remaining > 0
          ? `${remaining}/${maxReplays} ${remaining === 1 ? "play" : "plays"} left`
          : "No replays left"}
      </Text>
    </View>
  );
}

export default AudioPlayer;
