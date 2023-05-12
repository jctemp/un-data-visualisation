import * as d3 from "d3";

type Entry = { Id: number, Name: string };
const countryIds = await (d3.json("/data/datasets/Country Ids.json") as Promise<Entry[]>)
    .then(data => new Map<number, string>(data.map(entry => [entry.Id, entry.Name])));

console.log(countryIds);
