/**
 * Monetization Service using RevenueCat
 * Handles subscriptions and in-app purchases
 */

import Purchases, {
  PurchasesPackage,
  CustomerInfo,
  PurchasesOffering,
  LOG_LEVEL,
} from "react-native-purchases";
import { Platform } from "react-native";

// RevenueCat API key (same key works for iOS and Android)
const REVENUECAT_API_KEY = process.env.EXPO_PUBLIC_REVENUE_CAT_API_KEY || "";

// Entitlement identifiers
export const ENTITLEMENTS = {
  PREMIUM: "premium",
  NO_ADS: "no_ads",
  UNLIMITED_HINTS: "unlimited_hints",
} as const;

// Product identifiers
export const PRODUCTS = {
  PREMIUM_MONTHLY: "bighead_premium_monthly",
  PREMIUM_YEARLY: "bighead_premium_yearly",
  HINT_PACK_5: "bighead_hints_5",
  HINT_PACK_20: "bighead_hints_20",
  REMOVE_ADS: "bighead_remove_ads",
} as const;

export interface PremiumFeatures {
  isPremium: boolean;
  hasNoAds: boolean;
  hasUnlimitedHints: boolean;
  hintsRemaining: number;
  expirationDate: string | null;
}

class MonetizationService {
  private isInitialized = false;
  private customerInfo: CustomerInfo | null = null;

  /**
   * Initialize RevenueCat
   */
  async initialize(userId?: string): Promise<void> {
    if (this.isInitialized) return;

    if (!REVENUECAT_API_KEY) {
      console.warn("RevenueCat API key not configured");
      return;
    }

    try {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);

      await Purchases.configure({
        apiKey: REVENUECAT_API_KEY,
        appUserID: userId,
      });

      this.isInitialized = true;
      console.log("RevenueCat initialized");

      // Get initial customer info
      await this.refreshCustomerInfo();
    } catch (error) {
      console.error("Failed to initialize RevenueCat:", error);
    }
  }

  /**
   * Set user ID for RevenueCat (after login)
   */
  async setUserId(userId: string): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize(userId);
      return;
    }

    try {
      await Purchases.logIn(userId);
      await this.refreshCustomerInfo();
    } catch (error) {
      console.error("Failed to set RevenueCat user ID:", error);
    }
  }

  /**
   * Clear user (on logout)
   */
  async clearUser(): Promise<void> {
    if (!this.isInitialized) return;

    try {
      await Purchases.logOut();
      this.customerInfo = null;
    } catch (error) {
      console.error("Failed to clear RevenueCat user:", error);
    }
  }

  /**
   * Refresh customer info
   */
  async refreshCustomerInfo(): Promise<CustomerInfo | null> {
    if (!this.isInitialized) return null;

    try {
      this.customerInfo = await Purchases.getCustomerInfo();
      return this.customerInfo;
    } catch (error) {
      console.error("Failed to get customer info:", error);
      return null;
    }
  }

  /**
   * Get available offerings
   */
  async getOfferings(): Promise<PurchasesOffering | null> {
    if (!this.isInitialized) return null;

    try {
      const offerings = await Purchases.getOfferings();
      return offerings.current;
    } catch (error) {
      console.error("Failed to get offerings:", error);
      return null;
    }
  }

  /**
   * Purchase a package
   */
  async purchase(pkg: PurchasesPackage): Promise<{
    success: boolean;
    customerInfo: CustomerInfo | null;
    error?: string;
  }> {
    if (!this.isInitialized) {
      return { success: false, customerInfo: null, error: "Not initialized" };
    }

    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      this.customerInfo = customerInfo;
      return { success: true, customerInfo };
    } catch (error: any) {
      // User cancelled
      if (error.userCancelled) {
        return { success: false, customerInfo: null, error: "cancelled" };
      }
      console.error("Purchase failed:", error);
      return { success: false, customerInfo: null, error: error.message };
    }
  }

  /**
   * Restore purchases
   */
  async restorePurchases(): Promise<{
    success: boolean;
    customerInfo: CustomerInfo | null;
    error?: string;
  }> {
    if (!this.isInitialized) {
      return { success: false, customerInfo: null, error: "Not initialized" };
    }

    try {
      const customerInfo = await Purchases.restorePurchases();
      this.customerInfo = customerInfo;
      return { success: true, customerInfo };
    } catch (error: any) {
      console.error("Restore failed:", error);
      return { success: false, customerInfo: null, error: error.message };
    }
  }

  /**
   * Check if user has a specific entitlement
   */
  hasEntitlement(entitlementId: string): boolean {
    if (!this.customerInfo) return false;
    return typeof this.customerInfo.entitlements.active[entitlementId] !== "undefined";
  }

  /**
   * Check if user is premium
   */
  isPremium(): boolean {
    return this.hasEntitlement(ENTITLEMENTS.PREMIUM);
  }

  /**
   * Check if user has no ads
   */
  hasNoAds(): boolean {
    return this.hasEntitlement(ENTITLEMENTS.NO_ADS) || this.isPremium();
  }

  /**
   * Get premium features status
   */
  getPremiumFeatures(): PremiumFeatures {
    const premiumEntitlement = this.customerInfo?.entitlements.active[ENTITLEMENTS.PREMIUM];

    return {
      isPremium: this.isPremium(),
      hasNoAds: this.hasNoAds(),
      hasUnlimitedHints: this.hasEntitlement(ENTITLEMENTS.UNLIMITED_HINTS) || this.isPremium(),
      hintsRemaining: 3, // Default free hints, should be stored in user profile
      expirationDate: premiumEntitlement?.expirationDate || null,
    };
  }

  /**
   * Get subscription management URL
   */
  async getManagementURL(): Promise<string | null> {
    if (!this.customerInfo) return null;
    return this.customerInfo.managementURL;
  }
}

// Singleton instance
export const monetization = new MonetizationService();

// Alias for backwards compatibility
export const monetizationService = monetization;

// Convenience functions
export const isPremium = () => monetization.isPremium();
export const hasNoAds = () => monetization.hasNoAds();
export const getPremiumFeatures = () => monetization.getPremiumFeatures();
export const getOfferings = () => monetization.getOfferings();
export const purchasePackage = async (pkg: any) => {
  const result = await monetization.purchase(pkg);
  return result.success;
};
export const restorePurchases = async () => {
  const result = await monetization.restorePurchases();
  return result.success;
};
