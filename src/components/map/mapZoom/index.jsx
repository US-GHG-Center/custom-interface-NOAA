import { useEffect } from 'react';

import { useMapbox } from '../../../context/mapContext';

export const MapZoom = ({ zoomLocation, zoomLevel }) => {
  const { map } = useMapbox();

  useEffect(() => {
    if (!map || !zoomLocation.length) return;

    const [lon, lat] = zoomLocation;
    map.flyTo({
      center: [lon, lat], // Replace with the desired latitude and longitude
      offset: zoomLevel ? [0, 0] : [-250, 0],
      zoom: zoomLevel ? zoomLevel : 2,
    });
  }, [map, zoomLevel, zoomLocation]);

  return null;
};
