import { supabase } from "./supabase";
import * as FileSystem from "expo-file-system";
import { decode } from "base64-arraybuffer";
import { Platform } from "react-native";

const AVATAR_BUCKET = "avatars";

/**
 * Get file extension from MIME type
 */
function getExtensionFromMimeType(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
    "image/heic": "heic",
    "image/heif": "heif",
  };
  return mimeToExt[mimeType.toLowerCase()] || "jpg";
}

/**
 * Upload avatar image to Supabase Storage
 */
export async function uploadAvatar(
  userId: string,
  imageUri: string,
  mimeType?: string
): Promise<string | null> {
  try {
    let base64: string;
    let fileExt: string;
    let contentType: string;

    // Determine file extension and content type
    if (mimeType) {
      fileExt = getExtensionFromMimeType(mimeType);
      contentType = mimeType;
    } else {
      // Fallback: try to extract from URI
      const uriParts = imageUri.split(".");
      const ext = uriParts[uriParts.length - 1]?.toLowerCase();
      // Only use if it looks like a valid image extension
      fileExt = ["jpg", "jpeg", "png", "gif", "webp", "heic", "heif"].includes(ext) ? ext : "jpg";
      contentType = `image/${fileExt === "jpg" ? "jpeg" : fileExt}`;
    }

    // Handle different URI types
    if (Platform.OS === "android" && imageUri.startsWith("content://")) {
      // For Android content URIs, copy to a local file first
      const localUri = `${FileSystem.cacheDirectory}avatar_temp.${fileExt}`;
      await FileSystem.copyAsync({
        from: imageUri,
        to: localUri,
      });
      base64 = await FileSystem.readAsStringAsync(localUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      // Clean up temp file
      await FileSystem.deleteAsync(localUri, { idempotent: true });
    } else {
      // For file:// URIs (iOS and some Android)
      base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
    }

    // Generate unique filename
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(fileName, decode(base64), {
        contentType,
        upsert: true,
      });

    if (error) {
      console.error("Error uploading avatar:", error);
      return null;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(AVATAR_BUCKET)
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  } catch (error) {
    console.error("Error uploading avatar:", error);
    return null;
  }
}

/**
 * Update user's avatar URL in the database
 */
export async function updateAvatarUrl(userId: string, avatarUrl: string): Promise<boolean> {
  try {
    const { error } = await (supabase
      .from("users") as any)
      .update({ avatar_url: avatarUrl })
      .eq("id", userId);

    if (error) {
      console.error("Error updating avatar URL:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error updating avatar URL:", error);
    return false;
  }
}

/**
 * Delete old avatar from storage
 */
export async function deleteAvatar(userId: string, avatarUrl: string): Promise<void> {
  try {
    // Extract path from URL
    const url = new URL(avatarUrl);
    const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/avatars\/(.+)/);
    if (pathMatch && pathMatch[1]) {
      await supabase.storage.from(AVATAR_BUCKET).remove([pathMatch[1]]);
    }
  } catch (error) {
    console.error("Error deleting old avatar:", error);
  }
}
