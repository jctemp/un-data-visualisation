import * as d3 from "d3";

interface Dataset {
    data: Entry[],
    years: string[],
};

type Entry = { id: number };
const ds = await (d3.json("/data/datasets/ecology/Arable land (percent of total land area).json") as Promise<Entry[]>)
    .then(data => ({ data, years: Object.keys(data[0]).filter(value => value !== "Id") } as Dataset));

console.log(ds);
