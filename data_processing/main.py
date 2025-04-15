""" Module providing a function to processes data from various source directories and convert them to csv format. """
import os
import json
from viz_data_gen import extact_viz_json
from aggregate import daily_aggregate, monthly_aggregate
from utils import get_insitu_filename_wo_daily_data, get_insitu_filename_wo_monthly_data, get_file_names

def main():
    """
    Processes data from various source directories and converts them to  CSV.
    Raw insitu data is converted to processed data with specific directories for GHG (Green House Gases).

    This function performs the following tasks:
    1. Creates destination directories for processed data if they do not exist.
    2. Converts txt files in source directories to csv format and stores them in the corresponding destination directories.
    3. Fills up missing datasets by aggregating granular data (e.g., hourly data to daily or monthly data).

    Returns:
        None

    Raises:
        Any errors encountered during the data processing.

    Example:
        main()
    """
    insitu_src_dirs = ["../data/raw/co2/insitu/surface/", "../data/raw/co2/insitu/tower/",
                "../data/raw/ch4/insitu/surface/", "../data/raw/ch4/insitu/tower/"]
    insitu_dest_dirs = ["../data/processed/co2/insitu/surface/", "../data/processed/co2/insitu/tower/",
                "../data/processed/ch4/insitu/surface/", "../data/processed/ch4/insitu/tower/"]

    # dirs that only need general .txt to .csv conversion.
    data_src_dirs = ["../data/raw/co2/pfp/surface/", "../data/raw/co2/flask/surface/", "../data/raw/ch4/pfp/surface/", "../data/raw/ch4/flask/surface/"]
    data_dest_dirs = ["../data/processed/co2/pfp/surface/", "../data/processed/co2/flask/surface/", "../data/processed/ch4/pfp/surface/", "../data/processed/ch4/flask/surface/"]

    # absolute paths conversion
    dirname = os.path.dirname(__file__) # absolute path of this file (which will be executed)
    insitu_src_dirs = [os.path.join(dirname, relative_dir) for relative_dir in insitu_src_dirs]
    insitu_dest_dirs = [os.path.join(dirname, relative_dir) for relative_dir in insitu_dest_dirs]
    data_src_dirs = [os.path.join(dirname, relative_dir) for relative_dir in data_src_dirs]
    data_dest_dirs = [os.path.join(dirname, relative_dir) for relative_dir in data_dest_dirs]

    for dest_dir in insitu_dest_dirs+data_dest_dirs:
        if not os.path.exists(dest_dir):
            os.makedirs(dest_dir)

    # Convert the files in the src_dir and store them in the dest dir.
    txt_src_dirs = data_src_dirs+insitu_src_dirs
    csv_dest_dirs = data_dest_dirs+insitu_dest_dirs
    for idx, src_dir in enumerate(txt_src_dirs):
        files = get_file_names(src_dir)
        for filename in files:
            src_filepath = src_dir + filename
            dest_filepath = csv_dest_dirs[idx]
            extact_viz_json(src_filepath, dest_filepath, filename)

    print("Converted the .txt data to csv.")

    # Fill-up missing datasets #
    # From the src_dir, get the list of files with missing frequency data. Convert them and store them in the dest dir 
    
    for idx, dest_dir in enumerate(insitu_dest_dirs):
        insitu_files_wo_daily_data = get_insitu_filename_wo_daily_data(dest_dir)
        insitu_files_wo_monthly_data = get_insitu_filename_wo_monthly_data(dest_dir)
        print(f"insitu files wo daily data: {dest_dir}",len(insitu_files_wo_daily_data))
        print(f"insitu files wo monthly data: {dest_dir}",len(insitu_files_wo_daily_data))

        # generate for missing daily data
        # For each filenames, use their hourly counterpart and then convert it to daily
        for missed_file in insitu_files_wo_daily_data:
            #convert missed_file to the format of 
            src_filepath = dest_dir + missed_file
            daily_aggregate(src_filepath)

        # generate for missing monthly data
        # For each filenames, use their hourly counterpart and then convert it to monthly
        for missed_file in insitu_files_wo_monthly_data:
            src_filepath = dest_dir + missed_file
            monthly_aggregate(src_filepath)

    print("Missing values filled using aggregation of granular data. Converted to csv.")

    get_summary(txt_src_dirs, csv_dest_dirs)

    
