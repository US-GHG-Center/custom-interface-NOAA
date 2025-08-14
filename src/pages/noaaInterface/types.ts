export interface NoaaInterfaceConfig {
  mapboxToken: string;
  mapboxStyle: string;
  basemapStyle: string;
  featuresApiUrl: string;
}

export interface NoaaInterface {
  config?: Partial<NoaaInterfaceConfig>;
  defaultZoomLocation: [number, number];
  defaultZoomLevel: number;
}
