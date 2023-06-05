import "./chart.css";

import { Dataset } from "../utils/dataset";
import Chart from 'chart.js/auto';
import { inverseSymmetricLogarithm, symmetricLogarithm } from "../utils/scaling";
import { SingleValue } from "../utils/container";

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

    toChartDatasetScatter(ds1: Dataset, ds2: Dataset, year_index: number): ChartDataset<[number, number], [string, string]> {
        let data1 = ds1.byYear(ds1.years[year_index]);
        let data2 = ds2.byYear(ds2.years[year_index]);

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
        };
    }


    countryMapping: Map<string, string>;
    continentMapping: Map<string, string>;
}

interface ChartDataset<T, R> {
    name: R,
    labels: string[],
    data: T[],
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
                        return `${value?.toFixed(1)} ${CHART_A_LABEL_SUFFIX.value}`;
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

        this.colourScheme = colourScheme;

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
            }
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

        this.chart.data.labels = ds.labels;

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

                        const values = `(${x.toFixed(1)} ${CHART_A_LABEL_SUFFIX.value}, ${y.toFixed(1)} ${CHART_B_LABEL_SUFFIX.value})`;
                        return `${label}: ${values}`;
                    }
                }
            }
        }];

        let scales = {
            x: {
                title: {
                    display: true,
                    text: ds.name[0]
                },
                ticks: {
                    // @ts-ignore
                    callback: (value, _index, _values) => {
                        return Number(value).toFixed(1);
                    }
                }
            }, y: {
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