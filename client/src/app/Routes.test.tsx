import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { mockFeatures } = vi.hoisted(() => ({
  mockFeatures: {
    monitoringAlerting: false,
    observability: false,
  },
}));

vi.mock("./hooks/useFeatureFlags", () => ({
  useFeatureFlags: () => ({ features: mockFeatures }),
}));

vi.mock("./pages/SystemHealth", () => ({
  default: () => <h1>System Health route</h1>,
}));

import { AppRoutes, Paths } from "./Routes";

const renderSystemHealthRoute = () =>
  render(
    <MemoryRouter initialEntries={[Paths.systemHealth]}>
      <AppRoutes />
    </MemoryRouter>,
  );

describe("System Health route", () => {
  beforeEach(() => {
    mockFeatures.monitoringAlerting = false;
    mockFeatures.observability = false;
  });

  test("renders for direct access when observability is enabled", async () => {
    mockFeatures.observability = true;

    renderSystemHealthRoute();

    expect(await screen.findByRole("heading", { name: "System Health route" })).toBeInTheDocument();
    expect(screen.queryByText("404: That page does not exist")).not.toBeInTheDocument();
  });

  test("falls through to Not Found for direct access when observability is disabled", async () => {
    renderSystemHealthRoute();

    expect(await screen.findByText("404: That page does not exist")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "System Health route" })).not.toBeInTheDocument();
  });
});
