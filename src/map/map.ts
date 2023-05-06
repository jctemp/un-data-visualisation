import * as d3 from "d3";
import { datasetData, geoJsonData } from "./data";
import { Atlas } from "./figure";

// Load data
const [data, dataset] = await Promise.all([
    geoJsonData("/data/maps/world-atlas.geo.json", "value"),
    datasetData(),
]);

if (data === undefined || dataset === undefined)
    throw Error("Houston we have a problem");

let YEAR = 4;
const options = document.getElementById("year-select")
if (options == null)
    throw Error("Houston we have a problem");

dataset.opts.forEach(year => {
    const opt = document.createElement("option");
    opt.value = year.toString();
    opt.innerText = year.toString();
    options.append(opt);
    options.onchange = (_event) => {
        for (let index = 0; index < options.children.length; index++) {
            const element = options.children[index] as HTMLOptionElement;
            if (element.selected)
                YEAR = parseInt(element.value);
        }
    }
});

/// =============================================================================================

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
const colorScale = d3.scaleLog<string, string>()
    .domain([min, max])
    .range(["purple", "yellow"]);

atlas.settings = {
    pathGenerator, colorScale, property: "value"
};

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


