/**
 * Sound Service for BigHead
 * Manages game sounds and background music
 */

import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Sound types
export type SoundEffect =
  | "correct"
  | "wrong"
  | "tick"
  | "timeout"
  | "levelUp"
  | "achievement"
  | "buttonPress"
  | "gameStart"
  | "gameOver"
  | "countdown"
  | "chain"
  | "win"
  | "lose";

// Storage keys
const SOUND_ENABLED_KEY = "@bighead_sound_enabled";
const MUSIC_ENABLED_KEY = "@bighead_music_enabled";
const SOUND_VOLUME_KEY = "@bighead_sound_volume";
const MUSIC_VOLUME_KEY = "@bighead_music_volume";

// Sound URLs (using free sound effects)
const SOUND_URLS: Record<SoundEffect, string> = {
  correct: "https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3", // Success ding
  wrong: "https://assets.mixkit.co/active_storage/sfx/2001/2001-preview.mp3", // Error buzz
  tick: "https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3", // Clock tick
  timeout: "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3", // Alarm
  levelUp: "https://assets.mixkit.co/active_storage/sfx/1997/1997-preview.mp3", // Level up
  achievement: "https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3", // Achievement
  buttonPress: "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3", // Click
  gameStart: "https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3", // Game start
  gameOver: "https://assets.mixkit.co/active_storage/sfx/2020/2020-preview.mp3", // Game over
  countdown: "https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3", // Countdown beep
  chain: "https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3", // Combo/chain
  win: "https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3", // Victory
  lose: "https://assets.mixkit.co/active_storage/sfx/2021/2021-preview.mp3", // Defeat
};

// Background music URLs
const MUSIC_URLS = {
  menu: "https://assets.mixkit.co/active_storage/sfx/209/209-preview.mp3",
  game: "https://assets.mixkit.co/active_storage/sfx/212/212-preview.mp3",
  result: "https://assets.mixkit.co/active_storage/sfx/213/213-preview.mp3",
};

class SoundService {
  private soundObjects: Map<SoundEffect, Audio.Sound> = new Map();
  private musicObject: Audio.Sound | null = null;
  private isInitialized = false;
  private soundEnabled = true;
  private musicEnabled = true;
  private soundVolume = 0.8;
  private musicVolume = 0.5;
  private currentMusic: keyof typeof MUSIC_URLS | null = null;

  /**
   * Initialize the sound service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Configure audio mode
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      // Load settings from storage
      await this.loadSettings();

      this.isInitialized = true;
    } catch {
      // Silently fail - sounds are optional
    }
  }

  /**
   * Load settings from AsyncStorage
   */
  private async loadSettings(): Promise<void> {
    try {
      const [soundEnabled, musicEnabled, soundVolume, musicVolume] = await Promise.all([
        AsyncStorage.getItem(SOUND_ENABLED_KEY),
        AsyncStorage.getItem(MUSIC_ENABLED_KEY),
        AsyncStorage.getItem(SOUND_VOLUME_KEY),
        AsyncStorage.getItem(MUSIC_VOLUME_KEY),
      ]);

      if (soundEnabled !== null) this.soundEnabled = soundEnabled === "true";
      if (musicEnabled !== null) this.musicEnabled = musicEnabled === "true";
      if (soundVolume !== null) this.soundVolume = parseFloat(soundVolume);
      if (musicVolume !== null) this.musicVolume = parseFloat(musicVolume);
    } catch {
      // Use default settings
    }
  }

  /**
   * Play a sound effect
   * Fails silently if sound can't be played
   */
  async play(effect: SoundEffect): Promise<void> {
    if (!this.soundEnabled) return;

    try {
      // Get or create sound object
      let sound = this.soundObjects.get(effect);

      if (!sound) {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: SOUND_URLS[effect] },
          { volume: this.soundVolume }
        );
        sound = newSound;
        this.soundObjects.set(effect, sound);
      }

