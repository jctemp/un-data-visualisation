import { json } from "d3";

interface Dataset {
    data: Map<string, Map<number, number>>,
    years: number[],
};

interface Record {
    id: string | undefined,
    [index: number]: number,
};

/**
 * `loadDataset` loads a json file and converts the data to a `Dataset`. It saves the data as
 * a map. The options are extracted and saved to a years attribute. The json file is expected 
 * to have a certain scheme.
 * 
 * ```json
 * [{"id":"100","2015":6.1,"2017":6.0,"2018":5.6,"2019":5.5},...]
 * ```
 * 
 * @param resourcePath is the base URI base path.
 * @param filename is the name of the file at the URI base path.
 */
async function loadDataset(resourcePath: string, filename: string): Promise<Dataset | null> {
    return (json(`${resourcePath}/${filename}`) as Promise<Record[]>)
        .then(data => {
            const years = Object.keys(data[0]).filter(v => v !== "id").map(v => Number(v));
            return {
                data: data.reduce((map, record) => {
                    const id = record["id"]!;
                    delete record["id"];

                    const values = Object.keys(record)
                        .map(v => Number(v))
                        .reduce((map, value) => map.set(value, record[value] || NaN), new Map<number, number>());

                    return map.set(id, values);
                }, new Map<string, Map<number, number>>()),
                years: years,
            };
        })
        .catch(_ => null);
} 

type YearSlice = Map<string, number>;

/**
 * Filters the dataset by year. The functions iterates over all records and provides `YearSlice` that maps
 * country ids to a singular value.
 * @param year is a value provided in the `Dataset` type.
 */
function datasetByYear(dataset: Dataset, year: string): YearSlice | null {
    if (dataset.years.findIndex(value => value === Number(year)) == -1) return null;
    return Array.from(dataset.data.entries())
        .map(tuple => ({ id: tuple[0], values: tuple[1].get(Number(year))! }))
        .reduce((map, objectSlice) => map.set(objectSlice.id, objectSlice.values),
            new Map<string, number>());
}

interface IdSlice { labels: number[], values: number[] };

/**
 * Filters the dataset by year. It transforms the data into an `IdSlice` that provides two attributes. A
 * corresponding x/y axes philosophy, where `labels` is the x-axis and `values` the y-axis.
 * @param id is the UN ID code representation.
 */
function datasetById(dataset: Dataset, id: string): IdSlice | null {
    const country = dataset.data.get(id);
    if (country === undefined) return null;
    return {
        labels: Array.from(country.keys()),
        values: Array.from(country.values()),
    };
}

export default loadDataset;
export { datasetByYear, datasetById };
export type { YearSlice, IdSlice };