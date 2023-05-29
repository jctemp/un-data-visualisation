import * as d3 from "d3";

import { ColourSchemes, DatasetOptions } from "../constants";

import { WorldMap } from "../components/worldMap";
import { BarChart, Converter, ScatterChart } from "../components/chart";
import { CountryIds, Dataset } from "../utils/dataset";

import { Selection } from "../components/selection";
import { ThresholdOptions, ThresholdNumberOptions, ColourOptions, CheckBoxOption } from "../components/options";
import { symmetricLogarithm } from "../utils/scaling";

// ====================================================================================================
// Create the world map and load an initial dataset

let [worldMap, datasetA, datasetB, ids] = await Promise.all([
    WorldMap.init({
        mapId: "map",
        mapTooltipId: "map-tooltip",
        resourcePath: "/data",
        resource: "world",
    }),
    Dataset.init(DatasetOptions.paths[0], DatasetOptions.ecology[0]),
    Dataset.init(DatasetOptions.paths[0], DatasetOptions.ecology[2]),
    CountryIds.init("/data/datasets", "Country Ids"),
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
// Colour scaling function

function updateScale(): void {

    const [min, max] = datasetA.range;

    if (datasetA.scalingTypeCurrent === "Threshold") {
        const schema = datasetA.scaling.colourScheme === "Duo" ? ColourSchemes.thresholdDuo : ColourSchemes.thresholdMono;
        threshold.show();

        let values = calculateThresholds(schema, [min, max]);

        threshold.setThresholds(values);

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
});

let datasetYearSelection = new Selection({
    parentId: "map-actions",
    selectName: "Dataset Year",
    options: datasetA.years.map(year => year.toString()),
    useOptionsGroups: false,
});

datasetASelection.element.onchange = async () => {
    // 1. get selected option and path
    const selectedOption = datasetASelection.element.value;
    const path = DatasetOptions.paths[DatasetOptions.pathMapping.get(selectedOption)!];

    // 2. load dataset and update dataset year selection
    await datasetA.load(path, selectedOption);
    datasetYearSelection.update(datasetA.years.map(year => year.toString()));

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
    let limit = Number(rankingThreshold.control.value);
    ranking.update(converter.toChartDataset(datasetA, datasetA.yearCurrent, limit), datasetA.scaling.type, threshold.getColours(), threshold.getThresholds());

    // 7. update correlations
    correlations.update(converter.toChartDatasetScatter(datasetA, datasetB, 0), [datasetA.scaling.type, datasetB.scaling.type]);
};

datasetYearSelection.element.onchange = () => {
    // 1. get selected option
    datasetA.yearCurrent = Number(datasetYearSelection.element.value);
    updateScale();

    // 2. update world map
    worldMap.updateData(datasetA.byYear(datasetA.yearCurrent)!);
    worldMap.updateChart();

    // 3. update ranking
    let limit = Number(rankingThreshold.control.value);
    ranking.update(converter.toChartDataset(datasetA, datasetA.yearCurrent, limit), datasetA.scaling.type, threshold.getColours(), threshold.getThresholds());

}

datasetASelection.clone("correlation-actions");
let datasetBSelection = new Selection({
    parentId: "correlation-actions",
    selectName: "Dataset-B",
    options: [
        ["Ecology", DatasetOptions.ecology],
        ["Economy", DatasetOptions.economy],
        ["Population", DatasetOptions.population],
    ],
    useOptionsGroups: true,
});
datasetBSelection.element.value = DatasetOptions.ecology[2];

datasetBSelection.element.addEventListener("change", async () => {
    // 1. get selected options
    const selectedDatasetB = datasetBSelection.element.value;

    // 2. load dataset and update dataset year selection
    await datasetB.load(DatasetOptions.paths[DatasetOptions.pathMapping.get(selectedDatasetB)!], selectedDatasetB);

    // 3. update correlations
    correlations.update(converter.toChartDatasetScatter(datasetA, datasetB, 0), [datasetA.scaling.type, datasetB.scaling.type]);

});

// ====================================================================================================
// Scale selection

let scaleSelection = new Selection({
    parentId: "map-actions",
    selectName: "Scale Type",
    options: ["Linear", "Logarithmic", "Threshold"],
    useOptionsGroups: false,
});

const threshold = new ThresholdOptions("threshold-selection",
    ColourSchemes.thresholdMono.map((v, i) => [ColourSchemes.thresholdMono.length - i, v]));

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

const rankingThreshold = new ThresholdNumberOptions("ranking-actions", [10, 100], "Highest Top ");

rankingThreshold.setCallback(() => {
    let limit = Number(rankingThreshold.control.value);
    ranking.update(converter.toChartDataset(datasetA, datasetA.yearCurrent, limit), datasetA.scaling.type, threshold.getColours(), threshold.getThresholds());
});

// ====================================================================================================
// Correlations options

const checkboxOption = new CheckBoxOption("regions-selection", "Colour Regions")
checkboxOption.control.checked = true;
const colourOptionsContainer = document.createElement("div");
colourOptionsContainer.id = "correlation-colour-options";
checkboxOption.element.appendChild(colourOptionsContainer);

checkboxOption.setCallback(() => {
    if (checkboxOption.control.checked) {
        colourOptionsContainer.ariaDisabled = "false";
        correlations.updateColourScheme(colourOptions.getColours());
    } else {
        colourOptionsContainer.ariaDisabled = "true";
        correlations.updateColourScheme(["#4287f5", "#4287f5", "#4287f5", "#4287f5", "#4287f5", "#4287f5"]);
    }
});

const colourOptions = new ColourOptions("correlation-colour-options",
    Object.keys(ColourSchemes.regions).map(key => [key, ColourSchemes.regions[key]]));

colourOptions.setCallback(() => {
    correlations.updateColourScheme(colourOptions.getColours());
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

correlations.update(converter.toChartDatasetScatter(datasetA, datasetB, 0), [datasetA.scaling.type, datasetB.scaling.type]);
