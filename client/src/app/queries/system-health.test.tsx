import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { systemHealthMock } from "./mocks/system-health";

const { mockUseMockableQuery } = vi.hoisted(() => ({
  mockUseMockableQuery: vi.fn(),
}));

vi.mock("@app/axios-config/apiInit", () => ({
  client: {},
}));

vi.mock("@app/client", () => ({
  getApiV1SystemHealth: vi.fn(),
}));

vi.mock("./helpers", () => ({
  useMockableQuery: mockUseMockableQuery,
}));

import { SYSTEM_HEALTH_REFETCH_INTERVAL, SystemHealthKey, useFetchSystemHealth } from "./system-health";

describe("useFetchSystemHealth", () => {
  beforeEach(() => {
    mockUseMockableQuery.mockReset();
    mockUseMockableQuery.mockReturnValue({
      data: systemHealthMock,
      isLoading: false,
      isFetching: false,
      error: null,
      refetch: vi.fn(),
    });
  });

  test("polls system health every 60 seconds", () => {
    renderHook(() => useFetchSystemHealth());

    expect(mockUseMockableQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: SystemHealthKey,
        refetchInterval: SYSTEM_HEALTH_REFETCH_INTERVAL,
      }),
      systemHealthMock,
    );
    expect(SYSTEM_HEALTH_REFETCH_INTERVAL).toBe(60_000);
  });
});
