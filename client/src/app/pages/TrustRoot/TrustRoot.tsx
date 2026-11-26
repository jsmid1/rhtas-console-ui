import React, { Fragment } from "react";

import { Content, PageSection, Tab, TabContent, Tabs, TabTitleText } from "@patternfly/react-core";
import { ExternalLinkAltIcon } from "@patternfly/react-icons";

import { useFetchTrustMetadataInfo, useFetchTrustTargetCertificates } from "@app/queries/trust";

import { CertificatesTable } from "./components/Certificates";
import { Overview } from "./components/Overview";
import { RootDetails } from "./components/RootDetails";
import { MetadataNotAvailable } from "./components/ErrorStates/MetadataNotAvailable";
import { DocumentMetadata } from "@app/components/DocumentMetadata";
import { LoadingWrapper } from "@app/components/LoadingWrapper";

export const TrustRoots: React.FC = () => {
  const { metadataInfo, isLoading: isLoadingMetadata, fetchError: fetchErrorMetadata } = useFetchTrustMetadataInfo();

  const {
    certificates,
    isLoading: isLoadingCertificates,
    fetchError: fetchErrorCertificates,
  } = useFetchTrustTargetCertificates();

  // Tab refs
  const overviewTabRef = React.useRef<HTMLElement>(null);
  const certificatesTabRef = React.useRef<HTMLElement>(null);
  const rootDetailsTabRef = React.useRef<HTMLElement>(null);

  const [activeTabKey, setActiveTabKey] = React.useState<string | number>(0);

  const handleTabClick = (_event: React.MouseEvent | React.KeyboardEvent | MouseEvent, tabIndex: string | number) => {
    setActiveTabKey(tabIndex);
  };

  return (
    <Fragment>
      <DocumentMetadata title="Trust Root" />
      <PageSection variant="default">
        <Content>
          <h1>Trust Root</h1>
          <p>This information represents the update framework.</p>
          <p>
            <a href={metadataInfo?.["repo-url"]} target="_blank" rel="noopener noreferrer">
              {metadataInfo?.["repo-url"]} <ExternalLinkAltIcon />
            </a>
          </p>
        </Content>
      </PageSection>
      <PageSection variant="default">
        <Tabs
          mountOnEnter
          activeKey={activeTabKey}
          onSelect={handleTabClick}
          aria-label="Tabs that contain the SBOM information"
          role="region"
        >
          <Tab
            eventKey={0}
            title={<TabTitleText>Overview</TabTitleText>}
            tabContentId="overviewTabSection"
            tabContentRef={overviewTabRef}
          />
          <Tab
            eventKey={1}
            title={<TabTitleText>Certificates</TabTitleText>}
            tabContentId="certificatesTabSection"
            tabContentRef={certificatesTabRef}
          />
          <Tab
            eventKey={2}
            title={<TabTitleText>TUF Metadata</TabTitleText>}
            tabContentId="rootDetailsTabSection"
            tabContentRef={rootDetailsTabRef}
          />
        </Tabs>
      </PageSection>
      <PageSection>
        <TabContent eventKey={0} id="overviewTabSection" ref={overviewTabRef} aria-label="Overview">
          <Overview
            certificates={certificates?.data ?? []}
            isFetching={isLoadingCertificates}
            fetchError={fetchErrorCertificates}
            rootLink={metadataInfo?.["repo-url"]}
          />
        </TabContent>
        <TabContent eventKey={1} id="certificatesTabSection" ref={certificatesTabRef} aria-label="Certificates" hidden>
          <CertificatesTable
            certificates={certificates?.data ?? []}
            isFetching={isLoadingCertificates}
            fetchError={fetchErrorCertificates}
          />
        </TabContent>
        <TabContent eventKey={2} id="rootDetailsTabSection" ref={rootDetailsTabRef} aria-label="Metadata" hidden>
          <LoadingWrapper isFetching={isLoadingMetadata} fetchError={fetchErrorMetadata}>
            {metadataInfo ? (
              <RootDetails metadataInfo={metadataInfo} />
            ) : (
              <MetadataNotAvailable errorInfo="No metadata list found" />
            )}
          </LoadingWrapper>
        </TabContent>
      </PageSection>
    </Fragment>
  );
};
