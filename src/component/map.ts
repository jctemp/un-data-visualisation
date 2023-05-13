import { Feature, Geometry } from "geojson";
import { GeoProperties } from "../data/geo";
import * as d3 from "d3";

import "./map.css"

function countryMouseOver(d: MouseEvent) {
    d3.selectAll(".country")
        .transition()
        .duration(80)
        .style("opacity", ".2")
        .style("stroke-width", "0")

    // @ts-ignore cannot infer type
    d3.select(d.target)
        .transition()
        .duration(80)
        .style("opacity", 1)
        .style("stroke-width", "1")
}

function countryMouseLeave() {
    d3.selectAll(".country")
        .transition()
        .duration(240)
        .style("opacity", 1)
        .style("stroke-width", ".5")
}

function create(id: string, data: Feature<Geometry, GeoProperties>[]) {
    const container = document.getElementById(id);
    if (container == null) throw Error("The map container does not exists.");

    const width = container.clientWidth;
    const height = container.clientHeight;

    const pathGenerator = d3.geoPath();
    const projection = d3.geoNaturalEarth1()
        .scale(width / (2 * Math.PI))
        .translate([width / 2, height / 1.7])
    pathGenerator.projection(projection)

    const map = d3.select(`#${id}`)
        .append("g");

    const selection = map.selectAll("path")
        .data(data);

    selection.enter().append("path")
        .classed("country", true)
        .attr("d", pathGenerator)
        .attr("fill", _ => "url(#unknown)");

    new ResizeObserver(() => {
        const width = container.clientWidth;
        const height = container.clientHeight;
        const projection = d3.geoNaturalEarth1()
            .scale(width / (2 * Math.PI))
            .translate([width / 2, height / 1.7])
        pathGenerator.projection(projection);

        d3.select(`#${id}`)
            .select("g")
            .selectAll("path")
            .data(data)
            // @ts-ignore cannot infer type
            .on("mouseover", countryMouseOver)
            .on("mouseleave", countryMouseLeave)
            .attr("d", pathGenerator);
    }).observe(container);
}

type Scale = d3.ScaleLinear<any, any> | d3.ScaleLogarithmic<any, any>;
function update(id: string, data: Feature<Geometry, GeoProperties>[], scale: Scale) {
    d3.select(`#${id}`)
        .select("g")
        .selectAll("path")
        .data(data)

        .transition()
        .duration(500)
        .ease(d3.easeBackInOut)
        
        .attr("fill", feature => !Number.isNaN(feature.properties["value"]) ?
            scale(feature.properties["value"]) : "url(#unknown)")
        .call(() => console.log("UPDATE"));
}

export { create, update };