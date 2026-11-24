import type { ServiceHealth, SystemHealthResponse } from "@app/client";
import { systemHealthMock } from "@app/queries/mocks/system-health";
import { act, render, screen, within } from "@testing-library/react";
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

const healthyResponse: SystemHealthResponse = systemHealthMock;

const withServiceStatus = (name: ServiceHealth["name"], status: ServiceHealth["status"]): SystemHealthResponse => ({
  ...healthyResponse,
  services: healthyResponse.services.map((service) => (service.name === name ? { ...service, status } : service)),
});

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
    expect(screen.queryByLabelText("Cosign status")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Securesign status")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Fulcio status")).toHaveTextContent("Healthy");
    expect(screen.getByLabelText("Rekor status")).toHaveTextContent("Healthy");
    expect(screen.getByLabelText("TUF status")).toHaveTextContent("Healthy");
    expect(screen.getByLabelText("Fulcio status").parentElement).toHaveClass("pf-m-4-col-on-lg");
    expect(screen.queryByText("Overall signing system")).not.toBeInTheDocument();
    expect(screen.queryByText(/mock data/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /Error rate/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /Incident timeline/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /Expiring trust assets/i })).not.toBeInTheDocument();
  });

  test("derives a degraded state from an unhealthy visible component", () => {
    // The deprecated flat field remains healthy; the service entry is authoritative.
    setQueryState({}, withServiceStatus("fulcio", "unhealthy"));

    render(<SystemHealth />);

    expect(within(screen.getByLabelText("Fulcio status")).getByText("Down")).toBeInTheDocument();
    expect(screen.getByText("Degraded — some signing services need attention")).toBeInTheDocument();
    expect(screen.getByText("Affected services: Fulcio.")).toBeInTheDocument();
  });

  test("uses service entries by name rather than deprecated fields or array order", () => {
    setQueryState(
      {},
      {
        ...healthyResponse,
        fulcioStatus: "unhealthy",
        rekorStatus: "unhealthy",
        services: [...healthyResponse.services].reverse(),
      },
    );

    render(<SystemHealth />);

    expect(screen.getByLabelText("Fulcio status")).toHaveTextContent("Healthy");
    expect(screen.getByLabelText("Rekor status")).toHaveTextContent("Healthy");
    expect(screen.queryByText("Degraded — some signing services need attention")).not.toBeInTheDocument();
  });

  test("shows unknown and degrades when a service entry is missing", () => {
    setQueryState(
      {},
      { ...healthyResponse, services: healthyResponse.services.filter((service) => service.name !== "fulcio") },
    );

    render(<SystemHealth />);

    expect(screen.getByLabelText("Fulcio status")).toHaveTextContent("Unknown");
    expect(screen.getByText("Degraded — some signing services need attention")).toBeInTheDocument();
    expect(screen.getByText("Status unavailable: Fulcio.")).toBeInTheDocument();
  });

  test("shows unavailable when no service entries are returned", () => {
    setQueryState({}, { ...healthyResponse, services: [] });

    render(<SystemHealth />);

    expect(screen.getByLabelText("Fulcio status")).toHaveTextContent("Unknown");
    expect(screen.getByText("Status unavailable — unable to determine signing pipeline health")).toBeInTheDocument();
  });

  test.each([undefined, null])("handles an absent or null services array without using legacy fields", (services) => {
    // Older or malformed server responses can omit the array despite the generated type.
    setQueryState({}, { ...healthyResponse, services } as unknown as SystemHealthResponse);

    render(<SystemHealth />);

    expect(screen.getByLabelText("Fulcio status")).toHaveTextContent("Unknown");
    expect(screen.getByText("Status unavailable — unable to determine signing pipeline health")).toBeInTheDocument();
  });

  test.each(["ctlog", "trillian", "tsa"] as const)("derives the overall health from a failed hidden %s", (name) => {
    setQueryState({}, withServiceStatus(name, "unhealthy"));

    render(<SystemHealth />);

    expect(screen.getByText("Degraded — some signing services need attention")).toBeInTheDocument();
  });

  test("uses operator readiness as a supporting signal without presenting it as Cosign health", () => {
    setQueryState(
      {},
      {
        ...healthyResponse,
        securesignStatus: "unhealthy",
        securesignStatusReason: "Ready=False (reason: Creating)",
      },
    );

    render(<SystemHealth />);

    expect(screen.queryByLabelText("Cosign status")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Securesign status")).not.toBeInTheDocument();
    expect(screen.getByText("Degraded — some signing services need attention")).toBeInTheDocument();
    expect(
      screen.getByText("The operator reports the deployment as not ready: Ready=False (reason: Creating)"),
    ).toBeInTheDocument();
  });

  test("shows Down only when every monitored component is unhealthy", () => {
    setQueryState(
      {},
      {
        ...healthyResponse,
        securesignStatus: "unhealthy",
        services: healthyResponse.services.map((service) => ({ ...service, status: "unhealthy" })),
      },
    );

    render(<SystemHealth />);

    expect(screen.getByText("Down — signing pipeline unavailable")).toBeInTheDocument();
    expect(screen.getByText("Affected services: Fulcio, Rekor, TUF, CT log, Trillian, TSA.")).toBeInTheDocument();
  });

  test("degrades when component health is known but operator readiness is unavailable", () => {
    setQueryState({}, { ...healthyResponse, securesignStatus: "unknown" });

    render(<SystemHealth />);

    expect(screen.getByText("Degraded — some signing services need attention")).toBeInTheDocument();
    expect(screen.getByText("Operator readiness status is unavailable.")).toBeInTheDocument();
  });

  test("reflects unavailable information when component health cannot be determined", () => {
    setQueryState(
      {},
      {
        ...healthyResponse,
        securesignStatus: "unknown",
        services: healthyResponse.services.map((service) => ({ ...service, status: "unknown" })),
      },
    );

    render(<SystemHealth />);

    expect(screen.getByText("Status unavailable — unable to determine signing pipeline health")).toBeInTheDocument();
    expect(screen.getByText("Status unavailable")).toBeInTheDocument();
  });

  test("shows the API's operator reason when all service statuses are unavailable", () => {
    setQueryState(
      {},
      {
        ...healthyResponse,
        securesignStatus: "unknown",
        securesignStatusReason: "Permission denied reading the Securesign resource",
        services: healthyResponse.services.map((service) => ({ ...service, status: "unknown" })),
      },
    );

    render(<SystemHealth />);

    expect(screen.getByText("Status unavailable: Fulcio, Rekor, TUF, CT log, Trillian, TSA.")).toBeInTheDocument();
    expect(
      screen.getByText("Operator readiness status is unavailable: Permission denied reading the Securesign resource"),
    ).toBeInTheDocument();
  });

  test("updates the relative last-checked time while the page remains open", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-30T09:18:32Z"));
    setQueryState({}, { ...healthyResponse, updatedAt: "2026-06-30T09:18:28Z" });

    const { unmount } = render(<SystemHealth />);

    expect(screen.getByText("Last checked 4s ago")).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(2000));

    expect(screen.getByText("Last checked 6s ago")).toBeInTheDocument();
    unmount();
    vi.useRealTimers();
  });

  test("handles the initial API response before a health probe has completed", () => {
    setQueryState({}, { ...healthyResponse, updatedAt: null });

    render(<SystemHealth />);

    expect(screen.getByText("Last checked unavailable")).toBeInTheDocument();
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

    expect(screen.getByLabelText("Fulcio status")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Refresh/i })).toBeDisabled();
  });

  test("shows initial loading and a retryable error state", async () => {
    const user = userEvent.setup();
    setQueryState({ isLoading: true, isFetching: true }, null);
    const { rerender } = render(<SystemHealth />);

    expect(screen.getByRole("progressbar")).toBeInTheDocument();

    setQueryState({ fetchError: new Error("network") }, null);
    rerender(<SystemHealth />);

    expect(screen.getByText("Unable to connect")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Retry" }));
    expect(mockRefetch).toHaveBeenCalledOnce();
  });

  test("shows a stale-data warning after a failed refresh", () => {
    setQueryState({ fetchError: new Error("network") });

    render(<SystemHealth />);

    expect(screen.getByText("Unable to refresh system health")).toBeInTheDocument();
    expect(screen.getByText("Refresh failed")).toBeInTheDocument();
    expect(screen.queryByText("Dashboard online")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Fulcio status")).toBeInTheDocument();
  });

  test("shows an empty state when the API returns no body", () => {
    setQueryState({}, null);

    render(<SystemHealth />);

    expect(screen.getByText("No health data available")).toBeInTheDocument();
  });
});
