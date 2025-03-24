import os
import glob
import json
import pandas as pd
import geopandas as gpd
from shapely.geometry import Point


def process_csv_files():
    excluded_sites = ["LAC", "INX", "BWD", "NEB", "NWB", "TMD", "SPF", "KLM", "MKO", "MLO", "HFM"]
    # Process all CSV files recursively
    df = pd.DataFrame(columns=['site_code', 'site_name', 'site_country','site_elevation','site_elevation_unit','latitude','longitude'])
    site_dict = {}
    script_dir = os.path.dirname(os.path.realpath(__file__))
    for file in glob.glob(os.path.join(script_dir, "../data/processed/**/*.csv"), recursive=True):
        tmp = pd.read_csv(file)
        gas = file.split("/")[-1].split("_")[6]
        methodology = file.split("/")[-1].split("_")[3]
        instr = file.split("/")[-1].split("_")[2]
        site_code = file.split("/")[-1].split("_")[4]
        if site_dict.get(site_code):
            print("duplicate: ", site_code)
        else:
            site_dict[site_code] = 1
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
    print(df)
    # Convert to GeoDataFrame
    gdf = gpd.GeoDataFrame(df, geometry=gpd.points_from_xy(df.longitude, df.latitude), crs="EPSG:4326")
    # Save as GeoJSON
    output_dir = "data/geojson"
    os.makedirs(output_dir, exist_ok=True)
    gdf.to_file(f"{output_dir}/noaa_glm_station_metadata.geojson", driver="GeoJSON")

# Main function
def main():
    process_csv_files()

# Entry point
if __name__ == "__main__":
    main()







