import { NoaaInterfaceConfig } from "../pages/noaaInterface/types";

/**
 * Default configuration for the EMIT Interface
 * These values will be used if no user configuration is provided
 */

const defaultConfig: NoaaInterfaceConfig = {
  stacApiUrl: "https://earth.gov/ghgcenter/api/stac",
  rasterApiUrl: "https://earth.gov/ghgcenter/api/raster",
  cloudBrowseUrl: "https://data.ghg.center/browseui",
  publicUrl: "/ghgcenter/custom-interfaces/goes-plume-viewer",
  mapboxToken:
    "pk.eyJ1IjoiY292aWQtbmFzYSIsImEiOiJjbGNxaWdqdXEwNjJnM3VuNDFjM243emlsIn0.NLbvgae00NUD5K64CD6ZyA",
  mapboxStyle: "mapbox://styles/covid-nasa",
  featuresApiUrl:"https://dev.ghg.center/api/features",
  basemapStyle:"cldu1cb8f00ds01p6gi583w1m",
  defaultZoomLocation: [-98.771556, 32.967243],
  defaultZoomLevel: 4,
  defaultCollectionId: "goes-ch4plume-v1",
};

/**
 * Merges user configuration with default configuration
 * @param {Partial<GoesInterfaceConfig>} userConfig - User provided configuration
 * @returns {GoesInterfaceConfig} Merged configuration
 */
export const getConfig = (
  userConfig: Partial<NoaaInterfaceConfig> = {}
): NoaaInterfaceConfig => {
  return {
    ...defaultConfig,
    ...userConfig,
  };
};

interface ValidationResult {
  result: boolean;
  missingFields: string[];
}

/**
 * Validates the configuration
 * @param {NoaaInterfaceConfig} config - Configuration to validate
 * @returns {NoaaInterfaceConfig} Validation result with missing fields if any
 */
export const validateConfig = (
  config: NoaaInterfaceConfig
): ValidationResult => {
  const requiredFields: (keyof NoaaInterfaceConfig)[] = [
    "stacApiUrl",
    "rasterApiUrl",
    "mapboxToken",
    "defaultCollectionId",
    "mapboxStyle",
    "basemapStyle",
    "featuresApiUrl"
  ];

  const missingFields = requiredFields.filter((field) => !config[field]);

  if (missingFields.length > 0) {
    return { result: false, missingFields };
  }
  return { result: true, missingFields: [] };
};
