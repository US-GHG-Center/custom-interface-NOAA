// Station Meta definition
export interface Station {
  id: string;
  geometry: Geometry;
  meta: StationMeta;
  collection_items?: CollectionItem[];
}

// Station Properties definition
export interface StationMeta {
  ogc_fid: number;
  site_code: string;
  site_country: string;
  site_elevation: string;
  site_elevation_unit: string;
  site_name: string;
}

// Collection Item definition
export interface CollectionItem {
  id: string;
  gas: string;
  gas_full_name: string;
  product: string;
  measurement_inst: string;
  methodology: string;
  time_period: string;
  link: Link;
  value?: number[];
  datetime?: DateTime[];
}

// Helpers
export type DateTime = string;
export type Lon = number;
export type Lat = number;
export type Coordinates = [Lon, Lat];

export interface Link {
  title?: string;
  href: string;
  rel?: string;
  type?: string;
}

export interface Geometry {
  type: string;
  coordinates: string[][][];
}
