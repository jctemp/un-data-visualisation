import * as d3 from "d3";
import { Feature, FeatureCollection, GeoJsonProperties, Geometry } from "geojson";

interface AtlasSVG {
    HTML: HTMLElement,
    D3: d3.Selection<d3.BaseType, unknown, HTMLElement, any>,
}

interface AtlasSettings {
    pathGenerator: d3.GeoPath<any, d3.GeoPermissibleObjects>,
    colorScale: d3.ScaleLogarithmic<any, any>
    | d3.ScalePower<any, any>
    | d3.ScaleLinear<any, any>
    | d3.ScaleThreshold<any, any>,
    property: string,
}

type AtlasGeoData = FeatureCollection<Geometry, GeoJsonProperties>;

class Atlas {
    constructor(domElementId: string, settings: AtlasSettings | null) {
        const HTML = document.getElementById(domElementId);
        if (HTML === null)
            throw Error(`domElement with the id "${domElementId}" does not exist.`);
        const D3 = d3.select(`#${domElementId}`);
        D3.append("g");
        this.svg = { HTML, D3 };
        this.settings = settings;
    }

    update(data: AtlasGeoData) {
        const selection = this.svg.D3.select("g")
            .selectAll("path")
            .data(data.features);

        if (this.settings === null) {
            console.warn("Cannot update without settings");
            return;
        }

        selection.join(
            enter => enter
                .append("path")
                .classed("country", true)
                .style("opacity", 1)
                .style("stroke-width", ".05vh")
                // @ts-ignore expects null but sets callback
                .on("mouseover", this.countryMouseOver)
                // @ts-ignore expects null but sets callback
                .on("mouseleave", this.countryMouseLeave)

                .attr("d", this.settings!.pathGenerator)
                // @ts-ignore cannot infer type
                .attr("fill", feature => {
                    return this.transform(feature, this.settings!)
                }),
            update => update
                .attr("d", this.settings!.pathGenerator)
                // @ts-ignore cannot infer type
                .attr("fill", feature => {
                    return this.transform(feature, this.settings!)
                }),
            exit => exit
                .exit()
                .remove()
        )
    }

    private transform(
        feature: Feature<Geometry, GeoJsonProperties>, settings: AtlasSettings
    ): string | undefined {
        if (feature.properties) {
            if (Number.isNaN(feature.properties[settings.property])) return "#333"
            return settings.colorScale(feature.properties[settings.property])
        }
    }

    private countryMouseOver(d: MouseEvent) {
        d3.selectAll(".country")
            .transition()
            .duration(80)
            .style("opacity", ".2")
            .style("stroke-width", ".0")

        // @ts-ignore cannot infer type
        d3.select(d.target)
            .transition()
            .duration(80)
            .style("opacity", 1)
            .style("stroke-width", ".12vh")
    }

    private countryMouseLeave() {
        d3.selectAll(".country")
            .transition()
            .duration(240)
            .style("opacity", 1)
            .style("stroke-width", ".05vh")
    }

    svg: AtlasSVG;
    settings: AtlasSettings | null;
}



export { Atlas };