export interface StatusChartData {
    completed: number;
    pending?: number;
    scheduled?: number;
    cancelled: number;
}

export interface MonthlyOrderData {
    [month: number]: StatusChartData;
}

export interface YearlyOrderData {
    [year: number]: MonthlyOrderData;
}

export interface PieChartData {
    [year: number]: number[];
}

export interface ChartOptions {
    responsive?: boolean;
    maintainAspectRatio?: boolean;
    plugins?: {
        legend?: {
            position?: 'top' | 'bottom' | 'left' | 'right';
            labels?: {
                color?: string;
            }
        },
        title?: {
            display?: boolean;
            text?: string;
            color?: string;
            font?: {
                size?: number;
            }
        }
    },
    scales?: {
        x?: {
            stacked?: boolean;
            title?: {
                display?: boolean;
                text?: string;
                color?: string;
                font?: {
                    size?: number;
                }
            },
            ticks?: {
                color?: string;
            }
        },
        y?: {
            stacked?: boolean;
            title?: {
                display?: boolean;
                text?: string;
                color?: string;
                font?: {
                    size?: number;
                }
            },
            ticks?: {
                color?: string;
            },
            beginAtZero?: boolean;
        }
    }
}
