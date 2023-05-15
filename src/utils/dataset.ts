import { json } from "d3";

interface DatasetRecord {
    id: string | undefined,
    [index: number]: number,
};

interface CountryIdRecord {
    id: string,
    name: string
};

interface Slice {
    labels: number[],
    values: number[],
};

/**
 * The CountryIds class provides a wrapper for the country ids. It provides a function to set the
 * id property of the geo data.
 */
class CountryIds {

    /**
     * Loads the country ids from the specified path and initialises a map with it. The function can
     * throw Errors!
     * @param resourcePath is the base path to the resource (here geo.json).
     * @param resource is the name of the world geo.json file.
     */
    public static async init(resourcePath: string, resource: string): Promise<CountryIds> {
        let data = await json<CountryIdRecord[]>(`${resourcePath}/${resource}.json`)
            .then(data => {
                if (data === undefined) return null;
                return data.reduce((map, pair) => map.set(pair.name, pair.id), new Map<string, string>());
            })
            .catch(_ => null);

        if (data == null) throw new Error("Cannot load id file.");
        return new CountryIds(data);
    }

    private constructor(map: Map<string, string>) {
        this.map = map;
    }

    map: Map<string, string>;
}

/**
 * The dataset class provides a wrapper for the dataset. It provides functions to filter the data
 * by year and country id. The data is stored as a map that maps country ids to a map that maps years
 * to a value.
 */
class Dataset {
    /**
     * The function loads datasets and assigns it to the object. It saves the data as
     * a map. The options are extracted and saved to a years attribute. The json file is expected 
     * to have a certain scheme.
     * 
     * ```json
     * [{"id":"100","2015":6.1,"2017":6.0,"2018":5.6,"2019":5.5},...]
     * ```
     * 
     * @param resourcePath is the base path to the resource (here geo.json).
     * @param resource is the name of the world geo.json file.
     */
    public static async init(resourcePath: string, resource: string): Promise<Dataset> {
        let data = await json<DatasetRecord[]>(`${resourcePath}/${resource}.json`)
            .then(data => {
                if (data === undefined) return null;
                const years = Object.keys(data[0]).filter(v => v !== "id").map(v => Number(v));
                const dataset = data.reduce((map, record) => {
                    const id = record["id"]!;
                    delete record["id"];

                    const values = Object.keys(record)
                        .map(v => Number(v))
                        .reduce((map, value) => map.set(value, record[value] || NaN), new Map<number, number>());

                    return map.set(id, values);
                }, new Map<string, Map<number, number>>());
                return new Dataset(dataset, years, resource);
            })
            .catch(_ => null);

        if (data == null) throw new Error("Cannot load dataset.");
        return data;
    }

    public async load(resourcePath: string, resource: string) {
        await json<DatasetRecord[]>(`${resourcePath}/${resource}.json`)
            .then(data => {
                if (data === undefined) return null;

                const years = Object.keys(data[0]).filter(v => v !== "id").map(v => Number(v));
                const dataset = data.reduce((map, record) => {
                    const id = record["id"]!;
                    delete record["id"];

                    const values = Object.keys(record)
                        .map(v => Number(v))
                        .reduce((map, value) => map.set(value, record[value] || NaN), new Map<number, number>());

                    return map.set(id, values);
                }, new Map<string, Map<number, number>>());

                this.data = dataset != null ? dataset : new Map<string, Map<number, number>>();
                this.years = years != null ? years : [];
                this.name = resource;
            });
    }


    /**
     * Filters the dataset by year. The functions iterates over all records and provides `YearSlice` that maps
     * country ids to a singular value.
     * @param year is a value provided in the `Dataset` type.
     */
    public byYear(year: string): Map<string, number> | null {
        if (this.years.findIndex(value => value === Number(year)) == -1) return null;
        return Array.from(this.data.entries())
            .map(tuple => ({ id: tuple[0], values: tuple[1].get(Number(year))! }))
            .reduce((map, objectSlice) => map.set(objectSlice.id, objectSlice.values),
                new Map<string, number>());
    }

    /**
     * Filters the dataset by year. It transforms the data into an `IdSlice` that provides two attributes. A
     * corresponding x/y axes philosophy, where `labels` is the x-axis and `values` the y-axis.
     * @param id is the UN ID code representation.
     */
    public byId(id: string): Slice | null {
        const country = this.data.get(id);
        if (country === undefined) return null;
        return {
            labels: Array.from(country.keys()),
            values: Array.from(country.values()),
        };
    }

    private constructor(data: Map<string, Map<number, number>>, years: number[], name: string) {
        this.data = data;
        this.years = years;
        this.name = name;
    }

    public name: string;
    public data: Map<string, Map<number, number>>;
    public years: number[];
}

export { Dataset, CountryIds };