import type { SystemHealthResponse } from "@app/client";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { SystemHealth } from "./SystemHealth";

vi.mock("@app/components/DocumentMetadata", () => ({
  DocumentMetadata: () => null,
}));

const mockRefetch = vi.fn();
const mockRefetchCertificates = vi.fn();
const mockRefetchMetadata = vi.fn();

vi.mock("@app/queries/system-health", () => ({
  useFetchSystemHealth: vi.fn(),
}));

vi.mock("@app/queries/trust", () => ({
  useFetchTrustMetadataInfo: vi.fn(),
  useFetchTrustTargetCertificates: vi.fn(),
}));

import { useFetchSystemHealth } from "@app/queries/system-health";
import { useFetchTrustMetadataInfo, useFetchTrustTargetCertificates } from "@app/queries/trust";

const mockUseFetchSystemHealth = vi.mocked(useFetchSystemHealth);
const mockUseFetchTrustMetadataInfo = vi.mocked(useFetchTrustMetadataInfo);
const mockUseFetchTrustTargetCertificates = vi.mocked(useFetchTrustTargetCertificates);

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

const setTrustQueryState = (
  certificateOverrides: Partial<ReturnType<typeof useFetchTrustTargetCertificates>> = {},
  metadataOverrides: Partial<ReturnType<typeof useFetchTrustMetadataInfo>> = {},
) => {
  mockUseFetchTrustTargetCertificates.mockReturnValue({
    certificates: { data: [] },
    isLoading: false,
    isFetching: false,
    fetchError: null,
    refetch: mockRefetchCertificates,
    ...certificateOverrides,
  } as ReturnType<typeof useFetchTrustTargetCertificates>);
  mockUseFetchTrustMetadataInfo.mockReturnValue({
    metadataInfo: { data: {} },
    isLoading: false,
    isFetching: false,
    fetchError: null,
    refetch: mockRefetchMetadata,
    ...metadataOverrides,
  } as ReturnType<typeof useFetchTrustMetadataInfo>);
};

describe("SystemHealth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setQueryState();
    setTrustQueryState();
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
    expect(screen.getByText("Expiring trust assets")).toBeInTheDocument();
    expect(screen.getByText("No expiry warnings")).toBeInTheDocument();
  });

  test("uses fulcioStatus for the Fulcio card and lists it in the degraded banner", () => {
    setQueryState({}, { ...healthyResponse, fulcioStatus: "unhealthy" });

    render(<SystemHealth />);

    expect(within(screen.getByLabelText("Fulcio status")).getByText("Down")).toBeInTheDocument();
    expect(screen.getByText("Degraded — some signing services need attention")).toBeInTheDocument();
    expect(screen.getByText("Affected services: Fulcio.")).toBeInTheDocument();
  });

  test.each([
    ["ctlogStatus", "CT log"],
    ["trillianStatus", "Trillian"],
    ["tsaStatus", "TSA"],
  ] as const)("includes a failed %s in overall health and the warning", (field, serviceName) => {
    setQueryState({}, { ...healthyResponse, [field]: "unhealthy" });

    render(<SystemHealth />);

    expect(screen.getByText("Degraded — some signing services need attention")).toBeInTheDocument();
    expect(screen.getByText(`Affected services: ${serviceName}.`)).toBeInTheDocument();
  });

  test("does not present the overall Securesign operator status as Cosign health", () => {
    setQueryState({}, { ...healthyResponse, securesignStatus: "unhealthy" });

    render(<SystemHealth />);

    expect(screen.queryByLabelText("Cosign status")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Securesign status")).not.toBeInTheDocument();
    expect(screen.getByText("Degraded — some signing services need attention")).toBeInTheDocument();
    expect(screen.getByText("Affected services: Securesign operator.")).toBeInTheDocument();
  });

  test("shows Down only when every monitored API status is unhealthy", () => {
    setQueryState(
      {},
      {
        ...healthyResponse,
        securesignStatus: "unhealthy",
        fulcioStatus: "unhealthy",
        rekorStatus: "unhealthy",
        tufStatus: "unhealthy",
        ctlogStatus: "unhealthy",
        trillianStatus: "unhealthy",
        tsaStatus: "unhealthy",
      },
    );

    render(<SystemHealth />);

    expect(screen.getByText("Down — signing pipeline unavailable")).toBeInTheDocument();
    expect(
      screen.getByText("Affected services: Securesign operator, Fulcio, Rekor, TUF, CT log, Trillian, TSA."),
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

  test("refreshes on request", async () => {
    const user = userEvent.setup();
    render(<SystemHealth />);

    await user.click(screen.getByRole("button", { name: /Refresh/i }));

    expect(mockRefetch).toHaveBeenCalledOnce();
    expect(mockRefetchCertificates).toHaveBeenCalledOnce();
    expect(mockRefetchMetadata).toHaveBeenCalledOnce();
  });

  test("keeps stale data visible during a background refresh", () => {
    setQueryState({ isFetching: true });

    render(<SystemHealth />);

    expect(screen.getByLabelText("Fulcio status")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Refresh/i })).toBeDisabled();
  });

  test("keeps refresh disabled while trust data is being refetched", () => {
    setTrustQueryState({ isFetching: true });

    render(<SystemHealth />);

    expect(screen.getByText("No expiry warnings")).toBeInTheDocument();
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
    expect(mockRefetchCertificates).toHaveBeenCalledOnce();
    expect(mockRefetchMetadata).toHaveBeenCalledOnce();
  });

  test("shows a stale-data warning after a failed refresh", () => {
    setQueryState({ fetchError: new Error("network") });

    render(<SystemHealth />);

    expect(screen.getByText("Unable to refresh system health")).toBeInTheDocument();
    expect(screen.getByLabelText("Fulcio status")).toBeInTheDocument();
  });

  test("shows an empty state when the API returns no body", () => {
    setQueryState({}, null);

    render(<SystemHealth />);

    expect(screen.getByText("No health data available")).toBeInTheDocument();
  });
});
