import type { ServiceHealth, SystemHealthResponse } from "@app/client";

const healthyService = (name: ServiceHealth["name"], probed: boolean, latencyP95Ms?: number): ServiceHealth => ({
  name,
  status: "healthy",
  probed,
  latencyP95Ms,
  errorRate: 0,
  uptimePercentage: 100,
  consecutiveFailures: 0,
  probeCount: 120,
});

export const systemHealthMock: SystemHealthResponse = {
  securesignStatus: "healthy",
  securesignStatusReason: null,
  rekorStatus: "healthy",
  fulcioStatus: "healthy",
  ctlogStatus: "healthy",
  trillianStatus: "healthy",
  tsaStatus: "healthy",
  tufStatus: "healthy",
  services: [
    healthyService("rekor", true, 210),
    healthyService("fulcio", true, 92),
    healthyService("ctlog", false),
    healthyService("trillian", false),
    healthyService("tsa", true, 304),
    healthyService("tuf", true, 110),
  ],
  // Monitoring not configured: no counts, nothing invented.
  metrics: {
    status: "disabled",
    reason: null,
    windowSeconds: 3600,
    updatedAt: null,
    errorRates: null,
    signingActivity: null,
  },
  probeIntervalSeconds: 30,
  windowSeconds: 3600,
  updatedAt: "2026-06-30T09:18:32.658987Z",
};
