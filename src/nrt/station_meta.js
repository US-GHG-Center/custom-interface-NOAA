export const nrtStations = [
    {
        stationName: "Mauna Loa, Hawaii",
        stationCode: "MLO",
        source: "https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_daily_mlo.txt",
        label: "Observed CO₂ Concentration (Daily NRT)",
        ghg: "co2",
        frequency: "customNRTMLO",
        unit: "ppm",
        chartColor: "rgba(0, 0, 255, 1)",
        chartId: 991,
        cutoffDate: "2023-04-30T00:00:00Z",
        displayLine: false,
        notice: "Mauna Loa Observatory (MLO) measurements were suspended from November 29, 2022 through July 4, 2023 due to a volcanic eruption. Measurements from the Mauna Kea Observatory (MKO), 21 miles to the northeast are substituted during this time period to fill in the Mauna Loa record. The Mauna Kea quality-controlled measurements are noted using coral color. NRT data is shown in blue and is substituted with quality controlled data as it becomes available.",
        // Related station for historical data fill-in
        relatedStation: {
            stationCode: "MKO",
            chartColor: "rgba(255, 127, 80, 1)",
            chartId: 990,
            cutoffDate: "2023-07-04T00:00:00Z",
            displayLine: true
        }
    },
    {
        stationName: "Mauna Loa, Hawaii",
        stationCode: "MLO",
        source: null,
        label: "Observed CH₄ Concentration (Daily NRT)",
        ghg: "ch4",
        frequency: "customNRTMLO",
        unit: "ppb",
        chartColor: "rgba(0, 0, 255, 1)",
        chartId: 991,
        displayLine: false,
        notice: "Mauna Loa Observatory (MLO) measurements were suspended from November 29, 2022 through July 4, 2023 due to a volcanic eruption. Measurements from the Mauna Kea Observatory (MKO), 21 miles to the northeast are substituted during this time period to fill in the Mauna Loa record. The Mauna Kea quality-controlled measurements are noted using coral color. NRT data is shown in blue and is substituted with quality controlled data as it becomes available.",
        // Related station for historical data fill-in
        relatedStation: {
            stationCode: "MKO",
            chartColor: "rgba(255, 127, 80, 1)",
            chartId: 990,
            cutoffDate: "2023-07-04T00:00:00Z",
            displayLine: true
        }
    },
];