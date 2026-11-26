import { Card, CardBody, Content, Flex, FlexItem } from "@patternfly/react-core";
import { StatusDot } from "./StatusDot";
import { statusColor, statusLabel, statusToSeverity, type ServiceStatus } from "../utils";

interface ServiceStatusCardProps {
  name: string;
  status: ServiceStatus;
  summary?: string;
  onClick?: () => void;
  isSelected?: boolean;
}

export const ServiceStatusCard: React.FC<ServiceStatusCardProps> = ({ name, status, summary, onClick, isSelected }) => (
  <Card
    isFullHeight
    aria-label={`${name} status`}
    component={onClick ? "button" : "div"}
    isClickable={Boolean(onClick)}
    isSelected={isSelected}
    onClick={onClick}
    type={onClick ? "button" : undefined}
    aria-haspopup={onClick ? "dialog" : undefined}
    aria-expanded={onClick ? Boolean(isSelected) : undefined}
    aria-controls={onClick ? "system-health-service-detail-drawer" : undefined}
  >
    <CardBody>
      <Flex alignItems={{ default: "alignItemsCenter" }} spaceItems={{ default: "spaceItemsSm" }}>
        <FlexItem>
          <StatusDot severity={statusToSeverity(status)} />
        </FlexItem>
        <FlexItem>
          <Content component="p">
            <strong>{name}</strong>
          </Content>
        </FlexItem>
      </Flex>
      <Content component="p" style={{ color: statusColor(status), marginTop: "var(--pf-t--global--spacer--sm)" }}>
        {statusLabel(status)}
      </Content>
      {summary && <Content component="small">{summary}</Content>}
    </CardBody>
  </Card>
);
