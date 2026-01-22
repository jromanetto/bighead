/**
 * Offline Cache Service
 * Cache questions locally for offline play
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { getQuestions, formatQuestionsForGame, FormattedQuestion } from "./questions";
import type { Question } from "../types/database";

const CACHE_KEY = "@bighead_questions_cache";
const CACHE_TIMESTAMP_KEY = "@bighead_questions_cache_timestamp";
const CACHE_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface CachedData {
  questions: Question[];
  categories: string[];
  language: string;
}

class OfflineCacheService {
  private isOnline = true;
  private cachedQuestions: Question[] = [];
  private cacheTimestamp: number = 0;

  /**
   * Initialize the cache service
   */
  async initialize(): Promise<void> {
    // Set up network listener
    NetInfo.addEventListener((state) => {
      this.isOnline = state.isConnected ?? true;
    });

    // Load cache from storage
    await this.loadCache();
  }

  /**
   * Check if device is online
   */
  async checkOnline(): Promise<boolean> {
    const state = await NetInfo.fetch();
    this.isOnline = state.isConnected ?? true;
    return this.isOnline;
  }

  /**
   * Load cache from AsyncStorage
   */
  private async loadCache(): Promise<void> {
    try {
      const [cachedData, timestamp] = await Promise.all([
        AsyncStorage.getItem(CACHE_KEY),
        AsyncStorage.getItem(CACHE_TIMESTAMP_KEY),
      ]);

      if (cachedData && timestamp) {
        const parsedTimestamp = parseInt(timestamp, 10);
        const now = Date.now();

        // Check if cache is still valid
        if (now - parsedTimestamp < CACHE_DURATION_MS) {
          const parsed: CachedData = JSON.parse(cachedData);
          this.cachedQuestions = parsed.questions;
          this.cacheTimestamp = parsedTimestamp;
          console.log(`Loaded ${this.cachedQuestions.length} questions from cache`);
        } else {
          console.log("Cache expired, will refresh");
          await this.clearCache();
        }
      }
    } catch (error) {
      console.error("Failed to load cache:", error);
    }
  }

  /**
   * Save questions to cache
   */
  async cacheQuestions(questions: Question[], language: string = "en"): Promise<void> {
    try {
      // Merge with existing cache (avoid duplicates)
      const existingIds = new Set(this.cachedQuestions.map((q) => q.id));
      const newQuestions = questions.filter((q) => !existingIds.has(q.id));

      this.cachedQuestions = [...this.cachedQuestions, ...newQuestions];
      this.cacheTimestamp = Date.now();

      // Get unique categories
      const categories = [...new Set(this.cachedQuestions.map((q) => q.category))];

      const cacheData: CachedData = {
        questions: this.cachedQuestions,
        categories,
        language,
      };

      await Promise.all([
        AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cacheData)),
        AsyncStorage.setItem(CACHE_TIMESTAMP_KEY, this.cacheTimestamp.toString()),
      ]);

      console.log(`Cached ${this.cachedQuestions.length} questions`);
    } catch (error) {
      console.error("Failed to cache questions:", error);
    }
  }

  /**
   * Get questions (from cache if offline)
   */
  async getQuestions(options: {
    count?: number;
    category?: string;
    language?: string;
    excludeIds?: string[];
  } = {}): Promise<FormattedQuestion[]> {
    const { count = 10, category, language = "en", excludeIds = [] } = options;

    const isOnline = await this.checkOnline();

    if (isOnline) {
      try {
        // Try to fetch from server
        const questions = await getQuestions({ count: count * 2, language });

        // Cache the fetched questions
        await this.cacheQuestions(questions, language);

        // Filter and return
        let filtered = questions.filter((q) => !excludeIds.includes(q.id));
        if (category) {
          filtered = filtered.filter((q) => q.category === category);
        }

        return formatQuestionsForGame(filtered.slice(0, count));
      } catch (error) {
        console.error("Failed to fetch questions, using cache:", error);
        // Fall through to use cache
      }
    }

    // Use cached questions
    return this.getQuestionsFromCache({ count, category, excludeIds });
  }

  /**
   * Get questions from cache
   */
  getQuestionsFromCache(options: {
    count?: number;
    category?: string;
    excludeIds?: string[];
  } = {}): FormattedQuestion[] {
    const { count = 10, category, excludeIds = [] } = options;

    let filtered = this.cachedQuestions.filter((q) => !excludeIds.includes(q.id));

    if (category) {
      filtered = filtered.filter((q) => q.category === category);
    }

    // Shuffle
    const shuffled = filtered.sort(() => Math.random() - 0.5);

    return formatQuestionsForGame(shuffled.slice(0, count));
  }

  /**
   * Prefetch questions for offline use
   */
  async prefetch(language: string = "en", categories: string[] = []): Promise<number> {
    const isOnline = await this.checkOnline();
    if (!isOnline) return 0;

    try {
      let totalCached = 0;

      // Fetch general questions
      const generalQuestions = await getQuestions({ count: 50, language });
      await this.cacheQuestions(generalQuestions, language);
      totalCached += generalQuestions.length;

      // Fetch category-specific questions
      for (const category of categories) {
        try {
          const catQuestions = await getQuestions({ count: 20, language });
          const filtered = catQuestions.filter((q) => q.category === category);
          await this.cacheQuestions(filtered, language);
          totalCached += filtered.length;
        } catch (error) {
          console.error(`Failed to prefetch ${category}:`, error);
        }
      }

      return totalCached;
    } catch (error) {
      console.error("Failed to prefetch questions:", error);
      return 0;
    }
  }

  /**
   * Clear the cache
   */
  async clearCache(): Promise<void> {
    this.cachedQuestions = [];
    this.cacheTimestamp = 0;

    await Promise.all([
      AsyncStorage.removeItem(CACHE_KEY),
      AsyncStorage.removeItem(CACHE_TIMESTAMP_KEY),
    ]);
  }

  /**
   * Get cache stats
   */
  getCacheStats(): {
    questionCount: number;
    categories: string[];
    cacheAge: number;
    isExpired: boolean;
  } {
    const categories = [...new Set(this.cachedQuestions.map((q) => q.category))];
    const cacheAge = this.cacheTimestamp > 0 ? Date.now() - this.cacheTimestamp : 0;

    return {
      questionCount: this.cachedQuestions.length,
      categories,
      cacheAge,
      isExpired: cacheAge > CACHE_DURATION_MS,
    };
  }

  /**
   * Check if we have enough cached questions
   */
  hasSufficientCache(minQuestions: number = 20): boolean {
    return this.cachedQuestions.length >= minQuestions;
  }
}

// Singleton instance
export const offlineCache = new OfflineCacheService();

// Initialize on import
offlineCache.initialize().catch(console.error);
