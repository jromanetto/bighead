import { Modal, View, Text, Pressable } from "react-native";
import { useTranslation } from "../contexts/LanguageContext";

const COLORS = {
  surface: "#1E2529",
  surfaceActive: "#252e33",
  primary: "#00c2cc",
  text: "#ffffff",
  textMuted: "#9ca3af",
  bg: "#161a1d",
};

interface Props {
  visible: boolean;
  onClose: () => void;
}

/**
 * Shown on the home screen the day after a streak freeze auto-consume.
 * "Your streak was saved by a Streak Freeze."
 */
export function StreakFreezeModal({ visible, onClose }: Props) {
  const { t } = useTranslation();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 items-center justify-center px-6"
        style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
        onPress={onClose}
      >
        <Pressable
          className="w-full rounded-3xl p-6 items-center"
          style={{ backgroundColor: COLORS.surface, maxWidth: 360 }}
          onPress={(e) => e.stopPropagation()}
        >
          <View
            className="w-20 h-20 rounded-full items-center justify-center mb-4"
            style={{ backgroundColor: "rgba(0, 194, 204, 0.15)" }}
          >
            <Text style={{ fontSize: 44 }}>🛡️</Text>
          </View>

          <Text
            className="text-2xl font-black text-center mb-2"
            style={{ color: COLORS.text }}
          >
            {t("streakFreezeRescuedTitle" as any)}
          </Text>

          <Text
            className="text-center mb-6"
            style={{ color: COLORS.textMuted, lineHeight: 20 }}
          >
            {t("streakFreezeRescued" as any)}
          </Text>

          <Pressable
            onPress={onClose}
            className="w-full rounded-xl py-3"
            style={{ backgroundColor: COLORS.primary }}
          >
            <Text
              className="text-center font-bold"
              style={{ color: COLORS.bg }}
            >
              {t("streakFreezeContinue" as any)}
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default StreakFreezeModal;
