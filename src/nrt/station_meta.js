export const nrtStations = [
    {
        stationName: "Mauna Loa, Hawaii", // A Daily NRT for CO2 measured in MLO station
        stationCode: "MLO",
        source: "https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_daily_mlo.txt",
        label: "Observed CO₂ Concentration (Daily NRT)",
        ghg: "co2",
        frequency: "customNRTMLO",
        chartColor: "'rgba(0, 0, 255, 1)'",
        notice: "Mauna Loa Observatory (MLO) measurements were suspended from November 29, 2022 through July 4, 2023 due to a volcanic eruption. Measurements from the Mauna Kea Observatory (MKO), 21 miles to the northeast are substituted during this time period to fill in the Mauna Loa record. The Mauna Kea quality-controlled measurements are noted using coral color. NRT data is shown in blue and is substituted with quality controlled data as it becomes available."
    },
];