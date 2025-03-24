import React, { useEffect, useState, useRef } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import { fetchAllFromFeaturesAPI } from '../../services/api';
import { ChartData } from '../../dataModel/chart';
import { DataFrequency, measurementLegend } from '../../constants';
import { 
  categorizeStations,
  getChartColor,
  getChartLegend,
  getYAxisLabel,
  getDataAccessURL,
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
import { ShowChart } from '@mui/icons-material';

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
  setZoomLevel,
  zoomLocation,
  setZoomLocation,
  loadingData,
  ghg,
  selectedFrequency,
  setSelectedFrequency,
  agency,
}) {
  // states for data
  const [displayChart, setDisplayChart] = useState(false);
  const [vizItems, setVizItems] = useState([]); // store all available visualization items
  const [selectedRegionId, setSelectedRegionId] = useState(''); // region_id of the selected region (marker)
  const prevSelectedRegionId = useRef(''); // to be able to restore to previously selected region.
  const [hoveredStationId, setHoveredStationId] = useState(''); // vizItem_id of the visualization item which was hovered over
  const [loadingChartData, setLoadingChartData] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [dataAccessURL, setDataAccessURL] = useState('');
  const [legendData, setLegendData] = useState([]);


  // handler functions
  const handleSelectedVizItem = (vizItemId) => {
    setSelectedStationId(vizItemId);
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
    if (!stationData) return;

    const categorizedData = categorizeStations(stationData, measurementLegend);
    setVizItems(categorizedData); // Store the object
  }, [stationData]);

  useEffect(() => {
    const fetchCollectionItemValue = async () => {
      if (!selectedStationId || !stationData) return;
  
      const selectedStation = stationData[selectedStationId];
      if (!selectedStation?.collection_items) return;
      
      setDisplayChart(true);
      setLoadingChartData(true);
      setChartData([]);
      
  
      // Create a deep copy of stationData to avoid mutation
      const updatedStationData = { ...stationData };
      const updatedStation = { ...updatedStationData[selectedStationId] };
      updatedStationData[selectedStationId] = updatedStation;
  
      const processedChartData = [];
  
      try {
        // Fetch missing datetime and values in parallel
        await Promise.all(
          selectedStation.collection_items.map(async (item, index) => {
            if (!item.datetime || !item.value) {
              try {
                const response = await fetchAllFromFeaturesAPI(
                  `https://dev.ghg.center/api/features/collections/${item.id}/items`
                );
  
                if (response.length > 0) {
                  item.datetime = response[0].properties.datetime;
                  item.value = response[0].properties.value;
                }
              } catch (error) {
                console.error(`Error fetching data for item ${item.id}:`, error);
                return;
              }
            }
  
            // Add to chart data if datetime and values exist
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
          })
        );
  
        // Update station data and chart data
        setStationData(updatedStationData);
        setChartData(processedChartData);

        console.log(updatedStationData[selectedStationId])
        // Set data access URL
        setDataAccessURL(getDataAccessURL(stationData[selectedStationId]));
      } catch (error) {
        console.error('Error in fetchCollectionItemValue:', error);
        setDisplayChart(false);
      } finally {
        setLoadingChartData(false);
      }
    };
  
    fetchCollectionItemValue();
  }, [selectedStationId]);

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
                    { loadingChartData && <LoadingSpinner />}
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
      {loadingData && <LoadingSpinner />}
    </Box>
  );
}
