import { createContext, use, useMemo, type ReactNode } from "react";
import { ENV } from "@app/env";

interface FeatureFlagsContextType {
  features: {
    monitoringAlerting: boolean;
    observability: boolean;
  };
}

const FeatureFlagsContext = createContext<FeatureFlagsContextType | undefined>(undefined);

export const FeatureFlagsProvider = ({ children }: { children: ReactNode }) => {
  const features = useMemo(
    () => ({
      monitoringAlerting: ENV.FEATURE_MONITORING === "on",
      observability: ENV.FEATURE_OBSERVABILITY === "on",
    }),
    [],
  );

  const value = { features };

  return <FeatureFlagsContext value={value}>{children}</FeatureFlagsContext>;
};

export const useFeatureFlags = () => {
  const context = use(FeatureFlagsContext);
  if (!context) {
    throw new Error("useFeatureFlags must be used within FeatureFlagsProvider");
  }
  return context;
};
