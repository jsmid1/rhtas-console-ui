import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, test, vi } from "vitest";
import { SidebarApp } from "./sidebar";

const mockFeatures = { monitoringAlerting: false, observability: false };

vi.mock("@app/hooks/useFeatureFlags", () => ({
  useFeatureFlags: () => ({ features: mockFeatures }),
}));

function renderSidebar() {
  return render(
    <MemoryRouter>
      <SidebarApp />
    </MemoryRouter>,
  );
}

describe("SidebarApp", () => {
  test("renders core navigation links", () => {
    renderSidebar();

    expect(screen.getByRole("link", { name: "Trust Root" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Artifacts" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Rekor Search" })).toBeInTheDocument();
  });

  test("hides Monitoring link when feature flag is off", () => {
    mockFeatures.monitoringAlerting = false;
    renderSidebar();

    expect(screen.queryByRole("link", { name: "Monitoring" })).not.toBeInTheDocument();
  });

  test("shows Monitoring link when feature flag is on", () => {
    mockFeatures.monitoringAlerting = true;
    renderSidebar();

    expect(screen.getByRole("link", { name: "Monitoring" })).toBeInTheDocument();
  });

  test("hides System Health link when observability flag is off", () => {
    mockFeatures.observability = false;
    renderSidebar();

    expect(screen.queryByRole("link", { name: "System Health" })).not.toBeInTheDocument();
  });

  test("shows System Health link when observability flag is on", () => {
    mockFeatures.observability = true;
    renderSidebar();

    expect(screen.getByRole("link", { name: "System Health" })).toBeInTheDocument();
  });
});
