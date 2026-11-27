import type { SystemHealthMetrics as SystemHealthMetricsData } from "@app/client";
import { systemHealthMetricsAvailableMock } from "@app/queries/mocks/system-health";
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { SystemHealthMetrics } from "./SystemHealthMetrics";

const availableMetrics = systemHealthMetricsAvailableMock.metrics as SystemHealthMetricsData;

describe("SystemHealthMetrics", () => {
  test("renders live signing error rates and activity", () => {
    render(<SystemHealthMetrics metrics={availableMetrics} />);

    expect(screen.getByRole("heading", { name: "Signing metrics" })).toBeInTheDocument();
    expect(screen.getByText("Available")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Error rate · last 1h" })).toBeInTheDocument();
    expect(screen.getByText("2,184")).toBeInTheDocument();
    expect(screen.getByText("42.7%")).toBeInTheDocument();
    expect(screen.getByText("1,512")).toBeInTheDocument();
    expect(screen.getByText("488")).toBeInTheDocument();
    expect(screen.getByText("5,120")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Signing activity · last 1h" })).toBeInTheDocument();
    expect(screen.getByText("312")).toBeInTheDocument();
    expect(screen.getByText("305")).toBeInTheDocument();
    expect(screen.getByText("298")).toBeInTheDocument();
    expect(screen.getByText(/^Updated /)).toBeInTheDocument();
  });

  test("shows the disabled state when Prometheus is not configured", () => {
    render(
      <SystemHealthMetrics
        metrics={{
          status: "disabled",
          reason: null,
          windowSeconds: 3600,
          updatedAt: null,
          errorRates: null,
          signingActivity: null,
        }}
      />,
    );

    expect(screen.getByText("Not configured")).toBeInTheDocument();
    expect(screen.getByText("Prometheus metrics are not configured")).toBeInTheDocument();
    expect(screen.getByText("Set PROMETHEUS_URL to collect signing request metrics.")).toBeInTheDocument();
  });

  test("shows the unavailable state and sanitized reason", () => {
    render(
      <SystemHealthMetrics
        metrics={{
          status: "unavailable",
          reason: "Prometheus query timed out",
          windowSeconds: 3600,
          updatedAt: null,
          errorRates: null,
          signingActivity: null,
        }}
      />,
    );

    expect(screen.getByText("Unavailable")).toBeInTheDocument();
    expect(screen.getByText("Prometheus metrics are unavailable")).toBeInTheDocument();
    expect(screen.getByText("Prometheus query timed out")).toBeInTheDocument();
  });

  test("handles available status without metric payloads", () => {
    render(
      <SystemHealthMetrics
        metrics={{
          status: "available",
          reason: null,
          windowSeconds: 3600,
          updatedAt: null,
          errorRates: null,
          signingActivity: null,
        }}
      />,
    );

    expect(screen.getByText("No signing metrics available")).toBeInTheDocument();
    expect(screen.getByText("Prometheus did not return signing request data.")).toBeInTheDocument();
  });
});
