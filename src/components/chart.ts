import "./chart.css";

import { Dataset } from "../utils/dataset";
import Chart from 'chart.js/auto';

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
    constructor(elementId: string, showGrid: boolean) {
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
                scales: {
                    x: {
                        grid: {
                            display: showGrid
                        }
                    },
                    y: {
                        grid: {
                            display: showGrid
                        }
                    }
                }
            }
        });

    }

    public update(ds: ChartDataset<number, string>) {
        this.chart.data.labels = ds.labels;
        this.chart.data.datasets = [{
            label: ds.name,
            data: ds.data,
            borderWidth: 1
        }];
        this.chart.update();
    }

    chart: Chart<"bar", number[], string>;
}

class ScatterChart {
    constructor(elementId: string, showGrid: boolean) {
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
                scales: {
                    x: {
                        grid: {
                            display: showGrid
                        }
                    },
                    y: {
                        grid: {
                            display: showGrid
                        }
                    }
                }
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