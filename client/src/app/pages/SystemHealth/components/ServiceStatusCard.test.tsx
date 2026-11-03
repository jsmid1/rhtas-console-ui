import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { ServiceStatusCard } from "./ServiceStatusCard";

describe("ServiceStatusCard", () => {
  test("renders a healthy service", () => {
    render(<ServiceStatusCard name="Fulcio" status="healthy" detail="Certificate authority" />);

    expect(screen.getByLabelText("Fulcio status")).toHaveTextContent("Healthy");
    expect(screen.getByText("Certificate authority")).toBeInTheDocument();
  });

  test("renders unhealthy and unknown labels", () => {
    const { rerender } = render(<ServiceStatusCard name="Rekor" status="unhealthy" detail="Transparency log" />);

    expect(screen.getByLabelText("Rekor status")).toHaveTextContent("Down");

    rerender(<ServiceStatusCard name="TUF" status="unknown" detail="Trust metadata repository" />);

    expect(screen.getByLabelText("TUF status")).toHaveTextContent("Unknown");
  });
});
