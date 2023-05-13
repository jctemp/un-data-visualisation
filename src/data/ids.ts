import { json } from "d3";

type Entry = { id: string, name: string };

/**
 * `loadCountryIds` loads a json file and converts the data to a map, making a mapping from
 * country ids to their names. The json file is expected to have a certain scheme. It is a
 * file with an array containing objects that contain the Id and Name of the country.
 * 
 * ```json
 * [{"id":360,"name":"Indonesia"},...]
 * ```
 * 
 * @param resourcePath is the base URI base path.
 * @param filename is the name of the file at the URI base path.
 */
async function loadCountryIds(resourcePath: string, filename: string): Promise<Map<string, string> | null> {
    return (json(`${resourcePath}/${filename}`) as Promise<Entry[]>)
        .then(data => data.reduce((map, pair) => map.set(pair.name, pair.id), new Map<string, string>()))
        .catch(_ => null);
}

export default loadCountryIds;