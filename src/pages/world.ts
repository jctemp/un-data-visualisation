import * as d3 from "d3";

import { ColourSchemes, DatasetOptions } from "../constants";

import { WorldMap } from "../components/worldMap";
import { BarChart, Converter, ScatterChart } from "../components/chart";
import { CountryIds, Dataset } from "../utils/dataset";

import { Selection } from "../components/selection";
import { Threshold, ThresholdNumber } from "../components/threshold";

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
let ranking = new BarChart("ranking", true);
let correlations = new ScatterChart("correlation", true);

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

    const [preferredColourScheme, preferredScale] = DatasetOptions.colourMapping.get(selectedOption)!;

    // 3. update world map
    worldMap.updateData(datasetA.byYear(datasetA.years[0])!);
    worldMap.scaleColorScheme = preferredColourScheme;
    scaleSelection.element.value = preferredScale;
    worldMap.scaleType = preferredScale;
    threshold.hide();

    // 4. create a linear scale if the values are negative otherwise a log scale
    if (preferredScale === "Logarithmic")
        worldMap.scale = d3.scaleLog<any>()
            .domain(worldMap.scaleRange)
            .range(worldMap.scaleColorScheme === "duo" ? ColourSchemes.duo : ColourSchemes.mono);
    else
        worldMap.scale = d3.scaleLinear<any>()
            .domain(worldMap.scaleRange)
            .range(worldMap.scaleColorScheme === "duo" ? ColourSchemes.duo : ColourSchemes.mono);

    // 5. update world map
    worldMap.updateChart();

    // 6. update ranking
    let limit = Number(rankingThreshold.control.value);
    ranking.update(converter.toChartDataset(datasetA, datasetA.years[0], limit));
};

datasetYearSelection.element.onchange = () => {
    // 1. get selected option
    const selectedOption = datasetYearSelection.element.value;

    // 2. update world map
    worldMap.updateData(datasetA.byYear(Number(selectedOption))!);
    worldMap.updateChart();

    // 3. update ranking
    let limit = Number(rankingThreshold.control.value);
    ranking.update(converter.toChartDataset(datasetA, Number(selectedOption), limit));

}

let datasetASelectionLink = datasetASelection.clone("correlation-actions");
let datasetBSelection = new Selection({
    parentId: "correlation-actions",
    selectName: "Dataset",
    options: [
        ["Ecology", DatasetOptions.ecology],
        ["Economy", DatasetOptions.economy],
        ["Population", DatasetOptions.population],
    ],
    useOptionsGroups: true,
});

datasetASelectionLink.element.addEventListener("change", () => {
    // 1. Dataset A is updated through original onchange function
    correlations.update(converter.toChartDatasetScatter(datasetA, datasetB, 0));
});

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
    ColourSchemes.threshold.reverse().map((v, i) => [ColourSchemes.threshold.length - i, v]));

threshold.setCallback(() => {
    worldMap.scale = d3.scaleThreshold<any, any>()
        .domain(threshold.getThresholds())
        .range(threshold.getColours());
    worldMap.updateChart();
});

scaleSelection.element.onchange = () => {
    worldMap.scaleType = scaleSelection.element.value;

    if (worldMap.scaleType === "Threshold") threshold.show();
    else threshold.hide();

    if (worldMap.scaleType !== "Threshold" && worldMap.scaleRange[0] < 0)
        scaleSelection.element.value = "Linear";

    // TODO: Balance of Payments power scale or something like this
    // TODO: Mutliple datasets have weird values -> manual fix them (most are economy, some in population)
    if (worldMap.scaleType === "Threshold") {

        const [min, max] = worldMap.scaleRange;
        const scaleType = DatasetOptions.colourMapping.get(datasetA.name)![1];

        threshold.setRange([min, max]);

        let values = d3.range(min, max, (max - min) / ColourSchemes.threshold.length);
        if (scaleType === "Logarithmic") {
            let exponents = values.map(v => Math.log(v));
            let minExp = 0;
            let maxExp = Math.ceil(Math.max(...exponents));

            values = d3.range(minExp, maxExp, (maxExp - minExp) / ColourSchemes.threshold.length)
                .map(v => Math.exp(v));
        }
        values = values.map(v => Math.round(v));
        console.log(values);

        threshold.setThresholds(values);

        worldMap.scale = d3.scaleThreshold<any, any>()
            .domain(threshold.getThresholds())
            .range(threshold.getColours());
    } else if (worldMap.scaleType === "Logarithmic")
        worldMap.scale = d3.scaleLog<any>()
            .domain(worldMap.scaleRange)
            .range(worldMap.scaleColorScheme === "duo" ? ColourSchemes.duo : ColourSchemes.mono);
    else
        worldMap.scale = d3.scaleLinear<any>()
            .domain(worldMap.scaleRange)
            .range(worldMap.scaleColorScheme === "duo" ? ColourSchemes.duo : ColourSchemes.mono);

    worldMap.updateChart();
};

// ====================================================================================================
// Ranking threshold
const rankingThreshold = new ThresholdNumber("ranking-actions", [10, 100], "Top ");

rankingThreshold.setCallback(() => {
    let limit = Number(rankingThreshold.control.value);
    ranking.update(converter.toChartDataset(datasetA, Number(datasetYearSelection.element.value), limit));
});


// ====================================================================================================

worldMap.updateData(datasetA.byYear(datasetA.years[0])!);
worldMap.scale = d3.scaleLinear<any>()
    .domain(worldMap.scaleRange)
    .range(worldMap.scaleColorScheme === "duo" ? ColourSchemes.duo : ColourSchemes.mono);
worldMap.updateChart();

ranking.update(converter.toChartDataset(datasetA, datasetA.years[0], 10));

correlations.update(converter.toChartDatasetScatter(datasetA, datasetB, 0));

// ====================================================================================================