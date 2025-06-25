import React from 'react';
import { DashboardContainer } from '../dashboardContainer';
import { ConfigProvider } from '../../context/configContext';

export function NoaaInterface({
  config = {},
  defaultZoomLocation,
  defaultZoomLevel,
}) {
  return (
    <ConfigProvider userConfig={config}>
      <DashboardContainer
        defaultZoomLocation={defaultZoomLocation}
        defaultZoomLevel={defaultZoomLevel}
      />
    </ConfigProvider>
  );
}
