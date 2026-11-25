import type { CertificateInfoList, MetadataInfoResponse, TrustConfig } from "@app/client";

export const trustConfigMock: TrustConfig = {
  fulcioCertAuthorities: [
    {
      pem: "-----BEGIN CERTIFICATE-----\nstub-cert\n-----END CERTIFICATE-----",
      subject: "stub-sub",
    },
  ],
};

export const trustMetadataInfoMock: MetadataInfoResponse = {
  "repo-url": "https://tuf-repo-cdn.sigstore.dev",
  data: {
    root: [
      { expires: "2026-11-20T13:58:18Z", status: "valid", version: "3" },
      { expires: "2025-02-19T08:04:32Z", status: "expired", version: "1" },
      { expires: "2025-08-05T08:37:20Z", status: "expired", version: "2" },
    ],
    targets: [{ expires: "2036-05-09T09:00:52Z", status: "valid", version: "14" }],
    snapshot: [{ expires: "2036-05-15T08:09:16Z", status: "valid", version: "165" }],
    timestamp: [{ expires: "2026-07-30T08:02:24Z", status: "expiring", version: "736" }],
  },
};

export const trustTargetCertificatesMock: CertificateInfoList = {
  data: [
    {
      certExpiration: "2031-02-23 03:20:29 +0000 UTC",
      issuer: "CN=sigstore,O=sigstore.dev",
      status: "revoked",
      subject: "CN=sigstore,O=sigstore.dev",
      target: "fulcio.crt.pem",
      type: "Fulcio",
      pem: "-----BEGIN CERTIFICATE-----\nMIIB+DCCAX6gAwIBAgITNVkDZoCiofPDsy7dfm6geLbuhzAKBggqhkjOPQQDAzAq\nMRUwEwYDVQQKEwxzaWdzdG9yZS5kZXYxETAPBgNVBAMTCHNpZ3N0b3JlMB4XDTIx\nMDMwNzAzMjAyOVoXDTMxMDIyMzAzMjAyOVowKjEVMBMGA1UEChMMc2lnc3RvcmUu\nZGV2MREwDwYDVQQDEwhzaWdzdG9yZTB2MBAGByqGSM49AgEGBSuBBAAiA2IABLSy\nA7Ii5k+pNO8ZEWY0ylemWDowOkNa3kL+GZE5Z5GWehL9/A9bRNA3RbrsZ5i0Jcas\ntaRL7Sp5fp/jD5dxqc/UdTVnlvS16an+2Yfswe/QuLolRUCrcOE2+2iA5+tzd6Nm\nMGQwDgYDVR0PAQH/BAQDAgEGMBIGA1UdEwEB/wQIMAYBAf8CAQEwHQYDVR0OBBYE\nFMjFHQBBmiQpMlEk6w2uSu1KBtPsMB8GA1UdIwQYMBaAFMjFHQBBmiQpMlEk6w2u\nSu1KBtPsMAoGCCqGSM49BAMDA2gAMGUCMH8liWJfMui6vXXBhjDgY4MwslmN/TJx\nVe/83WrFomwmNf056y1X48F9c4m3a3ozXAIxAKjRay5/aj/jsKKGIkmQatjI8uup\nHr/+CxFvaJWmpYqNkLDGRU+9orzh5hI2RrcuaQ==\n-----END CERTIFICATE-----\n",
      role: "root",
      chainIndex: 0,
      isCA: true,
      serialNumber: "3559036680A2A1F3C3B32EDD7E6EA078B6EE87",
      validForStart: "2021-03-07T03:20:29Z",
      validForEnd: "2022-12-31T23:59:59Z",
    },
    {
      certExpiration: "2031-10-05 13:56:58 +0000 UTC",
      issuer: "CN=sigstore,O=sigstore.dev",
      status: "pending",
      subject: "CN=sigstore-pending,O=sigstore.dev",
      target: "fulcio_pending.crt.pem",
      type: "Fulcio",
      pem: "-----BEGIN CERTIFICATE-----\nMIIB9zCCAXygAwIBAgIUALZNAPFdxHPwjeDloDwyYChAO/4wCgYIKoZIzj0EAwMw\nKjEVMBMGA1UEChMMc2lnc3RvcmUuZGV2MREwDwYDVQQDEwhzaWdzdG9yZTAeFw0y\nMTEwMDcxMzU2NTlaFw0zMTEwMDUxMzU2NThaMCoxFTATBgNVBAoTDHNpZ3N0b3Jl\nLmRldjERMA8GA1UEAxMIc2lnc3RvcmUwdjAQBgcqhkjOPQIBBgUrgQQAIgNiAAT7\nXeFT4rb3PQGwS4IajtLk3/OlnpgangaBclYpsYBr5i+4ynB07ceb3LP0OIOZdxex\nX69c5iVuyJRQ+Hz05yi+UF3uBWAlHpiS5sh0+H2GHE7SXrk1EC5m1Tr19L9gg92j\nYzBhMA4GA1UdDwEB/wQEAwIBBjAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBRY\nwB5fkUWlZql6zJChkyLQKsXF+jAfBgNVHSMEGDAWgBRYwB5fkUWlZql6zJChkyLQ\nKsXF+jAKBggqhkjOPQQDAwNpADBmAjEAj1nHeXZp+13NWBNa+EDsDP8G1WWg1tCM\nWP/WHPqpaVo0jhsweNFZgSs0eE7wYI4qAjEA2WB9ot98sIkoF3vZYdd3/VtWB5b9\nTNMea7Ix/stJ5TfcLLeABLE4BNJOsQ4vnBHJ\n-----END CERTIFICATE-----\n",
      role: "root",
      chainIndex: 0,
      isCA: true,
      serialNumber: "B64D00F15DC473F08DE0E5A03C326028403BFE",
      validForStart: "2031-01-01T00:00:00Z",
    },
    {
      certExpiration: "2031-10-05 13:56:58 +0000 UTC",
      issuer: "CN=sigstore,O=sigstore.dev",
      status: "active",
      subject: "CN=sigstore-intermediate,O=sigstore.dev",
      target: "fulcio_intermediate_v1.crt.pem",
      type: "Fulcio",
      pem: "-----BEGIN CERTIFICATE-----\nMIIB9zCCAXygAwIBAgIUALZNAPFdxHPwjeDloDwyYChAO/4wCgYIKoZIzj0EAwMw\nKjEVMBMGA1UEChMMc2lnc3RvcmUuZGV2MREwDwYDVQQDEwhzaWdzdG9yZTAeFw0y\nMTEwMDcxMzU2NTlaFw0zMTEwMDUxMzU2NThaMCoxFTATBgNVBAoTDHNpZ3N0b3Jl\nLmRldjERMA8GA1UEAxMIc2lnc3RvcmUwdjAQBgcqhkjOPQIBBgUrgQQAIgNiAAT7\nXeFT4rb3PQGwS4IajtLk3/OlnpgangaBclYpsYBr5i+4ynB07ceb3LP0OIOZdxex\nX69c5iVuyJRQ+Hz05yi+UF3uBWAlHpiS5sh0+H2GHE7SXrk1EC5m1Tr19L9gg92j\nYzBhMA4GA1UdDwEB/wQEAwIBBjAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBRY\nwB5fkUWlZql6zJChkyLQKsXF+jAfBgNVHSMEGDAWgBRYwB5fkUWlZql6zJChkyLQ\nKsXF+jAKBggqhkjOPQQDAwNpADBmAjEAj1nHeXZp+13NWBNa+EDsDP8G1WWg1tCM\nWP/WHPqpaVo0jhsweNFZgSs0eE7wYI4qAjEA2WB9ot98sIkoF3vZYdd3/VtWB5b9\nTNMea7Ix/stJ5TfcLLeABLE4BNJOsQ4vnBHJ\n-----END CERTIFICATE-----\n",
      role: "root",
      chainIndex: 0,
      isCA: true,
      serialNumber: "B64D00F15DC473F08DE0E5A03C326028403BFE",
      validForStart: "2022-04-13T20:06:15Z",
    },
    {
      certExpiration: "2026-08-15T13:56:58Z",
      issuer: "CN=sigstore,O=sigstore.dev",
      status: "expiring",
      subject: "CN=sigstore-expiring,O=sigstore.dev",
      target: "fulcio_expiring.crt.pem",
      type: "Fulcio",
      pem: "-----BEGIN CERTIFICATE-----\nMIICGjCCAaGgAwIBAgIUALnViVfnU0brJasmRkHrn/UnfaQwCgYIKoZIzj0EAwMw\nKjEVMBMGA1UEChMMc2lnc3RvcmUuZGV2MREwDwYDVQQDEwhzaWdzdG9yZTAeFw0y\nMjA0MTMyMDA2MTVaFw0zMTEwMDUxMzU2NThaMDcxFTATBgNVBAoTDHNpZ3N0b3Jl\nLmRldjEeMBwGA1UEAxMVc2lnc3RvcmUtaW50ZXJtZWRpYXRlMHYwEAYHKoZIzj0C\nAQYFK4EEACIDYgAE8RVS/ysH+NOvuDZyPIZtilgUF9NlarYpAd9HP1vBBH1U5CV7\n7LSS7s0ZiH4nE7Hv7ptS6LvvR/STk798LVgMzLlJ4HeIfF3tHSaexLcYpSASr1kS\n0N/RgBJz/9jWCiXno3sweTAOBgNVHQ8BAf8EBAMCAQYwEwYDVR0lBAwwCgYIKwYB\nBQUHAwMwEgYDVR0TAQH/BAgwBgEB/wIBADAdBgNVHQ4EFgQU39Ppz1YkEZb5qNjp\nKFWixi4YZD8wHwYDVR0jBBgwFoAUWMAeX5FFpWapesyQoZMi0CrFxfowCgYIKoZI\nzj0EAwMDZwAwZAIwPCsQK4DYiZYDPIaDi5HFKnfxXx6ASSVmERfsynYBiX2X6SJR\nnZU84/9DZdnFvvxmAjBOt6QpBlc4J/0DxvkTCqpclvziL6BCCPnjdlIB3Pu3BxsP\nmygUY7Ii2zbdCdliiow=\n-----END CERTIFICATE-----\n",
      role: "intermediate",
      chainIndex: 0,
      isCA: true,
      serialNumber: "B9D58957E75346EB25AB264641EB9FF5277DA4",
      validForStart: "2022-04-13T20:06:15Z",
    },
    {
      certExpiration: "2031-10-05 13:56:58 +0000 UTC",
      issuer: "CN=sigstore,O=sigstore.dev",
      status: "active",
      subject: "CN=sigstore,O=sigstore.dev",
      target: "fulcio_v1.crt.pem",
      type: "Fulcio",
      pem: "-----BEGIN CERTIFICATE-----\nMIICGjCCAaGgAwIBAgIUALnViVfnU0brJasmRkHrn/UnfaQwCgYIKoZIzj0EAwMw\nKjEVMBMGA1UEChMMc2lnc3RvcmUuZGV2MREwDwYDVQQDEwhzaWdzdG9yZTAeFw0y\nMjA0MTMyMDA2MTVaFw0zMTEwMDUxMzU2NThaMDcxFTATBgNVBAoTDHNpZ3N0b3Jl\nLmRldjEeMBwGA1UEAxMVc2lnc3RvcmUtaW50ZXJtZWRpYXRlMHYwEAYHKoZIzj0C\nAQYFK4EEACIDYgAE8RVS/ysH+NOvuDZyPIZtilgUF9NlarYpAd9HP1vBBH1U5CV7\n7LSS7s0ZiH4nE7Hv7ptS6LvvR/STk798LVgMzLlJ4HeIfF3tHSaexLcYpSASr1kS\n0N/RgBJz/9jWCiXno3sweTAOBgNVHQ8BAf8EBAMCAQYwEwYDVR0lBAwwCgYIKwYB\nBQUHAwMwEgYDVR0TAQH/BAgwBgEB/wIBADAdBgNVHQ4EFgQU39Ppz1YkEZb5qNjp\nKFWixi4YZD8wHwYDVR0jBBgwFoAUWMAeX5FFpWapesyQoZMi0CrFxfowCgYIKoZI\nzj0EAwMDZwAwZAIwPCsQK4DYiZYDPIaDi5HFKnfxXx6ASSVmERfsynYBiX2X6SJR\nnZU84/9DZdnFvvxmAjBOt6QpBlc4J/0DxvkTCqpclvziL6BCCPnjdlIB3Pu3BxsP\nmygUY7Ii2zbdCdliiow=\n-----END CERTIFICATE-----\n",
      role: "intermediate",
      chainIndex: 0,
      isCA: true,
      serialNumber: "B9D58957E75346EB25AB264641EB9FF5277DA4",
      validForStart: "2022-04-13T20:06:15Z",
    },
  ],
};
