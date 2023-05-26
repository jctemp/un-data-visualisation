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

interface Scaling {
    type: string,
    colorScheme: string,
    thresholdType: string,
    thresholds: number[];
}

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
                this.yearCurrent = this.years[0];
                this.scaling = COLOUR_MAPPING.get(this.name)!;
                this.scalingTypeCurrent = this.scaling.type;
                this.loadRanges();
            });
    }


    /**
     * Filters the dataset by year. The functions iterates over all records and provides `YearSlice` that maps
     * country ids to a singular value.
     * @param year is a value provided in the `Dataset` type.
     */
    public byYear(year: number): Map<string, number> | null {
        if (this.years.findIndex(value => value === year) == -1) return null;
        return Array.from(this.data.entries())
            .map(tuple => ({ id: tuple[0], values: tuple[1].get(year)! }))
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

    private loadRanges() {
        // determine standard deviation
        const values = Array.from(this.data.values())
            .map(country => Array.from(country.values()))
            .reduce((array, value) => array.concat(value), [])
            .filter(value => !isNaN(value));
        const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
        const std = Math.sqrt(values.map(value => Math.pow(value - mean, 2))
            .reduce((sum, value) => sum + value, 0) / values.length);

        // get min and max value
        const min = values.reduce((min, value) => Math.min(min, value), Number.MAX_VALUE);
        const max = values.reduce((max, value) => Math.max(max, value), Number.MIN_VALUE);

        // set range
        const c = mean * .5;

        let clampedMin = Math.max(min, mean - c * std);
        let clampedMax = Math.min(max, mean + c * std);

        if (clampedMin > clampedMax) {
            let tmp = clampedMin;
            clampedMin = clampedMax;
            clampedMax = tmp;
        }

        this.range = [clampedMin, clampedMax];
    }

    private constructor(data: Map<string, Map<number, number>>, years: number[], name: string) {
        this.data = data;
        this.years = years;
        this.name = name;

        // for every year in the dataset get the min and max value
        this.range = [0, 0];
        this.loadRanges();
        this.yearCurrent = this.years[0];

        this.scaling = COLOUR_MAPPING.get(name)!;
        this.scalingTypeCurrent = this.scaling.type;
    }

    public name: string;
    public data: Map<string, Map<number, number>>;
    public range: [number, number];

    public years: number[];
    public yearCurrent: number;

    public scaling: Scaling;
    public scalingTypeCurrent: string;
}

const COLOUR_MAPPING = new Map<string, Scaling>([
    ["Arable land (percent of total land area)", { type: "Linear", colorScheme: "Mono", thresholdType: "", thresholds: [] }],
    ["Emissions per capita (metric tons of carbon dioxide)", { type: "Logarithmic", colorScheme: "Mono", thresholdType: "", thresholds: [] }],
    ["Forest cover (percent of total land area)", { type: "Threshold", colorScheme: "Mono", thresholdType: "", thresholds: [] }],
    ["Important sites for terrestrial biodiversity protected (percent of total sites protected)", { type: "Linear", colorScheme: "Mono", thresholdType: "", thresholds: [] }],
    ["Permanent crops (percent of total land area)", { type: "Logarithmic", colorScheme: "Mono", thresholdType: "", thresholds: [] }],

    ["Balance of Payments Current account (millions of US dollars)", { type: "Threshold", colorScheme: "Duo", thresholdType: "Custom", thresholds: [-6000, -3000, 0, 1000, 3000, Number.MAX_SAFE_INTEGER] }],
    ["Balance of Payments Financial account (millions of US dollars)", { type: "Threshold", colorScheme: "Duo", thresholdType: "Custom", thresholds: [-10000, -5000, 0, 1000, 3000, Number.MAX_SAFE_INTEGER] }],
    ["GDP per capita (US dollars)", { type: "Threshold", colorScheme: "Mono", thresholdType: "Logarithmic", thresholds: [] }],
    ["GDP real rates of growth (percent)", { type: "Threshold", colorScheme: "Duo", thresholdType: "Linear", thresholds: [] }],
    ["Grants of patents (number)", { type: "Logarithmic", colorScheme: "Mono", thresholdType: "Custom", thresholds: [50, 2000, 8000, 25000, 50000, Number.MAX_SAFE_INTEGER] }],

    ["Infant mortality for both sexes (per 1,000 live births)", { type: "Threshold", colorScheme: "Mono", thresholdType: "Custom", thresholds: [5, 10, 20, 40, 80, Number.MAX_SAFE_INTEGER] }],
    ["Life expectancy at birth for both sexes (years)", { type: "Threshold", colorScheme: "Mono", thresholdType: "Custom", thresholds: [60, 65, 70, 75, 80, Number.MAX_SAFE_INTEGER] }],
    ["Percentage of individuals using the internet", { type: "Logarithmic", colorScheme: "Mono", thresholdType: "Custom", thresholds: [] }],
    ["Population aged 0 to 14 years old (percentage)", { type: "Linear", colorScheme: "Mono", thresholdType: "", thresholds: [] }],
    ["Population aged 60+ years old (percentage)", { type: "Linear", colorScheme: "Mono", thresholdType: "", thresholds: [] }],
    ["Population annual rate of increase (percent)", { type: "Threshold", colorScheme: "Duo", thresholdType: "Custom", thresholds: [-2, -1, 0, 2, 4, Number.MAX_SAFE_INTEGER] }],
    ["Population density", { type: "Logarithmic", colorScheme: "Mono", thresholdType: "", thresholds: [] }],
    ["Population mid-year estimates (millions)", { type: "Threshold", colorScheme: "Mono", thresholdType: "Logarithmic", thresholds: [] }],
]);

export { Dataset, CountryIds };