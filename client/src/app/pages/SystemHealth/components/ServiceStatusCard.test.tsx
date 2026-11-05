import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { ServiceStatusCard } from "./ServiceStatusCard";

describe("ServiceStatusCard", () => {
  test("renders a healthy service", () => {
    render(<ServiceStatusCard name="Fulcio" status="healthy" />);

    expect(screen.getByLabelText("Fulcio status")).toHaveTextContent("Healthy");
  });

  test("renders unhealthy and unknown labels", () => {
    const { rerender } = render(<ServiceStatusCard name="Rekor" status="unhealthy" />);

    expect(screen.getByLabelText("Rekor status")).toHaveTextContent("Down");

    rerender(<ServiceStatusCard name="TUF" status="unknown" />);

    expect(screen.getByLabelText("TUF status")).toHaveTextContent("Unknown");
  });
});
