import { supabase } from "./supabase";

/**
 * Stats Prime Time du jour (participants + percentile du joueur), calculées
 * serveur-side depuis les résultats daily (RPC get_prime_time_stats).
 */
export interface PrimeTimeStats {
  participants: number;
  myCorrect: number;
  percentile: number;
}

export async function fetchPrimeTimeStats(): Promise<PrimeTimeStats | null> {
  // @ts-ignore - RPC non typée
  const { data, error } = await supabase.rpc("get_prime_time_stats");
  if (error) {
    console.warn("[primeTime] stats error:", error.message);
    return null;
  }
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return null;
  return {
    participants: Number((row as any).participants) || 0,
    myCorrect: Number((row as any).my_correct) || 0,
    percentile: Number((row as any).percentile) || 0,
  };
}
