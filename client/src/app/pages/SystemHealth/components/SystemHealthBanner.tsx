import { Alert } from "@patternfly/react-core";
import type { DashboardStatus, ServiceStatus } from "../utils";

interface ServiceSummary {
  name: string;
  status: ServiceStatus;
}

interface SystemHealthBannerProps {
  overallStatus: Exclude<DashboardStatus, "Healthy">;
  services: ServiceSummary[];
  securesignStatus: ServiceStatus;
  securesignStatusReason?: string;
}

export const SystemHealthBanner: React.FC<SystemHealthBannerProps> = ({
  overallStatus,
  services,
  securesignStatus,
  securesignStatusReason,
}) => {
  const affectedServices = services.filter(({ status }) => status === "unhealthy").map(({ name }) => name);
  const unknownServices = services.filter(({ status }) => status === "unknown").map(({ name }) => name);
  const isDown = overallStatus === "Down";
  const isUnavailable = overallStatus === "Unavailable";
  const operatorReason = securesignStatusReason?.trim();
  const showOperatorFallback =
    !operatorReason && affectedServices.length === 0 && unknownServices.length === 0 && overallStatus === "Degraded";

  return (
    <Alert
      isInline
      variant={isDown ? "danger" : "warning"}
      title={
        isDown
          ? "Down — signing pipeline unavailable"
          : isUnavailable
            ? "Status unavailable — unable to determine signing pipeline health"
            : "Degraded — some signing services need attention"
      }
    >
      {affectedServices.length > 0 && <div>Affected services: {affectedServices.join(", ")}.</div>}
      {unknownServices.length > 0 && <div>Status unavailable: {unknownServices.join(", ")}.</div>}
      {securesignStatus !== "healthy" && (operatorReason || showOperatorFallback) && (
        <div>
          {securesignStatus === "unknown"
            ? operatorReason
              ? `Operator readiness status is unavailable: ${operatorReason}`
              : "Operator readiness status is unavailable."
            : operatorReason
              ? `The operator reports the deployment as not ready: ${operatorReason}`
              : "The operator reports the deployment as not ready."}
        </div>
      )}
    </Alert>
  );
};
