import { Station, CollectionItem } from '../dataModel/station';
import { GreenhouseGas, InstrumentType, greenhouseGases, measurementInstruments, measurementLegend, timePeriodMapping } from '../constants';

import { ignoreStations } from '../constants';

interface CategorizedStation {
  color: string;
  stations: Array<Station & { categoryText: string }>;
}

type CategorizedStations = Record<string, Record<string, CategorizedStation>>;


function shouldIgnoreStation(stationKey: string, ghg: string): boolean {
  // Check if the station is in the ignore list and the GHG matches
  return ignoreStations.some(entry => entry.station === stationKey && entry.ghg === ghg);
}

export function categorizeStations(
  stationData: Record<string, Station>,
  legendsDictionary: Record<string, any>,
  dataFrequency: 'continuous' | 'non_continuous' | 'all',
  ghg: string
): Array<Record<string, { stations: Record<string, Station>, color: string }>> {
  if (!stationData) return [];

  const categorizedStations: Record<string, { stations: Record<string, Station>, color: string }> = {};

  Object.entries(stationData).forEach(([stationKey, station]) => {
    if (!station.collection_items || station.collection_items.length === 0) return;
    if (shouldIgnoreStation(stationKey, ghg)) return; // Skip the special station

    // Apply filter based on dataFrequency
    let filteredItems = station.collection_items;

    if (dataFrequency === 'continuous') {
      filteredItems = filteredItems.filter(item =>
        item.measurement_inst === "insitu" &&
        (item.methodology === "surface" || item.methodology === "tower")
      );
    } else if (dataFrequency === 'non_continuous') {
      filteredItems = filteredItems.filter(item =>
        !(item.measurement_inst === "insitu" &&
          (item.methodology === "surface" || item.methodology === "tower"))
      );
    }

    if (filteredItems.length === 0) return; // Skip stations with no valid collection items

    // Determine station frequency based on filtered data
    const isContinuous = filteredItems.some(item =>
      item.measurement_inst === "insitu" &&
      (item.methodology === "surface" || item.methodology === "tower")
    );

    const categoryKey = isContinuous ? "continuous" : "non_continuous";

    if (!categorizedStations[categoryKey]) {
      categorizedStations[categoryKey] = {
        stations: {},
        color: legendsDictionary[categoryKey]?.color || (categoryKey === "continuous" ? "#0000FF" : "#00FF00")
      };
    }

    // Store station with only the filtered collection items
    categorizedStations[categoryKey].stations[stationKey] = {
      ...station,
      collection_items: filteredItems
    };
  });

  return Object.entries(categorizedStations).map(([key, value]) => ({ [key]: value }));
}


export function getPopUpContent(station: Station): string {
  // Extract latitude and longitude from Geometry
  const [lon, lat] = station.geometry.coordinates[0][0]; // Assuming the first coordinate pair is representative

  // Extract unique measurement types
  const uniqueMeasurements = Array.from(
    new Set(station.collection_items?.map(item => `${item.methodology}-${item.measurement_inst}`))
  ).join("; ");

  return `
    <b>${station.id}: ${station.meta.site_name}</b><br>
    ${station.meta.site_country ? `<b>${station.meta.site_country}</b><br>` : ""}
    Latitude: ${lat}<br>
    Longitude: ${lon}<br>
    Elevation: ${station.meta.site_elevation} masl<br>
    Measurement Type: ${uniqueMeasurements}
  `;
}


export function getChartColor(collectionItem: CollectionItem): string {
  const colors = [
    'rgba(105, 47, 119, 1)',
    'rgba(198, 82, 64, 1)',
    'rgba(41, 148, 41, 1)',
    'rgba(27, 98, 220, 1)',
    'rgba(234, 128, 41, 0.9)',
    'rgba(35, 161, 161, 1)',
    'rgba(197, 98, 115, 1)',
    'rgba(129, 59, 129, 1)',
    'rgba(49, 120, 49, 1)',
    'rgba(44, 138, 167, 1)',
    'rgba(122, 122, 57, 1)',
    'rgba(191, 45, 12, 1)',
    'rgba(77, 34, 106, 1)',
    'rgba(61, 106, 61, 1)',
    'rgba(140, 47, 47, 1)',
  ];

  const colorMapping: Record<string, string> = {};
  const gases = ['co2', 'ch4'];
  const timePeriods = ['daily', 'hourly', 'weekly', 'monthly', 'yearly', 'event'];
  const instruments = ['insitu', 'pfp', 'flask'];

  let index = 0;
  for (const gas of gases) {
    for (const timePeriod of timePeriods) {
      for (const instrument of instruments) {
        const key = `${gas}-${timePeriod}-${instrument}`;
        colorMapping[key] = colors[index % colors.length];
        index++;
      }
    }
  }

  const uniqueKey = `${collectionItem.gas}-${collectionItem.time_period}-${collectionItem.measurement_inst}`;
  return colorMapping[uniqueKey] || 'rgba(0, 0, 0, 0.1)';
}


export function getChartLegend(collectionItem: CollectionItem): string {
  const gasKey = collectionItem.gas as GreenhouseGas;
  const gasInfo = greenhouseGases[gasKey] || { short: collectionItem.gas.toUpperCase() };

  const instrumentKey = collectionItem.measurement_inst.toLowerCase() as InstrumentType;
  const instrumentInfo = measurementInstruments[instrumentKey] || { fullName: collectionItem.measurement_inst };

  const timePeriod = collectionItem.time_period && collectionItem.time_period !== 'event'
    ? `${timePeriodMapping[collectionItem.time_period] || collectionItem.time_period} `
    : '';

  return `Observed ${gasInfo.short} Concentration (${timePeriod}${instrumentInfo.fullName})`;
}


export function getYAxisLabel(collectionItem: CollectionItem): string {
  const gasKey = collectionItem.gas as GreenhouseGas;

  if (Object.values(GreenhouseGas).includes(gasKey)) {
    const { fullName, unit, short } = greenhouseGases[gasKey];
    return `${fullName} (${short}) Concentration (${unit})`;
  }

  return `${collectionItem.gas.toUpperCase()} Concentration (ppm)`;
}


export function getDataAccessURL(station: Station): string {
  const siteName = encodeURIComponent(station.id);
  const gasKey = station.collection_items?.[0]?.gas as GreenhouseGas | undefined;

  let parameterName = gasKey && greenhouseGases[gasKey]
    ? encodeURIComponent(greenhouseGases[gasKey].fullName)
    : '';

  parameterName = parameterName.replace(/%20/g, '%2B');

  return `https://gml.noaa.gov/data/data.php?site=${siteName}&category=Greenhouse%2BGases&parameter_name=${parameterName}`;
}
