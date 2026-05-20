import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { useMapbox } from '../../../context/mapContext';
import './index.css';

/**
 * MarkerFeature React component for rendering a single interactive Mapbox marker.
 *
 * Displays a custom-styled marker on a Mapbox map. The marker represents a
 * data item with coordinates and shows a popup with info on hover.
 * By using this component for each marker, React's lifecycle manages the marker.
 *
 * @param {string} id - Unique ID for the marker.
 * @param {Object} coordinates - Coordinate object containing lat/lon.
 * @param {number} coordinates.lat - Latitude for the marker.
 * @param {number} coordinates.lon - Longitude for the marker.
 * @param {Object} station - information for the station
 * @param {Function} onSelectVizItem - Callback when a marker is clicked. Passes the marker ID.
 * @param {Function} getPopupContent - Callback that returns popup HTML string for a given item.
 * @param {string} markerColor - Color for the marker
 *
 * @returns {null} This component renders directly on the map using Mapbox API.
 */
export const MarkerFeature = ({
  id,
  coordinates,
  station,
  onSelectVizItem,
  getPopupContent,
  markerColor = '#00b7eb',
}) => {
  const { map } = useMapbox();
  const propsRef = useRef({ onSelectVizItem, getPopupContent, station, markerColor });
  propsRef.current = { onSelectVizItem, getPopupContent, station, markerColor };

  useEffect(() => {
    if (!map || !coordinates?.lat || !coordinates?.lon) return;

    const { lon, lat } = coordinates;

    // Create marker element
    const el = document.createElement('div');
    el.className = 'marker';
    el.innerHTML = getMarkerSVG(markerColor);

    // Create Mapbox marker
    const marker = new mapboxgl.Marker({
      element: el,
      anchor: 'center',
    }).setLngLat([lon, lat]);

    // Create popup if content provided
    let popup;
    if (propsRef.current.getPopupContent) {
      popup = new mapboxgl.Popup({
        offset: 5,
        closeButton: false,
        closeOnClick: false,
      }).setHTML(propsRef.current.getPopupContent(propsRef.current.station));
    }

    // Event handlers
    const handleMouseEnter = () => {
      if (popup) {
        marker.setPopup(popup).togglePopup();
      }
    };

    const handleMouseLeave = () => {
      if (popup) {
        popup.remove();
      }
    };

    const handleClick = (e) => {
      e.stopPropagation();
      propsRef.current.onSelectVizItem && propsRef.current.onSelectVizItem(id);
    };

    // Add event listeners
    el.addEventListener('mouseenter', handleMouseEnter);
    el.addEventListener('mouseleave', handleMouseLeave);
    el.addEventListener('click', handleClick);

    marker.addTo(map);

    return () => {
      marker.remove();
      popup?.remove();
      el.remove();
    };
  }, [map, coordinates?.lat, coordinates?.lon, markerColor, id]);

  return null;
};

/**
 * Returns an SVG string representing the visual icon for the marker.
 *
 * @param {string} color - Fill color for the marker.
 * @param {string} [strokeColor='#000000'] - Optional stroke color.
 * @returns {string} SVG string to be injected into the DOM.
 */
const getMarkerSVG = (color, strokeColor = '#000000') => {
  return `
    <svg fill="${color}" width="30px" height="30px" viewBox="-51.2 -51.2 614.40 614.40" xmlns="http://www.w3.org/2000/svg">
      <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
      <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="${strokeColor}" stroke-width="10.24">
        <path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z"></path>
      </g>
      <g id="SVGRepo_iconCarrier">
        <path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z"></path>
      </g>
    </svg>`;
};

export default MarkerFeature;
