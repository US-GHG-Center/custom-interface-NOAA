#If something fails with exit!=0 the script stops
set -e

parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P ) # path of this invoked script
temp_path="$parent_path/temp"

# create necessary dirs
if [ ! -d "$temp_path" ]; then
    # If not, create it
    mkdir -p "$temp_path"
fi

co2_flask_surface="$parent_path/data/raw/co2/flask/surface"
co2_pfp_surface="$parent_path/data/raw/co2/pfp/surface"
co2_insitu_surface="$parent_path/data/raw/co2/insitu/surface"
co2_insitu_tower="$parent_path/data/raw/co2/insitu/tower"

ch4_flask_surface="$parent_path/data/raw/ch4/flask/surface"
ch4_pfp_surface="$parent_path/data/raw/ch4/pfp/surface"
ch4_insitu_surface="$parent_path/data/raw/ch4/insitu/surface"
ch4_insitu_tower="$parent_path/data/raw/ch4/insitu/tower"

if [ ! -d "data" ]; then
    mkdir -p $co2_flask_surface
    mkdir -p $co2_pfp_surface
    mkdir -p $co2_insitu_surface
    mkdir -p $co2_insitu_tower
    mkdir -p $ch4_flask_surface
    mkdir -p $ch4_pfp_surface
    mkdir -p $ch4_insitu_surface
    mkdir -p $ch4_insitu_tower
fi

cd $temp_path

# Download files
wget https://gml.noaa.gov/aftp/data/greenhouse_gases/co2/flask/surface/co2_surface-flask_ccgg_text.zip
wget https://gml.noaa.gov/aftp/data/greenhouse_gases/ch4/flask/surface/ch4_surface-flask_ccgg_text.zip
wget https://gml.noaa.gov/aftp/data/greenhouse_gases/ch4/pfp/surface/ch4_surface-pfp_ccgg_text.zip
wget https://gml.noaa.gov/aftp/data/greenhouse_gases/co2/pfp/surface/co2_surface-pfp_ccgg_text.zip
wget https://gml.noaa.gov/aftp/data/greenhouse_gases/co2/in-situ/surface/co2_surface-insitu_ccgg_text.zip
wget https://gml.noaa.gov/aftp/data/greenhouse_gases/co2/in-situ/tower/co2_tower-insitu_ccgg_text.zip
wget https://gml.noaa.gov/aftp/data/greenhouse_gases/ch4/in-situ/surface/ch4_surface-insitu_ccgg_text.zip
wget https://gml.noaa.gov/aftp/data/greenhouse_gases/ch4/in-situ/tower/ch4_tower-insitu_ccgg_text.zip

# unzip to respective folders
unzip -j -o co2_surface-flask_ccgg_text.zip co2_surface-flask_ccgg_text/*_event.txt -d "$co2_flask_surface"
unzip -j -o ch4_surface-flask_ccgg_text.zip ch4_surface-flask_ccgg_text/*_event.txt -d "$ch4_flask_surface"
unzip -j -o co2_surface-pfp_ccgg_text.zip co2_surface-pfp_ccgg_text/*_event.txt -d "$co2_pfp_surface"
unzip -j -o ch4_surface-pfp_ccgg_text.zip ch4_surface-pfp_ccgg_text/*_event.txt -d "$ch4_pfp_surface"
unzip -j -o co2_surface-insitu_ccgg_text.zip co2_surface-insitu_ccgg_text/*.txt -d "$co2_insitu_surface"
unzip -j -o co2_tower-insitu_ccgg_text.zip co2_tower-insitu_ccgg_text/*.txt -d "$co2_insitu_tower"
unzip -j -o ch4_surface-insitu_ccgg_text.zip ch4_surface-insitu_ccgg_text/*.txt -d "$ch4_insitu_surface"
unzip -j -o ch4_tower-insitu_ccgg_text.zip ch4_tower-insitu_ccgg_text/*.txt -d "$ch4_insitu_tower"
