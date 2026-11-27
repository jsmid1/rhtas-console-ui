import type { ProbeSample, ServiceHealth, SystemHealthResponse } from "@app/client";

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

const probeSample = (
  timestamp: string,
  status: ProbeSample["status"],
  source: ProbeSample["source"],
  latencyMs?: number | null,
  httpStatusCode?: number | null,
  error?: string | null,
): ProbeSample => ({
  timestamp,
  status,
  success: status === "healthy",
  latencyMs: latencyMs ?? null,
  httpStatusCode: httpStatusCode ?? null,
  source,
  error: error ?? null,
});

const serviceHistory = (name: ServiceHealth["name"], samples: ProbeSample[]): ServiceHealth => {
  const service = systemHealthMock.services.find((candidate) => candidate.name === name);
  if (!service) throw new Error(`Unknown service: ${name}`);
  return { ...service, probeHistory: samples };
};

export const systemHealthHistoryMock: SystemHealthResponse = {
  ...systemHealthMock,
  services: [
    serviceHistory("rekor", [
      probeSample("2026-06-30T09:18:02Z", "healthy", "http", 208, 200),
      probeSample("2026-06-30T09:17:32Z", "healthy", "http", 214, 200),
      probeSample("2026-06-30T09:17:02Z", "healthy", "http", 202, 200),
    ]),
    serviceHistory("fulcio", [
      probeSample("2026-06-30T09:18:02Z", "healthy", "http", 90, 200),
      probeSample("2026-06-30T09:17:32Z", "healthy", "http", 94, 200),
      probeSample("2026-06-30T09:17:02Z", "healthy", "http", 88, 200),
    ]),
    serviceHistory("ctlog", [
      probeSample("2026-06-30T09:18:02Z", "healthy", "condition"),
      probeSample("2026-06-30T09:17:32Z", "healthy", "condition"),
      probeSample("2026-06-30T09:17:02Z", "healthy", "condition"),
    ]),
    serviceHistory("trillian", [
      probeSample("2026-06-30T09:18:02Z", "healthy", "condition"),
      probeSample("2026-06-30T09:17:32Z", "healthy", "condition"),
      probeSample("2026-06-30T09:17:02Z", "healthy", "condition"),
    ]),
    serviceHistory("tsa", [
      probeSample("2026-06-30T09:18:02Z", "healthy", "http", 300, 200),
      probeSample("2026-06-30T09:17:32Z", "healthy", "http", 308, 200),
      probeSample("2026-06-30T09:17:02Z", "healthy", "http", 296, 200),
    ]),
    serviceHistory("tuf", [
      probeSample("2026-06-30T09:18:02Z", "healthy", "http", 108, 200),
      probeSample("2026-06-30T09:17:32Z", "healthy", "http", 112, 200),
      probeSample("2026-06-30T09:17:02Z", "healthy", "http", 104, 200),
    ]),
  ],
};
