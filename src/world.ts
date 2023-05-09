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

let datasetName = "Population mid-year estimates (millions)";
let datasetPath = "/data/datasets/population";

dropdownMain.append(optGroupEcology);
dropdownMain.append(optGroupEconomy);
dropdownMain.append(optGroupPopulation);

dropdownMain.addEventListener("change", _ => {
    dropdownScatterFirst.value = dropdownMain.value;
    datasetName = dropdownMain.value;
    datasetPath = optionPaths[optionType.get(datasetName)!];
});

dropdownScatterFirst.append(optGroupEcology.cloneNode(true));
dropdownScatterFirst.append(optGroupEconomy.cloneNode(true));
dropdownScatterFirst.append(optGroupPopulation.cloneNode(true));

dropdownScatterFirst.addEventListener("change", _ => {
    dropdownMain.value = dropdownScatterFirst.value;
    datasetName = dropdownScatterFirst.value;
    datasetPath = optionPaths[optionType.get(datasetName)!];
});

dropdownScatterSecond.append(optGroupEcology.cloneNode(true));
dropdownScatterSecond.append(optGroupEconomy.cloneNode(true));
dropdownScatterSecond.append(optGroupPopulation.cloneNode(true));

dropdownScatterSecond.addEventListener("change", _ => {
    datasetName = dropdownScatterSecond.value;
    datasetPath = optionPaths[optionType.get(datasetName)!];
});



import { Chart } from 'chart.js/auto';
import * as d3 from "d3";
import { datasetData, geoJsonData } from "./utils/data";
import { Atlas } from "./utils/figure";

// Load data
const [data, dataset] = await Promise.all([
    geoJsonData("/data/maps/world-atlas.geo.json", "value"),
    datasetData(datasetPath, datasetName),
]);

let YEAR = 0;
const yearOptions = document.getElementById("year-select")
if (yearOptions == null)
    throw Error("Houston we have a problem");

dataset.opts.forEach(year => {
    if (isNaN(year)) return;
    const opt = document.createElement("option");
    opt.value = year.toString();
    opt.innerText = year.toString();
    yearOptions.append(opt);
    yearOptions.onchange = (_event) => {
        for (let index = 0; index < yearOptions.children.length; index++) {
            const element = yearOptions.children[index] as HTMLOptionElement;
            if (element.selected)
                YEAR = parseInt(element.value);
        }
    }
});

const atlas = new Atlas("atlas", null);
new ResizeObserver(() => {
    const width = atlas.svg.HTML.clientWidth;
    const height = atlas.svg.HTML.clientHeight;
    const projection = d3.geoNaturalEarth1()
        .scale(width / (2 * Math.PI))
        .translate([width / 2, height / 1.7])
    atlas.settings?.pathGenerator.projection(projection)
    atlas.update(data)
}).observe(atlas.svg.HTML)

const width = atlas.svg.HTML.clientWidth;
const height = atlas.svg.HTML.clientHeight;

// Map and projection
const pathGenerator = d3.geoPath();
const projection = d3.geoNaturalEarth1()
    .scale(width / (2 * Math.PI))
    .translate([width / 2, height / 1.7])
pathGenerator.projection(projection)

// Find valid range
let min = Number.MAX_VALUE;
let max = Number.MIN_VALUE;
data.features.forEach(feature => {
    if (feature.properties) {
        const entries = dataset.data.get(parseInt(feature.properties["un_a3"]));
        if (entries === undefined) return;

        const value = entries.get(dataset.opts[YEAR]);
        if (value === undefined) return;

        if (value < min) min = value;
        if (value > max) max = value;
    }
})

// Color Scale
const bi_color_scheme = ["#80ACFF", "#FFD780"];
const uni_color_yellow_scheme = ["#FFFFFF", "#FFD780"];
const uni_color_blue_scheme = ["#80ACFF", "#FFFFFF"];
const colorScale = d3.scaleLog<string, string>()
    .domain([min, max])
    .range(bi_color_scheme);

// "Arable land (percentage of total land area)",
// "Forest cover (percentage  of total land area)",
// "Important sites for terrestrial biodiversity protected (percentage of total sites protected)",

// const colorScale = d3.scaleLinear<string, string>()
//  .domain([min, max])
//  .range(color_scheme);

// "Population annual rate of increase (percent)"
// const range = max - min;
// .domain(d3.range(range * .15 + min, range * .666 + min))
//
// "Population density"
// .domain([1, 4, 16, 128, 1024, 10240])
//
// Population mid-year estimates (millions)
// .domain([1, 4, 16, 128, 1024, 10240])
//
// "Arable land (thousand hectares)"
// .domain([1000, 5000, 10000, 50000])
//
// "GDP real rates of growth (percent)"
// .domain([0, 5, 8, 10])
//
// "Balance of Payments Financial account (millions of US dollars)"
// .domain([-5000, -2500, -1000, 0, 1000])
//
// "Balance of Payments Current account (millions of US dollars)"
// .domain([-5000, -1000, 0, 1000, 5000])

// const schema_threshold = ["#80ACFF", "#A4C0FF", "#C4D4FF", "#FFE9C4", "#FFE0A4", "#FFD780"];
// const colorScale = d3.scaleThreshold<number, string>()
//   .domain([-5000, -1000, 0, 1000, 5000])
//   .range(schema_threshold);

// Set atlas settings
atlas.settings = {
    pathGenerator, colorScale, property: "value"
};

//
data.features.forEach(feature => {
    if (feature.properties) {
        feature.properties["value"] = NaN;
    }
})

atlas.update(data);

data.features.forEach(feature => {
    if (feature.properties) {
        const entries = dataset.data.get(parseInt(feature.properties["un_a3"]));
        feature.properties["value"] = entries?.get(dataset.opts[1]) || NaN;
    }
})

atlas.update(data);

const ranking = document.getElementById("ranking") as HTMLCanvasElement | null;
if (ranking == null) throw Error("Deine Mama")

dataset.data = new Map([...dataset.data].sort((a, b) => (b[1].get(dataset.opts[1]) || 0) - (a[1].get(dataset.opts[1]) || 0)))

new Chart(ranking, {
    type: "bar",
    data: {
        labels: Array.from(dataset.data.keys()).slice(0, 100),
        datasets: [
            {
                label: '',
                data: Array.from(dataset.data.values()).slice(0, 100).map(entry => entry.get(dataset.opts[1])),
                backgroundColor: "#80ACFF",
            }
        ]
    }
});
