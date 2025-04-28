import os
import glob
import json
import pandas as pd
import geopandas as gpd
from shapely.geometry import Point


def process_csv_files():
    """
    Processes all CSV files under the `../data/processed/` directory to extract site metadata,
    filters out excluded sites, and generates a GeoJSON file containing metadata for all valid sites.

    The metadata extracted includes:
        - Site code, name, country
        - Site elevation and its unit
        - Latitude and longitude
        - Methodology, gas type, and instrument (for record keeping, although not saved in final GeoJSON)

    Excluded site codes are specified in `excluded_sites`. The resulting GeoJSON is saved as:
        ../data/geojson/noaa_glm_station_metadata.geojson
    """

    excluded_sites = ["LAC", "INX", "BWD", "NEB", "NWB", "TMD", "SPF", "KLM", "HFM"] # removed "MKO", "MLO" from this list
    # Process all CSV files recursively
    df = pd.DataFrame(columns=['site_code', 'site_name', 'site_country','site_elevation','site_elevation_unit','latitude','longitude'])
    script_dir = os.path.dirname(os.path.realpath(__file__))
    for file in glob.glob(os.path.join(script_dir, "../data/processed/**/*.csv"), recursive=True):
        tmp = pd.read_csv(file)
        gas = file.split("/")[-1].split("_")[6]
        methodology = file.split("/")[-1].split("_")[3]
        instr = file.split("/")[-1].split("_")[2]
        site_code = file.split("/")[-1].split("_")[4]
        site_name = tmp['site_name'].unique()[0]
        site_country = tmp['site_country'].unique()[0]
        site_elevation = tmp['site_elevation'].unique()[0]
        site_elevation_unit = tmp['site_elevation_unit'].unique()[0]
        lat = tmp['latitude'].unique()[0]
        lon = tmp['longitude'].unique()[0]

                # Append the new row as a DataFrame
        new_row = pd.DataFrame([{
            'site_code': site_code,
            'site_name': site_name,
            'site_country': site_country,
            'site_elevation': site_elevation,
            'site_elevation_unit': site_elevation_unit,
            'latitude': lat,
            'longitude': lon,
            'methodology': methodology,
            'gas': gas,
            'instrument': instr,
        }])

        # Concatenate with the existing DataFrame
        df = pd.concat([df, new_row], ignore_index=True)

    df = df.groupby('site_code').agg(site_name = ("site_name","first"),
                                    site_country=  ("site_country","first"),
                                    site_elevation= ("site_elevation","first"),
                                    site_elevation_unit= ("site_elevation_unit","first"),
                                    latitude= ("latitude","first"),
                                    longitude= ("longitude","first")).reset_index()
    df = df[~df['site_code'].isin(excluded_sites)]
    # Convert to GeoDataFrame
    gdf = gpd.GeoDataFrame(df, geometry=gpd.points_from_xy(df.longitude, df.latitude), crs="EPSG:4326")
    # Save as GeoJSON
    output_dir = "../data/geojson"
    os.makedirs(output_dir, exist_ok=True)
    gdf.to_file(f"{output_dir}/noaa_glm_station_metadata.geojson", driver="GeoJSON")

# Main function
def main():
    """
    Entry point for script execution. Triggers the processing of CSV files into GeoJSON.
    """
    process_csv_files()

# Entry point
if __name__ == "__main__":
    main()


