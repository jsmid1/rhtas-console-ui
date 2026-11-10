import type { CertificateInfo, MetadataInfoResponse } from "@app/client";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import {
  ExpiringTrustAssets,
  formatTimeRemaining,
  getExpiringTrustAssets,
  isUrgentExpiry,
} from "./ExpiringTrustAssets";

const certificates: CertificateInfo[] = [
  {
    target: "fulcio.pem",
    status: "expiring",
    certExpiration: "2026-12-01T10:00:00Z",
    issuer: "CN=issuer",
    subject: "CN=subject",
    type: "Fulcio",
    pem: "certificate",
  },
  {
    target: "rekor.pem",
    status: "active",
    certExpiration: "2027-12-01T10:00:00Z",
    issuer: "CN=issuer",
    subject: "CN=subject",
    type: "Rekor",
    pem: "certificate",
  },
];

const metadataInfo: MetadataInfoResponse = {
  data: {
    timestamp: [
      { version: "2", status: "expired", expires: "2026-07-01T00:00:00Z" },
      { version: "3", status: "expiring", expires: "2026-11-20T00:00:00Z" },
    ],
  },
};

const defaultProps = {
  certificates,
  metadataInfo,
  isFetchingCertificates: false,
  isFetchingMetadata: false,
  certificatesFetchError: null,
  metadataFetchError: null,
};

describe("ExpiringTrustAssets", () => {
  test("formats the canonical remaining-time labels", () => {
    const now = Date.parse("2026-11-03T10:00:00Z");

    expect(formatTimeRemaining("2026-12-01T10:00:00Z", "expiring", now)).toBe("28 days");
    expect(formatTimeRemaining("2027-12-01T10:00:00Z", "expiring", now)).toBe("1y 28d");
    expect(formatTimeRemaining("2026-11-02T10:00:00Z", "expiring", now)).toBe("Expired");
    expect(formatTimeRemaining(undefined, "expiring", now)).toBe("Expiring");
    expect(formatTimeRemaining("2027-12-01T10:00:00Z", "expired", now)).toBe("Expired");
  });

  test("only emphasizes expired and near-term expiry warnings", () => {
    const now = Date.parse("2026-11-03T10:00:00Z");

    expect(isUrgentExpiry({ id: "expired", name: "Expired", status: "expired" }, now)).toBe(true);
    expect(isUrgentExpiry({ id: "near", name: "Near", status: "expiring", expires: "2026-12-01T10:00:00Z" }, now)).toBe(
      true,
    );
    expect(
      isUrgentExpiry({ id: "later", name: "Later", status: "expiring", expires: "2027-08-01T10:00:00Z" }, now),
    ).toBe(false);
  });

  test("uses the latest metadata version and includes only warning statuses", () => {
    expect(getExpiringTrustAssets(certificates, metadataInfo)).toEqual([
      {
        id: "metadata-timestamp-3",
        name: "TUF timestamp metadata",
        status: "expiring",
        expires: "2026-11-20T00:00:00Z",
      },
      {
        id: "certificate-fulcio.pem-2026-12-01T10:00:00Z-CN=subject",
        name: "fulcio.pem",
        status: "expiring",
        expires: "2026-12-01T10:00:00Z",
      },
    ]);
  });

  test("normalizes past-due expiring records to expired", () => {
    expect(getExpiringTrustAssets(certificates, metadataInfo, Date.parse("2026-12-02T00:00:00Z"))).toEqual([
      expect.objectContaining({ name: "TUF timestamp metadata", status: "expired" }),
      expect.objectContaining({ name: "fulcio.pem", status: "expired" }),
    ]);
  });

  test("shows expired count, asset identity, expiry date, and urgency", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-02T00:00:00Z"));
    render(
      <ExpiringTrustAssets
        {...defaultProps}
        metadataInfo={{
          data: { root: [{ version: "1", status: "expired", expires: "2026-07-01T00:00:00Z" }] },
        }}
      />,
    );

    expect(screen.getByText("1 expired")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Expiring trust assets" })).toBeInTheDocument();
    expect(within(screen.getByRole("list", { name: "Expiring trust assets" })).getAllByRole("listitem")).toHaveLength(
      2,
    );
    expect(screen.getByText("TUF root metadata")).toBeInTheDocument();
    expect(screen.getByText("Expired Jul 01, 2026 · 1d ago")).toBeInTheDocument();
    expect(screen.getByText("Expired", { selector: "p" })).toBeInTheDocument();
    expect(screen.getByText("fulcio.pem")).toBeInTheDocument();
    expect(screen.getByText("Expires Dec 01, 2026")).toBeInTheDocument();
    vi.useRealTimers();
  });

  test("shows loading and complete no-warning states", () => {
    const { rerender } = render(
      <ExpiringTrustAssets
        {...defaultProps}
        certificates={undefined}
        metadataInfo={null}
        isFetchingCertificates
        isFetchingMetadata
      />,
    );
    expect(screen.getByRole("progressbar", { name: "Loading expiry warnings" })).toBeInTheDocument();

    rerender(<ExpiringTrustAssets {...defaultProps} certificates={[]} metadataInfo={{ data: {} }} />);
    expect(screen.getByText("No expiry warnings")).toBeInTheDocument();
    expect(screen.getByText("No certificates or TUF metadata currently need attention.")).toBeInTheDocument();
  });

  test("preserves available warnings when one source fails", () => {
    render(
      <ExpiringTrustAssets
        {...defaultProps}
        metadataInfo={null}
        metadataFetchError={new Error("metadata unavailable")}
      />,
    );

    expect(screen.getByText("Some expiry information unavailable")).toBeInTheDocument();
    expect(screen.getByText("fulcio.pem")).toBeInTheDocument();
    expect(screen.queryByText("No expiry warnings")).not.toBeInTheDocument();
  });

  test("does not claim a complete no-warning state when one source is unavailable", () => {
    render(
      <ExpiringTrustAssets
        {...defaultProps}
        certificates={[]}
        metadataInfo={null}
        metadataFetchError={new Error("metadata unavailable")}
      />,
    );

    expect(screen.getByText("Some expiry information unavailable")).toBeInTheDocument();
    expect(screen.getByText("No expiry warnings found in available data.")).toBeInTheDocument();
    expect(screen.queryByText("No expiry warnings")).not.toBeInTheDocument();
  });

  test("shows a total error only when both sources are unavailable", () => {
    render(
      <ExpiringTrustAssets
        {...defaultProps}
        certificates={undefined}
        metadataInfo={null}
        certificatesFetchError={new Error("certificates unavailable")}
        metadataFetchError={new Error("metadata unavailable")}
      />,
    );

    expect(screen.getByText("Unable to load expiry warnings")).toBeInTheDocument();
  });

  test("keeps cached warnings visible after a failed background refresh", () => {
    render(
      <ExpiringTrustAssets
        {...defaultProps}
        certificatesFetchError={new Error("certificates refresh failed")}
        metadataFetchError={new Error("metadata refresh failed")}
      />,
    );

    expect(screen.getByText("Unable to refresh expiry information")).toBeInTheDocument();
    expect(screen.getByText("Showing the last available trust data.")).toBeInTheDocument();
    expect(screen.getByText("fulcio.pem")).toBeInTheDocument();
    expect(screen.getByText("TUF timestamp metadata")).toBeInTheDocument();
    expect(screen.queryByText("Unable to load expiry warnings")).not.toBeInTheDocument();
  });
});
