import React, { useState } from 'react';
import { DashboardContainer } from '../dashboardContainer';
import { ConfigProvider } from '../../context/configContext';
import { LocalizationProvider } from '@mui/x-date-pickers';
import CssBaseline from '@mui/material/CssBaseline';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { useSearchParams } from 'react-router-dom';

export function NoaaInterface({
  config = {},
  defaultZoomLocation,
  defaultZoomLevel,
  defaultAgency,
  defaultGhg,
  defaultSelectedFrequency,
  defaultStationCode
}) {
  return (
    <ConfigProvider userConfig={config}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterMoment}>
        <DashboardContainer
          defaultZoomLocation={defaultZoomLocation}
          defaultZoomLevel={defaultZoomLevel}
          defaultSelectedFrequency={defaultSelectedFrequency}
          defaultStationCode={defaultStationCode}
          defaultGhg={defaultGhg}
          defaultAgency={defaultAgency}
        />
      </LocalizationProvider>
    </ConfigProvider>
  );
}

export function NoaaInterfaceContainer({
  defaultZoomLevel,
  defaultZoomLocation,
}) {
  const [searchParams] = useSearchParams();
  const agency = searchParams.get('agency'); // nist, noaa, or nasa
  const ghg = searchParams.get('ghg'); // co2 or ch4
  const stationCode = searchParams.get('station-code'); // buc, smt, etc
  const zoomLevel = useState(
    searchParams.get('zoom-level') || defaultZoomLevel
  );
  const zoomLocation = searchParams.get('zoom-location' || defaultZoomLocation);
  const selectedFrequency = searchParams.get('frequency');

  return (
    <NoaaInterface
      defaultSelectedFrequency={selectedFrequency}
      defaultStationCode={stationCode}
      defaultGhg={ghg}
      defaultAgency={agency}
      defaultZoomLocation={zoomLocation}
      defaultZoomLevel={zoomLevel}
    />
  );
}
