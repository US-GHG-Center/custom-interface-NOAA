"""Module providing a function to aggregate hourly dataset into daily and monthly dataset."""

import sys
import json
import pandas as pd

def daily_aggregate(filepath):
    """
    Reads hourly data from a .txt file, aggregates it to daily, and returns a list of JSON objects that can be readily visualized in chart.

    Parameters:
        filepath (str): The path to the file containing the data to be aggregated.

    Returns:
        list: A list of dictionaries representing aggregated data, with each dictionary containing
              'date' and 'value' keys.

    Description:
        This function reads data from the specified file, aggregates it, and returns a list of JSON objects.
        The function performs the following steps:
        - Reads the content of the file.
        - Extracts the header lines from the file to determine the structure of the data.
        - Processes the data into a DataFrame.
        - Filters and aggregates the data.
        - Converts the aggregated data into a list of JSON objects, where each object contains 'date' and 'value' keys.

    Exceptions:
        - FileNotFoundError: If the specified file is not found.
        - Exception: If any other exception occurs during the processing, the exception message is returned.

    Note:
        - The input file is expected to have a .txt format with header lines indicating the structure of the data.
        - The function aggregates data from hourly to daily intervals.
        - The returned JSON list is suitable for use in frontend applications to visualize the aggregated data.

    Example:
        aggregated_data = daily_aggregate("/path/to/data_file.txt")
    """
    try:
        try:
            dataframe = pd.read_csv(filepath)
        except Exception as e:
            print("error reading hourly file for daily agg: ", e)
        dataframe['tmp'] = pd.to_datetime(dataframe['datetime'])
        dataframe["day"] = dataframe["tmp"].dt.date
        aggregated_df = dataframe.groupby('day').agg(value = ("value", "mean"),
                                                        latitude=("latitude", "first"),
                                                        longitude=("longitude", "first"),
                                                        site_country=("site_country", "first"),
                                                        site_name=("site_name","first"),
                                                        site_elevation=("site_elevation","first"),
                                                        site_elevation_unit=("site_elevation_unit","first")).reset_index()
        aggregated_df['datetime'] = pd.to_datetime(aggregated_df['day']).dt.strftime('%Y-%m-%dT%H:%M:%SZ')
        aggregated_df = aggregated_df.drop(columns=['day'])
        filename = filepath.replace("hourly", "daily")
        print(f"Aggregating and writing daily file : {filename} ")

        try:
            aggregated_df.to_csv(filename, index=False)
        except Exception as e:
            print("Error while saving in daily aggregation:", e)

    except FileNotFoundError:
        return "File not found"
    except Exception as e:
        return f"Exception occured {e}"


def monthly_aggregate(filepath):
    """
    Reads hourly data from a .txt file, aggregates it to monthly, and returns a list of JSON objects that can be readily visualized in chart.

    Parameters:
        filepath (str): The path to the file containing the data to be aggregated.

    Returns:
        list: A list of dictionaries representing aggregated data, with each dictionary containing
              'date' and 'value' keys.

    Description:
        This function reads data from the specified file, aggregates it, and returns a list of JSON objects.
        The function performs the following steps:
        - Reads the content of the file.
        - Extracts the header lines from the file to determine the structure of the data.
        - Processes the data into a DataFrame.
        - Filters and aggregates the data.
        - Converts the aggregated data into a list of JSON objects, where each object contains 'date' and 'value' keys.

    Exceptions:
        - FileNotFoundError: If the specified file is not found.
        - Exception: If any other exception occurs during the processing, the exception message is returned.

    Note:
        - The input file is expected to have a .txt format with header lines indicating the structure of the data.
        - The function aggregates data from hourly to daily intervals.
        - The returned JSON list is suitable for use in frontend applications to visualize the aggregated data.

    Example:
        aggregated_data = monthly_aggregate("/path/to/data_file.txt")
    """
    try:
        try:
            dataframe = pd.read_csv(filepath)
        except Exception as e:
            print("error reading hourly file for monthly agg: ", e)
        dataframe['datetime'] = pd.to_datetime(dataframe['datetime'])
        dataframe['year'] = dataframe['datetime'].dt.year
        dataframe['month'] = dataframe['datetime'].dt.month
        aggregated_df = dataframe.groupby(['year', 'month']).agg(value = ("value", "mean"),
                                                                datetime = ("datetime", "mean"),
                                                                latitude=("latitude", "first"),
                                                                longitude=("longitude", "first"),
                                                                site_country=("site_country", "first"),
                                                                site_name=("site_name","first"),
                                                                site_elevation=("site_elevation","first"),
                                                                site_elevation_unit=("site_elevation_unit","first")).reset_index()
        aggregated_df = aggregated_df[['datetime', 'value', 'latitude', 'longitude','site_country','site_name','site_elevation','site_elevation_unit']]
        aggregated_df['datetime'] = pd.to_datetime(aggregated_df['datetime'])
        aggregated_df.sort_values(by='datetime')
        aggregated_df['datetime'] = aggregated_df['datetime'].dt.strftime('%Y-%m-%dT%H:%M:%SZ')
        filename = filepath.replace("hourly", "monthly")
        print(f"Aggregating and writing monthly file : {filename} ")

        try:
            aggregated_df.to_csv(filename, index=False)
        except Exception as e:
            print("Error while saving in monthly aggregation:", e)

    except FileNotFoundError:
        return "File not found"
    except Exception as e:
        return f"Exception occured {e}"


if __name__ == "__main__":
    # Check if filepath argument is provided
    if len(sys.argv) != 2:
        print("Usage: python aggregrate.py <daily|monthly> <filepath>")
        sys.exit(1)

    # Get the filepath from command line argument
    frequency = sys.argv[1]
    hourly_data_filepath = sys.argv[2]

    # Call the aggregate function with the provided filepath
    if (frequency == "daily"):
        result = daily_aggregate(hourly_data_filepath)
    elif (frequency == "monthly"):
        result = monthly_aggregate(hourly_data_filepath)
    else:
        print("Usage: python aggregrate.py <daily|monthly> <filepath>")
        sys.exit(1)

    if result is not None:
        print(result)
        # save the json file for reference
        out_path = f"{hourly_data_filepath.split('/')[-1]}.json"
        with open(out_path, "w", encoding="utf-8") as file:
            json.dump(result, file)
