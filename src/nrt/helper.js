import { fetchAllFromFeaturesAPI } from '../services/api';


const FEATURES_API_URL = process.env.REACT_APP_FEATURES_API_URL || '';


// handle special cases
export const handleSpecialCases = async (stationData, isNrtStation, nrtStationMeta, setChartData) => {
    if (!isNrtStation && !nrtStationMeta) return;

    // Merge MKO station data with MLO station

    // Get MKO station data
    const mkoStation = stationData['MKO'];

    if (!mkoStation || !mkoStation.collection_items) return;

    // Find the correct item (where id contains "co2", "daily", and "insitu")
    const mkoCollectionItem = mkoStation.collection_items.find(
        (entry) => entry.id.includes("co2") && entry.id.includes("daily") && entry.id.includes("insitu")
    );

    if (!mkoCollectionItem || !mkoCollectionItem.link?.href) {
        console.warn("No valid MKO daily insitu CO2 data found.");
        return;
    }

    try {
        // Fetch data from the provided link using fetchAllFromFeaturesAPI
        const response = await fetchAllFromFeaturesAPI(
            `${FEATURES_API_URL}/collections/${mkoCollectionItem.id}/items`
        );

        if (response.length > 0) {
            const itemData = response[0].properties;
            const cutoffDate = new Date('2023-07-04T00:00:00Z');
    
            const filtered = itemData.datetime.reduce(
                (acc, dateStr, index) => {
                    const currentDate = new Date(dateStr);
                    if (currentDate <= cutoffDate) {
                        acc.datetime.push(dateStr);
                        acc.value.push(itemData.value[index]);
                    }
                    return acc;
                },
                { datetime: [], value: [] }
            );
    
            mkoCollectionItem.datetime = filtered.datetime;
            mkoCollectionItem.value = filtered.value;
        }

        // Create a local dictionary (object) to be appended to chartData state
        if (mkoCollectionItem.datetime && mkoCollectionItem.value) {
            const chartDataItem = {
                id: 990,
                label: Array.isArray(mkoCollectionItem.datetime) ? mkoCollectionItem.datetime : [mkoCollectionItem.datetime],
                value: Array.isArray(mkoCollectionItem.value) ? mkoCollectionItem.value : [mkoCollectionItem.value],
                color: 'rgba(255, 127, 80, 1)',
                legend: 'Observed CO₂ Concentration (MKO daily In-situ)',
                labelX: 'Observation Date/Time (UTC)',
                labelY: 'Carbon Dioxide CO₂ Concentration (ppm)',
                displayLine: true,
            };

            // Update chartData state only if the ID doesn't already exist
            setChartData(prevData => {
                const exists = prevData.some(item => item.id === chartDataItem.id);
                return exists ? prevData : [...prevData, chartDataItem];
            });
        }
    } catch (error) {
        console.error("Error fetching MKO CO2 daily insitu data:", error);
    }


    // Add NRT data to MLO station

    const url = "https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_daily_mlo.txt";

    try {
        const response = await fetch(url);
        const text = await response.text();
        const lines = text.split("\n").filter(line => line.trim() && !line.startsWith("#"));

        const labels = [];
        const values = [];

        const cutoffDate = new Date("2023-04-30T00:00:00Z");

        lines.forEach(line => {
            const parts = line.trim().split(/\s+/);
            if (parts.length >= 5) {
                const dateStr = `${parts[0]}-${parts[1].padStart(2, "0")}-${parts[2].padStart(2, "0")}`;
                const date = new Date(dateStr);

                if (date >= cutoffDate) { // Ignore dates before cutoffDate
                    const value = parseFloat(parts[4]);
                    labels.push(dateStr);
                    values.push(value);
                }
            }
        });

        // Prepare chart data item
        const chartDataItem = {
            id: 991,
            label: labels,
            value: values,
            color: 'rgba(0, 0, 255, 1)',
            legend: 'Observed CO₂ Concentration (Daily NRT)',
            labelX: 'Observation Date/Time (UTC)',
            labelY: 'Carbon Dioxide CO₂ Concentration (ppm)',
            displayLine: false,
        };

        // Update chartData state only if the ID doesn't already exist
        setChartData(prevData => {
            const exists = prevData.some(item => item.id === chartDataItem.id);
            return exists ? prevData : [...prevData, chartDataItem];
        });

    } catch (error) {
        console.error("Error fetching CO2 data:", error);
    }
};
