import "./chart.css";

import { Dataset } from "../utils/dataset";
import Chart from 'chart.js/auto';
import { inverseSymmetricLogarithm, symmetricLogarithm } from "../utils/scaling";

class Converter {
    constructor(mapping: Map<string, string>) {
        this.mapping = mapping;
    }

    toChartDataset(ds: Dataset, year: number, limit: number = -1): ChartDataset<number, string> {
        let data = ds.byYear(year);

        if (data === null) {
            return {
                name: ds.name,
                labels: [],
                data: [],
                borderWidth: 1,
            };
        }

        let working = Array.from(data.entries());
        working = working.filter(a => !isNaN(a[1]));
        working.sort((a, b) => b[1] - a[1]);
        if (limit > 0) working = working.slice(0, limit);
        data = new Map(working);

        return {
            name: ds.name,
            labels: Array.from(data.keys()).map(id => this.mapping.get(id)!),
            data: Array.from(data.values()),
            borderWidth: 1,
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
                borderWidth: 1,
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
            labels: Array.from(data.keys()).map(id => this.mapping.get(id)!),
            data: Array.from(data.values()),
            borderWidth: 1,
        };
    }


    mapping: Map<string, string>;
}

interface ChartDataset<T, R> {
    name: R,
    labels: string[],
    data: T[],
    borderWidth: number,
}

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
        let min = Math.min(...working.map(a => a[1]));

        if (scaleType === "Logarithmic" || scaleType === "Threshold") {
            working = working.map(a => {
                if (min > 0 && a[1] < 10)
                    return [a[0], a[1] / 10];
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
                        return `${context.label}: ${value?.toFixed(1)}`;
                    }
                }
            }
        }];
        if (scaleType === "Logarithmic" || scaleType === "Threshold") {
            this.chart.options.scales = {
                y: {
                    ticks: {
                        callback: (value, _index, _values) => {
                            let num = Number(value);
                            if (min > 0 && num <= 1)
                                return (num * 10).toFixed(1);
                            return inverseSymmetricLogarithm(num).toFixed(1);
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
    constructor(elementId: string) {
        let html = document.getElementById(elementId) as HTMLCanvasElement | null;
        if (html === null) throw new Error("Could not find ranking canvas");

        this.chart = new Chart(html, {
            type: "scatter",
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

    public update(ds: ChartDataset<[number, number], [string, string]>) {
        this.chart.data.labels = ds.labels;
        this.chart.data.datasets = [{
            data: ds.data,
            borderWidth: 1
        }];

        const x_min = Math.min(...ds.data.map(a => a[0]));
        const x_max = Math.max(...ds.data.map(a => a[0]));

        const y_min = Math.min(...ds.data.map(a => a[1]));
        const y_max = Math.max(...ds.data.map(a => a[1]));

        const options = {
            plugins: {
                legend: {
                    display: false
                }
            },
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: ds.name[0]
                    },
                    suggestedMin: x_min,
                    suggestedMax: x_max
                },
                y: {
                    title: {
                        display: true,
                        text: ds.name[1]
                    },
                    suggestedMin: y_min,
                    suggestedMax: y_max
                }
            }
        }

        // @ts-ignore
        this.chart.options = options;

        this.chart.update();
    }

    chart: Chart<"scatter", [number, number][], string>;
}

export { BarChart, ScatterChart, Converter };