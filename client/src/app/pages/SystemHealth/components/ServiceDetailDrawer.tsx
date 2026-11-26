import type { ServiceHealth } from "@app/client";
import { formatDate } from "@app/utils/utils";
import {
  Alert,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Drawer,
  DrawerActions,
  DrawerCloseButton,
  DrawerContent,
  DrawerContentBody,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
  Flex,
  FlexItem,
  Label,
  List,
  ListItem,
  Spinner,
  Title,
} from "@patternfly/react-core";
import { ExclamationCircleIcon } from "@patternfly/react-icons";
import { StatusDot } from "./StatusDot";
import { formatRelativeTime, statusLabel, statusToSeverity, type ServiceStatus } from "../utils";

export interface ServiceDetailInfo {
  id: ServiceHealth["name"];
  name: string;
  status: ServiceStatus;
  details?: ServiceHealth;
}

interface ServiceDetailDrawerProps {
  children: React.ReactNode;
  service?: ServiceDetailInfo;
  isExpanded: boolean;
  onClose: () => void;
  isLoading?: boolean;
  fetchError?: unknown;
}

const serviceImpact: Record<ServiceDetailInfo["id"], string> = {
  fulcio: "Certificate issuance and signing trust are affected.",
  rekor: "Transparency log writes and searches are affected.",
  tuf: "Trusted artifact verification is affected.",
  ctlog: "Certificate transparency checks are affected.",
  trillian: "Transparency log storage is affected.",
  tsa: "Signed timestamp issuance is affected.",
};

const formatLatency = (value: number | null | undefined) => {
  if (value == null) return undefined;
  return value >= 1000 ? `${(value / 1000).toFixed(1)}s` : `${Math.round(value)}ms`;
};

const formatTimestamp = (value: string | null | undefined) => {
  if (!value) return undefined;
  return `${formatDate(value)} · ${formatRelativeTime(value)}`;
};

const getFailingChecks = (service: ServiceDetailInfo) => {
  if (service.status === "unknown") return undefined;

  const checks: string[] = [];
  const details = service.details;

  if (service.status === "unhealthy") checks.push("Service is reported down");
  const consecutiveFailures = details?.consecutiveFailures;
  if (consecutiveFailures != null && consecutiveFailures > 0) {
    checks.push(`${consecutiveFailures} consecutive failed probes`);
  }
  if (details?.errorRate != null && details.errorRate > 0) {
    checks.push(`${(details.errorRate * 100).toFixed(1)}% probe error rate`);
  }
  if (service.status === "unhealthy" && details?.lastSuccessfulProbe == null) {
    checks.push("No successful probe has been recorded");
  }

  return checks.length > 0 ? checks : ["No failing checks"];
};

