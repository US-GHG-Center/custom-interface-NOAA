// Enum for Instrument Types
export enum InstrumentType {
    FLASK = "flask",
    PFP = "pfp",
    IN_SITU = "insitu"
}

// Enum for Greenhouse Gases
export enum GreenhouseGas {
    METHANE = "ch4",
    CARBON_DIOXIDE = "co2"
}

// Enum for Measurement Mediums
export enum MeasurementMedium {
    SURFACE = "surface",
    TOWER = "tower",
    AIRCRAFT = "aircraft",
    NRT = "nrt"
}

// Enum for Mesaurement Instrument Types
export enum MeasurementInstrument {
    FLASK = "flask",
    PFP = "pfp",
    IN_SITU = "insitu"
}

// Enum for Data Frequency
export enum DataFrequency {
    CONTINUOUS = "continuous",
    NON_CONTINUOUS = "non_continuous"
}

// Type for Greenhouse Gas Properties
type GasProperties = {
    short: string;
    fullName: string;
    unit: string;
};

// Greenhouse Gas Details
export const greenhouseGases: Record<GreenhouseGas, GasProperties> = {
    [GreenhouseGas.METHANE]: { short: "CH₄", fullName: "Methane", unit: "ppb" },
    [GreenhouseGas.CARBON_DIOXIDE]: { short: "CO₂", fullName: "Carbon Dioxide", unit: "ppm" }
};

// Type for Instrument Properties
type InstrumentProperties = {
    short: string;
    fullName: string;
};

// Instrument Types Mapping
export const measurementInstruments: Record<InstrumentType, InstrumentProperties> = {
    [InstrumentType.FLASK]: { short: "Flask", fullName: "Flask" },
    [InstrumentType.PFP]: { short: "PFP", fullName: "PFP" },
    [InstrumentType.IN_SITU]: { short: "In-situ", fullName: "In-situ" }
};

export const timePeriodMapping: Record<string, string> = {
    "hourly": "Hourly",
    "daily": "Daily",
    "weekly": "Weekly",
    "monthly": "Monthly",
    "quarterly": "Quarterly",
    "yearly": "Yearly",
};


// Station categorization
// Legend mapping for visualization with hex color codes
export const measurementLegend = {
    [DataFrequency.CONTINUOUS]: {
        color: "#00B7EB", // Blue
        text: "Continuous Measurements (Surface and Tower In-situ)",
        shortText: "Continuous Measurements"
    },
    [DataFrequency.NON_CONTINUOUS]: {
        color: "#FFD700", // Gold
        text: "Non-Continuous Measurements (Flask and PFP)",
        shortText: "Non-Continuous Measurements"
    },
};

// Ignore station for visualization
export const ignoreStations = [
    { station: "MKO", ghg: GreenhouseGas.CARBON_DIOXIDE }, // Ignore MKO if GHG is Co2
];