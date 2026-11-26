import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { fireEvent } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { ServiceDetailDrawer, type ServiceDetailInfo } from "./ServiceDetailDrawer";

const healthyService: ServiceDetailInfo = {
  id: "rekor",
  name: "Rekor",
  status: "healthy",
  details: {
    name: "rekor",
    status: "healthy",
    probed: true,
    endpointUrl: "https://rekor.example.com",
    latencyP50Ms: 42.5,
    latencyP95Ms: 88.1,
    meanLatencyMs: 50.3,
    errorRate: 0,
    uptimePercentage: 100,
    consecutiveFailures: 0,
    probeCount: 120,
    lastProbe: "2026-03-18T12:00:00Z",
    lastSuccessfulProbe: "2026-03-18T12:00:00Z",
    lastStateChange: "2026-03-18T10:00:00Z",
  },
};

const conditionOnlyService: ServiceDetailInfo = {
  id: "ctlog",
  name: "CT log",
  status: "unknown",
  details: {
    name: "ctlog",
    status: "unknown",
    probed: false,
    errorRate: null,
    uptimePercentage: null,
    consecutiveFailures: 0,
    probeCount: 0,
  },
};

const unhealthyService: ServiceDetailInfo = {
  ...healthyService,
  id: "fulcio",
  name: "Fulcio",
  status: "unhealthy",
  details: {
    ...healthyService.details!,
    name: "fulcio",
    status: "unhealthy",
    endpointUrl: undefined,
    latencyP50Ms: null,
    latencyP95Ms: null,
    meanLatencyMs: null,
    errorRate: 1,
    uptimePercentage: 0,
    consecutiveFailures: 47,
    lastSuccessfulProbe: null,
  },
};

const renderDrawer = (service?: ServiceDetailInfo, isExpanded = true) =>
  render(
    <ServiceDetailDrawer
      service={service}
      isExpanded={isExpanded}
      onClose={() => undefined}
      isLoading={false}
      fetchError={null}
    >
      <button type="button">Main content</button>
    </ServiceDetailDrawer>,
  );

describe("ServiceDetailDrawer", () => {
  test("renders live service details for an actively probed service", () => {
    renderDrawer(healthyService);

    expect(screen.getByRole("heading", { name: "Rekor" })).toBeInTheDocument();
    expect(screen.getByText("Healthy")).toBeInTheDocument();
    expect(screen.getByText("No operational impact.")).toBeInTheDocument();
    expect(screen.getByText("HTTP probe")).toBeInTheDocument();
    expect(screen.getByText("43ms")).toBeInTheDocument();
    expect(screen.getByText("88ms")).toBeInTheDocument();
    expect(screen.getByText("50ms")).toBeInTheDocument();
    expect(screen.getByText("0.0%")).toBeInTheDocument();
    expect(screen.getByText("100.0%")).toBeInTheDocument();
    expect(screen.getByText("120")).toBeInTheDocument();
    expect(screen.getByText("No failing checks")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "https://rekor.example.com" })).toHaveAttribute(
      "href",
      "https://rekor.example.com",
    );
  });

  test("omits unavailable optional fields for condition-only services", () => {
    renderDrawer(conditionOnlyService);

    expect(screen.getByText("Condition-derived")).toBeInTheDocument();
    expect(screen.getByText("Operational impact is unavailable.")).toBeInTheDocument();
    expect(screen.queryByText("Endpoint")).not.toBeInTheDocument();
    expect(screen.queryByText("p50 latency")).not.toBeInTheDocument();
    expect(screen.queryByText("p95 latency")).not.toBeInTheDocument();
    expect(screen.queryByText("Mean latency")).not.toBeInTheDocument();
    expect(screen.queryByText("Probe uptime")).not.toBeInTheDocument();
    expect(screen.getByText("Failing checks unavailable")).toBeInTheDocument();
  });

  test("shows failing checks for an unhealthy service", () => {
    renderDrawer(unhealthyService);

    const checks = screen.getByLabelText("Fulcio failing checks");
    expect(within(checks).getByText("Service is reported down")).toBeInTheDocument();
    expect(within(checks).getByText("47 consecutive failed probes")).toBeInTheDocument();
    expect(within(checks).getByText("100.0% probe error rate")).toBeInTheDocument();
    expect(within(checks).getByText("No successful probe has been recorded")).toBeInTheDocument();
    expect(screen.getByText("Certificate issuance and signing trust are affected.")).toBeInTheDocument();
  });

  test("closes from the close button", async () => {
    const onClose = vi.fn();
    render(
      <ServiceDetailDrawer service={healthyService} isExpanded onClose={onClose}>
        <button type="button">Main content</button>
      </ServiceDetailDrawer>,
    );

    await userEvent.click(screen.getByRole("button", { name: "Close service details" }));

    expect(onClose).toHaveBeenCalledOnce();
  });

  test("closes when Escape is pressed inside the drawer", () => {
    const onClose = vi.fn();
    const { container } = render(
      <ServiceDetailDrawer service={healthyService} isExpanded onClose={onClose}>
        <button type="button">Main content</button>
      </ServiceDetailDrawer>,
    );

    fireEvent.keyDown(container.firstElementChild as HTMLElement, { key: "Escape" });

    expect(onClose).toHaveBeenCalledOnce();
  });

  test("shows a loading state before service details are available", () => {
    render(
      <ServiceDetailDrawer isExpanded onClose={() => undefined} isLoading>
        <button type="button">Main content</button>
      </ServiceDetailDrawer>,
    );

    expect(screen.getByRole("progressbar", { name: "Loading service details" })).toBeInTheDocument();
  });

  test("shows an error state when details cannot be loaded", () => {
    render(
      <ServiceDetailDrawer isExpanded onClose={() => undefined} fetchError={new Error("network")}>
        <button type="button">Main content</button>
      </ServiceDetailDrawer>,
    );

    expect(screen.getByText("Unable to load service details")).toBeInTheDocument();
  });

  test("keeps the last available details visible after a refresh failure", () => {
    render(
      <ServiceDetailDrawer
        service={healthyService}
        isExpanded
        onClose={() => undefined}
        fetchError={new Error("network")}
      >
        <button type="button">Main content</button>
      </ServiceDetailDrawer>,
    );

    expect(screen.getByText("Unable to refresh service details")).toBeInTheDocument();
    expect(screen.getByText("Showing the last available service information.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Rekor" })).toBeInTheDocument();
  });
});
