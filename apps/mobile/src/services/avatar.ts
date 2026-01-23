import { supabase } from "./supabase";
import { readAsStringAsync } from "expo-file-system";
import { decode } from "base64-arraybuffer";

const AVATAR_BUCKET = "avatars";

/**
 * Upload avatar image to Supabase Storage
 */
export async function uploadAvatar(userId: string, imageUri: string): Promise<string | null> {
  try {
    // Read file as base64
    const base64 = await readAsStringAsync(imageUri, {
      encoding: "base64",
    });

    // Generate unique filename
    const fileExt = imageUri.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    const contentType = `image/${fileExt === "jpg" ? "jpeg" : fileExt}`;

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
