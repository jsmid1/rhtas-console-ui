import type { ProbeSample } from "@app/client";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { ServiceProbeHistory } from "./ServiceProbeHistory";

const samples: ProbeSample[] = [
  {
    timestamp: "2026-06-30T09:18:02Z",
    status: "healthy",
    success: true,
    latencyMs: 208,
    httpStatusCode: 200,
    source: "http",
    error: null,
  },
  {
    timestamp: "2026-06-30T09:17:32Z",
    status: "unhealthy",
    success: false,
    latencyMs: null,
    httpStatusCode: 503,
    source: "http",
    error: "unexpected status code 503",
  },
  {
    timestamp: "2026-06-30T09:17:02Z",
    status: "unknown",
    success: false,
    latencyMs: null,
    httpStatusCode: null,
    source: "condition",
    error: "condition not reported",
  },
];

describe("ServiceProbeHistory", () => {
  test("renders an accessible table of live probe samples", () => {
    render(<ServiceProbeHistory serviceName="Rekor" samples={samples} />);

    const table = screen.getByRole("grid", { name: "Rekor probe history" });
    expect(within(table).getAllByRole("row")).toHaveLength(samples.length + 1);
    expect(within(table).getByText("Healthy")).toBeInTheDocument();
    expect(within(table).getByText("Down")).toBeInTheDocument();
    expect(within(table).getByText("Unknown")).toBeInTheDocument();
    expect(within(table).getByText("208ms")).toBeInTheDocument();
    expect(within(table).getByText("503")).toBeInTheDocument();
    expect(within(table).getAllByText("HTTP probe").length).toBeGreaterThan(0);
    expect(within(table).getByText("Condition")).toBeInTheDocument();
    expect(within(table).getByText("unexpected status code 503")).toBeInTheDocument();
  });

  test("shows a loading state before history is available", () => {
    render(<ServiceProbeHistory serviceName="Fulcio" isFetching />);

    expect(screen.getByRole("progressbar", { name: "Loading Fulcio probe history" })).toBeInTheDocument();
  });

  test("shows an empty state when no samples are retained", () => {
    render(<ServiceProbeHistory serviceName="CT log" samples={[]} />);

    expect(screen.getByText("No probe history available")).toBeInTheDocument();
    expect(screen.getByText("No retained probe samples are available for this service.")).toBeInTheDocument();
  });

  test("shows an error state when history cannot be loaded", () => {
    render(<ServiceProbeHistory serviceName="TUF" fetchError={new Error("network")} />);

    expect(screen.getByText("Unable to load probe history")).toBeInTheDocument();
  });

  test("keeps cached samples visible after a refresh failure", () => {
    render(<ServiceProbeHistory serviceName="Rekor" samples={samples} fetchError={new Error("network")} />);

    expect(screen.getByText("Unable to refresh probe history")).toBeInTheDocument();
    expect(screen.getByText("Showing the last available probe samples.")).toBeInTheDocument();
    expect(screen.getByRole("grid", { name: "Rekor probe history" })).toBeInTheDocument();
  });
});
