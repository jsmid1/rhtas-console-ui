import type { ServiceHealth, SystemHealthResponse } from "@app/client";

const healthyService = (name: ServiceHealth["name"], probed: boolean): ServiceHealth => ({
  name,
  status: "healthy",
  probed,
  errorRate: 0,
  uptimePercentage: 100,
  consecutiveFailures: 0,
  probeCount: 1,
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
    healthyService("rekor", true),
    healthyService("fulcio", true),
    healthyService("ctlog", false),
    healthyService("trillian", false),
    healthyService("tsa", true),
    healthyService("tuf", true),
  ],
  probeIntervalSeconds: 30,
  windowSeconds: 3600,
  updatedAt: "2026-06-30T09:18:32.658987Z",
};
