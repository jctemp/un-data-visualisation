import * as d3 from "d3";

import { ColourSchemes, DatasetOptions } from "../constants";

import { WorldMap } from "../components/worldMap";
import { CountryIds, Dataset } from "../utils/dataset";

import { Selection } from "../components/selection";
import { Threshold } from "../components/threshold";

import "../components/chart";

// ====================================================================================================
// Create the world map and load an initial dataset

let [worldMap, dataset, ids] = await Promise.all([
    WorldMap.init({
        mapId: "map",
        mapTooltipId: "map-tooltip",
        resourcePath: "/data",
        resource: "world",
    }),
    Dataset.init(DatasetOptions.paths[0], DatasetOptions.ecology[0]),
    CountryIds.init("/data/datasets", "Country Ids"),
]);

worldMap.setCountryIds(ids);

// ====================================================================================================
// Create the dataset selection

let datasetSelection = new Selection({
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
    options: dataset.years.map(year => year.toString()),
    useOptionsGroups: false,
});

datasetSelection.element.onchange = async () => {
    // 1. get selected option and path
    const selectedOption = datasetSelection.element.value;
    const path = DatasetOptions.paths[DatasetOptions.pathMapping.get(selectedOption)!];

    // 2. load dataset and update dataset year selection
    await dataset.load(path, selectedOption);
    datasetYearSelection.update(dataset.years.map(year => year.toString()));

    const [preferredColourScheme, preferredScale] = DatasetOptions.colourMapping.get(selectedOption)!;

    // 3. update world map
    worldMap.updateData(dataset.byYear(dataset.years[0].toString())!);
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
};

datasetYearSelection.element.onchange = () => {
    // 1. get selected option
    const selectedOption = datasetYearSelection.element.value;

    // 2. update world map
    worldMap.updateData(dataset.byYear(selectedOption)!);
    worldMap.updateChart();
}

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
    console.log(threshold.getThresholds());
    console.log(threshold.getColours());
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
        const scaleType = DatasetOptions.colourMapping.get(dataset.name)![1];

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
worldMap.updateData(dataset.byYear(dataset.years[0].toString())!);
worldMap.scale = d3.scaleLinear<any>()
    .domain(worldMap.scaleRange)
    .range(worldMap.scaleColorScheme === "duo" ? ColourSchemes.duo : ColourSchemes.mono);
worldMap.updateChart();
