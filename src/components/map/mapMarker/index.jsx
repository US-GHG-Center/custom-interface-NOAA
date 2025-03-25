import { useState, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

import { useMapbox } from '../../../context/mapContext';
import './index.css';
import { zoom } from 'chartjs-plugin-zoom';
/*
  Add marker on map
  @param {STACItem} vizItems   - An array of stac items which are to be rendered as markers
  @param {function} onSelectVizItem  - function to execute when the marker is clicked . will provide vizItemId as a parameter to the callback
*/

// eslint-disable-next-line prettier/prettier
export const MarkerFeature = ({ 
  vizItems, 
  onSelectVizItem,
  getPopupContent,
  zoomThreshold=0,
  markerColor='#00b7eb' }) => {
    const { map } = useMapbox();
    const [markersVisible, setMarkersVisible] = useState(true);
    const [activePopup, setActivePopup] = useState(null);
  
    useEffect(() => {
      if (!map || !vizItems.length) return;
  
      const getPopup = (vizItem) => {
        const popup = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false,
        }).setHTML(getPopupContent(vizItem));
        return popup;
      };
  
      const plottedMarkers = vizItems.map((item) => {
        const location = item.geometry.coordinates[0][0];
        const [lon, lat] = location;
        const marker = addMarker(map, lon, lat, markerColor);
        const handleClick = () => onSelectVizItem && onSelectVizItem(item.id);
        let popup = null;
  
        const handleMouseEnter = () => {
          if (getPopupContent) {
            if (!popup) {
              popup = getPopup(item);
            }
            marker.setPopup(popup);
            popup.addTo(map);
            setActivePopup(popup);
          }
        };
  
        const handleMouseLeave = () => {
          if (popup && getPopupContent) {
            popup.remove();
            setActivePopup(null);
          }
        };
        const mel = marker.getElement();
        mel.addEventListener('click', handleClick);
        mel.addEventListener('mouseenter', handleMouseEnter);
        mel.addEventListener('mouseleave', handleMouseLeave);
  
        mel.style.display = markersVisible ? 'block' : 'none';
        return { mel, handleClick, handleMouseLeave, handleMouseEnter, popup };
      });
  
      // clean-upss
      return () => {
        plottedMarkers.forEach(
          ({ mel, handleClick, handleMouseLeave, handleMouseEnter, popup }) => {
            mel.removeEventListener('click', handleClick);
            mel.removeEventListener('mouseenter', handleMouseEnter);
            mel.removeEventListener('mouseleave', handleMouseLeave);
            mel.parentNode.removeChild(mel);
            if (popup) popup.remove();
          }
        );
        if (activePopup) activePopup.remove();
      };
    }, [vizItems, map, onSelectVizItem, markersVisible]);
  
    useEffect(() => {
      if (!map || !zoomThreshold) return;
      const updateMarkersVisibility = () =>
        setMarkersVisible(map.getZoom() <= zoomThreshold);
  
      map.on('zoom', updateMarkersVisibility);
      return () => map.off('zoom', updateMarkersVisibility);
    }, [map]);
  
    return null;
  };

const addMarker = (map, longitude, latitude, color) => {
  const el = document.createElement('div');
  el.className = 'marker';
  const markerColor = color || '#00b7eb';
  el.innerHTML = getMarkerSVG(markerColor);
  let marker = new mapboxgl.Marker(el)
    .setLngLat([longitude, latitude])
    .addTo(map);
  return marker;
};

const getMarkerSVG = (color, strokeColor = '#000000') => {
  return `
        <svg fill="${color}" width="30px" height="30px" viewBox="-51.2 -51.2 614.40 614.40" xmlns="http://www.w3.org/2000/svg">
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="${strokeColor}"
                stroke-width="30.24">
                <path
                    d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z"></path>
            </g>
            <g id="SVGRepo_iconCarrier">
                <path
                    d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z"></path>
            </g>
        </svg>`;
};
