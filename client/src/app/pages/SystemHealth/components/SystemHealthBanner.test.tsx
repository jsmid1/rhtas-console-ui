import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { SystemHealthBanner } from "./SystemHealthBanner";

describe("SystemHealthBanner", () => {
  test("distinguishes affected services from unavailable statuses", () => {
    render(
      <SystemHealthBanner
        overallStatus="unhealthy"
        services={[
          { name: "TAS", status: "healthy" },
          { name: "Fulcio", status: "unhealthy" },
          { name: "Rekor", status: "unknown" },
          { name: "TUF", status: "healthy" },
        ]}
      />,
    );

    expect(screen.getByText("Down — signing pipeline unavailable")).toBeInTheDocument();
    expect(screen.getByText("Affected services: Fulcio.")).toBeInTheDocument();
    expect(screen.getByText("Status unavailable: Rekor.")).toBeInTheDocument();
  });

  test("does not describe an unknown service as affected", () => {
    render(
      <SystemHealthBanner
        overallStatus="unknown"
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
        overallStatus="unhealthy"
        services={[
          { name: "TAS", status: "unhealthy" },
          { name: "Fulcio", status: "unhealthy" },
        ]}
      />,
    );

    expect(screen.getByText("Down — signing pipeline unavailable")).toBeInTheDocument();
  });
});
