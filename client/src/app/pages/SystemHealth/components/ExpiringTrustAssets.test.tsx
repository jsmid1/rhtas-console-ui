import type { CertificateInfo, MetadataInfoResponse } from "@app/client";
import { render, screen, within } from "@testing-library/react";
import { trustMetadataInfoMock } from "@app/queries/mocks/trust.mock";
import { describe, expect, test, vi } from "vitest";
import {
  ExpiringTrustAssets,
  formatTimeRemaining,
  getExpiringTrustAssets,
  isUrgentExpiry,
} from "./ExpiringTrustAssets";

const certificate = (overrides: Partial<CertificateInfo>): CertificateInfo => ({
  target: "fulcio.pem",
  status: "expiring",
  certExpiration: "2026-12-01T10:00:00Z",
  issuer: "CN=issuer",
  subject: "CN=subject",
  type: "Fulcio",
  pem: "certificate",
  role: "intermediate",
  chainIndex: 0,
  isCA: true,
  serialNumber: "1234",
  ...overrides,
});

const certificates: CertificateInfo[] = [
  certificate({}),
  certificate({
    target: "rekor.pem",
    status: "active",
    certExpiration: "2027-12-01T10:00:00Z",
    type: "Rekor",
    role: "root",
    chainIndex: 1,
    serialNumber: "5678",
  }),
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
    expect(
      isUrgentExpiry({ id: "active", name: "Active", status: "active", expires: "2026-12-01T10:00:00Z" }, now),
    ).toBe(false);
  });

  test("uses the latest metadata version and includes active trust assets", () => {
    expect(getExpiringTrustAssets(certificates, metadataInfo, Date.parse("2026-11-03T10:00:00Z"))).toEqual([
      {
        id: "metadata-timestamp-3",
        name: "TUF timestamp metadata",
        status: "expiring",
        expires: "2026-11-20T00:00:00Z",
      },
      {
        id: "certificate-fulcio.pem-intermediate-0-1234-2026-12-01T10:00:00Z-CN=subject",
        name: "fulcio.pem",
        description: "intermediate certificate · serial 1234",
        status: "expiring",
        expires: "2026-12-01T10:00:00Z",
      },
      {
        id: "certificate-rekor.pem-root-1-5678-2027-12-01T10:00:00Z-CN=subject",
        name: "rekor.pem",
        description: "root certificate · serial 5678",
        status: "active",
        expires: "2027-12-01T10:00:00Z",
      },
    ]);
  });

  test("normalizes past-due expiring records to expired", () => {
    const assets = getExpiringTrustAssets(certificates, metadataInfo, Date.parse("2026-12-02T00:00:00Z"));

    expect(assets).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "TUF timestamp metadata", status: "expired" }),
        expect.objectContaining({ name: "fulcio.pem", status: "expired" }),
      ]),
    );
  });

  test("includes valid TUF metadata as active trust assets", () => {
    expect(getExpiringTrustAssets([], trustMetadataInfoMock, Date.parse("2026-07-01T10:00:00Z"))).toEqual([
      {
        id: "metadata-timestamp-736",
        name: "TUF timestamp metadata",
        status: "expiring",
        expires: "2026-07-30T08:02:24Z",
      },
      {
        id: "metadata-root-3",
        name: "TUF root metadata",
        status: "active",
        expires: "2026-11-20T13:58:18Z",
      },
      {
        id: "metadata-targets-14",
        name: "TUF targets metadata",
        status: "active",
        expires: "2036-05-09T09:00:52Z",
      },
      {
        id: "metadata-snapshot-165",
        name: "TUF snapshot metadata",
        status: "active",
        expires: "2036-05-15T08:09:16Z",
      },
    ]);
  });

  test("uses certificate chain identity from the trust API for stable keys", () => {
    const sameTargetCertificates = [
      certificate({ serialNumber: "1111", role: "root", chainIndex: 0 }),
      certificate({ serialNumber: "2222", role: "intermediate", chainIndex: 1 }),
    ];

    const assets = getExpiringTrustAssets(sameTargetCertificates, undefined);

    expect(assets).toHaveLength(2);
    expect(new Set(assets.map(({ id }) => id)).size).toBe(2);
    expect(assets.map(({ description }) => description)).toEqual([
      "root certificate · serial 1111",
      "intermediate certificate · serial 2222",
    ]);
  });

  test("shows expired count, asset identity, expiry date, and urgency", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-02T00:00:00Z"));
    render(
      <ExpiringTrustAssets
        {...defaultProps}
        certificates={[certificate({})]}
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
    expect(screen.getByText("intermediate certificate · serial 1234 · Expires Dec 01, 2026")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Renewal runbook →" })).toHaveAttribute(
      "href",
      "https://docs.redhat.com/en/documentation/red_hat_trusted_artifact_signer",
    );
    vi.useRealTimers();
  });

  test("hides the renewal runbook when every trust asset is active", () => {
    render(
      <ExpiringTrustAssets
        {...defaultProps}
        certificates={[
          certificate({
            status: "active",
            certExpiration: "2030-01-01T00:00:00Z",
          }),
        ]}
        metadataInfo={{
          data: { root: [{ version: "1", status: "valid", expires: "2030-01-01T00:00:00Z" }] },
        }}
      />,
    );

    expect(screen.getByText("fulcio.pem")).toBeInTheDocument();
    expect(screen.getByText("TUF root metadata")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Renewal runbook →" })).not.toBeInTheDocument();
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
    expect(screen.getByText("No trust assets with expiry information are currently available.")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Renewal runbook →" })).not.toBeInTheDocument();
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
