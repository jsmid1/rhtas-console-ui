import { DocumentMetadata } from "@app/components/DocumentMetadata";
import { LoadingWrapper } from "@app/components/LoadingWrapper";
import type { ServiceHealth } from "@app/client";
import { useFetchSystemHealth } from "@app/queries/system-health";
import {
  Alert,
  Bullseye,
  Button,
  Content,
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  PageSection,
  Stack,
  StackItem,
} from "@patternfly/react-core";
import { ExclamationCircleIcon, SyncAltIcon } from "@patternfly/react-icons";
import { useEffect, useState } from "react";
import { ServiceStatusCard } from "./components/ServiceStatusCard";
import { StatusDot } from "./components/StatusDot";
import { SystemHealthBanner } from "./components/SystemHealthBanner";
import { dashboardStatusLabel, formatRelativeTime, getDashboardStatus, type ServiceStatus } from "./utils";

interface ServiceInfo {
  name: string;
  status: ServiceStatus;
}

interface LastCheckedProps {
  updatedAt?: string | null;
}

const LastChecked: React.FC<LastCheckedProps> = ({ updatedAt }) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 1000);

    return () => window.clearInterval(timer);
  }, [updatedAt]);

  if (!updatedAt) return <>Last checked unavailable</>;

  return <>Last checked {formatRelativeTime(updatedAt, now)}</>;
};

export const SystemHealth: React.FC = () => {
  const { data, isLoading, isFetching, fetchError, refetch } = useFetchSystemHealth();
  const serviceStatus = (name: ServiceHealth["name"]): ServiceStatus =>
    data?.services?.find((service) => service.name === name)?.status ?? "unknown";

  const visibleServices: ServiceInfo[] = [
    { name: "Fulcio", status: serviceStatus("fulcio") },
    { name: "Rekor", status: serviceStatus("rekor") },
    { name: "TUF", status: serviceStatus("tuf") },
  ];
  const monitoredServices: ServiceInfo[] = [
    ...visibleServices,
    { name: "CT log", status: serviceStatus("ctlog") },
    { name: "Trillian", status: serviceStatus("trillian") },
    { name: "TSA", status: serviceStatus("tsa") },
  ];
  const securesignStatus = data?.securesignStatus ?? "unknown";
  const overallStatus = getDashboardStatus(
    monitoredServices.map(({ status }) => status),
    securesignStatus,
  );
  const securesignStatusReason = data?.securesignStatusReason ?? undefined;
  const refreshFailed = Boolean(fetchError);

  return (
    <>
      <DocumentMetadata title="System Health" />
      <PageSection>
        <Flex justifyContent={{ default: "justifyContentSpaceBetween" }} alignItems={{ default: "alignItemsCenter" }}>
          <FlexItem>
            <Content>
              <Content component="h1">System Health</Content>
              <Content component="p">
                Monitor service health, track expiring trust assets, and investigate signing failures from one place
              </Content>
            </Content>
          </FlexItem>
          {data && (
            <FlexItem>
              <Flex alignItems={{ default: "alignItemsCenter" }} spaceItems={{ default: "spaceItemsMd" }}>
                <FlexItem>
                  <Content component="small">{dashboardStatusLabel(overallStatus)}</Content>
                </FlexItem>
                <FlexItem>
                  <Flex alignItems={{ default: "alignItemsCenter" }} spaceItems={{ default: "spaceItemsXs" }}>
                    <FlexItem>
                      <StatusDot severity={refreshFailed ? "warning" : "success"} />
                    </FlexItem>
                    <FlexItem>
                      <Content component="small">{refreshFailed ? "Refresh failed" : "Dashboard online"}</Content>
                    </FlexItem>
                  </Flex>
                </FlexItem>
                <FlexItem>
                  <Content component="small" style={{ color: "var(--pf-t--global--text--color--subtle)" }}>
                    <LastChecked updatedAt={data.updatedAt} />
                  </Content>
                </FlexItem>
                <FlexItem>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<SyncAltIcon />}
                    isLoading={isFetching}
                    isDisabled={isFetching}
                    onClick={() => void refetch()}
                  >
                    Refresh
                  </Button>
                </FlexItem>
              </Flex>
            </FlexItem>
          )}
        </Flex>
      </PageSection>
      <LoadingWrapper
        fetchError={data ? null : fetchError}
        isFetching={isLoading}
        fetchErrorState={() => (
          <PageSection>
            <Bullseye>
              <EmptyState
                status="danger"
                headingLevel="h2"
                titleText="Unable to connect"
                icon={ExclamationCircleIcon}
                variant={EmptyStateVariant.sm}
              >
                <EmptyStateBody>
                  There was an error retrieving data. Check your connection and try again.
                </EmptyStateBody>
                <Button variant="primary" isLoading={isFetching} isDisabled={isFetching} onClick={() => void refetch()}>
                  Retry
                </Button>
              </EmptyState>
            </Bullseye>
          </PageSection>
        )}
      >
        <PageSection>
          {data ? (
            <Stack hasGutter>
              {Boolean(fetchError) && (
                <StackItem>
                  <Alert isInline variant="warning" title="Unable to refresh system health">
                    Showing the last successfully retrieved status.
                  </Alert>
                </StackItem>
              )}
              {overallStatus !== "Healthy" && (
                <StackItem>
                  <SystemHealthBanner
                    overallStatus={overallStatus}
                    services={monitoredServices}
                    securesignStatus={securesignStatus}
                    securesignStatusReason={securesignStatusReason}
                  />
                </StackItem>
              )}
              <StackItem>
                <Grid hasGutter>
                  {visibleServices.map((service) => (
                    <GridItem key={service.name} span={12} sm={6} lg={4}>
                      <ServiceStatusCard name={service.name} status={service.status} />
                    </GridItem>
                  ))}
                </Grid>
              </StackItem>
            </Stack>
          ) : (
            !isLoading &&
            !fetchError && (
              <Bullseye>
                <EmptyState titleText="No health data available" headingLevel="h2">
                  <EmptyStateBody>Refresh to request the latest TAS service status.</EmptyStateBody>
                  <Button variant="primary" onClick={() => void refetch()}>
                    Refresh
                  </Button>
                </EmptyState>
              </Bullseye>
            )
          )}
        </PageSection>
      </LoadingWrapper>
    </>
  );
};
