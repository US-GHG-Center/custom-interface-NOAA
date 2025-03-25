import React, { useEffect, useState, useRef } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import { measurementLegend } from '../../constants';

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
  const [vizItems, setVizItems] = useState([]); // store all available visualization items
  const [chartData, setChartData] = useState([]);
  const [dataAccessURL, setDataAccessURL] = useState('');
  const [legendData, setLegendData] = useState([]);


  // handler functions
  const handleSelectedVizItem = (vizItemId) => {
    if (vizItemId === selectedStationId) {
      setDisplayChart(true);
    } else {
      setSelectedStationId(vizItemId);
    }
  };
    

  const handleChartClose = () => {
    setDisplayChart(false);   
  }

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


  useEffect(() => {
    if (!selectedStationId || !vizItems) return;
    setDisplayChart(false);
    setLoadingData(true);
    setChartData([]);
  
    let selectedCategory;
  
    // First, check if the station exists in 'continuous' category
    const continuousCategory = vizItems.find((item) => item['continuous']);
    if (continuousCategory && continuousCategory.continuous.stations[selectedStationId]) {
      selectedCategory = continuousCategory;
    }

    // If not found in 'continuous', fallback to selectedFrequency category
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
              displayLine: item.time_period === 'monthly' || item.time_period === 'yearly',
            });
          }
        });
        setChartData(processedChartData);
      }
    }

    // Set data access URL
    setDataAccessURL(getDataAccessURL(stationData[selectedStationId]));

    setLoadingData(false);
  }, [selectedStationId, vizItems, selectedFrequency]);
  

  useEffect(() => {
    if (!stationData) return;

    const categorizedData = categorizeStations(stationData, measurementLegend, selectedFrequency);
    setVizItems(categorizedData);
  }, [stationData, selectedFrequency]);

  
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

                  // Conditionally render Marke based on selectedFrequency
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
                      <DataAccessTool dataAccessLink={dataAccessURL} />
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
                      (
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
                        />)
                ))}
              </MainChart>
            </Panel>
          </>
        )}
      </PanelGroup>
      {(loadingData) && <LoadingSpinner />}
    </Box>
  );
}
