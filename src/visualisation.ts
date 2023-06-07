import * as d3 from "d3";

import { ColourSchemes, DatasetOptions, Descriptions, Units } from "./constants";

import { MAP_LABEL_SUFFIX, WorldMap } from "./components/worldMap";
import { BarChart, CHART_A_LABEL_SUFFIX, CHART_B_LABEL_SUFFIX, Converter, ScatterChart } from "./components/chart";
import { CountryIds, Dataset } from "./utils/dataset";

import { Selection } from "./components/selection";
import { ThresholdOptions, ThresholdNumberOptions, ColourOptions, CheckBoxOption, ResetOption } from "./components/options";
import { symmetricLogarithm } from "./utils/scaling";
import { SearchBar } from "./components/searchbar";

// ====================================================================================================
// Create the world map and load an initial dataset

// TODO: replace this with static import (requires major changes in WorldMap.ts and Dataset.ts as dependencies)
let pathName = document.location.pathname;
let base = "/" + pathName.split("/").filter(x => x !== "")[0];

let [worldMap, datasetA, datasetB, ids] = await Promise.all([
    WorldMap.init({
        mapId: "map",
        mapTooltipId: "map-tooltip",
        resourcePath: base + "/data",
        resource: "world",
    }),
    Dataset.init(base + DatasetOptions.paths[0], DatasetOptions.ecology[0]),
    Dataset.init(base + DatasetOptions.paths[0], DatasetOptions.ecology[2]),
    CountryIds.init(base + "/data/datasets", "Country Ids"),
]);

let countries = new Map<string, string>();
ids.map.forEach((a, b) => countries.set(a[0], b));

let continents = new Map<string, string>();
ids.map.forEach((a, _) => continents.set(a[0], a[1]));

worldMap.setCountryIds(ids);

let converter = new Converter(countries, continents);
let ranking = new BarChart("ranking");
let correlations = new ScatterChart("correlation", ColourSchemes.regions);

// ====================================================================================================
// Highlight selected country

let countrySelect = new SearchBar('searchbar-container', 'Search for a country...',
    Array.from(countries.values()));

countrySelect.setCallback((country: string) => {
    let countryId = ids.map.get(country)?.[0] || "-1";
    worldMap.highlightCountry(countryId);
    worldMap.updateChart();
    ranking.highlightCountry(country);
    correlations.highlightCountry(country);
});

// ====================================================================================================
// Colour scaling function

function updateScale(): void {

    const [min, max] = datasetA.range;
    let values = calculateThresholds(datasetA.scaling.colourScheme === "Duo" ? ColourSchemes.thresholdDuo : ColourSchemes.thresholdMono, [min, max]);
    threshold.setThresholds(values);

    if (datasetA.scalingTypeCurrent === "Threshold") {
        threshold.show();

        worldMap.scale = d3.scaleThreshold<any, any>()
            .domain(threshold.getThresholds())
            .range(threshold.getColours());
    } else {
        const schema = datasetA.scaling.colourScheme === "Duo" ? ColourSchemes.duo : ColourSchemes.mono;
        threshold.hide();
        if (datasetA.scalingTypeCurrent === "Logarithmic") {
            worldMap.scale = d3.scaleLog<any>()
                .domain([min, max])
                .range(schema);
        } else {
            worldMap.scale = d3.scaleLinear<any>()
                .domain([min, max])
                .range(schema);
        }
    }
}

function calculateThresholds(schema: string[], range: [number, number]): number[] {
    const [min, max] = range;

    threshold.setRange([min, max]);
    threshold.setColours(schema.map((v, _) => v));
    let values = d3.range(min, max, (max - min) / schema.length);

    if (datasetA.scaling.thresholdType === "Logarithmic") {
        let exponents = values.map(v => symmetricLogarithm(v));
        let minExp = Math.ceil(Math.min(...exponents));
        let maxExp = Math.ceil(Math.max(...exponents));

        values = d3.range(minExp, maxExp, (maxExp - minExp) / schema.length)
            .map(v => Math.pow(10, v));
    } else if (datasetA.scaling.thresholdType === "Custom") {
        values = datasetA.scaling.thresholds;
    }

    return values.map(v => Math.round(v));
}

