import './style.css';

const optionsEcology = [
    "Arable land (percent of total land area)",
    "Emissions per capita (metric tons of carbon dioxide)",
    "Forest cover (percent of total land area)",
    "Important sites for terrestrial biodiversity protected (percent of total sites protected)",
    "Land area (thousand hectares)",
    "Permanent crops (percent of total land area)",
];

const optionsEconomy = [
    "Balance of Payments Current account (millions of US dollars)",
    "Balance of Payments Financial account (millions of US dollars)",
    "GDP per capita (US dollars)",
    "GDP real rates of growth (percent)",
    "Grants of patents (number)",
];

const optionsPopulation = [
    "Infant mortality for both sexes (per 1,000 live births)",
    "Life expectancy at birth for both sexes (years)",
    "Percentage of individuals using the internet",
    "Population aged 0 to 14 years old (percentage)",
    "Population aged 60+ years old (percentage)",
    "Population annual rate of increase (percent)",
    "Population density",
    "Population mid-year estimates (millions)",
];

const optionPaths = [
    "/data/datasets/ecology",
    "/data/datasets/economy",
    "/data/datasets/population"
];

const optionType = new Map<string, number>();
optionsEcology.forEach(value => optionType.set(value, 0));
optionsEconomy.forEach(value => optionType.set(value, 1));
optionsPopulation.forEach(value => optionType.set(value, 2));

let datasetName = "Population mid-year estimates (millions)";
let datasetPath = "/data/datasets/population";
