import { json } from "d3";
import { Feature, FeatureCollection, Geometry } from "geojson";

type GeoProperties = {
    geo_id: string,
    [name: string]: any;
};

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
async function load(
    resourcePath: string,
    filename: string,
    targetProperty: string,
): Promise<Feature<Geometry, GeoProperties>[] | null> {
    return json<FeatureCollection>(`${resourcePath}/${filename}`)
        .then(data => {
            if (data === undefined) return null;
            data.features.forEach(feature => {
                if (feature.properties) {
                    feature.properties.geo_id = "-1";
                    feature.properties[targetProperty] = NaN;
                }
            });
            return data.features as Feature<Geometry, GeoProperties>[];
        })
        .catch(_ => null);
}

function update(
    data: Feature<Geometry, GeoProperties>[],
    values: Map<string, number>,
    targetProperty: string,
): [number, number] {
    let min = Number.MAX_VALUE, max = Number.MIN_VALUE;
    data.forEach(country => {
        country.properties[targetProperty] = values.get(country.properties.geo_id) || NaN;
        min = country.properties[targetProperty] < min ? country.properties[targetProperty] : min;
        max = country.properties[targetProperty] > max ? country.properties[targetProperty] : max;
    });
    return [min, max];
}

export { load, update };
export type { GeoProperties }