// ====================================================================================================
// Create the dataset selection

let datasetASelection = new Selection({
    parentId: "map-actions",
    selectName: "Dataset",
    options: [
        ["Ecology", DatasetOptions.ecology],
        ["Economy", DatasetOptions.economy],
        ["Population", DatasetOptions.population],
    ],
    useOptionsGroups: true,
    label: "🅰️",
});

let datasetYearSelection = new Selection({
    parentId: "map-actions",
    selectName: "Dataset Year",
    options: datasetA.years.map(year => year.toString()),
    useOptionsGroups: false,
});

let ds_description = document.getElementById("ds-description")!;
ds_description.innerText = Descriptions.mapping[DatasetOptions.ecology[0]];

MAP_LABEL_SUFFIX.value = Units.mapping[DatasetOptions.ecology[0]];
CHART_A_LABEL_SUFFIX.value = Units.mapping[DatasetOptions.ecology[0]];

datasetASelection.element.onchange = async () => {
    // 1. get selected option and path
    const selectedOption = datasetASelection.element.value;
    const path = DatasetOptions.paths[DatasetOptions.pathMapping.get(selectedOption)!];

    ds_description.innerText = Descriptions.mapping[selectedOption];
    MAP_LABEL_SUFFIX.value = Units.mapping[selectedOption];
    CHART_A_LABEL_SUFFIX.value = Units.mapping[selectedOption];

    // 2. load dataset and update dataset year selection
    await datasetA.load(path, selectedOption);
    datasetYearSelection.update(datasetA.years.map(year => year.toString()));
    const correlationYears = datasetA.years.map(year => year.toString()).filter(x => datasetB.years.map(year => year.toString()).includes(x));
    if (correlationYears.length === 0) {
        datasetsYearSelection.update(["latest"]);
    } else {
        datasetsYearSelection.update(correlationYears);
    }

    // 3. update world map
    worldMap.updateData(datasetA.byYear(datasetA.yearCurrent)!);

    // 4. update scale
    scaleSelection.element.value = datasetA.scaling.type;

    // disable "Logarithmic" option if values are negative
    if (datasetA.range[0] < 0) {
        scaleSelection.element.options[1].disabled = true;
    } else {
        scaleSelection.element.options[1].disabled = false;
    }

    updateScale();

    // 5. update world map
    worldMap.updateChart();

    // 6. update ranking
    rankingThreshold.setRange([1, datasetA.data.size]);

    let limit = Number(rankingThreshold.control.value);
    ranking.update(converter.toChartDataset(datasetA, datasetA.yearCurrent, limit), datasetA.scaling.type, threshold.getColours(), threshold.getThresholds());

    // 7. update correlations
    correlations.update(converter.toChartDatasetScatter(datasetA, datasetB, Number(correlationYears[0])), [datasetA.scaling.type, datasetB.scaling.type]);
};

datasetYearSelection.element.onchange = () => {
    // 1. get selected option
    datasetA.yearCurrent = Number(datasetYearSelection.element.value);

    // 2. update world map
    worldMap.updateData(datasetA.byYear(datasetA.yearCurrent)!);
    worldMap.updateChart();

    // 3. update ranking
    let limit = Number(rankingThreshold.control.value);
    ranking.update(converter.toChartDataset(datasetA, datasetA.yearCurrent, limit), datasetA.scaling.type, threshold.getColours(), threshold.getThresholds());

}

