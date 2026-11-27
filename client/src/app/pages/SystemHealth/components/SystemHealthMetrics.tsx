import type { SystemHealthMetrics as SystemHealthMetricsData } from "@app/client";
import { formatDate } from "@app/utils/utils";
import {
  Alert,
  Card,
  CardBody,
  CardTitle,
  Content,
  Grid,
  GridItem,
  Label,
  Stack,
  StackItem,
  Title,
} from "@patternfly/react-core";
import { formatErrorRate, formatRelativeTime } from "../utils";

interface SystemHealthMetricsProps {
  metrics?: SystemHealthMetricsData;
}

const formatCount = (value: number | null | undefined) => (value == null ? "Not available" : value.toLocaleString());

const formatWindow = (seconds: number) => {
  if (seconds % 3600 === 0) return `${seconds / 3600}h`;
  if (seconds % 60 === 0) return `${seconds / 60}m`;
  return `${seconds}s`;
};

const formatTimestamp = (value: string | null | undefined) => {
  if (!value) return "Not available";
  return `${formatDate(value)} · ${formatRelativeTime(value)}`;
};

const statusLabel = (status: SystemHealthMetricsData["status"]) => {
  switch (status) {
    case "available":
      return "Available";
    case "disabled":
      return "Not configured";
    case "unavailable":
      return "Unavailable";
  }
};

const statusTone = (status: SystemHealthMetricsData["status"]) => {
  switch (status) {
    case "available":
      return "success" as const;
    case "disabled":
      return "info" as const;
    case "unavailable":
      return "warning" as const;
  }
};

export const SystemHealthMetrics: React.FC<SystemHealthMetricsProps> = ({ metrics }) => {
  if (!metrics) return null;

  const errorRates = metrics.errorRates;
  const signingActivity = metrics.signingActivity;
  const windowLabel = `last ${formatWindow(metrics.windowSeconds)}`;

  return (
    <Card isFullHeight>
      <CardTitle component="h2" aria-label="Signing metrics">
        <Stack hasGutter>
          <StackItem>Signing metrics</StackItem>
          <StackItem>
            <Label isCompact status={statusTone(metrics.status)}>
              {statusLabel(metrics.status)}
            </Label>
          </StackItem>
        </Stack>
      </CardTitle>
      <CardBody>
        {metrics.status === "disabled" ? (
          <Alert isInline variant="info" title="Prometheus metrics are not configured">
            Set PROMETHEUS_URL to collect signing request metrics.
          </Alert>
        ) : metrics.status === "unavailable" ? (
          <Alert isInline variant="warning" title="Prometheus metrics are unavailable">
            {metrics.reason ?? "Prometheus could not be queried."}
          </Alert>
        ) : !errorRates && !signingActivity ? (
          <Alert isInline variant="info" title="No signing metrics available">
            Prometheus did not return signing request data.
          </Alert>
        ) : (
          <Stack hasGutter>
            {errorRates && (
              <StackItem>
                <Title headingLevel="h3">Error rate · {windowLabel}</Title>
                <Grid hasGutter>
                  <GridItem span={6} lg={3}>
                    <Content component="p">Total errors</Content>
                    <Content component="p">{formatCount(errorRates.totalErrors)}</Content>
                  </GridItem>
                  <GridItem span={6} lg={3}>
                    <Content component="p">Error rate</Content>
                    <Content component="p">
                      {errorRates.errorRate == null ? "No requests" : formatErrorRate(errorRates.errorRate)}
                    </Content>
                  </GridItem>
                  <GridItem span={6} lg={3}>
                    <Content component="p">Server errors</Content>
                    <Content component="p">{formatCount(errorRates.serverErrors)}</Content>
                  </GridItem>
                  <GridItem span={6} lg={3}>
                    <Content component="p">Client errors</Content>
                    <Content component="p">{formatCount(errorRates.clientErrors)}</Content>
                  </GridItem>
                  <GridItem span={6} lg={3}>
                    <Content component="p">Timeouts</Content>
                    <Content component="p">{formatCount(errorRates.timeouts)}</Content>
                  </GridItem>
                  <GridItem span={6} lg={3}>
                    <Content component="p">Total requests</Content>
                    <Content component="p">{formatCount(errorRates.totalRequests)}</Content>
                  </GridItem>
                </Grid>
              </StackItem>
            )}
            {signingActivity && (
              <StackItem>
                <Title headingLevel="h3">Signing activity · {windowLabel}</Title>
                <Grid hasGutter>
                  <GridItem span={6} lg={4}>
                    <Content component="p">Certificates issued</Content>
                    <Content component="p">{formatCount(signingActivity.certificatesIssued)}</Content>
                  </GridItem>
                  <GridItem span={6} lg={4}>
                    <Content component="p">Log entries added</Content>
                    <Content component="p">{formatCount(signingActivity.logEntriesAdded)}</Content>
                  </GridItem>
                  <GridItem span={6} lg={4}>
                    <Content component="p">Timestamps issued</Content>
                    <Content component="p">{formatCount(signingActivity.timestampsIssued)}</Content>
                  </GridItem>
                </Grid>
              </StackItem>
            )}
            <StackItem>
              <Content component="small">Updated {formatTimestamp(metrics.updatedAt)}</Content>
            </StackItem>
          </Stack>
        )}
      </CardBody>
    </Card>
  );
};
