import { describe, expect, it } from "vitest";
import {
  dashboardStatusLabel,
  formatErrorRate,
  formatRelativeTime,
  getDashboardStatus,
  getOverallStatus,
  overallStatusToSeverity,
  statusLabel,
} from "./utils";

describe("getOverallStatus", () => {
  it("returns Healthy when all services are healthy", () => {
    expect(getOverallStatus(["healthy", "healthy", "healthy", "healthy"])).toBe("Healthy");
  });

  it("returns Down when all services are unhealthy", () => {
    expect(getOverallStatus(["unhealthy", "unhealthy", "unhealthy", "unhealthy"])).toBe("Down");
  });

  it("returns Degraded for mixed or unknown statuses", () => {
    expect(getOverallStatus(["healthy", "unhealthy", "healthy", "healthy"])).toBe("Degraded");
    expect(getOverallStatus(["healthy", "unknown", "healthy", "healthy"])).toBe("Degraded");
    expect(getOverallStatus(["unhealthy", "unknown", "unhealthy", "unhealthy"])).toBe("Degraded");
  });
});

describe("getDashboardStatus", () => {
  it("derives the page status from component statuses", () => {
    expect(getDashboardStatus(["healthy", "healthy"], "healthy")).toBe("Healthy");
    expect(getDashboardStatus(["healthy", "unhealthy"], "unhealthy")).toBe("Degraded");
    expect(getDashboardStatus(["unhealthy", "unhealthy"], "unhealthy")).toBe("Down");
  });

  it("uses operator readiness as a supporting signal", () => {
    expect(getDashboardStatus(["healthy", "healthy"], "unhealthy")).toBe("Degraded");
    expect(getDashboardStatus(["healthy", "healthy"], "unknown")).toBe("Degraded");
  });

  it("reports unavailable information explicitly", () => {
    expect(getDashboardStatus(["unknown", "unknown"], "unknown")).toBe("Unavailable");
    expect(dashboardStatusLabel("Unavailable")).toBe("Status unavailable");
  });
});

describe("overallStatusToSeverity", () => {
  it("maps dashboard statuses to PatternFly severities", () => {
    expect(overallStatusToSeverity("Healthy")).toBe("success");
    expect(overallStatusToSeverity("Degraded")).toBe("warning");
    expect(overallStatusToSeverity("Down")).toBe("danger");
  });
});

describe("statusLabel", () => {
  it("maps API values to user-facing labels", () => {
    expect(statusLabel("healthy")).toBe("Healthy");
    expect(statusLabel("unhealthy")).toBe("Down");
    expect(statusLabel("unknown")).toBe("Unknown");
  });
});

describe("formatErrorRate", () => {
  it("keeps exact zero distinct from a positive rate that rounds to zero", () => {
    expect(formatErrorRate(0)).toBe("0.0%");
    expect(formatErrorRate(0.0001)).toBe("<0.1%");
    expect(formatErrorRate(0.001)).toBe("0.1%");
    expect(formatErrorRate(0.25)).toBe("25.0%");
  });
});

describe("formatRelativeTime", () => {
  it("formats compact timestamps for the dashboard header", () => {
    const now = Date.parse("2026-11-03T10:00:04Z");

    expect(formatRelativeTime("2026-11-03T10:00:00Z", now)).toBe("4s ago");
    expect(formatRelativeTime("2026-11-03T09:55:00Z", now)).toBe("5m ago");
    expect(formatRelativeTime("not-a-date", now)).toBe("unknown");
  });
});