datasetASelection.clone("correlation-actions", "🅰");
let datasetBSelection = new Selection({
    parentId: "correlation-actions",
    selectName: "Dataset-B",
    options: [
        ["Ecology", DatasetOptions.ecology],
        ["Economy", DatasetOptions.economy],
        ["Population", DatasetOptions.population],
    ],
    useOptionsGroups: true,
    label: "🅱️",
});
datasetBSelection.element.value = DatasetOptions.ecology[2];
CHART_B_LABEL_SUFFIX.value = Units.mapping[DatasetOptions.ecology[2]];


let datasetsYearSelection = new Selection({
    parentId: "correlation-actions",
    selectName: "Correlations-Year",
    options: datasetA.years.map(year => year.toString()).filter(x => datasetB.years.map(year => year.toString()).includes(x)),
    useOptionsGroups: false,
});

datasetBSelection.element.addEventListener("change", async () => {
    // 1. get selected options
    const selectedDatasetB = datasetBSelection.element.value;

    // 2. load dataset and update dataset year selection
    await datasetB.load(DatasetOptions.paths[DatasetOptions.pathMapping.get(selectedDatasetB)!], selectedDatasetB);
    CHART_B_LABEL_SUFFIX.value = Units.mapping[selectedDatasetB];

    const correlationYears = datasetA.years.map(year => year.toString()).filter(x => datasetB.years.map(year => year.toString()).includes(x));
    if (correlationYears.length === 0) {
        datasetsYearSelection.update(["latest"]);
    } else {
        datasetsYearSelection.update(correlationYears);
    }

    // 3. update correlations
    correlations.update(converter.toChartDatasetScatter(datasetA, datasetB, Number(correlationYears[0])), [datasetA.scaling.type, datasetB.scaling.type]);
});

datasetsYearSelection.element.addEventListener("change", () => {
    // 1. get selected option
    datasetB.yearCurrent = Number(datasetsYearSelection.element.value);

    // 2. update correlations
    correlations.update(converter.toChartDatasetScatter(datasetA, datasetB, datasetB.yearCurrent), [datasetA.scaling.type, datasetB.scaling.type]);
    correlations.updateDotSize(Number(dotSize.control.value))
});


// ====================================================================================================
// Scale selection

let scaleSelection = new Selection({
    parentId: "map-actions",
    selectName: "Scale Type",
    options: ["Linear", "Logarithmic", "Threshold"],
    useOptionsGroups: false,
});
scaleSelection.element.value = "Threshold";

const threshold = new ThresholdOptions("threshold-selection",
    ColourSchemes.thresholdMono.map((v, i) => [ColourSchemes.thresholdMono.length - i, v]));

const resetThresholds = new ResetOption("threshold-selection", "Reset");

resetThresholds.setCallback(() => {
    let colourSchema = datasetA.scaling.colourScheme === "Mono" ? ColourSchemes.thresholdMono : ColourSchemes.thresholdDuo;
    let values = calculateThresholds(colourSchema, datasetA.range);
    threshold.setThresholds(values);

    // update world map
    worldMap.scale = d3.scaleThreshold<any, any>()
        .domain(threshold.getThresholds())
        .range(threshold.getColours());
    worldMap.updateChart();

    // update ranking
    let limit = Number(rankingThreshold.control.value);
    ranking.update(converter.toChartDataset(datasetA, datasetA.yearCurrent, limit), datasetA.scaling.type, threshold.getColours(), threshold.getThresholds());
});

threshold.setCallback(() => {
    worldMap.scale = d3.scaleThreshold<any, any>()
        .domain(threshold.getThresholds())
        .range(threshold.getColours());
    worldMap.updateChart();

    let limit = Number(rankingThreshold.control.value);
    ranking.update(converter.toChartDataset(datasetA, datasetA.yearCurrent, limit), datasetA.scaling.type, threshold.getColours(), threshold.getThresholds());
});