export const ServiceDetailDrawer: React.FC<ServiceDetailDrawerProps> = ({
  children,
  service,
  isExpanded,
  onClose,
  isLoading = false,
  fetchError,
}) => {
  const failingChecks = service ? getFailingChecks(service) : undefined;

  return (
    <Drawer
      isExpanded={isExpanded}
      position="end"
      onKeyDown={(event) => {
        if (event.key === "Escape") onClose();
      }}
    >
      <DrawerContent
        panelContent={
          <DrawerPanelContent
            id="system-health-service-detail-drawer"
            aria-label="Service details"
            isResizable
            defaultSize="500px"
            minSize="320px"
            focusTrap={{ enabled: true }}
          >
            <DrawerHead>
              <Flex
                alignItems={{ default: "alignItemsCenter" }}
                spaceItems={{ default: "spaceItemsSm" }}
                direction={{ default: "column" }}
              >
                <FlexItem>
                  <Flex alignItems={{ default: "alignItemsCenter" }} spaceItems={{ default: "spaceItemsXs" }}>
                    <FlexItem>
                      <StatusDot severity={service ? statusToSeverity(service.status) : "info"} />
                    </FlexItem>
                    <FlexItem>
                      <Title headingLevel="h2" size="lg">
                        {service?.name ?? "Service details"}
                      </Title>
                    </FlexItem>
                  </Flex>
                </FlexItem>
                {service && (
                  <FlexItem>
                    <Label isCompact status={statusToSeverity(service.status)}>
                      {statusLabel(service.status)}
                    </Label>
                  </FlexItem>
                )}
              </Flex>
              <DrawerActions>
                <DrawerCloseButton aria-label="Close service details" onClose={onClose} />
              </DrawerActions>
            </DrawerHead>
            <DrawerPanelBody>
              {isLoading && !service ? (
                <Spinner aria-label="Loading service details" />
              ) : !service ? (
                fetchError ? (
                  <Alert variant="danger" title="Unable to load service details">
                    The service information could not be retrieved. Try refreshing System Health.
                  </Alert>
                ) : (
                  <EmptyState
                    variant={EmptyStateVariant.sm}
                    titleText="No service selected"
                    headingLevel="h3"
                    icon={ExclamationCircleIcon}
                  >
                    <EmptyStateBody>Select a service card to view its details.</EmptyStateBody>
                  </EmptyState>
                )
              ) : (
                <>
                  {Boolean(fetchError) && (
                    <Alert isInline variant="warning" title="Unable to refresh service details">
                      Showing the last available service information.
                    </Alert>
                  )}
                  <DescriptionList aria-label={`${service.name} details`} isHorizontal isCompact>
                    <DescriptionListGroup>
                      <DescriptionListTerm>Impact</DescriptionListTerm>
                      <DescriptionListDescription>
                        {service.status === "healthy"
                          ? "No operational impact."
                          : service.status === "unknown"
                            ? "Operational impact is unavailable."
                            : serviceImpact[service.id]}
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                    {service.details?.endpointUrl && (
                      <DescriptionListGroup>
                        <DescriptionListTerm>Endpoint</DescriptionListTerm>
                        <DescriptionListDescription>
                          <a href={service.details.endpointUrl} target="_blank" rel="noopener noreferrer">
                            {service.details.endpointUrl}
                          </a>
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                    )}
                    <DescriptionListGroup>
                      <DescriptionListTerm>Probe type</DescriptionListTerm>
                      <DescriptionListDescription>
                        {service.details?.probed ? "HTTP probe" : "Condition-derived"}
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                    {service.details?.latencyP50Ms != null && (
                      <DescriptionListGroup>
                        <DescriptionListTerm>p50 latency</DescriptionListTerm>
                        <DescriptionListDescription>
                          {formatLatency(service.details.latencyP50Ms)}
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                    )}
                    {service.details?.latencyP95Ms != null && (
                      <DescriptionListGroup>
                        <DescriptionListTerm>p95 latency</DescriptionListTerm>
                        <DescriptionListDescription>
                          {formatLatency(service.details.latencyP95Ms)}
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                    )}
                    {service.details?.meanLatencyMs != null && (
                      <DescriptionListGroup>
                        <DescriptionListTerm>Mean latency</DescriptionListTerm>
                        <DescriptionListDescription>
                          {formatLatency(service.details.meanLatencyMs)}
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                    )}
                    {service.details?.errorRate != null && (
                      <DescriptionListGroup>
                        <DescriptionListTerm>Probe error rate</DescriptionListTerm>
                        <DescriptionListDescription>
                          {(service.details.errorRate * 100).toFixed(1)}%
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                    )}
                    {service.details?.uptimePercentage != null && (
                      <DescriptionListGroup>
                        <DescriptionListTerm>Probe uptime</DescriptionListTerm>
                        <DescriptionListDescription>
                          {service.details.uptimePercentage.toFixed(1)}%
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                    )}
                    {service.details?.consecutiveFailures != null && (
                      <DescriptionListGroup>
                        <DescriptionListTerm>Consecutive failures</DescriptionListTerm>
                        <DescriptionListDescription>{service.details.consecutiveFailures}</DescriptionListDescription>
                      </DescriptionListGroup>
                    )}
                    {service.details?.probeCount != null && (
                      <DescriptionListGroup>
                        <DescriptionListTerm>Probe count</DescriptionListTerm>
                        <DescriptionListDescription>{service.details.probeCount}</DescriptionListDescription>
                      </DescriptionListGroup>
                    )}
                    {service.details?.lastProbe && (
                      <DescriptionListGroup>
                        <DescriptionListTerm>Last probe</DescriptionListTerm>
                        <DescriptionListDescription>
                          {formatTimestamp(service.details.lastProbe)}
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                    )}
                    {service.details?.lastSuccessfulProbe && (
                      <DescriptionListGroup>
                        <DescriptionListTerm>Last successful probe</DescriptionListTerm>
                        <DescriptionListDescription>
                          {formatTimestamp(service.details.lastSuccessfulProbe)}
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                    )}
                    {service.details?.lastStateChange && (
                      <DescriptionListGroup>
                        <DescriptionListTerm>Last state change</DescriptionListTerm>
                        <DescriptionListDescription>
                          {formatTimestamp(service.details.lastStateChange)}
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                    )}
                    <DescriptionListGroup>
                      <DescriptionListTerm>Failing checks</DescriptionListTerm>
                      <DescriptionListDescription>
                        {failingChecks ? (
                          <List aria-label={`${service.name} failing checks`} isPlain>
                            {failingChecks.map((check) => (
                              <ListItem key={check}>{check}</ListItem>
                            ))}
                          </List>
                        ) : (
                          "Failing checks unavailable"
                        )}
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                  </DescriptionList>
                </>
              )}
            </DrawerPanelBody>
          </DrawerPanelContent>
        }
      >
        <DrawerContentBody>{children}</DrawerContentBody>
      </DrawerContent>
    </Drawer>
  );
};
