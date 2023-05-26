export const TARGET_PROPERTY = "value";

export class DatasetOptions {
    static readonly ecology = [
        "Arable land (percent of total land area)",
        "Emissions per capita (metric tons of carbon dioxide)",
        "Forest cover (percent of total land area)",
        "Important sites for terrestrial biodiversity protected (percent of total sites protected)",
        "Permanent crops (percent of total land area)",
    ];

    static readonly economy = [
        "Balance of Payments Current account (millions of US dollars)",
        "Balance of Payments Financial account (millions of US dollars)",
        "GDP per capita (US dollars)",
        "GDP real rates of growth (percent)",
        "Grants of patents (number)",
    ];

    static readonly population = [
        "Infant mortality for both sexes (per 1,000 live births)",
        "Life expectancy at birth for both sexes (years)",
        "Percentage of individuals using the internet",
        "Population aged 0 to 14 years old (percentage)",
        "Population aged 60+ years old (percentage)",
        "Population annual rate of increase (percent)",
        "Population density",
        "Population mid-year estimates (millions)",
    ];

    static readonly paths = [
        "/data/datasets/ecology",
        "/data/datasets/economy",
        "/data/datasets/population"
    ];

    static readonly pathMapping = new Map<string, number>()
}

DatasetOptions.ecology.forEach(value => DatasetOptions.pathMapping.set(value, 0));
DatasetOptions.economy.forEach(value => DatasetOptions.pathMapping.set(value, 1));
DatasetOptions.population.forEach(value => DatasetOptions.pathMapping.set(value, 2));

export class ColourSchemes {
    static readonly mono = ["#FFFFFF", "#FF8F02"];
    static readonly duo = ["#104DFF", "#FF8F02"];
    static readonly thresholdMono = ["#FFFFFF", "#FFECC2", "#FFD987", "#FFC13B", "#FAAC00", "#FF8F02"];
    static readonly thresholdDuo = ["#104DFF", "#5F96FF", "#C0D6FF", "#FFECC2", "#FFC13B", "#FF8F02"];
}