scaleSelection.element.onchange = () => {
    datasetA.scalingTypeCurrent = scaleSelection.element.value;
    updateScale();
    worldMap.updateChart();

    let limit = Number(rankingThreshold.control.value);
    ranking.update(converter.toChartDataset(datasetA, datasetA.yearCurrent, limit), datasetA.scaling.type, threshold.getColours(), threshold.getThresholds());
};

// ====================================================================================================
// Ranking threshold

const rankingThreshold = new ThresholdNumberOptions("ranking-actions", [1, datasetA.data.size], "Highest Top ");
const paragraph = document.getElementById("tick-info")!;

rankingThreshold.setCallback(() => {
    let limit = Number(rankingThreshold.control.value);
    ranking.update(converter.toChartDataset(datasetA, datasetA.yearCurrent, limit), datasetA.scaling.type, threshold.getColours(), threshold.getThresholds());

    if (ranking.chart.scales.x.ticks.length === 1 || ranking.chart.scales.x.ticks[1].value === 1) {
        paragraph.innerText = `Every country is shown.`;

    } else {
        let ticks = ranking.chart.scales.x.ticks[1].value;
        let suffix = ticks === 2 ? "nd" : ticks === 3 ? "rd" : "th";
        paragraph.innerText = `Every ${ticks}${suffix} country is shown.`;
    }


});

// ====================================================================================================
// Correlations options

const dotSize = new ThresholdNumberOptions("regions-selection", [1, 5], "Dot Size ", true);
dotSize.control.value = "3";
dotSize.setCallback(() => {
    correlations.updateDotSize(Number(dotSize.control.value));
});

const resetColours = new ResetOption("regions-selection", "Reset");

const checkboxOption = new CheckBoxOption("regions-selection", "Colour Regions")
checkboxOption.control.checked = true;
const colourOptionsContainer = document.createElement("div");
colourOptionsContainer.id = "correlation-colour-options";
checkboxOption.element.appendChild(colourOptionsContainer);

checkboxOption.setCallback(() => {
    if (checkboxOption.control.checked) {
        colourOptionsContainer.ariaDisabled = "false";
        resetColours.control.disabled = false;
        correlations.updateColourScheme(colourOptions.getColours(), colourOptions.getActive());
    } else {
        colourOptionsContainer.ariaDisabled = "true";
        resetColours.control.disabled = true;
        correlations.updateColourScheme(["#4287f5", "#4287f5", "#4287f5", "#4287f5", "#4287f5", "#4287f5"], [true, true, true, true, true, true]);
    }
});

resetColours.setCallback(() => {
    colourOptions.setColours(Object.keys(ColourSchemes.regions).map(key => ColourSchemes.regions[key]));
    correlations.updateColourScheme(colourOptions.getColours(), colourOptions.getActive());
});


const colourOptions = new ColourOptions("correlation-colour-options",
    Object.keys(ColourSchemes.regions).map(key => [key, ColourSchemes.regions[key]]));

colourOptions.setCallback(() => {
    correlations.updateColourScheme(colourOptions.getColours(), colourOptions.getActive());
});

// ====================================================================================================

worldMap.updateData(datasetA.byYear(datasetA.yearCurrent)!);
updateScale();
worldMap.updateChart();

let schema = datasetA.scaling.colourScheme === "Mono" ? ColourSchemes.thresholdMono : ColourSchemes.thresholdDuo;
let values = calculateThresholds(schema, datasetA.range);
threshold.setColours(schema.map((v, _) => v));
threshold.setThresholds(values);


let limit = Number(rankingThreshold.control.value);
ranking.update(converter.toChartDataset(datasetA, datasetA.yearCurrent, limit), datasetA.scaling.type, threshold.getColours(), threshold.getThresholds());
let ticks = ranking.chart.scales.x.ticks[1].value;
paragraph.innerText = `Every ${ticks}th country is shown.`;

correlations.update(converter.toChartDatasetScatter(datasetA, datasetB, Number(datasetsYearSelection.element.options[0].value)), [datasetA.scaling.type, datasetB.scaling.type]);
