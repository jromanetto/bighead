import { View, Text, Pressable, Alert } from "react-native";
import { memo, useCallback } from "react";
import type { LifelineType, Lifelines } from "../services/lifelines";
import { useLifeline as useLifelineRpc } from "../services/lifelines";
import { useTranslation } from "../contexts/LanguageContext";
import { buttonPressFeedback } from "../utils/feedback";

const COLORS = {
  surface: "#1E2529",
  border: "rgba(255,255,255,0.08)",
  text: "#ffffff",
  muted: "#9ca3af",
  disabled: "rgba(255,255,255,0.04)",
};

type LifelineDef = {
  type: LifelineType;
  emoji: string;
  labelKey:
    | "lifelineFiftyFifty"
    | "lifelineSkip"
    | "lifelinePlus5s"
    | "lifelineDoubleXp";
};

const DEFS: LifelineDef[] = [
  { type: "fifty_fifty", emoji: "🎯", labelKey: "lifelineFiftyFifty" },
  { type: "skip", emoji: "⏭️", labelKey: "lifelineSkip" },
  { type: "plus_5s", emoji: "⏱️", labelKey: "lifelinePlus5s" },
  { type: "double_xp", emoji: "✨", labelKey: "lifelineDoubleXp" },
];

export interface LifelineBarProps {
  lifelines: Lifelines | null;
  /** When provided, hides any lifeline type listed (e.g. timer-irrelevant screens). */
  hide?: LifelineType[];
  /** Called when a lifeline is successfully used (after decrement). */
  onUse: (type: LifelineType, newCount: number) => void;
  /** Optional: ask the user to confirm before consuming. Default true. */
  confirm?: boolean;
  /** Refresh the lifelines state from parent after consumption. */
  onChange?: () => void;
}

function LifelineBarInner({
  lifelines,
  hide = [],
  onUse,
  confirm = true,
  onChange,
}: LifelineBarProps) {
  const { t } = useTranslation();

  const handlePress = useCallback(
    async (def: LifelineDef) => {
      buttonPressFeedback();
      const current = lifelines ? (lifelines as any)[def.type] ?? 0 : 0;

      if (current <= 0) {
        Alert.alert(t("lifelineEmptyTitle"), t("lifelineEmpty"));
        return;
      }

      const apply = async () => {
        const newCount = await useLifelineRpc(def.type);
        if (newCount === null) {
          Alert.alert(t("lifelineErrorTitle"), t("lifelineErrorMessage"));
          return;
        }
        onUse(def.type, newCount);
        onChange?.();
      };

      if (!confirm) {
        await apply();
        return;
      }

      Alert.alert(
        // @ts-ignore - dynamic key
        t(def.labelKey),
        t("lifelineConfirm"),
        [
          { text: t("cancel"), style: "cancel" },
          { text: t("lifelineUse"), onPress: apply },
        ],
      );
    },
    [lifelines, onUse, onChange, confirm, t],
  );

  const visibleDefs = DEFS.filter((d) => !hide.includes(d.type));

  return (
    <View className="flex-row gap-2 px-4 mb-3">
      {visibleDefs.map((def) => {
        const count = lifelines ? (lifelines as any)[def.type] ?? 0 : 0;
        const disabled = count <= 0;
        return (
          <Pressable
            key={def.type}
            onPress={() => handlePress(def)}
            disabled={disabled && false /* still tappable to show alert */}
            className="flex-1 rounded-xl items-center justify-center active:opacity-80"
            style={{
              backgroundColor: disabled ? COLORS.disabled : COLORS.surface,
              borderWidth: 1,
              borderColor: COLORS.border,
              paddingVertical: 10,
              opacity: disabled ? 0.55 : 1,
            }}
          >
            <Text style={{ fontSize: 20 }}>{def.emoji}</Text>
            <View
              className="px-1.5 rounded-full mt-1"
              style={{
                backgroundColor: disabled
                  ? "rgba(255,255,255,0.06)"
                  : "rgba(0,194,204,0.18)",
                minWidth: 22,
              }}
            >
              <Text
                className="text-center text-[11px] font-bold"
                style={{ color: disabled ? COLORS.muted : "#67e8f9" }}
              >
                {count}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

// Re-renders only when lifelines object identity, hide array, or callbacks change.
// Callers should memoize onUse/onChange via useCallback for max benefit.
export const LifelineBar = memo(LifelineBarInner);
