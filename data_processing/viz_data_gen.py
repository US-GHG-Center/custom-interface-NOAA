""" Module providing a function to generate a chart-visualization-ready dataset """

import sys
import json
import pandas as pd
import geopandas as gpd
from shapely.geometry import Point


time_mapping = {
    "hour": "hourly",
    "day": "daily",
    "daily": "daily",
    "month": "monthly",
    "year": "yearly",
    "event": "event",
}

def extact_viz_json(filepath, dest_filepath, f):
    """
    Reads data from a .txt file, extracts necessary data for visualization, and write it into csv file.

    Parameters:
        filepath (str): The path to the file containing the data to be converted.

    Description:
        This function reads data from a .txt file, and returns a list of JSON objects.
        The function performs the following steps:
        - Reads the content of the file.
        - Extracts the header lines from the file to determine the structure of the data.
        - Processes the data into a DataFrame.
        - Converts the aggregated data into a dataframe.

    Exceptions:
        - FileNotFoundError: If the specified file is not found.
        - Exception: If any other exception occurs during the processing, the exception message is returned.

    Example:
        extrated_json = extact_viz_json("/path/to/data_file.txt")
    """
    try:
        with open(filepath, "r", encoding="utf-8") as file:
            file_content_str = file.read()
            # split the string text based on new line
            file_content_list = file_content_str.split("\n")
            # get the header lines. its mentioned in the file's first line.
            header_lines = file_content_list[0].split(":")[-1]
            header_lines = int(header_lines)
            # Slice the non header part of the data. and the last empty element
            str_datas = file_content_list[header_lines - 1: -1]
            data = [data.replace("\n", "").split(" ") for data in str_datas]
            # seperate table body and head to form dataframe
            table_head = data[0]
            table_body = data[1:]
            dataframe = pd.DataFrame(table_body, columns=table_head)
            dataframe['value'] = dataframe['value'].astype(float)

            dataframe['datetime'] = pd.to_datetime(dataframe['datetime'])
            dataframe = dataframe.sort_values(by='datetime')
            dataframe['datetime'] = dataframe['datetime'].dt.strftime('%Y-%m-%dT%H:%M:%SZ')

            # Helper function to extract metadata safely
            def get_metadata_value(key, default="None"):
                try:
                    return [line.split(":")[-1].strip() for line in file_content_list[:header_lines] if key in line][0]
                except IndexError:
                    return default

            # Filter data
            mask = (dataframe["qcflag"] == "...") & (dataframe["value"] != 0) & (dataframe["value"] != -999)
            filtered_df = dataframe[mask].reset_index(drop=True)

            # Extract metadata with fallback to "None"
            site_country = get_metadata_value(" site_country ")
            country = site_country.replace(' ', '') if site_country != "N/A" else "None"
            site_name = get_metadata_value(" site_name ")
            site_elevation = get_metadata_value(" site_elevation ")
            site_elevation_unit = get_metadata_value(" site_elevation_unit ")

            # site_country = [line for line in file_content_list[:header_lines] if " site_country " in line][0].split(':')[-1].strip()
            # country = site_country.replace(' ','')
            # site_name = [line for line in file_content_list[:header_lines] if " site_name " in line][0].split(':')[-1].strip()
            # site_elevation = [line for line in file_content_list[:header_lines] if " site_elevation " in line][0].split(':')[-1].strip()
            # site_elevation_unit = [line for line in file_content_list[:header_lines] if " site_elevation_unit " in line][0].split(':')[-1].strip()
            # if country == 'N/A':
            #     country = 'None' 

            measuring_instr = filepath.split('/')[-3]
            methodology = filepath.split('/')[-2]
            gas = filepath.split('/')[-4]
            station = filtered_df.site_code.values[0]
            time = filepath.split('/')[-1].split('.')[0].split('_')[-1].lower()
            time = next((value for key, value in time_mapping.items() if key in time), time)


            filename = f"noaa_glm_{measuring_instr}_{methodology}_{station}_{country}_{gas}_{time}.csv"

            # filtered_df['site_country'] = site_country
            # filtered_df['site_name'] = site_name
            # filtered_df['site_elevation'] = site_elevation
            # filtered_df['site_elevation_unit'] = site_elevation_unit
            # filtered_df['station'] = station

            try:
                filtered_df[['datetime', 'value', 'latitude', 'longitude']].to_csv(dest_filepath+filename )
            except Exception as e:
                print("Error while saving:", e)

    except FileNotFoundError:
        return "File not found"
    except Exception as e:
        return f"Exception occured {e}"

if __name__ == "__main__":
    # Check if filepath argument is provided
    if len(sys.argv) != 2:
        print("Usage: python aggregrate.py <filepath>")
        sys.exit(1)

    # Get the filepath from command line argument
    data_filepath = sys.argv[1]

    # Call the aggregate function with the provided filepath
    result = extact_viz_json(data_filepath)
    if result is not None:
        print(result)
        # save the json file for reference
        out_path = f"{data_filepath.split('/')[-1]}.json"
        with open(out_path, "w", encoding="utf-8") as file:
            json.dump(result, file)
