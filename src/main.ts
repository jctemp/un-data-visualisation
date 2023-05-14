import './style.css';
// import "./pages/world"
import loadCountryIds from './data/ids';
import loadDataset, { datasetById, datasetByYear } from './data/datasets';
import * as geo from './data/geo';

let DATASET_NAME = "Population mid-year estimates (millions)";

const ids = await loadCountryIds("/data/datasets", "Country Ids.json");
const dataset = await loadDataset("/data/datasets/population", `${DATASET_NAME}.json`);
const geoData = await geo.load("/data", "world.geo.json", "value");

if (geoData == null || dataset == null || ids == null) throw Error("Du bastard");

geoData.forEach(feature => feature.properties.geo_id = ids?.get(feature.properties["name"]) || "-1");

import * as d3 from "d3";
import * as map from './component/map';

map.create("map", geoData);

const BI_COLOR_SCHEME = ["#80ACFF", "#FFD780"];
const UNI_COLOR_SCHEME_YELLOW = ["#FFFFFF", "#FFD780"];

dataset.years.forEach(year => {
    const values = geo.update(geoData, datasetByYear(dataset, year.toString())!, "value");
    const scale = datasetScales(values)!;
    map.update("map", geoData, scale);
});

function datasetScales(values: number[]): d3.ScaleLogarithmic<any, any> | d3.ScaleLinear<any, any> | null {
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