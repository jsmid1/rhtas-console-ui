import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { SystemHealthBanner } from "./SystemHealthBanner";

describe("SystemHealthBanner", () => {
  test("distinguishes affected services from unavailable statuses", () => {
    render(
      <SystemHealthBanner
        overallStatus="Degraded"
        securesignStatus="unhealthy"
        services={[
          { name: "TAS", status: "healthy" },
          { name: "Fulcio", status: "unhealthy" },
          { name: "Rekor", status: "unknown" },
          { name: "TUF", status: "healthy" },
        ]}
      />,
    );

    expect(screen.getByText("Degraded — some signing services need attention")).toBeInTheDocument();
    expect(screen.getByText("Affected services: Fulcio.")).toBeInTheDocument();
    expect(screen.getByText("Status unavailable: Rekor.")).toBeInTheDocument();
  });

  test("does not describe an unknown service as affected", () => {
    render(
      <SystemHealthBanner
        overallStatus="Unavailable"
        securesignStatus="unknown"
        services={[
          { name: "Fulcio", status: "healthy" },
          { name: "Rekor", status: "unknown" },
        ]}
      />,
    );

    expect(screen.queryByText(/Affected services:/)).not.toBeInTheDocument();
    expect(screen.getByText("Status unavailable: Rekor.")).toBeInTheDocument();
  });

  test("renders the down state", () => {
    render(
      <SystemHealthBanner
        overallStatus="Down"
        securesignStatus="unhealthy"
        services={[
          { name: "TAS", status: "unhealthy" },
          { name: "Fulcio", status: "unhealthy" },
        ]}
      />,
    );

    expect(screen.getByText("Down — signing pipeline unavailable")).toBeInTheDocument();
  });

  test("shows the operator reason when components appear healthy", () => {
    render(
      <SystemHealthBanner
        overallStatus="Degraded"
        securesignStatus="unhealthy"
        services={[
          { name: "Fulcio", status: "healthy" },
          { name: "Rekor", status: "healthy" },
        ]}
        securesignStatusReason="Ready=False (reason: Creating)"
      />,
    );

    expect(
      screen.getByText("The operator reports the deployment as not ready: Ready=False (reason: Creating)"),
    ).toBeInTheDocument();
  });

  test("shows a fallback when the operator reason is unavailable", () => {
    render(
      <SystemHealthBanner
        overallStatus="Degraded"
        securesignStatus="unhealthy"
        services={[
          { name: "Fulcio", status: "healthy" },
          { name: "Rekor", status: "healthy" },
        ]}
      />,
    );

    expect(screen.getByText("The operator reports the deployment as not ready.")).toBeInTheDocument();
  });

  test("distinguishes an unavailable operator readiness signal from not ready", () => {
    render(
      <SystemHealthBanner
        overallStatus="Degraded"
        securesignStatus="unknown"
        services={[
          { name: "Fulcio", status: "healthy" },
          { name: "Rekor", status: "healthy" },
        ]}
      />,
    );

    expect(screen.getByText("Operator readiness status is unavailable.")).toBeInTheDocument();
    expect(screen.queryByText(/not ready/i)).not.toBeInTheDocument();
  });

  test("shows an unavailable operator reason alongside unavailable services", () => {
    render(
      <SystemHealthBanner
        overallStatus="Unavailable"
        securesignStatus="unknown"
        securesignStatusReason="Permission denied reading the Securesign resource"
        services={[
          { name: "Fulcio", status: "unknown" },
          { name: "Rekor", status: "unknown" },
        ]}
      />,
    );

    expect(screen.getByText("Status unavailable: Fulcio, Rekor.")).toBeInTheDocument();
    expect(
      screen.getByText("Operator readiness status is unavailable: Permission denied reading the Securesign resource"),
    ).toBeInTheDocument();
    expect(screen.queryByText(/not ready/i)).not.toBeInTheDocument();
  });

  test("shows a not-ready reason alongside affected and unavailable services", () => {
    render(
      <SystemHealthBanner
        overallStatus="Degraded"
        securesignStatus="unhealthy"
        securesignStatusReason="Ready=False (reason: Creating)"
        services={[
          { name: "Fulcio", status: "unhealthy" },
          { name: "Rekor", status: "unknown" },
        ]}
      />,
    );

    expect(screen.getByText("Affected services: Fulcio.")).toBeInTheDocument();
    expect(screen.getByText("Status unavailable: Rekor.")).toBeInTheDocument();
    expect(
      screen.getByText("The operator reports the deployment as not ready: Ready=False (reason: Creating)"),
    ).toBeInTheDocument();
  });

  test("shows an unavailable operator reason even when component statuses are healthy", () => {
    render(
      <SystemHealthBanner
        overallStatus="Degraded"
        securesignStatus="unknown"
        securesignStatusReason="Ready condition is missing"
        services={[{ name: "Fulcio", status: "healthy" }]}
      />,
    );

    expect(
      screen.getByText("Operator readiness status is unavailable: Ready condition is missing"),
    ).toBeInTheDocument();
  });

  test("does not show an operator reason when the operator status is healthy", () => {
    render(
      <SystemHealthBanner
        overallStatus="Degraded"
        securesignStatus="healthy"
        securesignStatusReason="Unexpected reason"
        services={[{ name: "Fulcio", status: "unhealthy" }]}
      />,
    );

    expect(screen.queryByText(/Unexpected reason/)).not.toBeInTheDocument();
    expect(screen.getByText("Affected services: Fulcio.")).toBeInTheDocument();
  });

  test("uses the fallback when the reason is blank", () => {
    render(
      <SystemHealthBanner
        overallStatus="Degraded"
        securesignStatus="unknown"
        securesignStatusReason="   "
        services={[{ name: "Fulcio", status: "healthy" }]}
      />,
    );

    expect(screen.getByText("Operator readiness status is unavailable.")).toBeInTheDocument();
  });
});
