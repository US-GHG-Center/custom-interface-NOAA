import React, { useEffect, useState, useRef } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import { measurementLegend } from '../../constants';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMessage } from "@fortawesome/free-regular-svg-icons";

import { 
  categorizeStations,
  getChartColor,
  getChartLegend,
  getYAxisLabel,
  getDataAccessURL,
  getPopUpContent,
} from '../../utils/helpers';

import { FrequencyDropdown } from '../../components/dropdown';
import { Title } from '../../components/title';
import { Legend } from '../../components/legend';

import { nrtStations } from '../../nrt/station_meta';
import { handleSpecialCases } from '../../nrt/helper';
 
import {
  MainMap,
  MarkerFeature,
  LoadingSpinner,
  MapZoom,
  MainChart,
  ChartTools,
  ChartToolsLeft,
  ChartToolsRight,
  ChartInstruction,
  ChartTitle,
  DataAccessTool,
  ZoomResetTool,
  CloseButton,
  LineChart,
} from '@components';

import styled from 'styled-components';

import './index.css';

const TITLE = 'NOAA: ESRL Global Monitoring Laboratory';
const FEATURES_API_URL = process.env.REACT_APP_FEATURES_API_URL || '';

const HorizontalLayout = styled.div`
  width: 90%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin: 12px;
`;
export function Dashboard({
  stationData,
  setStationData,
  selectedStationId,
  setSelectedStationId,
  zoomLevel,
  zoomLocation,
  loadingData,
  setLoadingData,
  ghg,
  selectedFrequency,
  setSelectedFrequency,
  agency,
}) {
  // states for data
  const [displayChart, setDisplayChart] = useState(false);
  const [vizItems, setVizItems] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [dataAccessURL, setDataAccessURL] = useState('');
  const [legendData, setLegendData] = useState([]);

  const [isNrtStation, setIsNrtStation] = useState(false);
  const [nrtStationMeta, setNrtStationMeta] = useState(null);
  

  // handler functions
  const handleSelectedVizItem = (vizItemId) => {
    if (nrtStationCodes.includes(vizItemId) && ghg === 'co2') {
      setIsNrtStation(true);
    } else {
      setIsNrtStation(false);
    }
    setSelectedStationId(vizItemId);
  };
    
  const handleChartClose = () => {
    setDisplayChart(false);
    setSelectedStationId(null);
    setIsNrtStation(false);
  }

  // Handle special case of NRT dataset

  // fetch nrt/station_meta.js and add station_codes to nrtStationCodes
  const nrtStationCodes = [...new Set(nrtStations.map((station) => station.stationCode))];

  // update nrtStationMeta state if the station is NRT station
  useEffect(() => {
    if (!isNrtStation)  return;

    const selectedNrtStation = nrtStations.find(station => station.stationCode === selectedStationId);
    setNrtStationMeta(selectedNrtStation || null); // Override with the current station or null if not found

  }, [isNrtStation, selectedStationId]);


  // update legend based on the vizItems and selectedFrequency
  useEffect(() => {
    if (Array.isArray(vizItems)) {
      const newLegendData = vizItems
        .filter(item => selectedFrequency === 'all' || Object.keys(item)[0] === selectedFrequency)
        .map(item => {
          const category = Object.keys(item)[0];
          return {
            text: measurementLegend[category].shortText,
            color: item[category].color,
          };
        });
      setLegendData(newLegendData);
    }
  }, [vizItems, selectedFrequency]);


  // update the chart data whenever selected station, data frequency or vizItems changes
  useEffect(() => {
    if (!selectedStationId || !vizItems) return;
    setDisplayChart(false);
    setLoadingData(true);
    setChartData([]);
  
    let selectedCategory;
  
    // First, check if the station exists in 'continuous' category and then non_continuous category
    // This is because the Station is continous if it has both continous and non_continous values
    const continuousCategory = vizItems.find((item) => item['continuous']);
    if (continuousCategory && continuousCategory.continuous.stations[selectedStationId]) {
      selectedCategory = continuousCategory;
    }

    if (!selectedCategory) {
      selectedCategory = vizItems.find((item) => item['non_continuous']);
    }
      
    if (selectedCategory) {
      const categoryKey = Object.keys(selectedCategory)[0]; // Extract category name
      const selectedStation = selectedCategory[categoryKey].stations[selectedStationId];
      const processedChartData = [];
      if (selectedStation?.collection_items) {
        selectedStation.collection_items.forEach((item) => {
          if (item.datetime && item.value) {
            processedChartData.push({
              id: item.id,
              label: Array.isArray(item.datetime) ? item.datetime : [item.datetime],
              value: Array.isArray(item.value) ? item.value : [item.value],
              color: getChartColor(item) || '#1976d2',
              legend: getChartLegend(item),
              labelX: 'Observation Date/Time (UTC)',
              labelY: getYAxisLabel(item),
              // todo: rename it to connect points
              displayLine: item.time_period === 'monthly' || item.time_period === 'yearly',
            });
          }
        });
        setChartData(processedChartData);
      }
    }

    if (nrtStationMeta && (nrtStationMeta.stationCode === selectedStationId)) {
      handleSpecialCases(stationData, isNrtStation, nrtStationMeta, setChartData);
    }

    // Set data access URL
    setDataAccessURL(getDataAccessURL(stationData[selectedStationId]));

    setLoadingData(false);
  }, [selectedStationId, vizItems, selectedFrequency]);
  

  // set vizItems when stationData or data frequency changes
  useEffect(() => {
    if (!stationData) return;

    const categorizedData = categorizeStations(stationData, measurementLegend, selectedFrequency, ghg);
    setVizItems(categorizedData);
  }, [stationData, selectedFrequency]);


  // display chart when chartData is populated
  useEffect(() => {
    setDisplayChart(chartData.length > 0);
  }, [chartData]);

  
  return (
    <Box className='fullSize'>
      <PanelGroup direction='vertical' className='panel-wrapper'>
        <Panel
          id='map-panel'
          maxSize={100}
          defaultSize={100}
          minSize={25}
          className='panel'
          order={1}
        >
          <div id='dashboard-map-container'>
              <MainMap>
                <Paper className='title-wrapper' sx={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
                  <Title title={TITLE} ghg={ghg} frequency={selectedFrequency} />
                </Paper>
                <img src={process.env.PUBLIC_URL + "/noaa-logo.png"} alt="NOAA" className='logo'/>

                <MapZoom zoomLocation={zoomLocation} zoomLevel={zoomLevel} />
                {vizItems.map((item) => {
                  const [category, data] = Object.entries(item)[0];

                  // Conditionally render Marker based on selectedFrequency
                  if (selectedFrequency === "all" || selectedFrequency === category) {
                    return (
                      <MarkerFeature
                        key={category}
                        vizItems={Object.values(data.stations)}
                        onSelectVizItem={handleSelectedVizItem}
                        markerColor={data.color}
                        getPopupContent={getPopUpContent}
                      />
                    );
                  }

                  return null; // Ensure nothing is rendered if conditions don't match
                })}
                <FrequencyDropdown
                  selectedValue={selectedFrequency}
                  setSelectedValue={setSelectedFrequency}
                />
                <Legend legendData={legendData} />
              </MainMap>
          </div>
        </Panel>
        {displayChart && (
          <>
            <PanelResizeHandle className='resize-handle'>
              <DragHandleIcon title='Resize' />
            </PanelResizeHandle>

            <Panel
              id='chart-panel'
              maxSize={75}
              minSize={40}
              className='panel panel-timeline'
              order={2}
            >
              <MainChart>
                  {/* Instructions and Tools container */}
                  <ChartTools>
                    <ChartToolsLeft>
                      <ChartInstruction />
                    </ChartToolsLeft>
                    <ChartToolsRight>
                      { isNrtStation && nrtStationMeta && 
                        <DataAccessTool 
                          dataAccessLink={nrtStationMeta.source}
                          tooltip="Access NRT Dataset"
                        />
                      }
                      { dataAccessURL &&
                        <DataAccessTool 
                          dataAccessLink={dataAccessURL} 
                          tooltip="Access NOAA Dataset"
                        />
                      }
                      <ZoomResetTool />
                      <CloseButton handleClose={handleChartClose} />
                    </ChartToolsRight>
                  </ChartTools>


                  {/* Main chart container */}
                    <ChartTitle>{ 
                      selectedStationId? 
                      stationData[selectedStationId].meta?.site_name + ' (' + selectedStationId + ')'  : 
                      'Chart' }
                    </ChartTitle>
                    {chartData.length > 0 && chartData.map((data, index) => (
                        <LineChart
                          key={data.id}
                          data={data.value}
                          labels={data.label}
                          legend={data.legend}
                          labelX={data.labelX}
                          labelY={data.labelY}
                          index={index}
                          showLine={data.displayLine}
                          color={data.color}
                        />
                ))}
              </MainChart>
              
            </Panel>
            <div>
            {isNrtStation && nrtStationMeta &&
            <div className='nrt-station-note-container'>
              <FontAwesomeIcon icon={faMessage} /> <b>Note</b>
              <div className='nrt-station-note'>{nrtStationMeta.notice}</div>
            </div>
            }
            </div>
          </>
        )}
      </PanelGroup>
      {(loadingData) && <LoadingSpinner />}
    </Box>
  );
}
