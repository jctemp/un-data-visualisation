const optionsEcology = [
    "Arable land (percent of total land area)",
    "Emissions per capita (metric tons of carbon dioxide)",
    "Forest cover (percent of total land area)",
    "Important sites for terrestrial biodiversity protected (percent of total sites protected)",
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

const dropdownMain = document.getElementById("dataset-select") as HTMLSelectElement | null;
const dropdownScatterFirst = document.getElementById("first-dataset-select") as HTMLSelectElement | null;
const dropdownScatterSecond = document.getElementById("second-dataset-select") as HTMLSelectElement | null;

if (dropdownMain === null ||
    dropdownScatterFirst === null ||
    dropdownScatterSecond === null)
    throw Error("Houston, we've got a problem.");

const optGroupEcology = document.createElement("optgroup");
optGroupEcology.label = "Ecology";

optionsEcology.forEach(dataset => {
    const option = document.createElement("option");
    option.value = dataset;
    option.label = dataset;
    optGroupEcology.append(option);
});

const optGroupEconomy = document.createElement("optgroup");
optGroupEconomy.label = "Economy";

optionsEconomy.forEach(dataset => {
    const option = document.createElement("option");
    option.value = dataset;
    option.label = dataset;
    optGroupEconomy.append(option);
});

const optGroupPopulation = document.createElement("optgroup");
optGroupPopulation.label = "Population";

optionsPopulation.forEach(dataset => {
    const option = document.createElement("option");
    option.value = dataset;
    option.label = dataset;
    optGroupPopulation.append(option);
});

export let DATASET_NAME = "Population mid-year estimates (millions)";
let DATASET_PATH = "/data/datasets/population";

let callbackFirstDataset: (resourcePath: string, dataset: string) => Promise<void> = async () => { };
let callbackSecondDataset: (resourcePath: string, dataset: string) => Promise<void> = async () => { };

export function setCallbackFirstDataset(fn: (resourcePath: string, dataset: string) => Promise<void>): void {
    callbackFirstDataset = fn;
}

export function setCallbackSecondDataset(fn: (resourcePath: string, dataset: string) => Promise<void>): void {
    callbackSecondDataset = fn;
}

dropdownMain.append(optGroupEcology);
dropdownMain.append(optGroupEconomy);
dropdownMain.append(optGroupPopulation);

dropdownMain.addEventListener("change", _ => {
    dropdownScatterFirst.value = dropdownMain.value;
    DATASET_NAME = dropdownMain.value;
    DATASET_PATH = optionPaths[optionType.get(DATASET_NAME)!];
    callbackFirstDataset(DATASET_PATH, DATASET_NAME);
});

dropdownScatterFirst.append(optGroupEcology.cloneNode(true));
dropdownScatterFirst.append(optGroupEconomy.cloneNode(true));
dropdownScatterFirst.append(optGroupPopulation.cloneNode(true));

dropdownScatterFirst.addEventListener("change", _ => {
    dropdownMain.value = dropdownScatterFirst.value;
    DATASET_NAME = dropdownScatterFirst.value;
    DATASET_PATH = optionPaths[optionType.get(DATASET_NAME)!];
    callbackFirstDataset(DATASET_PATH, DATASET_NAME);
});

dropdownScatterSecond.append(optGroupEcology.cloneNode(true));
dropdownScatterSecond.append(optGroupEconomy.cloneNode(true));
dropdownScatterSecond.append(optGroupPopulation.cloneNode(true));

dropdownScatterSecond.addEventListener("change", _ => {
    DATASET_NAME = dropdownScatterSecond.value;
    DATASET_PATH = optionPaths[optionType.get(DATASET_NAME)!];
    callbackSecondDataset(DATASET_PATH, DATASET_NAME);
});

dropdownMain.value = DATASET_NAME;
dropdownScatterFirst.value = DATASET_NAME;


const dropdownYear = document.getElementById("year-select") as HTMLSelectElement | null;
let callbackYear: (yearIndex: string) => Promise<void> = async () => { console.log("emty") };
export function setCallbackYear(fn: (yearIndex: string) => Promise<void>): void {
    callbackYear = fn;
}

if (dropdownYear === null)
    throw Error("Houston, we've got a problem.");

export function setYearOptions(values: number[]) {
    while (dropdownYear!.firstChild) {
        dropdownYear!.removeChild(dropdownYear!.lastChild!);
    }

    values.forEach((v, index) => {
        const option = document.createElement("option");
        option.value = index.toString();
        option.label = v.toString();
        dropdownYear?.append(option)
    });

    dropdownYear!.onchange = _ => {
        dropdownYear?.childNodes.forEach(e => {
            const node = e as HTMLOptionElement;
            if (node.selected) {
                callbackYear(node.value);
            }
        })
    };
} 