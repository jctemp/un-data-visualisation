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
// Colour scaling function

function updateScale(): void {
    if (worldMap.scale == null) return;
    if (worldMap.scaleType === "Threshold") threshold.show();
    else threshold.hide();

    if (worldMap.scaleType === "Threshold") {
        const [min, max] = worldMap.scaleRange;
        const scaleMode = DatasetOptions.colourMapping.get(datasetA.name)![2];
        const schema = worldMap.scaleColorScheme === "duo" ? ColourSchemes.threshold_duo : ColourSchemes.threshold_mono;

        threshold.setRange([min, max]);
        threshold.setColours(schema.map((v, _) => v));
        let values = d3.range(min, max, (max - min) / schema.length);

        if (scaleMode === "Logarithmic") {
            let exponents = values.map(v => Math.log(v));
            let minExp = Math.max(0, Math.ceil(Math.min(...exponents)));
            let maxExp = Math.ceil(Math.max(...exponents));

            values = d3.range(minExp, maxExp, (maxExp - minExp) / schema.length)
                .map(v => Math.exp(v));
        } else if (scaleMode === "Custom") {
            values = DatasetOptions.customThresholds.get(datasetA.name)!;
        }

        values = values.map(v => Math.round(v));

        threshold.setThresholds(values);

        worldMap.scale = d3.scaleThreshold<any, any>()
            .domain(threshold.getThresholds())
            .range(threshold.getColours());
    } else if (worldMap.scaleType === "Logarithmic") {
        if (worldMap.scaleRange[0] > 0) {
            worldMap.scale = d3.scaleLog<any>()
                .domain(worldMap.scaleRange)
                .range(worldMap.scaleColorScheme === "duo" ? ColourSchemes.duo : ColourSchemes.mono);
        } else {
            worldMap.scale = d3.scalePow<any>()
                .domain(worldMap.scaleRange)
                .range(worldMap.scaleColorScheme === "duo" ? ColourSchemes.duo : ColourSchemes.mono);
        }

    } else {
        worldMap.scale = d3.scaleLinear<any>()
            .domain(worldMap.scaleRange)
            .range(worldMap.scaleColorScheme === "duo" ? ColourSchemes.duo : ColourSchemes.mono);
    }
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

    let [preferredColourScheme, preferredScale, thresholdType] = DatasetOptions.colourMapping.get(selectedOption)!;

    // 3. update world map
    worldMap.updateData(datasetA.byYear(datasetA.years[0])!);

    worldMap.scaleType = preferredScale;
    worldMap.scaleColorScheme = preferredColourScheme;
    worldMap.scaleThresholdType = thresholdType;
    scaleSelection.element.value = preferredScale;

    // 4. update scale
    scaleSelection.element.value = worldMap.scaleType
    updateScale();

    // 5. update world map
    worldMap.updateChart();

    // 6. update ranking
    let limit = Number(rankingThreshold.control.value);
    ranking.update(converter.toChartDataset(datasetA, datasetA.years[0], limit));

    // 7. update correlations
    correlations.update(converter.toChartDatasetScatter(datasetA, datasetB, 0));
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
    ColourSchemes.threshold_mono.map((v, i) => [ColourSchemes.threshold_mono.length - i, v]));

threshold.setCallback(() => {
    worldMap.scale = d3.scaleThreshold<any, any>()
        .domain(threshold.getThresholds())
        .range(threshold.getColours());
    worldMap.updateChart();
});

scaleSelection.element.onchange = () => {
    worldMap.scaleType = scaleSelection.element.value;
    updateScale();
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