jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);
// On ne teste que les helpers purs — pas besoin d'un vrai client Supabase
// (qui ouvrirait une connexion realtime et laisserait un handle ouvert).
jest.mock("../supabase", () => ({ supabase: { rpc: jest.fn() } }));

import {
  computeTeamWeeklyTotal,
  canJoinTeam,
  teamProgressToGoal,
  rankTeams,
  suggestedWeeklyGoal,
  TEAM_MEMBER_CAP,
} from "../teams";

describe("computeTeamWeeklyTotal", () => {
  it("sums member weekly XP", () => {
    expect(computeTeamWeeklyTotal([100, 250, 0, 50])).toBe(400);
  });
  it("ignores garbage values", () => {
    // @ts-expect-error runtime robustness
    expect(computeTeamWeeklyTotal([100, null, undefined, "x", 50])).toBe(150);
  });
  it("handles empty", () => {
    expect(computeTeamWeeklyTotal([])).toBe(0);
  });
});

describe("canJoinTeam", () => {
  it("allows joining under the cap", () => {
    expect(canJoinTeam(5)).toBe(true);
    expect(canJoinTeam(TEAM_MEMBER_CAP - 1)).toBe(true);
  });
  it("blocks at/over the cap", () => {
    expect(canJoinTeam(TEAM_MEMBER_CAP)).toBe(false);
    expect(canJoinTeam(TEAM_MEMBER_CAP + 3)).toBe(false);
  });
});

describe("teamProgressToGoal", () => {
  it("computes 0..100 clamp", () => {
    expect(teamProgressToGoal(250, 500)).toBe(50);
    expect(teamProgressToGoal(999, 500)).toBe(100);
    expect(teamProgressToGoal(100, 0)).toBe(0);
  });
});

describe("rankTeams", () => {
  it("orders by weekly XP desc, name tiebreak", () => {
    const ranked = rankTeams([
      { name: "Bravo", weekly_xp: 100 },
      { name: "Alpha", weekly_xp: 300 },
      { name: "Charlie", weekly_xp: 100 },
    ]);
    expect(ranked.map((t) => t.name)).toEqual(["Alpha", "Bravo", "Charlie"]);
  });
  it("does not mutate the input", () => {
    const input = [{ name: "A", weekly_xp: 1 }, { name: "B", weekly_xp: 2 }];
    rankTeams(input);
    expect(input[0].name).toBe("A");
  });
});

describe("suggestedWeeklyGoal", () => {
  it("scales with member count", () => {
    expect(suggestedWeeklyGoal(1)).toBe(500);
    expect(suggestedWeeklyGoal(8)).toBe(4000);
    expect(suggestedWeeklyGoal(0)).toBe(500); // guard: min 1 member
  });
});
