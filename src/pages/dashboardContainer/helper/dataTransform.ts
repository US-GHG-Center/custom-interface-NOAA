import {
  Station,
  StationMeta,
  CollectionItem,
} from '../../../dataModel';

export interface StationMap {
  [key: string]: Station;
}

// Transform station features into Station objects
export function dataTransformationStation(stationData: any[]): Record<string, Station> {
  const stationMap: Record<string, Station> = {};

  if (!Array.isArray(stationData)) {
    console.error("Invalid API response format: Expected an array");
    return stationMap;
  }

  stationData.forEach((station: any) => {
    const siteCode = station.properties.site_code;

    if (!siteCode) {
      console.warn("Missing site_code in feature:", station);
      return;
    }

    if (!(siteCode in stationMap)) {
      stationMap[siteCode] = {
        id: siteCode,
        geometry: {
          type: station.geometry.type,
          coordinates: [[station.geometry.coordinates]],
        },
        meta: {
          ogc_fid: station.properties.ogc_fid,
          site_code: siteCode,
          site_country: station.properties.site_country,
          site_elevation: station.properties.site_elevation || "",
          site_elevation_unit: station.properties.site_elevation_unit || "",
          site_name: station.properties.site_name,
        },
        collection_items: [], // Will be filled later
      };
    }
  });

  return stationMap;
}

// Transform collections into CollectionItem objects and attach to respective stations
export function dataTransformCollection(
  collectionsData: any[],
  stations: Record<string, Station>,
  agency_filter: string,
  ghg_filter: string,
  time_period: string[]
): Record<string, Station> {
  if (!Array.isArray(collectionsData)) {
    console.error("Invalid API response format: Expected an array");
    return stations;
  }

  // Create a shallow copy of stations
  const updatedStations: Record<string, Station> = { ...stations };

  collectionsData.forEach((collection: any) => {
    if (!collection.id) {
      console.warn("Missing id in collection:", collection);
      return;
    }

    const parts = collection.id.split(".")[1].split("_");
    if (parts.length === 8) {
      const [
        agency,
        product,
        measurement_inst,
        methodology,
        sitecode,
        country,
        gas,
        time_period_value,
      ] = parts;

      const siteCodeUpper = sitecode.toUpperCase();
      const station = updatedStations[siteCodeUpper];

      if (
        station &&
        agency === agency_filter &&
        time_period.includes(time_period_value)
      ) {
        const existingItems = station.collection_items || [];

        // Filter and add only if gas matches filter
        const newCollectionItems = existingItems
          .filter((item) => item.gas === ghg_filter)
          .concat(
            gas === ghg_filter
              ? [
                {
                  id: collection.id,
                  gas,
                  gas_full_name: gas,
                  product,
                  measurement_inst,
                  methodology,
                  time_period: time_period_value,
                  link: collection.links?.[1],
                },
              ]
              : []
          );

        // Create new station object with updated collection_items
        updatedStations[siteCodeUpper] = {
          ...station,
          collection_items: newCollectionItems,
        };
      }
    }
  });

  return updatedStations;
}
