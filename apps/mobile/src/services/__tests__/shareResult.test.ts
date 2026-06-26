jest.mock("react-native-view-shot", () => ({ captureRef: jest.fn() }));
jest.mock("expo-sharing", () => ({
  isAvailableAsync: jest.fn(),
  shareAsync: jest.fn(),
}));
jest.mock("../../utils/errorReport", () => ({ reportCaught: jest.fn() }));

import { shareResultCard } from "../shareResult";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import { reportCaught } from "../../utils/errorReport";

const mockCapture = captureRef as jest.Mock;
const mockAvail = Sharing.isAvailableAsync as jest.Mock;
const mockShare = Sharing.shareAsync as jest.Mock;
const mockReport = reportCaught as jest.Mock;

const refWith = (current: unknown) => ({ current }) as any;

beforeEach(() => jest.clearAllMocks());

describe("shareResultCard", () => {
  it("captures the card then opens the share sheet with a PNG", async () => {
    mockCapture.mockResolvedValue("file:///tmp/card.png");
    mockAvail.mockResolvedValue(true);
    mockShare.mockResolvedValue(undefined);

    const ok = await shareResultCard(refWith({}), "Le Japon");

    expect(ok).toBe(true);
    expect(mockCapture).toHaveBeenCalledTimes(1);
    expect(mockShare).toHaveBeenCalledWith(
      "file:///tmp/card.png",
      expect.objectContaining({ mimeType: "image/png", dialogTitle: "Le Japon" }),
    );
  });

  it("no-ops (no capture) when the card ref is not mounted", async () => {
    const ok = await shareResultCard(refWith(null), "x");
    expect(ok).toBe(false);
    expect(mockCapture).not.toHaveBeenCalled();
    expect(mockShare).not.toHaveBeenCalled();
  });

  it("returns false when sharing is unavailable (never captures)", async () => {
    mockAvail.mockResolvedValue(false);
    const ok = await shareResultCard(refWith({}), "x");
    expect(ok).toBe(false);
    expect(mockCapture).not.toHaveBeenCalled();
    expect(mockShare).not.toHaveBeenCalled();
  });

  it("swallows capture failures, reports to Sentry, and never throws", async () => {
    mockAvail.mockResolvedValue(true);
    mockCapture.mockRejectedValue(new Error("boom"));
    const ok = await shareResultCard(refWith({}), "x");
    expect(ok).toBe(false);
    expect(mockReport).toHaveBeenCalledWith("share_result_card", expect.any(Error));
  });
});
