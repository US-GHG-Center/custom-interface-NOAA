import os
import glob
import json
import pandas as pd
import geopandas as gpd
from shapely.geometry import Point

# Custom function to convert GeoDataFrame to GeoJSON
def gdf_to_geojson(gdf):
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

def check_if_excluded(site_name):
    excluded_sites = ["LAC", "INX", "BWD", "NEB", "NWB", "TMD", "SPF", "KLM", "MKO", "MLO", "HFM"]
    return  (site_name.lower() in excluded_sites) or (site_name.upper() in excluded_sites)

def process_csv_files():
    # Process all CSV files recursively
    script_dir = os.path.dirname(os.path.realpath(__file__))
    print("Total files to be converted to geojson: ", len(glob.glob(os.path.join(script_dir, "../data/processed/**/*.csv"), recursive=True)))
    for file in glob.glob(os.path.join(script_dir, "../data/processed/**/*.csv"), recursive=True):
        df = pd.read_csv(file)
        site_code = file.split("/")[-1].split(".")[0].split("_")[4]
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
    process_csv_files()

# Entry point
if __name__ == "__main__":
    main()