def hourly_to_daily_converter(src_filepath, dest_filepath):
    """
    Converts data from hourly granularity to daily granularity and saves it as a csv file.

    Args:
        src_filepath (str): The file path to the source data with hourly granularity.
        dest_filepath (str): The file path to save the resulting data with daily granularity.

    Returns:
        None

    Raises:
        Any errors encountered during the conversion process.

    Example:
        hourly_to_daily_converter("hourly_data.csv", "daily_data.json")
    """
    print(f"Processing... {src_filepath}")
    json_list = daily_aggregate(src_filepath)
    with open(dest_filepath, "w", encoding="utf-8") as file:
        json.dump(json_list, file)
        print(f"Completed writing {dest_filepath}")

def hourly_to_monthly_converter(src_filepath, dest_filepath):
    """
    Converts data from hourly granularity to monthly granularity and saves it as a csv file.

    Args:
        src_filepath (str): The file path to the source data with hourly granularity.
        dest_filepath (str): The file path to save the resulting data with monthly granularity.

    Returns:
        None

    Raises:
        Any errors encountered during the conversion process.

    Example:
        hourly_to_monthly_converter("hourly_data.csv", "monthly_data.json")
    """
    print(f"Processing... {src_filepath}")
    json_list = monthly_aggregate(src_filepath)
    with open(dest_filepath, "w", encoding="utf-8") as file:
        json.dump(json_list, file)
        print(f"Completed writing {dest_filepath}")

def insitu_daily_filename(missed_file):
    """
    Generates a new filename for daily granularity data based on the given hourly filename.

    Args:
        missed_file (str): The original hourly filename from which to generate the daily filename.

    Returns:
        str: The new filename with daily granularity.

    Example:
        new_filename = insitu_daily_filename("example_hourly_data.txt")
    """
    splitted_file_name = missed_file.split("_")
    splitted_file_name[5] = "DailyData.json"
    return "_".join(splitted_file_name)

def insitu_monthly_filename(missed_file):
    """
    Generates a new filename for monthly granularity data based on the given hourly filename.

    Args:
        missed_file (str): The original hourly filename from which to generate the monthly filename.

    Returns:
        str: The new filename with monthly granularity.

    Example:
        new_filename = insitu_monthly_filename("example_hourly_data.txt")
    """
    splitted_file_name = missed_file.split("_")
    splitted_file_name[5] = "MonthlyData.json"
    return "_".join(splitted_file_name)

def json_filename(filename):
    """
    Generates a new filename with the ".json" extension based on the given .txt filename.

    Args:
        filename (str): The original filename to be converted.

    Returns:
        str: The new filename with the ".json" extension.

    Example:
        new_filename = json_filename("example.txt") # new_filename is "example.json".
    """
    splitted_filename = filename.split(".")
    splitted_filename[1] = "json"
    return ".".join(splitted_filename)

def get_summary(data_src_dirs, data_dest_dirs):
    """
    Generates a summary table of the files processed in he console.

    Args:
        data_src_dirs (list): list of the raw data dirs.
        data_dest_dirs (list): list of the processed data dirs.
    """

    print("SUMMARY: \n")

    for src, dest  in  zip(data_src_dirs, data_dest_dirs): 
        index1 = src.split("/raw/")[-1]
        number_of_files1 = len(get_file_names(src))

        index2 = dest.split("/processed/")[-1]
        number_of_files2 = len(get_file_names(dest))

        print(f"RAW: {index1}, Number of files: {number_of_files1}")
        print(f"PROCESSED: {index2}, Number of files: {number_of_files2}")

if __name__ == "__main__":
    main()