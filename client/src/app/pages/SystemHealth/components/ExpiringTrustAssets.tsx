import type { CertificateInfo, MetadataInfoResponse } from "@app/client";
import { formatDate } from "@app/utils/utils";
import {
  Alert,
  Bullseye,
  Card,
  CardBody,
  CardTitle,
  Content,
  Divider,
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
  Flex,
  FlexItem,
  Label,
  Spinner,
  Stack,
  StackItem,
} from "@patternfly/react-core";
import { Fragment } from "react";
import { formatRelativeTime } from "../utils";

interface ExpiringTrustAsset {
  id: string;
  name: string;
  status: "expiring" | "expired";
  expires?: string;
}

interface ExpiringTrustAssetsProps {
  certificates?: CertificateInfo[];
  metadataInfo?: MetadataInfoResponse | null;
  isFetchingCertificates: boolean;
  isFetchingMetadata: boolean;
  certificatesFetchError: unknown;
  metadataFetchError: unknown;
}

const isExpiryWarning = (status: string): status is ExpiringTrustAsset["status"] =>
  status === "expiring" || status === "expired";

const effectiveExpiryStatus = (
  status: ExpiringTrustAsset["status"],
  expires: string | undefined,
  now: number,
): ExpiringTrustAsset["status"] =>
  status === "expired" || expirationTimestamp(expires) <= now ? "expired" : "expiring";

const latestMetadata = (entries: MetadataInfoResponse["data"][string]) =>
  [...entries].sort((first, second) => second.version.localeCompare(first.version, undefined, { numeric: true }))[0];

const expirationTimestamp = (expires?: string) => {
  if (!expires) return Number.POSITIVE_INFINITY;
  const timestamp = Date.parse(expires);
  return Number.isNaN(timestamp) ? Number.POSITIVE_INFINITY : timestamp;
};

const URGENT_EXPIRY_THRESHOLD_DAYS = 30;

export const isUrgentExpiry = (asset: ExpiringTrustAsset, now = Date.now()) => {
  if (asset.status === "expired") return true;

  const expiration = expirationTimestamp(asset.expires);
  if (!Number.isFinite(expiration)) return true;

  return expiration - now <= URGENT_EXPIRY_THRESHOLD_DAYS * 24 * 60 * 60 * 1000;
};

export const getExpiringTrustAssets = (
  certificates: CertificateInfo[] = [],
  metadataInfo?: MetadataInfoResponse | null,
  now = Date.now(),
): ExpiringTrustAsset[] => {
  const certificateAssets = certificates
    .filter((certificate): certificate is CertificateInfo & { status: ExpiringTrustAsset["status"] } =>
      isExpiryWarning(certificate.status),
    )
    .map((certificate) => ({
      id: ["certificate", certificate.target, certificate.certExpiration, certificate.subject].join("-"),
      name: certificate.target,
      status: effectiveExpiryStatus(certificate.status, certificate.certExpiration, now),
      expires: certificate.certExpiration,
    }));

  const metadataAssets = Object.entries(metadataInfo?.data ?? {}).flatMap(([role, entries]) => {
    const metadata = latestMetadata(entries);
    if (!metadata || !isExpiryWarning(metadata.status)) return [];

    return [
      {
        id: `metadata-${role}-${metadata.version}`,
        name: `TUF ${role} metadata`,
        status: effectiveExpiryStatus(metadata.status, metadata.expires, now),
        expires: metadata.expires,
      },
    ];
  });

  return [...certificateAssets, ...metadataAssets].sort((first, second) => {
    if (first.status !== second.status) return first.status === "expired" ? -1 : 1;
    const expirationDifference = expirationTimestamp(first.expires) - expirationTimestamp(second.expires);
    return expirationDifference || first.name.localeCompare(second.name);
  });
};

export const formatTimeRemaining = (
  expires: string | undefined,
  status: ExpiringTrustAsset["status"],
  now = Date.now(),
): string => {
  if (status === "expired") return "Expired";

  const expiration = expirationTimestamp(expires);
  if (!Number.isFinite(expiration)) return "Expiring";

  const remainingMilliseconds = expiration - now;
  if (remainingMilliseconds <= 0) return "Expired";

  const remainingDays = Math.ceil(remainingMilliseconds / (24 * 60 * 60 * 1000));
  if (remainingDays >= 365) {
    const years = Math.floor(remainingDays / 365);
    const days = remainingDays % 365;
    return days > 0 ? `${years}y ${days}d` : `${years}y`;
  }
  if (remainingDays >= 1) return `${remainingDays} ${remainingDays === 1 ? "day" : "days"}`;

  const remainingHours = Math.max(1, Math.ceil(remainingMilliseconds / (60 * 60 * 1000)));
  return `${remainingHours}h`;
};

