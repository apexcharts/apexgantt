import { GanttOptions } from './Options';

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
    constructor(options: GanttOptions);
    generateBody(tasks: Task[], reRender: () => void): HTMLElement;
    generateHeader(headerList: string[]): HTMLElement;
    generateRow(task: Task, reRender: () => void): HTMLTableRowElement;
    generateRows(tasks: Task[], tableBody: HTMLElement, reRender: () => void): HTMLElement;
    render(reRender: () => void): HTMLElement;
}
