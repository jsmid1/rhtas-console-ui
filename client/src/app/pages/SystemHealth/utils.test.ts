import { describe, expect, it } from "vitest";
import { getOverallStatus, overallStatusToSeverity, statusLabel } from "./utils";

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
