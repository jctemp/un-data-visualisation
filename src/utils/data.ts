import * as d3 from "d3";
import { FeatureCollection, GeoJsonProperties, Geometry } from "geojson";

/**
 * # Summary
 * `countryData` loads a `.geo.json` file describing geographic data. It is asynchronously requested
 * with `d3.json`. It is expected that the requested file contains multiple feature entries, otherwise
 * it will not result in a `FeatureCollection`. The function initialises the `Feature`'s in the 
 * `FeatureCollection` with the `targetProperty` with null.
 * 
 * ## Error
 * If the data cannot be loaded then it will throw an Error.
 * 
 * ## Params
 * @param resourcePath the full path to the `.geo.json` file.
 */
async function geoJsonData(
    resourcePath: string, targetProperty: string
): Promise<FeatureCollection<Geometry, GeoJsonProperties>> {
    return d3.json<FeatureCollection>(resourcePath)
        .then(data => {
            if (data === undefined)
                throw Error("Could not load geojson data.");
            data.features.forEach(feature => {
                if (feature.properties) {
                    feature.properties[targetProperty] = NaN;
                }
            });
            return data;
        });
}

/**
 * An interface that describes the dataset as a map and array with column ids.
 */
interface Dataset {
    data: Map<number, Map<number, number>>,
    opts: number[],
};

/**
 * # Summary
 * `datasetData` loads a dataset file from the specified resource path. The `.csv` file is expected
 * to conform with the format `Id,year1,year2,...`. See the example:
 * 
 * ```csv
 * Id,1995,2000,2005,2010,2015,2017,2018,2019
 * 1,65.0,66.0,71.0,74.0,74.0,75.0,76.0,76.0
 * 100,116.0,97.0,107.0,100.0,108.0,110.0,111.0,110.0
 * ```
 * 
 * Not conforming to the structure is undefined.
 * 
 * ## Params
 * @param resourcePath location of the dataset files.
 * @param dataset is the stem of the dataset file name.
 */
async function datasetData(resourcePath: string, dataset: string): Promise<Dataset> {
    const fullPath = `${resourcePath}/${dataset}.csv`;
    return d3.csv(fullPath)
        .then(data => {
            const years = data.columns.slice(1);
            const map = data.reduce((map, obj) => {
                if (obj["Id"]) {
                    let data_points = new Map<number, number>();
                    years.forEach(year => data_points.set(parseInt(year), parseFloat(obj[year] as string) || NaN));
                    map.set(Number(obj['Id']), data_points);
                }
                return map;
            }, new Map<number, Map<number, number>>());
            return { data: map, opts: years.map(value => parseInt(value)) } as Dataset;
        });
}

interface CountryIdMap {
    country: Map<string, number>;
    id: Map<number, string>;
}

export { geoJsonData, datasetData };
export type { Dataset, CountryIdMap };
