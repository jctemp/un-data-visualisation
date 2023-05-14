// ======================================================================================
// DATASET

import { Chart } from 'chart.js/auto';
import * as d3 from "d3";
import { datasetData, geoJsonData } from "../utils/data";
import { Atlas } from "../utils/map";

// ======================================================================================
// CREATE WORLD MAP

// Load data
const data = await geoJsonData("/data/maps/world-atlas.geo.json", "value");

let DATASET_YEAR_INDEX = 1;
let DATASET_MIN_VALUE = Number.MAX_VALUE;
let DATASET_MAX_VALUE = Number.MIN_VALUE;

let colorScale = d3.scaleLog<string, string>();

data.features.forEach(feature => {
    if (feature.properties) {
        feature.properties["value"] = NaN;
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

atlas.settings = {
    pathGenerator, colorScale, property: "value"
};

atlas.update(data);

// ======================================================================================
// DATA LOADING

const BI_COLOR_SCHEME = ["#80ACFF", "#FFD780"];
const UNI_COLOR_SCHEME_YELLOW = ["#FFFFFF", "#FFD780"];

function datasetScales(values: number[]): d3.ScaleLogarithmic<any, any> | d3.ScaleLinear<any, any> | null {
    console.log(values);

    // ECOLOGY
    if (DATASET_NAME === "Arable land (percent of total land area)" ||
        DATASET_NAME === "Emissions per capita (metric tons of carbon dioxide)" ||
        DATASET_NAME === "Forest cover (percent of total land area)" ||
        DATASET_NAME === "Important sites for terrestrial biodiversity protected (percent of total sites protected)"
    ) {
        const [min, max] = values;
        const offset = (max - min) * .7;
        return d3.scaleLinear<string, string>()
            .domain([min, max - offset])
            .range(UNI_COLOR_SCHEME_YELLOW);
    }

    if (DATASET_NAME === "Permanent crops (percent of total land area)") {
        const [min, max] = values;
        const offset = (max - min) * .99;
        return d3.scaleLog<string, string>()
            .domain([min, max - offset])
            .range(UNI_COLOR_SCHEME_YELLOW);
    }

    // ECONOMY
    if (DATASET_NAME === "Balance of Payments Current account (millions of US dollars)") {
        const [min, max] = values;
        const offset = (max - min) * .4;
        return d3.scaleLinear<string, string>()
            .domain([min + offset, max])
            .range(BI_COLOR_SCHEME);
    }

    if (DATASET_NAME === "Balance of Payments Financial account (millions of US dollars)") {
        const [min, max] = values;
        const offset = (max - min) * .4;
        return d3.scaleLinear<string, string>()
            .domain([min + offset, max])
            .range(BI_COLOR_SCHEME);
    }

    if (DATASET_NAME === "GDP per capita (US dollars)") {
        const [min, max] = values;
        const offset = (max - min) * .85;
        return d3.scaleLinear<string, string>()
            .domain([min, max - offset])
            .range(UNI_COLOR_SCHEME_YELLOW);
    }

    if (DATASET_NAME === "GDP real rates of growth (percent)") {
        const [min, max] = values;
        const offset = (max - min) * .2;
        return d3.scaleLinear<string, string>()
            .domain([min + offset, max])
            .range(BI_COLOR_SCHEME);
    }

    
    if (DATASET_NAME === "Grants of patents (number)") {
        const [min, max] = values;
        const offset = (max - min) * .7;
        return d3.scaleLog<string, string>()
            .domain([min, max - offset])
            .range(UNI_COLOR_SCHEME_YELLOW);
    }

    if (
        DATASET_NAME === "Percentage of individuals using the internet" ||
        DATASET_NAME === "Population aged 0 to 14 years old (percentage)" ||
        DATASET_NAME === "Population aged 60+ years old (percentage)" ||
        DATASET_NAME === "Population annual rate of increase (percent)"
    ) {
        return d3.scaleLinear<string, string>()
            .domain([0, 100])
            .range(UNI_COLOR_SCHEME_YELLOW);
    }

    if (
        DATASET_NAME === "Infant mortality for both sexes (per 1,000 live births)" ||
        DATASET_NAME === "Life expectancy at birth for both sexes (years)" ||
        DATASET_NAME === "Population density" ||
        DATASET_NAME === "Population mid-year estimates (millions)"
    ) {
        return d3.scaleLog<string, string>()
            .domain(values)
            .range(BI_COLOR_SCHEME);
    }

    return null;
}

let rankingchart: Chart<any> | null = null;

async function callbackMap() {
    // fetch data
    const dataset = await datasetData(DATASET_PATH, DATASET_NAME);

    // fetch year select
    const dropdownYear = document.getElementById("year-select") as HTMLSelectElement | null;
    if (dropdownYear == null)
        throw Error("Houston, we've got a problem.");

    // remove existing year options
    while (dropdownYear.firstChild) {
        dropdownYear.removeChild(dropdownYear.lastChild!);
    }

    // set new year options
    dataset.opts.forEach((year, index) => {
        if (isNaN(year)) return;
        if (index == 1) DATASET_YEAR_INDEX = index;
        const opt = document.createElement("option");
        opt.value = index.toString();
        opt.innerText = year.toString();
        dropdownYear.append(opt);
        dropdownYear.onchange = _ => {
            DATASET_YEAR_INDEX = parseInt(dropdownYear.value);

            // find valid range
            DATASET_MIN_VALUE = Number.MAX_VALUE;
            DATASET_MAX_VALUE = Number.MIN_VALUE;
            data.features.forEach(feature => {
                if (feature.properties) {
                    const entries = dataset.data.get(parseInt(feature.properties["un_a3"]));
                    if (entries === undefined) return;

                    const value = entries?.get(dataset.opts[DATASET_YEAR_INDEX]) || NaN;
                    if (value === undefined) return;

                    feature.properties["value"] = value;

                    if (value < DATASET_MIN_VALUE) DATASET_MIN_VALUE = value;
                    if (value > DATASET_MAX_VALUE) DATASET_MAX_VALUE = value;
                }
            });

            // Set atlas settings
            atlas.settings = {
                pathGenerator,
                colorScale: datasetScales([DATASET_MIN_VALUE, DATASET_MAX_VALUE])!,
                property: "value"
            };

            atlas.update(data);
        }
    });

    // find valid range and set values
    DATASET_MIN_VALUE = Number.MAX_VALUE;
    DATASET_MAX_VALUE = Number.MIN_VALUE;

    data.features.forEach(feature => {
        if (feature.properties) {
            const country = dataset.data.get(parseInt(feature.properties["un_a3"]));
            if (country === undefined) return;

            const value = country?.get(dataset.opts[DATASET_YEAR_INDEX]) || NaN;
            if (value === undefined) return;

            feature.properties["value"] = value;

            if (value < DATASET_MIN_VALUE) DATASET_MIN_VALUE = value;
            if (value > DATASET_MAX_VALUE) DATASET_MAX_VALUE = value;
        }
    })

    if (DATASET_MAX_VALUE == Number.MIN_VALUE) {
        console.log(dataset);
    }


    // Set atlas settings
    atlas.settings = {
        pathGenerator,
        colorScale: datasetScales([DATASET_MIN_VALUE, DATASET_MAX_VALUE])!,
        property: "value"
    };

    atlas.update(data);

    // const ranking = document.getElementById("ranking") as HTMLCanvasElement | null;
    // if (ranking == null) throw Error("Deine Mama")

    // dataset.data = new Map([...dataset.data].sort((a, b) => (b[1].get(dataset.opts[1]) || 0) - (a[1].get(dataset.opts[1]) || 0)))

    // if (rankingchart != null) {
    //     rankingchart.destroy();
    // }

    // rankingchart = new Chart(ranking, {
    //     type: "bar",
    //     data: {
    //         labels: Array.from(dataset.data.keys()).slice(0, 100),
    //         datasets: [
    //             {
    //                 label: '',
    //                 data: Array.from(dataset.data.values()).slice(0, 100).map(entry => entry.get(dataset.opts[1])),
    //                 backgroundColor: "#80ACFF",
    //             }
    //         ]
    //     }
    // });

}

callbackMap()

dropdownMain.addEventListener("change", callbackMap);
dropdownScatterFirst.addEventListener("change", callbackMap);
