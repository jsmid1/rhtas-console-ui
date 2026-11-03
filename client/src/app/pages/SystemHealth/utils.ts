export type ServiceStatus = "healthy" | "unhealthy" | "unknown";

export type OverallStatus = "Healthy" | "Degraded" | "Down";

export type Severity = "danger" | "warning" | "success" | "info";

export function formatRelativeTime(value: string, now = Date.now()): string {
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) return "unknown";

  const differenceInSeconds = Math.round((now - timestamp) / 1000);
  const absoluteDifference = Math.abs(differenceInSeconds);
  const units = [
    { limit: 60, milliseconds: 1000, suffix: "s" },
    { limit: 60 * 60, milliseconds: 60 * 1000, suffix: "m" },
    { limit: 24 * 60 * 60, milliseconds: 60 * 60 * 1000, suffix: "h" },
    { limit: Number.POSITIVE_INFINITY, milliseconds: 24 * 60 * 60 * 1000, suffix: "d" },
  ];
  const unit = units.find(({ limit }) => absoluteDifference < limit) ?? units[units.length - 1];
  const amount = Math.max(0, Math.round(Math.abs(now - timestamp) / unit.milliseconds));

  return differenceInSeconds < 0 ? `in ${amount}${unit.suffix}` : `${amount}${unit.suffix} ago`;
}

export function getOverallStatus(statuses: ServiceStatus[]): OverallStatus {
  if (statuses.every((status) => status === "healthy")) return "Healthy";
  if (statuses.every((status) => status === "unhealthy")) return "Down";
  return "Degraded";
}

export function overallStatusToSeverity(status: OverallStatus): Severity {
  switch (status) {
    case "Healthy":
      return "success";
    case "Degraded":
      return "warning";
    case "Down":
      return "danger";
  }
}

export function statusLabel(status: ServiceStatus): string {
  switch (status) {
    case "healthy":
      return "Healthy";
    case "unhealthy":
      return "Down";
    case "unknown":
      return "Unknown";
  }
}

export function statusToSeverity(status: ServiceStatus): Severity {
  switch (status) {
    case "healthy":
      return "success";
    case "unknown":
      return "warning";
    case "unhealthy":
      return "danger";
  }
}

export function severityColor(severity: Severity): string {
  switch (severity) {
    case "success":
      return "var(--pf-t--global--color--status--success--default)";
    case "warning":
      return "var(--pf-t--global--color--status--warning--default)";
    case "danger":
      return "var(--pf-t--global--color--status--danger--default)";
    case "info":
      return "var(--pf-t--global--color--status--info--default)";
  }
}

export function statusColor(status: ServiceStatus): string {
  return severityColor(statusToSeverity(status));
}
