import { View, Text, Pressable, Image, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";

// Color palettes for generated avatars
const AVATAR_COLORS = [
  ["#FF6B6B", "#FF8E53"], // Coral-Orange
  ["#4ECDC4", "#44B4AA"], // Teal
  ["#A16EFF", "#8B5CF6"], // Purple
  ["#FFD93D", "#FF9900"], // Yellow-Orange
  ["#6BCB77", "#4AAE5A"], // Green
  ["#4D96FF", "#0066FF"], // Blue
  ["#FF6BA3", "#FF4777"], // Pink
  ["#00C2CC", "#00A3B5"], // Cyan
  ["#FF8066", "#FF5252"], // Red
  ["#9B59B6", "#8E44AD"], // Violet
];

// Background patterns
const PATTERNS = ["●", "◆", "★", "▲", "■", "◉", "✦", "⬡"];

interface ProfileAvatarProps {
  userId?: string | null;
  username?: string | null;
  avatarUrl?: string | null;
  size?: number;
  editable?: boolean;
  onAvatarChange?: (uri: string) => void;
  showBorder?: boolean;
  borderColor?: string;
}

// Generate a deterministic number from a string
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// Get colors based on user ID
function getAvatarColors(seed: string): [string, string] {
  const hash = hashString(seed);
  const index = hash % AVATAR_COLORS.length;
  return AVATAR_COLORS[index] as [string, string];
}

// Get pattern based on user ID
function getPattern(seed: string): string {
  const hash = hashString(seed + "pattern");
  return PATTERNS[hash % PATTERNS.length];
}

export function ProfileAvatar({
  userId,
  username,
  avatarUrl,
  size = 80,
  editable = false,
  onAvatarChange,
  showBorder = true,
  borderColor = "#00c2cc",
}: ProfileAvatarProps) {
  const [loading, setLoading] = useState(false);
  const [localUri, setLocalUri] = useState<string | null>(null);

  // Use local URI if available, otherwise use avatar URL
  const displayUri = localUri || avatarUrl;

  // Generate seed for avatar (use ID, username, or random)
  const seed = userId || username || Math.random().toString();
  const [color1, color2] = getAvatarColors(seed);
  const pattern = getPattern(seed);
  const initial = username?.charAt(0).toUpperCase() || "?";

  const handlePress = async () => {
    if (!editable || !onAvatarChange) return;

    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        return;
      }

      setLoading(true);

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        setLocalUri(uri);
        onAvatarChange(uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
    } finally {
      setLoading(false);
    }
  };

  const borderWidth = showBorder ? Math.max(2, size * 0.04) : 0;
  const innerSize = size - borderWidth * 2;

  return (
    <Pressable
      onPress={handlePress}
      disabled={!editable}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth,
        borderColor,
        overflow: "hidden",
        opacity: loading ? 0.7 : 1,
      }}
    >
      {displayUri ? (
        // Show uploaded/stored image
        <Image
          source={{ uri: displayUri }}
          style={{
            width: innerSize,
            height: innerSize,
            borderRadius: innerSize / 2,
          }}
        />
      ) : (
        // Show generated avatar
        <LinearGradient
          colors={[color1, color2]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: innerSize,
            height: innerSize,
            borderRadius: innerSize / 2,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Background pattern */}
          <View
            style={{
              position: "absolute",
              opacity: 0.15,
            }}
          >
            <Text style={{ fontSize: size * 0.8, color: "#fff" }}>{pattern}</Text>
          </View>

          {/* Initial letter */}
          <Text
            style={{
              color: "#fff",
              fontSize: size * 0.4,
              fontWeight: "900",
              textShadowColor: "rgba(0,0,0,0.3)",
              textShadowOffset: { width: 1, height: 1 },
              textShadowRadius: 2,
            }}
          >
            {initial}
          </Text>
        </LinearGradient>
      )}

      {/* Loading overlay */}
      {loading && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            borderRadius: size / 2,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ActivityIndicator color="#fff" />
        </View>
      )}

      {/* Edit indicator */}
      {editable && !loading && (
        <View
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: size * 0.3,
            height: size * 0.3,
            borderRadius: size * 0.15,
            backgroundColor: "#00c2cc",
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 2,
            borderColor: "#161a1d",
          }}
        >
          <Text style={{ color: "#161a1d", fontSize: size * 0.15, fontWeight: "bold" }}>
            +
          </Text>
        </View>
      )}
    </Pressable>
  );
}

// Smaller avatar for lists (leaderboard, etc.)
export function SmallAvatar({
  userId,
  username,
  avatarUrl,
  size = 40,
  isCurrentUser = false,
  ringColor,
}: {
  userId?: string | null;
  username?: string | null;
  avatarUrl?: string | null;
  size?: number;
  isCurrentUser?: boolean;
  ringColor?: string;
}) {
  return (
    <ProfileAvatar
      userId={userId}
      username={username}
      avatarUrl={avatarUrl}
      size={size}
      showBorder={!!ringColor || isCurrentUser}
      borderColor={ringColor || (isCurrentUser ? "#00c2cc" : "transparent")}
      editable={false}
    />
  );
}