      // Reset and play
      await sound.setPositionAsync(0);
      await sound.setVolumeAsync(this.soundVolume);
      await sound.playAsync();
    } catch {
      // Silently fail - sounds are optional
    }
  }

  /**
   * Play background music
   * Fails silently if music can't be played
   */
  async playMusic(track: keyof typeof MUSIC_URLS): Promise<void> {
    if (!this.musicEnabled) return;
    if (this.currentMusic === track) return;

    try {
      // Stop current music
      await this.stopMusic();

      // Create and play new music
      const { sound } = await Audio.Sound.createAsync(
        { uri: MUSIC_URLS[track] },
        { volume: this.musicVolume, isLooping: true }
      );

      this.musicObject = sound;
      this.currentMusic = track;
      await sound.playAsync();
    } catch {
      // Silently fail - music is optional
    }
  }

  /**
   * Stop background music
   */
  async stopMusic(): Promise<void> {
    if (this.musicObject) {
      try {
        await this.musicObject.stopAsync();
        await this.musicObject.unloadAsync();
      } catch {
        // Ignore cleanup errors
      }
      this.musicObject = null;
      this.currentMusic = null;
    }
  }

  /**
   * Pause background music
   */
  async pauseMusic(): Promise<void> {
    if (this.musicObject) {
      try {
        await this.musicObject.pauseAsync();
      } catch {
        // Silently fail
      }
    }
  }

  /**
   * Resume background music
   */
  async resumeMusic(): Promise<void> {
    if (this.musicObject && this.musicEnabled) {
      try {
        await this.musicObject.playAsync();
      } catch {
        // Silently fail
      }
    }
  }

  /**
   * Set sound effects enabled/disabled
   */
  async setSoundEnabled(enabled: boolean): Promise<void> {
    this.soundEnabled = enabled;
    await AsyncStorage.setItem(SOUND_ENABLED_KEY, enabled.toString());
  }

  /**
   * Set music enabled/disabled
   */
  async setMusicEnabled(enabled: boolean): Promise<void> {
    this.musicEnabled = enabled;
    await AsyncStorage.setItem(MUSIC_ENABLED_KEY, enabled.toString());

    if (!enabled) {
      await this.stopMusic();
    }
  }

  /**
   * Set sound volume (0-1)
   */
  async setSoundVolume(volume: number): Promise<void> {
    this.soundVolume = Math.max(0, Math.min(1, volume));
    await AsyncStorage.setItem(SOUND_VOLUME_KEY, this.soundVolume.toString());
  }

  /**
   * Set music volume (0-1)
   */
  async setMusicVolume(volume: number): Promise<void> {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    await AsyncStorage.setItem(MUSIC_VOLUME_KEY, this.musicVolume.toString());

    if (this.musicObject) {
      await this.musicObject.setVolumeAsync(this.musicVolume);
    }
  }

  /**
   * Get current settings
   */
  getSettings() {
    return {
      soundEnabled: this.soundEnabled,
      musicEnabled: this.musicEnabled,
      soundVolume: this.soundVolume,
      musicVolume: this.musicVolume,
    };
  }

  /**
   * Preload commonly used sounds
   * Fails silently if sounds can't be loaded (e.g., no network)
   */
  async preload(): Promise<void> {
    const commonSounds: SoundEffect[] = ["correct", "wrong", "buttonPress"];

    await Promise.all(
      commonSounds.map(async (effect) => {
        try {
          const { sound } = await Audio.Sound.createAsync(
            { uri: SOUND_URLS[effect] },
            { volume: this.soundVolume },
            undefined,
            false // Don't download immediately
          );
          this.soundObjects.set(effect, sound);
        } catch {
          // Silently fail - sounds are optional
        }
      })
    );
  }

  /**
   * Cleanup all sounds
   */
  async cleanup(): Promise<void> {
    // Unload all sound effects
    for (const [, sound] of this.soundObjects) {
      try {
        await sound.unloadAsync();
      } catch (error) {
        // Ignore cleanup errors
      }
    }
    this.soundObjects.clear();

    // Stop and unload music
    await this.stopMusic();

    this.isInitialized = false;
  }
}

// Singleton instance
export const soundService = new SoundService();

// Convenience functions
export const playSound = (effect: SoundEffect) => soundService.play(effect);
export const playMusic = (track: keyof typeof MUSIC_URLS) => soundService.playMusic(track);
export const stopMusic = () => soundService.stopMusic();
export const pauseMusic = () => soundService.pauseMusic();
export const resumeMusic = () => soundService.resumeMusic();
