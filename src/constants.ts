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

    static readonly colourMapping = new Map<string, [string, string]>([
        ["Arable land (percent of total land area)", ["mono", "Linear"]],
        ["Emissions per capita (metric tons of carbon dioxide)", ["mono", "Logarithmic"]],
        ["Forest cover (percent of total land area)", ["mono", "Linear"]],
        ["Important sites for terrestrial biodiversity protected (percent of total sites protected)", ["mono", "Linear"]],
        ["Permanent crops (percent of total land area)", ["mono", "Logarithmic"]],

        ["Balance of Payments Current account (millions of US dollars)", ["duo", "Linear"]],
        ["Balance of Payments Financial account (millions of US dollars)", ["duo", "Linear"]],
        ["GDP per capita (US dollars)", ["mono", "Logarithmic"]],
        ["GDP real rates of growth (percent)", ["duo", "Linear"]],
        ["Grants of patents (number)", ["mono", "Logarithmic"]],

        ["Infant mortality for both sexes (per 1,000 live births)", ["duo", "Logarithmic"]],
        ["Life expectancy at birth for both sexes (years)", ["duo", "Logarithmic"]],
        ["Percentage of individuals using the internet", ["mono", "Linear"]],
        ["Population aged 0 to 14 years old (percentage)", ["mono", "Linear"]],
        ["Population aged 60+ years old (percentage)", ["mono", "Linear"]],
        ["Population annual rate of increase (percent)", ["duo", "Linear"]],
        ["Population density", ["mono", "Logarithmic"]],
        ["Population mid-year estimates (millions)", ["mono", "Logarithmic"]],
    ]);
}

DatasetOptions.ecology.forEach(value => DatasetOptions.pathMapping.set(value, 0));
DatasetOptions.economy.forEach(value => DatasetOptions.pathMapping.set(value, 1));
DatasetOptions.population.forEach(value => DatasetOptions.pathMapping.set(value, 2));

export class ColourSchemes {
    static readonly mono = ["#FFFFFF", "#FFD780"];
    static readonly duo = ["#80ACFF", "#FFD780"];
    static readonly threshold = ["#4686FF", "#80ACFF", "#B4CEFF", "#FFEBC0", "#FFD780", "#FFBF33"];
}