const expiryDescription = (asset: ExpiringTrustAsset, now = Date.now()) => {
  if (!asset.expires || !Number.isFinite(expirationTimestamp(asset.expires))) return "Expiry date unavailable";
  const date = formatDate(asset.expires);
  return asset.status === "expired" ? `Expired ${date} · ${formatRelativeTime(asset.expires, now)}` : `Expires ${date}`;
};

export const ExpiringTrustAssets: React.FC<ExpiringTrustAssetsProps> = ({
  certificates,
  metadataInfo,
  isFetchingCertificates,
  isFetchingMetadata,
  certificatesFetchError,
  metadataFetchError,
}) => {
  const assets = getExpiringTrustAssets(certificates, metadataInfo);
  const expiredCount = assets.filter(({ status }) => status === "expired").length;
  const certificatesHaveData = certificates !== undefined;
  const metadataHaveData = metadataInfo != null;
  const isInitialLoading =
    (isFetchingCertificates && !certificatesHaveData) || (isFetchingMetadata && !metadataHaveData);
  const certificatesUnavailable = !certificatesHaveData;
  const metadataUnavailable = !metadataHaveData;
  const unavailableSources = Number(certificatesUnavailable) + Number(metadataUnavailable);
  const hasStaleData =
    (Boolean(certificatesFetchError) && certificatesHaveData) || (Boolean(metadataFetchError) && metadataHaveData);

  return (
    <Card isFullHeight>
      <CardTitle component="h2" aria-label="Expiring trust assets">
        <Flex justifyContent={{ default: "justifyContentSpaceBetween" }} alignItems={{ default: "alignItemsCenter" }}>
          <FlexItem>Expiring trust assets</FlexItem>
          {expiredCount > 0 && (
            <FlexItem>
              <Label color="red" isCompact>
                {expiredCount} expired
              </Label>
            </FlexItem>
          )}
        </Flex>
      </CardTitle>
      <CardBody>
        {isInitialLoading ? (
          <Bullseye>
            <Spinner aria-label="Loading expiry warnings" />
          </Bullseye>
        ) : unavailableSources === 2 ? (
          <Alert isInline variant="warning" title="Unable to load expiry warnings">
            Certificate and metadata expiry information is currently unavailable.
          </Alert>
        ) : (
          <Stack hasGutter>
            {hasStaleData && (
              <StackItem>
                <Alert isInline variant="warning" title="Unable to refresh expiry information">
                  Showing the last available trust data.
                </Alert>
              </StackItem>
            )}
            {unavailableSources === 1 && (
              <StackItem>
                <Alert isInline variant="warning" title="Some expiry information unavailable">
                  Showing warnings from available trust sources.
                </Alert>
              </StackItem>
            )}
            {assets.length > 0 ? (
              <StackItem>
                <Stack
                  component="ul"
                  hasGutter
                  aria-label="Expiring trust assets"
                  style={{ listStyle: "none", margin: 0, padding: 0 }}
                >
                  {assets.map((asset, index) => (
                    <Fragment key={asset.id}>
                      <StackItem component="li">
                        <Flex
                          justifyContent={{ default: "justifyContentSpaceBetween" }}
                          alignItems={{ default: "alignItemsCenter" }}
                        >
                          <FlexItem>
                            <Content component="p">{asset.name}</Content>
                            <Content component="small" style={{ color: "var(--pf-t--global--text--color--subtle)" }}>
                              {expiryDescription(asset)}
                            </Content>
                          </FlexItem>
                          <FlexItem>
                            <Content
                              component="p"
                              style={
                                isUrgentExpiry(asset)
                                  ? {
                                      color: "var(--pf-t--global--color--status--danger--default)",
                                      fontWeight: 500,
                                    }
                                  : undefined
                              }
                            >
                              {formatTimeRemaining(asset.expires, asset.status)}
                            </Content>
                          </FlexItem>
                        </Flex>
                      </StackItem>
                      {index < assets.length - 1 && (
                        <StackItem component="li" aria-hidden="true">
                          <Divider />
                        </StackItem>
                      )}
                    </Fragment>
                  ))}
                </Stack>
              </StackItem>
            ) : unavailableSources === 1 ? (
              <StackItem>
                <Content component="small">No expiry warnings found in available data.</Content>
              </StackItem>
            ) : (
              <StackItem>
                <EmptyState
                  variant={EmptyStateVariant.sm}
                  titleText="No expiry warnings"
                  headingLevel="h3"
                  status="success"
                >
                  <EmptyStateBody>No certificates or TUF metadata currently need attention.</EmptyStateBody>
                </EmptyState>
              </StackItem>
            )}
          </Stack>
        )}
      </CardBody>
    </Card>
  );
};
