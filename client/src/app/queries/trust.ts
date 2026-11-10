import type { AxiosError } from "axios";

import { client } from "@app/axios-config/apiInit";
import {
  getApiV1TrustConfig,
  getApiV1TrustMetadataInfo,
  getApiV1TrustTargetsCertificates,
  type Error as ApiError,
  type CertificateInfoList,
  type MetadataInfoResponse,
  type TrustConfig,
} from "@app/client";

import { useMockableQuery } from "./helpers";
import { trustConfigMock, trustMetadataInfoMock, trustTargetCertificatesMock } from "./mocks/trust.mock";

export const TrustKey = "Trust";

export const useFetchTrustConfig = () => {
  const { data, isLoading, error, refetch } = useMockableQuery<TrustConfig | null, AxiosError<ApiError>>(
    {
      queryKey: [TrustKey, "config"],
      queryFn: async () => {
        const response = await getApiV1TrustConfig({
          client,
        });
        return response.data ?? null;
      },
    },
    trustConfigMock,
  );

  return {
    config: data,
    isFetching: isLoading,
    fetchError: error,
    refetch,
  };
};

export const useFetchTrustMetadataInfo = () => {
  const { data, isLoading, isFetching, error, refetch } = useMockableQuery<
    MetadataInfoResponse | null,
    AxiosError<ApiError>
  >(
    {
      queryKey: [TrustKey, "metadata"],
      queryFn: async () => {
        const response = await getApiV1TrustMetadataInfo({
          client,
        });
        return response.data ?? null;
      },
    },
    trustMetadataInfoMock,
  );

  return {
    metadataInfo: data,
    isLoading,
    isFetching,
    fetchError: error,
    refetch,
  };
};

export const useFetchTrustTargetCertificates = () => {
  const { data, isLoading, isFetching, error, refetch } = useMockableQuery<
    CertificateInfoList | null,
    AxiosError<ApiError>
  >(
    {
      queryKey: [TrustKey, "certificates"],
      queryFn: async () => {
        const response = await getApiV1TrustTargetsCertificates({
          client,
        });
        return response.data ?? null;
      },
    },
    trustTargetCertificatesMock,
  );

  return {
    certificates: data,
    isLoading,
    isFetching,
    fetchError: error,
    refetch,
  };
};
