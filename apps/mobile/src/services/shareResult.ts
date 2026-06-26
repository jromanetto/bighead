import type { RefObject } from "react";
import type { View } from "react-native";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import { reportCaught } from "../utils/errorReport";

/**
 * Capture la carte de résultat (WeeklyShareCard) en PNG et ouvre la feuille de
 * partage native (Instagram Stories/Feed, WhatsApp, etc.). Le lien de download
 * est imprimé sur le visuel (une image n'est pas cliquable).
 *
 * Renvoie false si le partage n'est pas dispo, si l'utilisateur annule, ou en
 * cas d'erreur (remontée à Sentry).
 */
export async function shareResultCard(
  ref: RefObject<View | null>,
  dialogTitle: string,
): Promise<boolean> {
  try {
    if (!ref.current) return false;
    if (!(await Sharing.isAvailableAsync())) return false;
    const uri = await captureRef(ref, { format: "png", quality: 1, result: "tmpfile" });
    await Sharing.shareAsync(uri, {
      mimeType: "image/png",
      dialogTitle,
      UTI: "public.png",
    });
    return true;
  } catch (e) {
    reportCaught("share_result_card", e);
    return false;
  }
}
