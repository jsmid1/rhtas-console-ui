import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { SystemHealthBanner } from "./SystemHealthBanner";

describe("SystemHealthBanner", () => {
  test("renders only affected service names for a degraded state", () => {
    render(
      <SystemHealthBanner
        overallStatus="Degraded"
        services={[
          { name: "TAS", status: "healthy" },
          { name: "Fulcio", status: "unhealthy" },
          { name: "Rekor", status: "unknown" },
          { name: "TUF", status: "healthy" },
        ]}
      />,
    );

    expect(screen.getByText("Degraded — some signing services need attention")).toBeInTheDocument();
    expect(screen.getByText("Affected services: Fulcio, Rekor.")).toBeInTheDocument();
  });

  test("renders the down state", () => {
    render(
      <SystemHealthBanner
        overallStatus="Down"
        services={[
          { name: "TAS", status: "unhealthy" },
          { name: "Fulcio", status: "unhealthy" },
        ]}
      />,
    );

    expect(screen.getByText("Down — signing pipeline unavailable")).toBeInTheDocument();
  });
});
