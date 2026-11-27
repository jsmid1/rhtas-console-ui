import type { ProbeSample } from "@app/client";
import { formatDate } from "@app/utils/utils";
import { Alert, EmptyState, EmptyStateBody, EmptyStateVariant, Spinner, Title } from "@patternfly/react-core";
import { ExclamationCircleIcon } from "@patternfly/react-icons";
import { Table, Tbody, Td, Th, Thead, Tr } from "@patternfly/react-table";
import { StatusDot } from "./StatusDot";
import { formatRelativeTime, statusLabel, statusToSeverity } from "../utils";

interface ServiceProbeHistoryProps {
  serviceName: string;
  samples?: ProbeSample[];
  isFetching?: boolean;
  fetchError?: unknown;
}

const formatLatency = (value: number | null | undefined) => {
  if (value == null) return "Not available";
  return value >= 1000 ? `${(value / 1000).toFixed(1)}s` : `${Math.round(value)}ms`;
};

const formatProbeTimestamp = (value: string) => `${formatDate(value)} · ${formatRelativeTime(value)}`;

export const ServiceProbeHistory: React.FC<ServiceProbeHistoryProps> = ({
  serviceName,
  samples,
  isFetching = false,
  fetchError,
}) => {
  const hasSamples = Boolean(samples?.length);

  if (isFetching && !hasSamples) {
    return (
      <section aria-label={`${serviceName} probe history`}>
        <Title headingLevel="h3">Probe history</Title>
        <Spinner aria-label={`Loading ${serviceName} probe history`} />
      </section>
    );
  }

  if (!hasSamples) {
    return (
      <section aria-label={`${serviceName} probe history`}>
        <Title headingLevel="h3">Probe history</Title>
        {fetchError ? (
          <Alert variant="danger" title="Unable to load probe history">
            The probe history could not be retrieved. Try refreshing System Health.
          </Alert>
        ) : (
          <EmptyState
            variant={EmptyStateVariant.sm}
            titleText="No probe history available"
            headingLevel="h4"
            icon={ExclamationCircleIcon}
          >
            <EmptyStateBody>No retained probe samples are available for this service.</EmptyStateBody>
          </EmptyState>
        )}
      </section>
    );
  }

  return (
    <section aria-label={`${serviceName} probe history`}>
      <Title headingLevel="h3">Probe history</Title>
      {Boolean(fetchError) && (
        <Alert isInline variant="warning" title="Unable to refresh probe history">
          Showing the last available probe samples.
        </Alert>
      )}
      <Table aria-label={`${serviceName} probe history`} variant="compact">
        <Thead>
          <Tr>
            <Th>Time</Th>
            <Th>Status</Th>
            <Th>Latency</Th>
            <Th>HTTP code</Th>
            <Th>Source</Th>
            <Th>Error</Th>
          </Tr>
        </Thead>
        <Tbody>
          {samples?.map((sample) => (
            <Tr key={sample.timestamp}>
              <Td dataLabel="Time">{formatProbeTimestamp(sample.timestamp)}</Td>
              <Td dataLabel="Status">
                <StatusDot severity={statusToSeverity(sample.status)} /> {statusLabel(sample.status)}
              </Td>
              <Td dataLabel="Latency">{formatLatency(sample.latencyMs)}</Td>
              <Td dataLabel="HTTP code">{sample.httpStatusCode ?? "Not available"}</Td>
              <Td dataLabel="Source">{sample.source === "http" ? "HTTP probe" : "Condition"}</Td>
              <Td dataLabel="Error">{sample.error ?? "None"}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </section>
  );
};
