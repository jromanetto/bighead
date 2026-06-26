/**
 * Regression tests for resolveWeeklyChallenge — the resolver that crossed
 * challenges when two themed quizzes were active the same week.
 *
 * We mock the Supabase client with a chainable builder. `maybeSingle()` decides
 * what to return by inspecting the recorded `.eq()` calls: an `id` filter hits
 * the by-id path, a `status='active'` filter hits the active-fallback path.
 */

// Per-test fixtures the mock resolves to.
let mockByIdRow: any = null;
let mockActiveRow: any = null;

jest.mock("../supabase", () => {
  const makeBuilder = () => {
    const eqs: Record<string, unknown> = {};
    const builder: any = {
      select: () => builder,
      order: () => builder,
      limit: () => builder,
      eq: (col: string, val: unknown) => {
        eqs[col] = val;
        return builder;
      },
      maybeSingle: () => {
        if ("id" in eqs) return Promise.resolve({ data: mockByIdRow, error: null });
        if (eqs.status === "active") return Promise.resolve({ data: mockActiveRow, error: null });
        return Promise.resolve({ data: null, error: null });
      },
    };
    return builder;
  };
  return { supabase: { from: () => makeBuilder() } };
});

import { resolveWeeklyChallenge } from "../weeklyChallenge";

const JAPON = { id: "japon", theme_label_fr: "Le Japon", total_questions: 30 };
const MUSIC = { id: "music", theme_label_fr: "Musique 90s", total_questions: 20 };

beforeEach(() => {
  mockByIdRow = null;
  mockActiveRow = null;
});

describe("resolveWeeklyChallenge", () => {
  it("returns the exact challenge by id (never the active fallback)", async () => {
    mockByIdRow = MUSIC; // the clicked card
    mockActiveRow = JAPON; // what a blind 'active' query would return
    const c = await resolveWeeklyChallenge({ id: "music", type: "themed" });
    expect(c?.id).toBe("music");
    expect(c?.total_questions).toBe(20);
  });

  it("falls back to the active challenge when no id is given", async () => {
    mockActiveRow = MUSIC;
    const c = await resolveWeeklyChallenge({ type: "themed" });
    expect(c?.id).toBe("music");
  });

  it("falls back to active when the id is unknown (stale deep link)", async () => {
    mockByIdRow = null; // id not found
    mockActiveRow = MUSIC;
    const c = await resolveWeeklyChallenge({ id: "deleted-id", type: "themed" });
    expect(c?.id).toBe("music");
  });

  it("returns null when nothing matches", async () => {
    const c = await resolveWeeklyChallenge({ id: "nope", type: "themed" });
    expect(c).toBeNull();
  });
});
