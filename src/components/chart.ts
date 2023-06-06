import "./chart.css";

import { Dataset } from "../utils/dataset";
import Chart from 'chart.js/auto';
import { inverseSymmetricLogarithm, symmetricLogarithm } from "../utils/scaling";
import { SingleValue } from "../utils/container";
import annotationPlugin from 'chartjs-plugin-annotation';
import { PCA } from "ml-pca";
import { SVD, covariance } from "ml-matrix";

Chart.register(annotationPlugin);

class Converter {
    constructor(countryMapping: Map<string, string>, continentMapping: Map<string, string>) {
        this.countryMapping = countryMapping;
        this.continentMapping = continentMapping;
    }

    toChartDataset(ds: Dataset, year: number, limit: number = -1): ChartDataset<number, string> {
        let data = ds.byYear(year);

        if (data === null) {
            return {
                name: ds.name,
                labels: [],
                data: [],
            };
        }

        let working = Array.from(data.entries());
        working = working.filter(a => !isNaN(a[1]));
        working.sort((a, b) => b[1] - a[1]);
        if (limit > 0) working = working.slice(0, limit);
        data = new Map(working);

        return {
            name: ds.name,
            labels: Array.from(data.keys()).map(id => this.countryMapping.get(id)!),
            data: Array.from(data.values()),
        };
    }

    toChartDatasetScatter(ds1: Dataset, ds2: Dataset, year: number): ChartDataset<[number, number], [string, string]> {
        let yearIndex = ds1.years.findIndex(a => a === year);
        let yearIndex2 = ds2.years.findIndex(a => a === year);

        if (yearIndex === -1) {
            yearIndex = ds1.years.length - 1;
            yearIndex2 = ds2.years.length - 1;
        }

        let data1 = ds1.byYear(ds1.years[yearIndex]);
        let data2 = ds2.byYear(ds2.years[yearIndex2]);

        if (data1 === null || data2 === null) {
            return {
                name: [ds1.name, ds2.name],
                labels: [],
                data: [],
            };
        }

        let data = new Map<string, [number, number]>();
        for (let [id, value] of data1) {
            if (isNaN(value)) continue;
            let value2 = data2.get(id);
            if (value2 === undefined || isNaN(value2)) continue;
            data.set(id, [value, value2]);
        }

        return {
            name: [ds1.name, ds2.name],
            labels: Array.from(data.keys()).map(id => this.countryMapping.get(id)!),
            data: Array.from(data.values()),
            region: Array.from(data.keys()).map(id => this.continentMapping.get(id)!),
            scaleType: [ds1.scaling.colourScheme, ds2.scaling.colourScheme],
        };
    }


    countryMapping: Map<string, string>;
    continentMapping: Map<string, string>;
}

interface ChartDataset<T, R> {
    name: R,
    labels: string[],
    data: T[],
    scaleType?: [string, string],
    region?: string[],
}

export const CHART_A_LABEL_SUFFIX = new SingleValue<string>(" (unknown)");
export const CHART_B_LABEL_SUFFIX = new SingleValue<string>(" (unknown)");

class BarChart {
    constructor(elementId: string) {
        let html = document.getElementById(elementId) as HTMLCanvasElement | null;
        if (html === null) throw new Error("Could not find ranking canvas");

        this.chart = new Chart(html, {
            type: "bar",
            data: {
                labels: [],
                datasets: []
            },
            options: {
                plugins: {
                    legend: {
                        display: false
                    }
                },
                responsive: true,
                maintainAspectRatio: false,
            }
        });

    }

    public update(ds: ChartDataset<number, string>, scaleType: string, colour: string[], thresholds: number[]) {
        this.ds = ds;
        this.chart.data.labels = ds.labels;

        let working = Array.from(ds.data.entries());
        working = working.filter(a => !isNaN(a[1]));
        working = working.sort((a, b) => b[1] - a[1]);
        working = working.slice(0, this.chart.data.labels.length);

        if (scaleType === "Logarithmic" || scaleType === "Threshold") {
            working = working.map(a => {
                return [a[0], symmetricLogarithm(a[1])]
            })
            thresholds = thresholds.map(a => {
                return symmetricLogarithm(a);
            })
        }

        // for each value, find the threshold it belongs to
        let colours = working.map(a => {
            let index = thresholds.findIndex(b => a[1] < b);
            if (index === -1) index = thresholds.length - 1;
            return colour[index];
        });

        this.chart.options.plugins!.title = {
            display: true,
            text: ds.name
        };

        this.chart.data.datasets = [{
            label: ds.name,
            data: working.map(a => a[1]),
            backgroundColor: colours,
            borderWidth: 1,
            // @ts-ignore
            tooltip: {
                callbacks: {
                    label: (context: { parsed: { y: number; }; label: any; }) => {
                        let index = this.ds?.labels.findIndex(a => a === context.label);
                        if (index === undefined || index === -1) return "";
                        let value = this.ds?.data[index];
                        return `${value?.toFixed(1)}${CHART_A_LABEL_SUFFIX.value}`;
                    }
                }
            }
        }];

        if (scaleType === "Logarithmic" || scaleType === "Threshold") {
            this.chart.options.scales = {
                y: {
                    ticks: {
                        callback: (value, _index, _values) => {
                            return inverseSymmetricLogarithm(Number(value)).toFixed(1);
                        }
                    }
                }
            }
        } else {
            this.chart.options.scales = {
                y: {
                    ticks: {
                        callback: (value, _index, _values) => {
                            return Number(value).toFixed(1);
                        }
                    }
                }
            }
        }

        this.chart.update();
    }

