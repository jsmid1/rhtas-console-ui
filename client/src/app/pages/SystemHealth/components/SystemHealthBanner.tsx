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
  const affectedServices = services.filter(({ status }) => status !== "healthy").map(({ name }) => name);
  const isDown = overallStatus === "Down";

  return (
    <Alert
      isInline
      variant={isDown ? "danger" : "warning"}
      title={isDown ? "Down – signing system unavailable" : "Degraded – some signing services need attention"}
    >
      Affected services: {affectedServices.join(", ")}.
    </Alert>
  );
};
