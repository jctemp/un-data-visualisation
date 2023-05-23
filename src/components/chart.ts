import "./chart.css";

import { Dataset } from "../utils/dataset";
import Chart from 'chart.js/auto';

class Converter {
    constructor(mapping: Map<string, string>) {
        this.mapping = mapping;
    }

    toChartDataset(ds: Dataset, year: number, limit: number = -1): ChartDataset<number> {
        let data = ds.byYear(year);

        if (data === null) {
            return {
                prefix: ds.name,
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
            prefix: ds.name,
            labels: Array.from(data.keys()).map(id => this.mapping.get(id)!),
            data: Array.from(data.values()),
            borderWidth: 1,
        };
    }

    mapping: Map<string, string>;
}



interface ChartDataset<T> {
    prefix: string,
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

    public update(ds: ChartDataset<number>) {
        this.chart.data.labels = ds.labels;
        this.chart.data.datasets = [{
            label: ds.prefix,
            data: ds.data,
            borderWidth: 1
        }];
        this.chart.update();
    }

    chart: Chart<"bar", number[], string>;
}

export { BarChart, Converter };