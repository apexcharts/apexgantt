import { GanttOptions } from './Options';
import { DataManager } from './DataManager';
import { ChartContext } from '../../../../graph-utils/src/index.ts';

export declare enum TaskType {
    Milestone = "milestone",
    Task = "task"
}
export interface TaskInput {
    readonly id: string;
    readonly name: string;
    readonly startTime: string;
    readonly endTime?: string;
    readonly progress?: number;
    readonly type?: TaskType;
    readonly parentId?: string;
    readonly dependency?: string;
    readonly barBackgroundColor?: string;
    readonly rowBackgroundColor?: string;
    collapsed?: boolean;
}
export interface Task extends TaskInput {
    readonly endTime: string;
    readonly level?: number;
    readonly progress: number;
    readonly type: TaskType;
    readonly left?: number;
    readonly width?: number;
}
export declare class Tasks {
    options: GanttOptions;
    chartContext: ChartContext;
    dataManager: DataManager;
    constructor(options: GanttOptions, chartContext: ChartContext, dataManager: DataManager);
    generateBody(tasks: Task[], reRender: () => void): HTMLElement;
    generateHeader(headerList: string[]): HTMLElement;
    generateRow(task: Task, reRender: () => void): HTMLElement;
    generateRows(tasks: Task[], bodyContainer: HTMLElement, reRender: () => void): HTMLElement;
    private fillEmptyRows;
    private generateEmptyRow;
    render(reRender: () => void): HTMLElement[];
}