    ds: ChartDataset<number, string> | null = null;
    chart: Chart<"bar", number[], string>;
}

class ScatterChart {
    constructor(elementId: string, colourScheme: { [key: string]: string; }) {
        let html = document.getElementById(elementId) as HTMLCanvasElement | null;
        if (html === null) throw new Error("Could not find ranking canvas");

        this.colourScheme = JSON.parse(JSON.stringify(colourScheme));

        this.chart = new Chart(html, {
            type: "scatter",
            data: {
                labels: [],
                datasets: []
            },
            options: {
                plugins: {
                    legend: {
                        display: false,
                    }
                },
                responsive: true,
                maintainAspectRatio: false,
            },
        });
    }

    public update(ds: ChartDataset<[number, number], [string, string]>, scaleType: [string, string]) {
        const [scaleTypeDsX, scaleTypeDsY] = scaleType;
        this.ds = ds;

        let working = Array.from(ds.data.entries());
        working = working.filter(a => !isNaN(a[1][0]) && !isNaN(a[1][1]));

        if (scaleTypeDsX === "Logarithmic" || scaleTypeDsX === "Threshold") {
            working = working.map(a => {
                return [a[0], [symmetricLogarithm(a[1][0]), a[1][1]]]
            });
        }

        if (scaleTypeDsY === "Logarithmic" || scaleTypeDsY === "Threshold") {
            working = working.map(a => {
                return [a[0], [a[1][0], symmetricLogarithm(a[1][1])]]
            });
        }

        // create matrix for each region
        let regions = new Set<string>();
        for (let i = 0; i < working.length; i++) {
            regions.add(ds.region?.[working[i][0]] ?? "Unknown");
        }

        // create matrix for each region
        let matrices: [number, number][][] = [];
        for (let region of regions) {
            let matrix = working.filter(a => ds.region?.[a[0]] === region).map(a => a[1]);
            matrices.push(matrix);
        }

        // calculate the PCA for each region
        let pcas: { [key: string]: PCA } = {};
        for (let i = 0; i < regions.size; i++) {
            let result = new PCA(matrices[i], { center: true });
            pcas[Array.from(regions)[i]] = result;
        }

        let svds: { [key: string]: SVD } = {};
        for (let i = 0; i < regions.size; i++) {
            let result = new SVD(covariance(matrices[i]), { computeLeftSingularVectors: true, computeRightSingularVectors: true });
            svds[Array.from(regions)[i]] = result;
        }

        // create ellipses for each region
        let ellipses: [number, number, number, number, number][] = [];
        for (let i = 0; i < regions.size; i++) {
            let pca = pcas[Array.from(regions)[i]];
            let svd = svds[Array.from(regions)[i]];

            // get eigenvalues and eigenvectors
            let eigenvectors = pca.getEigenvectors();
            let eigenvalues = pca.getEigenvalues();

            eigenvectors = svd.rightSingularVectors;
            eigenvalues = svd.diagonal;

            // get means
            let means = pca.toJSON().means;

            // compute the angle
            let angle = Math.atan2(eigenvectors.get(1, 0), eigenvectors.get(0, 0));
            if (angle < 0) angle += 2 * Math.PI;

            // generate points on the ellipse
            let points: [number, number][] = [];
            const numberOfPoints = 100;
            const chisquare = 1.6449;
            for (let i = 0; i < numberOfPoints; i++) {
                let theta = i / numberOfPoints * 2 * Math.PI;

                let x = Math.cos(theta) * Math.sqrt(eigenvalues[0]) * chisquare + means[0];
                let y = Math.sin(theta) * Math.sqrt(eigenvalues[1]) * chisquare + means[1];

                points.push([x, y]);
            }

            // compute the min and max values for the x and y axis
            let xMin = Math.min(...points.map(a => a[0]));
            let xMax = Math.max(...points.map(a => a[0]));
            let yMin = Math.min(...points.map(a => a[1]));
            let yMax = Math.max(...points.map(a => a[1]));

            if (xMax - xMin < 0.001) {
                xMax += 0.01;
                xMin -= 0.01;
            }

            if (yMax - yMin < .001) {
                yMax += 0.1;
                yMin -= 0.1;
            }

            ellipses.push([angle, xMin, xMax, yMin, yMax]);
        }

        // make colour scheme transparent
        const transparentColourScheme = JSON.parse(JSON.stringify(this.colourScheme));
        for (let key in transparentColourScheme) {
            transparentColourScheme[key] = transparentColourScheme[key] + "30";
        }

        this.chart.data.labels = ds.labels;

        this.chart.options.plugins = {
            legend: {
                display: false,
            },
            annotation: {
                annotations: {
                    ...ellipses.map((a, i) => {
                        return {
                            type: "ellipse",
                            xMin: a[1],
                            xMax: a[2],
                            yMin: a[3],
                            yMax: a[4],
                            backgroundColor: transparentColourScheme[Array.from(regions)[i]] ?? "#000000",
                            borderColor: "#000000",
                            borderWidth: 1,
                            rotation: 180 * a[0] / Math.PI,
                        }
                    }),

                },
            }
        },

            this.chart.data.datasets = [{
                data: working.map(a => a[1]),
                borderWidth: 1,
                backgroundColor: ds.region?.map(a => this.colourScheme[a] ?? "#000000") ?? "#000000",
                borderColor: "#000000",
                // @ts-ignore
                tooltip: {
                    callbacks: {
                        label: (context: {
                            parsed: { x: number, y: number }; label: any;
                        }) => {
                            const label = context.label;

                            let x = context.parsed.x;
                            if (scaleTypeDsX === "Logarithmic" || scaleTypeDsX === "Threshold") {
                                x = inverseSymmetricLogarithm(x);
                            }

                            let y = context.parsed.y;
                            if (scaleTypeDsY === "Logarithmic" || scaleTypeDsY === "Threshold") {
                                y = inverseSymmetricLogarithm(y);
                            }

                            const values = `(${x.toFixed(1)}${CHART_A_LABEL_SUFFIX.value}, ${y.toFixed(1)}${CHART_B_LABEL_SUFFIX.value})`;
                            return `${label}: ${values}`;
                        }
                    }
                }
            }];

        let xMin = Math.min(...working.map(a => a[1][0]));
        let xMax = Math.max(...working.map(a => a[1][0]));

        let yMin = Math.min(...working.map(a => a[1][1]));
        let yMax = Math.max(...working.map(a => a[1][1]));

        let xRange = Math.max(Math.abs(xMin), Math.abs(xMax));
        let yRange = Math.max(Math.abs(yMin), Math.abs(yMax));

        let scales = {
            x: {
                min: ds.scaleType![0] === "Mono" && xMin > 10 ? 0 : xMin - xRange * 0.01,
                max: xMax + xRange * 0.01,
                title: {
                    display: true,
                    text: ds.name[0]
                },
                ticks: {
                    // @ts-ignore
                    callback: (value, _index, _values) => {
                        return Number(value).toFixed(1);
                    }
                },
            }, y: {
                min: ds.scaleType![1] === "Mono" && yMin > 10 ? 0 : yMin - yRange * 0.01,
                max: yMax + yRange * 0.01,
                title: {
                    display: true,
                    text: ds.name[1]
                },
                ticks: {
                    // @ts-ignore
                    callback: (value, _index, _values) => {
                        return Number(value).toFixed(1);
                    }
                }
            }
        };

        if (scaleTypeDsX === "Logarithmic" || scaleTypeDsX === "Threshold") {
            scales.x.ticks = {
                callback: (value, _index, _values) => {
                    return inverseSymmetricLogarithm(Number(value)).toFixed(1);
                }
            }
        }

        if (scaleTypeDsY === "Logarithmic" || scaleTypeDsY === "Threshold") {
            scales.y.ticks = {
                callback: (value, _index, _values) => {
                    return inverseSymmetricLogarithm(Number(value)).toFixed(1);
                }
            }
        }

        this.chart.options.scales = scales;
        this.chart.update();
    }

    public updateDotSize(size: number) {
        this.chart.data.datasets[0].pointRadius = size;
        this.chart.update();
    }

    public updateColourScheme(colourScheme: string[]) {
        Object.keys(this.colourScheme).forEach((key, index) => {
            this.colourScheme[key] = colourScheme[index];
        });

        this.chart.data.datasets[0].backgroundColor = this.ds?.region?.map(a => this.colourScheme[a] ?? "#000000") ?? "#000000";
        this.chart.update();
    }

    ds: ChartDataset<[number, number], [string, string]> | null = null;
    chart: Chart<"scatter", [number, number][], string>;
    colourScheme: {
        [key: string]: string;
    };
}

export { BarChart, ScatterChart, Converter };
