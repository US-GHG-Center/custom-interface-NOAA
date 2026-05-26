import { fetchAllFromFeaturesAPI } from '../services/api';
import { greenhouseGases } from '../constants';

// handle special cases for NRT stations
export const handleSpecialCases = async (
  stationData,
  nrtStationMeta,
  setChartData,
  config
) => {
  if (!nrtStationMeta) return;

  const gasInfo = greenhouseGases[nrtStationMeta.ghg] || { short: nrtStationMeta.ghg.toUpperCase(), fullName: nrtStationMeta.ghg.toUpperCase(), unit: 'ppm' };

  const FEATURES_API_URL = config?.featuresApiUrl
    ? config.featuresApiUrl
    : process.env.REACT_APP_FEATURES_API_URL || '';

  // Handle related station data (e.g., MKO for MLO)
  if (nrtStationMeta.relatedStation) {
    const relatedConfig = nrtStationMeta.relatedStation;
    const relatedStation = stationData[relatedConfig.stationCode];

    if (relatedStation && relatedStation.collection_items) {
      // Find the correct collection item (daily in-situ data for the GHG)
      const collectionItem = relatedStation.collection_items.find(
        (entry) =>
          entry.id.includes(nrtStationMeta.ghg) &&
          entry.id.includes('daily') &&
          entry.id.includes('insitu')
      );

      if (collectionItem && collectionItem.link?.href) {
        await addRelatedStationData(
          collectionItem,
          relatedConfig,
          gasInfo,
          FEATURES_API_URL,
          setChartData
        );
      } else {
        console.warn(`No valid ${relatedConfig.stationCode} daily insitu ${nrtStationMeta.ghg.toUpperCase()} data found.`);
      }
    }
  }

  // Handle NRT data if source is available
  if (nrtStationMeta.source) {
    await addNRTData(nrtStationMeta, gasInfo, setChartData);
  }
};

// Helper function to add related station data (e.g., MKO for MLO)
async function addRelatedStationData(collectionItem, relatedConfig, gasInfo, featuresApiUrl, setChartData) {
  try {
    // Fetch data from the provided link using fetchAllFromFeaturesAPI
    const response = await fetchAllFromFeaturesAPI(
      `${featuresApiUrl}/collections/${collectionItem.id}/items`
    );

    if (response.length > 0) {
      const itemData = response[0].properties;
      const cutoffDate = new Date(relatedConfig.cutoffDate);

      const filtered = itemData.datetime.reduce(
        (acc, dateStr, index) => {
          const currentDate = new Date(dateStr);
          if (currentDate <= cutoffDate) {
            acc.datetime.push(dateStr);
            acc.value.push(itemData.value[index]);
          }
          return acc;
        },
        { datetime: [], value: [] }
      );

      collectionItem.datetime = filtered.datetime;
      collectionItem.value = filtered.value;
    }

    // Create a local dictionary (object) to be appended to chartData state
    if (collectionItem.datetime && collectionItem.value) {
      const chartDataItem = {
        id: relatedConfig.chartId,
        label: Array.isArray(collectionItem.datetime)
          ? collectionItem.datetime
          : [collectionItem.datetime],
        value: Array.isArray(collectionItem.value)
          ? collectionItem.value
          : [collectionItem.value],
        color: relatedConfig.chartColor,
        legend: `Observed ${gasInfo.short} Concentration (${relatedConfig.stationCode} daily In-situ)`,
        labelX: 'Observation Date/Time (UTC)',
        labelY: `${gasInfo.fullName} ${gasInfo.short} Concentration (${gasInfo.unit})`,
        displayLine: relatedConfig.displayLine,
      };

      // Update chartData state only if the ID doesn't already exist
      setChartData((prevData) => {
        const exists = prevData.some((item) => item.id === chartDataItem.id);
        return exists ? prevData : [...prevData, chartDataItem];
      });
    }
  } catch (error) {
    console.error(`Error fetching ${relatedConfig.stationCode} daily insitu data:`, error);
  }
}

// Helper function to add NRT data
async function addNRTData(nrtStationConfig, gasInfo, setChartData) {
  const url = nrtStationConfig.source;

  try {
    const response = await fetch(url);
    const text = await response.text();
    const lines = text
      .split('\n')
      .filter((line) => line.trim() && !line.startsWith('#'));

    const labels = [];
    const values = [];

    const cutoffDate = new Date(nrtStationConfig.cutoffDate);

    lines.forEach((line) => {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 5) {
        const dateStr = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
        const date = new Date(dateStr);

        if (date >= cutoffDate) {
          // Ignore dates before cutoffDate
          const value = parseFloat(parts[4]);
          labels.push(dateStr);
          values.push(value);
        }
      }
    });

    // Prepare chart data item
    const chartDataItem = {
      id: nrtStationConfig.chartId,
      label: labels,
      value: values,
      color: nrtStationConfig.chartColor,
      legend: nrtStationConfig.label,
      labelX: 'Observation Date/Time (UTC)',
      labelY: `${gasInfo.fullName} ${gasInfo.short} Concentration (${gasInfo.unit})`,
      displayLine: nrtStationConfig.displayLine,
    };

    // Update chartData state only if the ID doesn't already exist
    setChartData((prevData) => {
      const exists = prevData.some((item) => item.id === chartDataItem.id);
      return exists ? prevData : [...prevData, chartDataItem];
    });
  } catch (error) {
    console.error(`Error fetching NRT data from ${url}:`, error);
  }
};
