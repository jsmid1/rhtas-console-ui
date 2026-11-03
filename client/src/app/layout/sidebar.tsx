import type React from "react";
import { NavLink } from "react-router-dom";

import { Nav, NavList, PageSidebar, PageSidebarBody } from "@patternfly/react-core";
import { css } from "@patternfly/react-styles";
import nav from "@patternfly/react-styles/css/components/Nav/nav";
import { Paths } from "@app/Routes";
import { useFeatureFlags } from "@app/hooks/useFeatureFlags";

const LINK_CLASS = nav.navLink;
const ACTIVE_LINK_CLASS = nav.modifiers.current;

export const SidebarApp: React.FC = () => {
  const { features } = useFeatureFlags();

  const renderPageNav = () => {
    return (
      <Nav id="nav-sidebar" aria-label="Nav">
        <NavList>
          {features.observability && (
            <li className={nav.navItem}>
              <NavLink
                to={Paths.systemHealth}
                className={({ isActive }) => {
                  return css(LINK_CLASS, isActive ? ACTIVE_LINK_CLASS : "");
                }}
              >
                System Health
              </NavLink>
            </li>
          )}
          <li className={nav.navItem}>
            <NavLink
              to={Paths.trustRoot}
              className={({ isActive }) => {
                return css(LINK_CLASS, isActive ? ACTIVE_LINK_CLASS : "");
              }}
            >
              Trust Root
            </NavLink>
          </li>
          <li>
            <NavLink
              to={Paths.artifacts}
              className={({ isActive }) => {
                return css(LINK_CLASS, isActive ? ACTIVE_LINK_CLASS : "");
              }}
            >
              Artifacts
            </NavLink>
          </li>
          <li className={nav.navItem}>
            <NavLink
              to={Paths.rekorSearch}
              className={({ isActive }) => {
                return css(LINK_CLASS, isActive ? ACTIVE_LINK_CLASS : "");
              }}
            >
              Rekor Search
            </NavLink>
          </li>
          {features.monitoringAlerting && (
            <li className={nav.navItem}>
              <NavLink
                to={Paths.monitoringAlerting}
                className={({ isActive }) => {
                  return css(LINK_CLASS, isActive ? ACTIVE_LINK_CLASS : "");
                }}
              >
                Monitoring
              </NavLink>
            </li>
          )}
        </NavList>
      </Nav>
    );
  };

  return (
    <PageSidebar>
      <PageSidebarBody>{renderPageNav()}</PageSidebarBody>
    </PageSidebar>
  );
};
