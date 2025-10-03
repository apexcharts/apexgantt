import { GanttOptions } from './Options';
import { DataManager } from './DataManager';
import { ChartContext } from '../../../../graph-utils/src/index.ts';

export declare enum TaskType {
    Milestone = "milestone",
    Task = "task"
}
export interface Task {
    readonly barBackgroundColor?: string;
    collapsed?: boolean;
    readonly dependency?: string;
    readonly endTime: string;
    readonly id: string;
    readonly left?: number;
    readonly level: number;
    readonly name: string;
    readonly parentId?: string;
    readonly progress: number;
    readonly rowBackgroundColor?: string;
    readonly startTime: string;
    readonly type?: TaskType;
    readonly width?: number;
}
export declare class Tasks {
    options: GanttOptions;
    chartContext: ChartContext;
    dataManager: DataManager;
    constructor(options: GanttOptions, chartContext: ChartContext, dataManager: DataManager);
    generateBody(tasks: Task[], reRender: () => void): HTMLElement;
    generateHeader(headerList: string[]): HTMLElement;
    generateRow(task: Task, reRender: () => void): HTMLTableRowElement;
    generateRows(tasks: Task[], tableBody: HTMLElement, reRender: () => void): HTMLElement;
    render(reRender: () => void): HTMLElement[];
}
