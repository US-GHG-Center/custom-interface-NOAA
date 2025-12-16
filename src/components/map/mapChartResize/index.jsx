import { useEffect } from 'react';
import { useMapbox } from '../../../context/mapContext';

/**
 * ChartMapResize React component for handling Mapbox map resize events.
 *
 * This component listens for changes to the resizeMap prop and triggers
 * the Mapbox map resize method to ensure the map renders correctly after
 * container dimension changes.
 *
 * @param {boolean|number} resizeMap - Trigger value that causes the map to resize.
 *                                      When this value changes, the map.resize() method is called.
 *
 * @returns {null} This component renders nothing and only manages map resize side effects.
 */
export const ChartMapResize = ({ resizeMap }) => {
  const { map } = useMapbox();

  useEffect(() => {
    if (!map) return;
    if (resizeMap) map.resize();
  }, [map, resizeMap]);

  return null;
};
