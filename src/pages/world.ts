import * as d3 from "d3";

import { ColourSchemes, DatasetOptions } from "../constants";

import { WorldMap } from "../components/worldMap";
import { BarChart, Converter, ScatterChart } from "../components/chart";
import { CountryIds, Dataset } from "../utils/dataset";

import { Selection } from "../components/selection";
import { Threshold, ThresholdNumber } from "../components/threshold";
import { inverseSymmetricLogarithm, symmetricLogarithm } from "../utils/scaling";

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
ids.map.forEach((a, b) => countries.set(a, b));

worldMap.setCountryIds(ids);

let converter = new Converter(countries);
let ranking = new BarChart("ranking");
let correlations = new ScatterChart("correlation");

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
    let colour = datasetA.scaling.colourScheme === "Mono" ? ColourSchemes.thresholdMono : ColourSchemes.thresholdDuo;
    let limit = Number(rankingThreshold.control.value);
    ranking.update(converter.toChartDataset(datasetA, datasetA.yearCurrent, limit), datasetA.scaling.type, colour, calculateThresholds(colour, datasetA.range));

    // 7. update correlations
    correlations.update(converter.toChartDatasetScatter(datasetA, datasetB, 0));
};

datasetYearSelection.element.onchange = () => {
    // 1. get selected option
    datasetA.yearCurrent = Number(datasetYearSelection.element.value);
    updateScale();

    // 2. update world map
    worldMap.updateData(datasetA.byYear(datasetA.yearCurrent)!);
    worldMap.updateChart();

    // 3. update ranking
    let colour = datasetA.scaling.colourScheme === "Mono" ? ColourSchemes.thresholdMono : ColourSchemes.thresholdDuo;
    let limit = Number(rankingThreshold.control.value);
    ranking.update(converter.toChartDataset(datasetA, datasetA.yearCurrent, limit), datasetA.scaling.type, colour, calculateThresholds(colour, datasetA.range));

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
    correlations.update(converter.toChartDatasetScatter(datasetA, datasetB, 0));

});

// ====================================================================================================
// Scale selection

let scaleSelection = new Selection({
    parentId: "map-actions",
    selectName: "Scale Type",
    options: ["Linear", "Logarithmic", "Threshold"],
    useOptionsGroups: false,
});

const threshold = new Threshold("threshold-selection",
    ColourSchemes.thresholdMono.map((v, i) => [ColourSchemes.thresholdMono.length - i, v]));

threshold.setCallback(() => {
    worldMap.scale = d3.scaleThreshold<any, any>()
        .domain(threshold.getThresholds())
        .range(threshold.getColours());
    worldMap.updateChart();
});

scaleSelection.element.onchange = () => {
    datasetA.scalingTypeCurrent = scaleSelection.element.value;
    updateScale();
    worldMap.updateChart();
};

// ====================================================================================================
// Ranking threshold
const rankingThreshold = new ThresholdNumber("ranking-actions", [10, 100], "Highest Top ");

rankingThreshold.setCallback(() => {
    let colour = datasetA.scaling.colourScheme === "Mono" ? ColourSchemes.thresholdMono : ColourSchemes.thresholdDuo;
    let limit = Number(rankingThreshold.control.value);
    ranking.update(converter.toChartDataset(datasetA, datasetA.yearCurrent, limit), datasetA.scaling.type, colour, calculateThresholds(colour, datasetA.range));
});


// ====================================================================================================

worldMap.updateData(datasetA.byYear(datasetA.yearCurrent)!);
updateScale();
worldMap.updateChart();

let colour = datasetA.scaling.colourScheme === "Mono" ? ColourSchemes.thresholdMono : ColourSchemes.thresholdDuo;
let limit = Number(rankingThreshold.control.value);
ranking.update(converter.toChartDataset(datasetA, datasetA.yearCurrent, limit), datasetA.scaling.type, colour, calculateThresholds(colour, datasetA.range));

correlations.update(converter.toChartDatasetScatter(datasetA, datasetB, 0));
