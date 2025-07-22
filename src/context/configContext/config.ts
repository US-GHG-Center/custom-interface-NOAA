import { NoaaInterfaceConfig } from '../../pages/noaaInterface/types';

/**
 * Default configuration for the NOAA Interface
 * These values will be used if no user configuration is provided
 */

const defaultConfig: NoaaInterfaceConfig = {
  mapboxToken: process.env.REACT_APP_MAPBOX_TOKEN || '',
  mapboxStyle: process.env.REACT_APP_MAPBOX_STYLE_URL || '',
  basemapStyle:
    process.env.REACT_APP_BASEMAP_STYLES_MAPBOX_ID ||
    'cldu1cb8f00ds01p6gi583w1m',
  featuresApiUrl: process.env.REACT_APP_FEATURES_API_URL || '',
};

/**
 * Merges user configuration with default configuration
 * @param {Partial<NoaaInterfaceConfig>} userConfig - User provided configuration
 * @returns {NoaaInterfaceConfig} Merged configuration
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
    'mapboxToken',
    'mapboxStyle',
    'basemapStyle',
    'featuresApiUrl',
  ];

  const missingFields = requiredFields.filter(
    (field) =>
      config[field] === undefined ||
      config[field] === null ||
      config[field] === ''
  );
  if (missingFields.length > 0) {
    return { result: false, missingFields };
  }
  return { result: true, missingFields: [] };
};
