import { VisibleRange } from './RowVirtualizer';
import { GanttOptions } from './Options';
import { DataManager } from './DataManager';
import { ChartContext } from '../../../../graph-utils/src/index.ts';

export declare enum TaskType {
    Milestone = "milestone",
    Task = "task"
}
export type DependencyType = 'FF' | 'FS' | 'SF' | 'SS';
export interface TaskDependency {
    /** ID of the task this task depends on */
    readonly taskId: string;
    /** Dependency type. Defaults to 'FS' (Finish-to-Start) */
    readonly type?: DependencyType;
    /** Lag/lead in days. Positive = lag (delay), negative = lead (overlap). Defaults to 0. */
    readonly lag?: number;
}
export interface BaselineInput {
    /** Planned (baseline) start date for the task */
    readonly start: string;
    /** Planned (baseline) end date for the task */
    readonly end: string;
}
export interface TaskInput {
    readonly id: string;
    readonly name: string;
    readonly startTime: string;
    readonly endTime?: string;
    readonly progress?: number;
    readonly type?: TaskType;
    readonly parentId?: string;
    /** Dependency on another task. Can be a task ID string (backwards compatible) or a TaskDependency object. */
    readonly dependency?: string | TaskDependency;
    readonly barBackgroundColor?: string;
    readonly rowBackgroundColor?: string;
    /** Optional baseline (planned) dates for comparison against actual dates */
    readonly baseline?: BaselineInput;
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
/**
 * Normalise a raw dependency value (string | TaskDependency) to a uniform object.
 * Backwards compatible: a plain string is treated as an FS dependency with no lag.
 */
export declare function normaliseDependency(raw: string | TaskDependency): {
    taskId: string;
    type: DependencyType;
    lag: number;
};
export declare class Tasks {
    options: GanttOptions;
    chartContext: ChartContext;
    dataManager: DataManager;
    private effectiveColumnList;
    constructor(options: GanttOptions, chartContext: ChartContext, dataManager: DataManager);
    /**
     * Merges user column config with defaults
     */
    private mergeColumnConfig;
    /**
     * Dynamic CSS for column widths based on configuration
     */
    private injectDynamicColumnStyles;
    generateBody(tasks: Task[], reRender: () => void, virtualRange?: {
        allTasks: Task[];
        range: VisibleRange;
        rowHeight: number;
    }): HTMLElement;
    generateHeader(headerList: string[]): HTMLElement;
    generateRow(task: Task, reRender: () => void, rowIndex: number): HTMLElement;
    generateRows(tasks: Task[], bodyContainer: HTMLElement, reRender: () => void): HTMLElement;
    /**
     * Render only the rows within the given visible range, with spacer divs
     * above and below to maintain correct scroll height.
     */
    generateRowsVirtualized(allTasks: Task[], bodyContainer: HTMLElement, reRender: () => void, range: VisibleRange, rowHeight: number): HTMLElement;
    private fillEmptyRows;
    private generateEmptyRow;
    render(reRender: () => void, virtualRange?: {
        allTasks: Task[];
        range: VisibleRange;
        rowHeight: number;
    }): HTMLElement[];
}
