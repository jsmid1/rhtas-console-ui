import type { SystemHealthResponse } from "@app/client";

export const systemHealthMock: SystemHealthResponse = {
  securesignStatus: "healthy",
  rekorStatus: "healthy",
  fulcioStatus: "healthy",
  ctlogStatus: "healthy",
  trillianStatus: "healthy",
  tsaStatus: "healthy",
  tufStatus: "healthy",
  updatedAt: "2026-06-30T09:18:32.658987Z",
};
