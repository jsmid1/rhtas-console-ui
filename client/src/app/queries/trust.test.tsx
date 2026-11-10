import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock the ENV module before importing the hooks
vi.mock("@app/env", () => ({
  default: {
    MOCK: "on",
  },
}));

// Mock the API client
vi.mock("@app/axios-config/apiInit", () => ({
  client: {},
}));

// Mock the API functions
vi.mock("@app/client", async () => {
  const actual = await vi.importActual<typeof import("@app/client")>("@app/client");
  return {
    ...actual,
    getApiV1TrustConfig: vi.fn(),
    getApiV1TrustMetadataInfo: vi.fn(),
    getApiV1TrustTargetsCertificates: vi.fn(),
  };
});

import { useFetchTrustConfig, useFetchTrustMetadataInfo, useFetchTrustTargetCertificates, TrustKey } from "./trust";
import { trustConfigMock, trustMetadataInfoMock, trustTargetCertificatesMock } from "./mocks/trust.mock";

describe("Trust Queries", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0, // Disable garbage collection for tests
        },
      },
    });
  });

  afterEach(() => {
    queryClient.clear();
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe("useFetchTrustConfig", () => {
    it("should return mock trust config data", async () => {
      const { result } = renderHook(() => useFetchTrustConfig(), { wrapper });

      await waitFor(
        () => {
          expect(result.current.config).toBeDefined();
        },
        { timeout: 2000 },
      );

      expect(result.current.config).toEqual(trustConfigMock);
      expect(result.current.isFetching).toBe(false);
      expect(result.current.fetchError).toBeNull();
    });

    it("should expose refetch function", async () => {
      const { result } = renderHook(() => useFetchTrustConfig(), { wrapper });

      await waitFor(
        () => {
          expect(result.current.config).toBeDefined();
        },
        { timeout: 2000 },
      );

      expect(typeof result.current.refetch).toBe("function");
    });

    it("should handle refetch", async () => {
      const { result } = renderHook(() => useFetchTrustConfig(), { wrapper });

      await waitFor(
        () => {
          expect(result.current.config).toBeDefined();
        },
        { timeout: 2000 },
      );

      const initialData = result.current.config;
      expect(initialData).toEqual(trustConfigMock);

      // Refetch should work
      await result.current.refetch();

      await waitFor(
        () => {
          expect(result.current.config).toBeDefined();
        },
        { timeout: 2000 },
      );

      expect(result.current.config).toEqual(trustConfigMock);
    });

    it("should use correct query key", async () => {
      const { result } = renderHook(() => useFetchTrustConfig(), { wrapper });

      await waitFor(
        () => {
          expect(result.current.config).toBeDefined();
        },
        { timeout: 2000 },
      );

      // Verify the query is cached with the correct key
      const queryData = queryClient.getQueryData([TrustKey, "config"]);
      expect(queryData).toEqual(trustConfigMock);
    });
  });

  describe("useFetchTrustMetadataInfo", () => {
    it("should return mock metadata info", async () => {
      const { result } = renderHook(() => useFetchTrustMetadataInfo(), { wrapper });

      await waitFor(
        () => {
          expect(result.current.metadataInfo).toBeDefined();
        },
        { timeout: 2000 },
      );

      expect(result.current.metadataInfo).toEqual(trustMetadataInfoMock);
      expect(result.current.isFetching).toBe(false);
      expect(result.current.fetchError).toBeNull();
    });

    it("should expose refetch function", async () => {
      const { result } = renderHook(() => useFetchTrustMetadataInfo(), { wrapper });

      await waitFor(
        () => {
          expect(result.current.metadataInfo).toBeDefined();
        },
        { timeout: 2000 },
      );

      expect(typeof result.current.refetch).toBe("function");
    });

    it("should handle refetch", async () => {
      const { result } = renderHook(() => useFetchTrustMetadataInfo(), { wrapper });

      await waitFor(
        () => {
          expect(result.current.metadataInfo).toBeDefined();
        },
        { timeout: 2000 },
      );

      const initialData = result.current.metadataInfo;
      expect(initialData).toEqual(trustMetadataInfoMock);

      // Refetch should work
      await result.current.refetch();

      await waitFor(
        () => {
          expect(result.current.metadataInfo).toBeDefined();
        },
        { timeout: 2000 },
      );

      expect(result.current.metadataInfo).toEqual(trustMetadataInfoMock);
    });

    it("should expose background metadata refetch state", async () => {
      const { result } = renderHook(() => useFetchTrustMetadataInfo(), { wrapper });

      await waitFor(() => expect(result.current.isFetching).toBe(false), { timeout: 2000 });

      let refetchPromise: ReturnType<typeof result.current.refetch>;
      act(() => {
        refetchPromise = result.current.refetch();
      });
      await waitFor(() => expect(result.current.isFetching).toBe(true));
      await act(async () => refetchPromise);
      await waitFor(() => expect(result.current.isFetching).toBe(false), { timeout: 2000 });
    });

    it("should use correct query key", async () => {
      const { result } = renderHook(() => useFetchTrustMetadataInfo(), { wrapper });

      await waitFor(
        () => {
          expect(result.current.metadataInfo).toBeDefined();
        },
        { timeout: 2000 },
      );

      // Verify the query is cached with the correct key
      const queryData = queryClient.getQueryData([TrustKey, "metadata"]);
      expect(queryData).toEqual(trustMetadataInfoMock);
    });
  });

  describe("useFetchTrustTargetCertificates", () => {
    it("should return mock target certificates", async () => {
      const { result } = renderHook(() => useFetchTrustTargetCertificates(), { wrapper });

      await waitFor(
        () => {
          expect(result.current.certificates).toBeDefined();
        },
        { timeout: 2000 },
      );

      expect(result.current.certificates).toEqual(trustTargetCertificatesMock);
      expect(result.current.isFetching).toBe(false);
      expect(result.current.fetchError).toBeNull();
    });

    it("should expose refetch function", async () => {
      const { result } = renderHook(() => useFetchTrustTargetCertificates(), { wrapper });

      await waitFor(
        () => {
          expect(result.current.certificates).toBeDefined();
        },
        { timeout: 2000 },
      );

      expect(typeof result.current.refetch).toBe("function");
    });

    it("should handle refetch", async () => {
      const { result } = renderHook(() => useFetchTrustTargetCertificates(), { wrapper });

      await waitFor(
        () => {
          expect(result.current.certificates).toBeDefined();
        },
        { timeout: 2000 },
      );

      const initialData = result.current.certificates;
      expect(initialData).toEqual(trustTargetCertificatesMock);

      // Refetch should work
      await result.current.refetch();

      await waitFor(
        () => {
          expect(result.current.certificates).toBeDefined();
        },
        { timeout: 2000 },
      );

      expect(result.current.certificates).toEqual(trustTargetCertificatesMock);
    });

    it("should expose background certificate refetch state", async () => {
      const { result } = renderHook(() => useFetchTrustTargetCertificates(), { wrapper });

      await waitFor(() => expect(result.current.isFetching).toBe(false), { timeout: 2000 });

      let refetchPromise: ReturnType<typeof result.current.refetch>;
      act(() => {
        refetchPromise = result.current.refetch();
      });
      await waitFor(() => expect(result.current.isFetching).toBe(true));
      await act(async () => refetchPromise);
      await waitFor(() => expect(result.current.isFetching).toBe(false), { timeout: 2000 });
    });

    it("should use correct query key", async () => {
      const { result } = renderHook(() => useFetchTrustTargetCertificates(), { wrapper });

      await waitFor(
        () => {
          expect(result.current.certificates).toBeDefined();
        },
        { timeout: 2000 },
      );

      // Verify the query is cached with the correct key
      const queryData = queryClient.getQueryData([TrustKey, "certificates"]);
      expect(queryData).toEqual(trustTargetCertificatesMock);
    });
  });
});
