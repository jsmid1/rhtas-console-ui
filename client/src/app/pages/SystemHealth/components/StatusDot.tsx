import { Icon } from "@patternfly/react-core";
import { type Severity, severityColor } from "../utils";

export const StatusDot: React.FC<{ severity: Severity; size?: number }> = ({ severity, size = 10 }) => (
  <Icon isInline>
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <circle cx={size / 2} cy={size / 2} r={size / 2} fill={severityColor(severity)} />
    </svg>
  </Icon>
);
