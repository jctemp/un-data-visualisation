import "./chart.css";
import Chart from 'chart.js/auto';

interface ChartDataset<T> {
    title: string;
    labels: string[];
    data: T[];
}

class BarChart {
    constructor(elementId: string, ds: ChartDataset<number>, showGrid: boolean) {

        let html = document.getElementById(elementId) as HTMLCanvasElement | null;
        if (html === null) throw new Error("Could not find ranking canvas");

        let chart = new Chart(html, {
            type: "bar",
            data: {
                labels: ds.labels,
                datasets: [{
                    label: ds.title,
                    data: ds.data,
                    borderWidth: 1
                }]
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
}

const barDs: ChartDataset<number> = {
    title: "Acquisitions by year",
    labels: ["A", "B", "C", "D", "E", "F", "G"],
    data: [1, 2, 3, 4, 5, 6, 7]
}

new BarChart("ranking", barDs, true);

class ScatterChart {
    constructor(elementId: string, ds: ChartDataset<[number, number]>, showGrid: boolean) {

        let html = document.getElementById(elementId) as HTMLCanvasElement | null;
        if (html === null) throw new Error("Could not find ranking canvas");

        let chart = new Chart(html, {
            type: "scatter",
            data: {
                labels: ds.labels,
                datasets: [{
                    label: ds.title,
                    data: ds.data,
                    borderWidth: 1
                }]
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
}

const scatterDs: ChartDataset<[number, number]> = {
    title: "Acquisitions by year",
    labels: ["A", "B", "C", "D", "E", "F", "G"],
    data: [[1, 2], [1, 3], [2, 4], [2, 1], [2, 2], [4, 4]]
}

new ScatterChart("scatter", scatterDs, true);

class RadarChart {
    constructor(elementId: string, dsArray: ChartDataset<number>[], showGrid: boolean) {

        let html = document.getElementById(elementId) as HTMLCanvasElement | null;
        if (html === null) throw new Error("Could not find ranking canvas");

        let chart = new Chart(html, {
            type: "radar",
            data: {
                labels: dsArray[0].labels,
                datasets: dsArray.map(ds => {
                    return {
                        label: ds.title,
                        data: ds.data,
                        borderWidth: 1
                    }
                })
            },
            options: {
                plugins: {
                    legend: {
                        display: true
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
}

const radarDs1: ChartDataset<number>[] = [
    {
        title: "County A",
        labels: ["Growth", "Value", "Land", "Other", "Internet", "Fancy", "Gain"],
        data: [1, 2, 5, -2, 1, 0, 7].reverse()
    },
    {
        title: "County B",
        labels: [],
        data: [1, 0, 3, 6, 5, 3, 3]
    },
];

new RadarChart("radar", radarDs1, true);