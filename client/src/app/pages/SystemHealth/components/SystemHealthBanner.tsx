import { Alert } from "@patternfly/react-core";
import type { OverallStatus, ServiceStatus } from "../utils";

interface ServiceSummary {
  name: string;
  status: ServiceStatus;
}

interface SystemHealthBannerProps {
  overallStatus: Exclude<OverallStatus, "Healthy">;
  services: ServiceSummary[];
}

export const SystemHealthBanner: React.FC<SystemHealthBannerProps> = ({ overallStatus, services }) => {
  const affectedServices = services.filter(({ status }) => status === "unhealthy").map(({ name }) => name);
  const unknownServices = services.filter(({ status }) => status === "unknown").map(({ name }) => name);
  const isDown = overallStatus === "Down";

  return (
    <Alert
      isInline
      variant={isDown ? "danger" : "warning"}
      title={isDown ? "Down — signing pipeline unavailable" : "Degraded — some signing services need attention"}
    >
      {affectedServices.length > 0 && <div>Affected services: {affectedServices.join(", ")}.</div>}
      {unknownServices.length > 0 && <div>Status unavailable: {unknownServices.join(", ")}.</div>}
    </Alert>
  );
};
