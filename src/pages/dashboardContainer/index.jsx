import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import { Dashboard } from '../dashboard/index.jsx';
import { fetchAllFromFeaturesAPI } from '../../services/api.js';
import {
  dataTransformationStation,
  dataTransformCollection,
} from './helper/dataTransform.ts';
import { useConfig } from '../../context/configContext/index.jsx';

export function DashboardContainer({ defaultZoomLocation, defaultZoomLevel }) {
  // Memoize the config to prevent unnecessary re-renders
  const { config } = useConfig();
  const [selectedStationId, setSelectedStationId] = useState('');
  const [stations, setStations] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingChartData, setLoadingChartData] = useState(false);

  const FEATURES_API_URL = config?.featuresApiUrl;

  const stationUrl = `${FEATURES_API_URL}/collections/public.noaa_glm_station_metadata/items`;
  const collectionUrl = `${FEATURES_API_URL}/collections`;

  // get the query params
  const [searchParams, setSearchParams] = useSearchParams();
  const [agency] = useState(searchParams.get('agency') || 'noaa'); // nist, noaa, or nasa
  const [ghg, setSelectedGHG] = useState(searchParams.get('ghg') || 'co2'); // co2 or ch4
  const [stationCode] = useState(searchParams.get('station-code') || ''); // buc, smt, etc
  const [zoomLevel, setZoomLevel] = useState(
    searchParams.get('zoom-level' || defaultZoomLevel)
  ); // let default zoom level controlled by map component
  const [zoomLocation, setZoomLocation] = useState(
    searchParams.get('zoom-location' || defaultZoomLocation) || []
  ); // let default zoom location be controlled by map component
  const [selectedFrequency, setSelectedFrequency] = useState(
    searchParams.get('frequency') || 'all'
  ); // continuous or non-continuous
  const time_period = ['event', 'all', 'monthly', 'weekly', 'daily'];

  // fetch station date from Features API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch and transform station metadata
        const stationApiResponse = await fetchAllFromFeaturesAPI(stationUrl);
        const transformedStationData =
          dataTransformationStation(stationApiResponse);

        // Fetch and transform collection data without mutating previous object
        const collectionApiResponse = await fetchAllFromFeaturesAPI(
          collectionUrl
        );
        const updatedStationData = dataTransformCollection(
          collectionApiResponse,
          transformedStationData,
          agency,
          ghg,
          time_period
        );

        // Set the final transformed station data
        setStations(updatedStationData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch datetime and value associated with collection item whenever a station is selected
  // This is done for all collection items of selected station
  useEffect(() => {
    const fetchCollectionItemValue = async () => {
      if (!selectedStationId || !stations) return;

      const selectedStation = stations[selectedStationId];
      if (!selectedStation?.collection_items) return;

      // Create a deep copy of stations and selected station
      const updatedStations = { ...stations };

      try {
        setLoadingChartData(true);
        const updatedCollectionItems = await Promise.all(
          selectedStation.collection_items.map(async (item) => {
            if (item.datetime && item.value) return item;

            try {
              const response = await fetchAllFromFeaturesAPI(
                `${FEATURES_API_URL}/collections/${item.id}/items`
              );

              if (response.length > 0) {
                const { datetime, value } = response[0].properties;
                return { ...item, datetime, value };
              }
            } catch (error) {
              console.error(`Error fetching data for item ${item.id}:`, error);
            }

            return item; // fallback to original item
          })
        );

        updatedStations[selectedStationId] = {
          ...selectedStation,
          collection_items: updatedCollectionItems,
        };

        setStations(updatedStations);
      } catch (error) {
        console.error('Error in fetchCollectionItemValue:', error);
      } finally {
        setLoadingChartData(false);
      }
    };

    fetchCollectionItemValue();
  }, [selectedStationId]);

  // Update the search params whenever a state value changes
  useEffect(() => {
    const newParams = new URLSearchParams();

    // Set new search params based on current state
    if (agency) newParams.set('agency', agency);
    if (ghg) newParams.set('ghg', ghg);
    if (stationCode) newParams.set('station-code', stationCode);
    if (selectedFrequency) newParams.set('frequency', selectedFrequency);

    // Update the URL without reloading the page
    setSearchParams(newParams);
  }, [
    agency,
    ghg,
    stationCode,
    zoomLevel,
    zoomLocation,
    selectedFrequency,
    setSearchParams,
  ]);

  return (
    <Dashboard
      stationData={stations}
      setStationData={setStations}
      selectedStationId={selectedStationId}
      setSelectedStationId={setSelectedStationId}
      ghg={ghg}
      zoomLevel={zoomLevel}
      zoomLocation={zoomLocation}
      loadingData={loading}
      loadingChartData={loadingChartData}
      setLoadingData={setLoading}
      selectedFrequency={selectedFrequency}
      setSelectedFrequency={setSelectedFrequency}
      agency={agency}
    />
  );
}
