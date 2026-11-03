import { getApiV1SystemHealth, type SystemHealthResponse } from "@app/client";
import { client } from "@app/axios-config/apiInit";
import { useMockableQuery } from "./helpers";
import { systemHealthMock } from "./mocks/system-health";

export const SystemHealthKey = ["system-health"];

export const useFetchSystemHealth = () => {
  const { data, isLoading, isFetching, error, refetch } = useMockableQuery<SystemHealthResponse | null>(
    {
      queryKey: SystemHealthKey,
      queryFn: async () => {
        const response = await getApiV1SystemHealth({ client });
        return response.data ?? null;
      },
    },
    systemHealthMock,
  );

  return { data, isLoading, isFetching, fetchError: error, refetch };
};
