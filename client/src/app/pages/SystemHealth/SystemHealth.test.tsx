import type { SystemHealthResponse } from "@app/client";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { SystemHealth } from "./SystemHealth";

vi.mock("@app/components/DocumentMetadata", () => ({
  DocumentMetadata: () => null,
}));

const mockRefetch = vi.fn();

vi.mock("@app/queries/system-health", () => ({
  useFetchSystemHealth: vi.fn(),
}));

import { useFetchSystemHealth } from "@app/queries/system-health";

const mockUseFetchSystemHealth = vi.mocked(useFetchSystemHealth);

const healthyResponse: SystemHealthResponse = {
  securesignStatus: "healthy",
  rekorStatus: "healthy",
  tufStatus: "healthy",
  fulcioStatus: "healthy",
  ctlogStatus: "healthy",
  trillianStatus: "healthy",
  tsaStatus: "healthy",
  updatedAt: "2026-06-30T09:18:32.658987Z",
};

const setQueryState = (
  overrides: Partial<ReturnType<typeof useFetchSystemHealth>> = {},
  data: SystemHealthResponse | null | undefined = healthyResponse,
) => {
  mockUseFetchSystemHealth.mockReturnValue({
    data,
    isLoading: false,
    isFetching: false,
    fetchError: null,
    refetch: mockRefetch,
    ...overrides,
  } as ReturnType<typeof useFetchSystemHealth>);
};

describe("SystemHealth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setQueryState();
  });

  test("renders the real API-backed service cards and no mock-only panels", () => {
    render(<SystemHealth />);

    expect(screen.getByRole("heading", { name: "System Health" })).toBeInTheDocument();
    expect(
      screen.getByText(
        "Monitor service health, track expiring trust assets, and investigate signing failures from one place",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Dashboard online")).toBeInTheDocument();
    expect(screen.getByText(/^Last checked /)).toBeInTheDocument();
    expect(screen.getByLabelText("Cosign status")).toHaveTextContent("Healthy");
    expect(screen.getByLabelText("Fulcio status")).toHaveTextContent("Healthy");
    expect(screen.getByLabelText("Rekor status")).toHaveTextContent("Healthy");
    expect(screen.getByLabelText("TUF status")).toHaveTextContent("Healthy");
    expect(screen.queryByText("Overall signing system")).not.toBeInTheDocument();
    expect(screen.queryByText(/mock data/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /Error rate/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /Incident timeline/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /Expiring trust assets/i })).not.toBeInTheDocument();
  });

  test("uses fulcioStatus for the Fulcio card and lists it in the degraded banner", () => {
    setQueryState({}, { ...healthyResponse, fulcioStatus: "unhealthy" });

    render(<SystemHealth />);

    expect(within(screen.getByLabelText("Fulcio status")).getByText("Down")).toBeInTheDocument();
    expect(screen.getByText("Degraded — some signing services need attention")).toBeInTheDocument();
    expect(screen.getByText("Affected services: Fulcio.")).toBeInTheDocument();
  });

  test("shows Down only when all displayed services are unhealthy", () => {
    setQueryState(
      {},
      {
        ...healthyResponse,
        securesignStatus: "unhealthy",
        fulcioStatus: "unhealthy",
        rekorStatus: "unhealthy",
        tufStatus: "unhealthy",
      },
    );

    render(<SystemHealth />);

    expect(screen.getByText("Down — signing pipeline unavailable")).toBeInTheDocument();
    expect(screen.getByText("Affected services: Cosign, Fulcio, Rekor, TUF.")).toBeInTheDocument();
  });

  test("refreshes on request", async () => {
    const user = userEvent.setup();
    render(<SystemHealth />);

    await user.click(screen.getByRole("button", { name: /Refresh/i }));

    expect(mockRefetch).toHaveBeenCalledOnce();
  });

  test("keeps stale data visible during a background refresh", () => {
    setQueryState({ isFetching: true });

    render(<SystemHealth />);

    expect(screen.getByLabelText("Cosign status")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Refresh/i })).toBeDisabled();
  });

  test("shows initial loading and error states", () => {
    setQueryState({ isLoading: true, isFetching: true }, null);
    const { rerender } = render(<SystemHealth />);

    expect(screen.getByRole("progressbar")).toBeInTheDocument();

    setQueryState({ fetchError: new Error("network") }, null);
    rerender(<SystemHealth />);

    expect(screen.getByText("Unable to connect")).toBeInTheDocument();
  });

  test("shows a stale-data warning after a failed refresh", () => {
    setQueryState({ fetchError: new Error("network") });

    render(<SystemHealth />);

    expect(screen.getByText("Unable to refresh system health")).toBeInTheDocument();
    expect(screen.getByLabelText("Cosign status")).toBeInTheDocument();
  });

  test("shows an empty state when the API returns no body", () => {
    setQueryState({}, null);

    render(<SystemHealth />);

    expect(screen.getByText("No health data available")).toBeInTheDocument();
  });
});
