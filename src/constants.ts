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

    static readonly colourMapping = new Map<string, [string, string, string]>([
        ["Arable land (percent of total land area)", ["mono", "Linear", "auto"]], // keep
        ["Emissions per capita (metric tons of carbon dioxide)", ["mono", "Logarithmic", "auto"]], // keep
        ["Forest cover (percent of total land area)", ["mono", "Linear", "auto"]], // keep
        ["Important sites for terrestrial biodiversity protected (percent of total sites protected)", ["mono", "Linear", "auto"]], // keep
        ["Permanent crops (percent of total land area)", ["mono", "Logarithmic", "auto"]], // keep
 
        ["Balance of Payments Current account (millions of US dollars)", ["duo", "Linear", "custom"]], // custon threshold
        ["Balance of Payments Financial account (millions of US dollars)", ["duo", "Linear", "custom"]], // custon threshold
        ["GDP per capita (US dollars)", ["mono", "Logarithmic", "auto"]], // threshold default
        ["GDP real rates of growth (percent)", ["duo", "Linear", "auto"]], // threshold default
        ["Grants of patents (number)", ["mono", "Logarithmic", "custom"]], // custom threshold

        ["Infant mortality for both sexes (per 1,000 live births)", ["mono", "Logarithmic", "custom"]], // threshold default
        ["Life expectancy at birth for both sexes (years)", ["mono", "Logarithmic", "custom"]], // threshold default + custom
        ["Percentage of individuals using the internet", ["mono", "Logarithmic", "custom"]],  // keep
        ["Population aged 0 to 14 years old (percentage)", ["mono", "Linear", "auto"]], // keep
        ["Population aged 60+ years old (percentage)", ["mono", "Linear", "auto"]], // keep
        ["Population annual rate of increase (percent)", ["duo", "Linear", "custom"]], // threshold default, custom
        ["Population density", ["mono", "Logarithmic", "auto"]], // keep
        ["Population mid-year estimates (millions)", ["mono", "Logarithmic", "auto"]], // keep
    ]);

    static readonly customThresholds = new Map<string, number[]>([
        ["Balance of Payments Current account (millions of US dollars)", [-6000, -3000, 0, 1000, 3000, Number.MAX_SAFE_INTEGER]],
        ["Balance of Payments Financial account (millions of US dollars)", [-10000, -5000, 0, 1000, 3000, Number.MAX_SAFE_INTEGER]],
        ["Grants of patents (number)", [50, 2000, 8000, 25000, 50000, Number.MAX_SAFE_INTEGER]],

        ["Infant mortality for both sexes (per 1,000 live births)", [5, 10, 20, 40, 80, Number.MAX_SAFE_INTEGER]],
        ["Life expectancy at birth for both sexes (years)", [60, 65, 70, 75, 80, Number.MAX_SAFE_INTEGER]],
        ["Population annual rate of increase (percent)", [-2, -1, 0, 2, 4, Number.MAX_SAFE_INTEGER]],
    ]);
}

DatasetOptions.ecology.forEach(value => DatasetOptions.pathMapping.set(value, 0));
DatasetOptions.economy.forEach(value => DatasetOptions.pathMapping.set(value, 1));
DatasetOptions.population.forEach(value => DatasetOptions.pathMapping.set(value, 2));

export class ColourSchemes {
    static readonly mono = ["#FFFFFF", "#FF8F02"];
    static readonly duo = ["#104DFF", "#FF8F02"];
    static readonly threshold_mono = ["#FFFFFF", "#FFECC2", "#FFD987", "#FFC13B", "#FAAC00", "#FF8F02"];
    static readonly threshold_duo = ["#104DFF", "#5F96FF", "#C0D6FF", "#FFECC2", "#FFC13B", "#FF8F02"];
}

