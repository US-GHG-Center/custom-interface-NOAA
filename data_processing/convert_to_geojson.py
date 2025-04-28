import os
import glob
import json
import pandas as pd
import geopandas as gpd
from shapely.geometry import Point

# Custom function to convert GeoDataFrame to GeoJSON
def gdf_to_geojson(gdf):
    """
    Converts a GeoDataFrame into a GeoJSON FeatureCollection.

    Parameters:
        gdf (geopandas.GeoDataFrame): A GeoDataFrame containing 'datetime', 'value', 'latitude', and 'longitude' fields.

    Returns:
        dict: A GeoJSON FeatureCollection with point geometries and associated properties.
    """

    features = []
    for _, row in gdf.iterrows():
        feature = {
            'type': 'Feature',
            'properties': {
                'datetime': row['datetime'],
                'value': row['value'],
                'latitude': row['latitude'],
                'longitude': row['longitude']
            },
            'geometry': {
                'type': 'Point',
                'coordinates': [row['longitude'], row['latitude']]
            }
        }
        features.append(feature)
    
    geojson = {
        'type': 'FeatureCollection',
        'name': 'exp',
        'features': features
    }
    return geojson

def handle_MKO_data_clip(df):
    """
    Clips the MKO site data between Nov 29, 2022 and July 4, 2023.

    Parameters:
        df (pandas.DataFrame): The input DataFrame with a 'datetime' column.

    Returns:
        pandas.DataFrame: The clipped DataFrame.
    """
    # Convert datetime column to actual datetime objects
    df['datetime'] = pd.to_datetime(df['datetime'])

    # Define start and end dates
    start_date = pd.to_datetime('2022-11-29')
    end_date = pd.to_datetime('2023-07-04')

    # Filter the dataframe
    clipped_df = df[(df['datetime'] >= start_date) & (df['datetime'] <= end_date)]

    return clipped_df


def check_if_excluded(site_name):
    """
    Checks if a given site code is in the list of excluded sites.

    Parameters:
        site_name (str): The site code to check.

    Returns:
        bool: True if the site is excluded, False otherwise.
    """

    excluded_sites = ["LAC", "INX", "BWD", "NEB", "NWB", "TMD", "SPF", "KLM", "HFM"] # removed "MKO", "MLO" from this list
    return  (site_name.lower() in excluded_sites) or (site_name.upper() in excluded_sites)

def process_csv_files():
    """
    Processes all CSV files in the '../data/processed/' directory, excluding certain site codes.
    
    For each included file:
      - Reads the CSV
      - Constructs a GeoDataFrame
      - Converts it to a GeoJSON format
      - Saves the GeoJSON to a mirrored path under '../data/geojson/'
    
    Prints progress and skips excluded sites.
    """

    # Process all CSV files recursively
    script_dir = os.path.dirname(os.path.realpath(__file__))
    print("Total files to be converted to geojson: ", len(glob.glob(os.path.join(script_dir, "../data/processed/**/*.csv"), recursive=True)))
    for file in glob.glob(os.path.join(script_dir, "../data/processed/**/*.csv"), recursive=True):
        df = pd.read_csv(file)
        site_code = file.split("/")[-1].split(".")[0].split("_")[4]

        # handle mko files 
        if site_code.lower()=='mko':
            df = handle_MKO_data_clip(df)

        if check_if_excluded(site_code):
            print(f"Excluding {file} from further processing")
        else:
            data = {
                'datetime': df['datetime'].tolist(),
                'value': df['value'].tolist(),
                'latitude': df["latitude"].iloc[0],
                'longitude': df["longitude"].iloc[0]
            }
            
            # Create a GeoDataFrame with a single row
            gdf = gpd.GeoDataFrame([data], geometry=[Point(data['longitude'], data['latitude'])])
            
            # Convert to GeoJSON
            geojson = gdf_to_geojson(gdf)
            
            # Modify filename
            filename = file.replace("/processed", "/geojson").replace(".csv", ".geojson")
            
            # Ensure the directory exists
            os.makedirs(os.path.dirname(filename), exist_ok=True)
            
            # Save to file
            with open(filename, 'w') as f:
                json.dump(geojson, f, indent=2)
            
            print(f"Saved: {filename}")

# Main function
def main():
    """
    Entry point for the script. Calls the CSV-to-GeoJSON processing function.
    """

    process_csv_files()

# Entry point
if __name__ == "__main__":
    main()
