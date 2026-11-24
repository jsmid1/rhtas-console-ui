import { render } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { StatusDot } from "./StatusDot";

describe("StatusDot", () => {
  test("renders an SVG circle", () => {
    const { container } = render(<StatusDot severity="success" />);
    const circle = container.querySelector("circle");

    expect(circle).toBeInTheDocument();
  });

  test("applies custom size", () => {
    const { container } = render(<StatusDot severity="danger" size={16} />);
    const svg = container.querySelector("svg");

    expect(svg).toHaveAttribute("width", "16");
    expect(svg).toHaveAttribute("height", "16");
  });
});
