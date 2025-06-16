export interface NoaaInterfaceConfig {
  stacApiUrl: string;
  mapboxToken: string;
  mapboxStyle: string;
  publicUrl: string;
  basemapStyle: string;
  defaultZoomLocation: [number, number];
  defaultZoomLevel: number;
  featuresApiUrl: string;
}

export interface NoaaInterface {
  config?: Partial<NoaaInterfaceConfig>;
}
