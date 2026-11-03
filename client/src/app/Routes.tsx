import { Suspense, lazy } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Navigate, useParams, useRoutes } from "react-router-dom";

import { Bullseye, Spinner } from "@patternfly/react-core";
import { ErrorFallback } from "./components/ErrorFallback";
import NotFound from "./pages/NotFound";
import { useFeatureFlags } from "./hooks/useFeatureFlags";

const Artifacts = lazy(() => import("./pages/Artifacts"));
const TrustRoot = lazy(() => import("./pages/TrustRoot"));
const RekorSearch = lazy(() => import("./pages/Rekor/RekorSearch"));
const RekorEntry = lazy(() => import("./pages/Rekor/RekorEntry"));
const Monitoring = lazy(() => import("./pages/Monitoring"));
const SystemHealth = lazy(() => import("./pages/SystemHealth"));

export const Paths = {
  artifacts: "/artifacts",
  rekorSearch: "/rekor-search",
  rekorEntry: `/rekor-search/:logIndex`,
  trustRoot: "/trust-root",
  monitoringAlerting: "/monitoring",
  systemHealth: "/system-health",
} as const;

export const AppRoutes = () => {
  const { features } = useFeatureFlags();

  const allRoutes = useRoutes([
    { path: "/", element: <Navigate to={Paths.trustRoot} /> },
    { path: Paths.trustRoot, element: <TrustRoot /> },
    { path: Paths.artifacts, element: <Artifacts /> },
    { path: Paths.rekorSearch, element: <RekorSearch /> },
    { path: Paths.rekorEntry, element: <RekorEntry /> },
    ...(features.observability ? [{ path: Paths.systemHealth, element: <SystemHealth /> }] : []),
    ...(features.monitoringAlerting ? [{ path: Paths.monitoringAlerting, element: <Monitoring /> }] : []),
    { path: "*", element: <NotFound /> },
  ]);

  return (
    <Suspense
      fallback={
        <Bullseye>
          <Spinner />
        </Bullseye>
      }
    >
      <ErrorBoundary FallbackComponent={ErrorFallback} key={location.pathname}>
        {allRoutes}
      </ErrorBoundary>
    </Suspense>
  );
};

export const useRouteParams = (pathParam: "logIndex") => {
  const params = useParams();
  const value = params[pathParam];
  if (value === undefined) {
    throw new Error(`ASSERTION FAILURE: required path parameter not set: ${pathParam}`);
  }
  return value;
};
