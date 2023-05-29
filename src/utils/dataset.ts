import { json } from "d3";

interface DatasetRecord {
    id: string | undefined,
    [index: number]: number,
};

interface CountryIdRecord {
    id: string,
    name: string,
    continent: string,
};

interface Slice {
    labels: number[],
    values: number[],
};

interface Scaling {
    type: string,
    colourScheme: string,
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
                return data.reduce((map, pair) => map.set(pair.name, [pair.id, pair.continent]), new Map<string, [string, string]>());
            })
            .catch(_ => null);

        if (data == null) throw new Error("Cannot load id file.");
        return new CountryIds(data);
    }

    private constructor(map: Map<string, [string, string]>) {
        this.map = map;
    }

    map: Map<string, [string, string]>;
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
        let mins: number[] = [];
        let maxs: number[] = [];


        for (let year of this.years) {
            let min = Number.MAX_VALUE;
            let max = Number.MIN_VALUE;

            for (let country of this.data.values()) {
                let value = country.get(year);
                if (value === undefined) continue;

                if (value < min) min = value;
                if (value > max) max = value;
            }

            mins.push(min);
            maxs.push(max);
        }

        let avgMin = mins.reduce((a, b) => a + b, 0) / mins.length;
        let avgMax = maxs.reduce((a, b) => a + b, 0) / maxs.length;

        this.range = [avgMin, avgMax];
    }

    private constructor(data: Map<string, Map<number, number>>, years: number[], name: string) {
        this.data = data;
        this.years = years;
        this.name = name;

        // for every year in the dataset get the min and max value
        this.range = [0, 0];
        this.yearCurrent = this.years[0];

        this.scaling = COLOUR_MAPPING.get(name)!;
        this.scalingTypeCurrent = this.scaling.type;

        this.loadRanges();
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
    ["Arable land (percent of total land area)", { type: "Linear", colourScheme: "Mono", thresholdType: "", thresholds: [] }],
    ["Emissions per capita (metric tons of carbon dioxide)", { type: "Threshold", colourScheme: "Mono", thresholdType: "", thresholds: [] }],
    ["Forest cover (percent of total land area)", { type: "Threshold", colourScheme: "Mono", thresholdType: "", thresholds: [] }],
    ["Important sites for terrestrial biodiversity protected (percent of total sites protected)", { type: "Linear", colourScheme: "Mono", thresholdType: "", thresholds: [] }],
    ["Permanent crops (percent of total land area)", { type: "Logarithmic", colourScheme: "Mono", thresholdType: "Custom", thresholds: [1, 2, 4, 8, 10, Number.MAX_SAFE_INTEGER] }],

    ["Balance of Payments Current account (millions of US dollars)", { type: "Threshold", colourScheme: "Duo", thresholdType: "Custom", thresholds: [-3000, -1000, 0, 1000, 3000, Number.MAX_SAFE_INTEGER] }],
    ["Balance of Payments Financial account (millions of US dollars)", { type: "Threshold", colourScheme: "Duo", thresholdType: "Custom", thresholds: [-10000, -500, 0, 500, 10000, Number.MAX_SAFE_INTEGER] }],
    ["GDP per capita (US dollars)", { type: "Threshold", colourScheme: "Mono", thresholdType: "Logarithmic", thresholds: [] }],
    ["GDP real rates of growth (percent)", { type: "Threshold", colourScheme: "Duo", thresholdType: "Linear", thresholds: [] }],
    ["Grants of patents (number)", { type: "Logarithmic", colourScheme: "Mono", thresholdType: "Custom", thresholds: [50, 2000, 8000, 25000, 50000, Number.MAX_SAFE_INTEGER] }],

    ["Infant mortality for both sexes (per 1,000 live births)", { type: "Threshold", colourScheme: "Mono", thresholdType: "Custom", thresholds: [5, 10, 20, 40, 80, Number.MAX_SAFE_INTEGER] }],
    ["Life expectancy at birth for both sexes (years)", { type: "Threshold", colourScheme: "Mono", thresholdType: "Custom", thresholds: [60, 65, 70, 75, 80, Number.MAX_SAFE_INTEGER] }],
    ["Percentage of individuals using the internet", { type: "Logarithmic", colourScheme: "Mono", thresholdType: "", thresholds: [] }],
    ["Population aged 0 to 14 years old (percentage)", { type: "Linear", colourScheme: "Mono", thresholdType: "", thresholds: [] }],
    ["Population aged 60+ years old (percentage)", { type: "Linear", colourScheme: "Mono", thresholdType: "", thresholds: [] }],
    ["Population annual rate of increase (percent)", { type: "Threshold", colourScheme: "Duo", thresholdType: "Custom", thresholds: [-2, -1, 0, 2, 4, Number.MAX_SAFE_INTEGER] }],
    ["Population density", { type: "Threshold", colourScheme: "Mono", thresholdType: "Custom", thresholds: [10, 50, 100, 200, 400, Number.MAX_SAFE_INTEGER] }],
    ["Population mid-year estimates (millions)", { type: "Threshold", colourScheme: "Mono", thresholdType: "Custom", thresholds: [1, 10, 100, 200, 500, Number.MAX_SAFE_INTEGER] }],
]);

export { Dataset, CountryIds };