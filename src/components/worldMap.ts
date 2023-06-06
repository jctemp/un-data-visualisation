import "./worldMap.css";

import * as d3 from "d3";

import { Feature, FeatureCollection, Geometry } from "geojson";
import { TARGET_PROPERTY } from "../constants";
import { CountryIds } from "../utils/dataset";
import { SingleValue } from "../utils/container";

export const MAP_LABEL_SUFFIX = new SingleValue<string>(" (unknown)");

function countryMouseOver(mouseEvent: MouseEvent, d: any) {
    d3.selectAll(".country")
        .transition()
        .duration(80)
        .style("opacity", ".2")
        .style("stroke-width", "0");

    // @ts-ignore cannot infer type
    d3.select(mouseEvent.currentTarget)
        .transition()
        .duration(80)
        .style("opacity", 1)
        .style("stroke-width", "1");

    const offsetY = ((mouseEvent.currentTarget as HTMLElement).parentNode?.parentNode?.parentNode as HTMLElement).offsetTop;
    const offsetX = ((mouseEvent.currentTarget as HTMLElement).parentNode?.parentNode?.parentNode as HTMLElement).offsetLeft;

    if (isNaN(d.properties.value) || d.properties.value === null || d.properties.value === undefined) return;
    d3.select(".tooltip")
        .style("left", mouseEvent.clientX + offsetX + 15 + "px")
        .style("top", mouseEvent.clientY - offsetY + scrollY - 28 + "px")
        .transition()
        .duration(500)
        .style("display", "block")
        .text(`${d.properties.name}: ${d.properties.value}${MAP_LABEL_SUFFIX.value}`);
}

function countryMouseLeave() {
    d3.selectAll(".country")
        .transition()
        .duration(240)
        .style("opacity", 1)
        .style("stroke-width", ".5");

    d3.select(".tooltip")
        .transition()
        .duration(500)
        .style("display", "none");
}

function countryMouseClick(_mouseEvent: MouseEvent, d: any) {
    if (d !== undefined && WorldMap.focus !== d) {
        WorldMap.focus = d;
        let centroid = WorldMap.pathGenerator.centroid(d);
        let x = centroid[0];
        let y = centroid[1];
        let k = 3;
        let translate = [
            WorldMap.container.clientWidth / 2 - k * x,
            WorldMap.container.clientHeight / 2 - k * y
        ];

        d3.select(`#${WorldMap.id}`)
            .select("g")
            .transition()
            .duration(750)
            .attr("transform", `translate(${translate})scale(${k})`);
    } else {
        WorldMap.focus = null;
        d3.select(`#${WorldMap.id}`)
            .select("g")
            .transition()
            .duration(750)
            .attr("transform", "");
    }
}

type Scale = d3.ScaleLinear<any, any> | d3.ScaleLogarithmic<any, any> | d3.ScaleThreshold<any, any>;

type GeoProperties = {
    id: string,
    [name: string]: any;
};

interface WorldMapParams {
    mapId: string,
    mapTooltipId: string,
    resourcePath: string,
    resource: string,
}

class WorldMap {
    /**
     * Loads the geo json data at the specified path and initialises a map with it. The function can
     * throw Errors!
     * @param resourcePath is the base path to the resource (here geo.json).
     * @param resource is the name of the world geo.json file.
     * @param property the value used by the map to color countries.
     */
    public static async init(params: WorldMapParams): Promise<WorldMap> {
        let data = await d3.json<FeatureCollection>(`${params.resourcePath}/${params.resource}.geo.json`)
            .then(data => {
                if (data === undefined) return null;
                data.features.forEach(feature => {
                    if (feature.properties) {
                        feature.properties.id = "-1";
                        feature.properties[TARGET_PROPERTY] = NaN;
                    }
                });
                return data.features as Feature<Geometry, GeoProperties>[];
            })
            .catch(_ => null);

        if (data == null) {
            console.warn("The world geo json is empty.");
            data = [] as Feature<Geometry, GeoProperties>[];
        }

        return new WorldMap(params.mapId, params.mapTooltipId, data);
    }

    /**
     * Updates the path elements in the d3 object.
     * @param scale is a function that maps values to a color value.
     */
    public updateChart() {
        d3.select(`#${WorldMap.id}`)
            .select("g")
            .selectAll("path")
            .data(this.data)

            .transition()
            .duration(500)
            .ease(d3.easeBackInOut)

            .attr("fill", feature => {
                if (Number.isNaN(feature.properties[TARGET_PROPERTY])) return "url(#unknown)";
                if (this.scale == null) return "url(#null)";
                return this.scale(feature.properties[TARGET_PROPERTY]);
            });
    }

    /**
     * Updates the target property of the countries.
     * @param values is a map that maps country ids to values.
     */
    public updateData(values: Map<string, number>) {
        this.data.forEach(country => {
            country.properties[TARGET_PROPERTY] = values.get(country.properties.id) || NaN;
        });
    }

    /**
     * Sets the id property of the geo data.
     * @param ids is a map that maps country names to ids.
     */
    public setCountryIds(ids: CountryIds) {
        this.data.forEach(feature => feature.properties.id = ids.map.get(feature.properties.name)?.[0] || "-1");
    }

    private constructor(id: string, tooltipId: string, data: Feature<Geometry, GeoProperties>[]) {
        WorldMap.id = id;
        WorldMap.container = document.getElementById(id)!;

        d3.select(`#${tooltipId}`)
            .classed("tooltip", true)
            .style("display", "none");

        // create background
        d3.select(`#${WorldMap.id}`)
            .append("rect")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("fill", "#ffffff")
            .on("click", countryMouseClick);

        this.data = data;

        const width = WorldMap.container.clientWidth;
        const height = WorldMap.container.clientHeight;

        WorldMap.pathGenerator = d3.geoPath();
        const projection = d3.geoNaturalEarth1()
            .scale(width / (2 * Math.PI))
            .translate([width / 2, height / 1.7])
        WorldMap.pathGenerator.projection(projection)

        const map = d3.select(`#${WorldMap.id}`)
            .append("g");

        const selection = map.selectAll("path")
            .data(this.data);

        selection.enter().append("path")
            .classed("country", true)
            .attr("d", WorldMap.pathGenerator)
            .attr("fill", _ => "url(#unknown)");

        new ResizeObserver(() => {
            const width = WorldMap.container.clientWidth;
            const height = WorldMap.container.clientHeight;
            const projection = d3.geoNaturalEarth1()
                .scale(width / (2 * Math.PI))
                .translate([width / 2, height / 1.7]);
            WorldMap.pathGenerator.projection(projection);

            d3.select(`#${WorldMap.id}`)
                .select("g")
                .selectAll("path")
                .data(this.data)
                // @ts-ignore cannot infer type
                .on("mouseover", countryMouseOver)
                .on("mouseleave", countryMouseLeave)
                .on("click", countryMouseClick)
                .attr("d", WorldMap.pathGenerator);
        }).observe(WorldMap.container);
    }

    static container: HTMLElement;
    static pathGenerator: d3.GeoPath<any, d3.GeoPermissibleObjects>;
    static focus: Feature<Geometry, GeoProperties> | null = null;
    static id: string;

    public data: Feature<Geometry, GeoProperties>[];
    public scale: Scale | null = null;
}

export { WorldMap };
export type { Scale, WorldMapParams };