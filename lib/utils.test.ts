import { describe, it, expect, vi, beforeEach } from "vitest";
import { timeAgo } from "./utils";

describe("timeAgo utility", () => {
  beforeEach(() => {
    // Fixa o tempo do sistema para que os testes sejam consistentes
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-11T12:00:00Z"));
  });

  it("should return 'just now' for dates less than 60 seconds ago", () => {
    const fiftyNineSecondsAgo = new Date("2026-03-11T11:59:01Z").toISOString();
    expect(timeAgo(fiftyNineSecondsAgo)).toBe("just now");
  });

  it("should return minutes ago for dates between 1 and 60 minutes ago", () => {
    const fortyFiveMinutesAgo = new Date("2026-03-11T11:15:00Z").toISOString();
    expect(timeAgo(fortyFiveMinutesAgo)).toBe("45 minutes ago");
  });

  it("should return hours ago for dates between 1 and 24 hours ago", () => {
    const threeHoursAgo = new Date("2026-03-11T09:00:00Z").toISOString();
    expect(timeAgo(threeHoursAgo)).toBe("3 hours ago");
  });

  it("should return days ago for dates more than 24 hours ago", () => {
    const twoDaysAgo = new Date("2026-03-09T12:00:00Z").toISOString();
    expect(timeAgo(twoDaysAgo)).toBe("2 days ago");
  });
});
