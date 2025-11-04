import { ViewMode } from './gantt.util';
import { Task, TaskInput } from '../models/Tasks';
import { GanttOptions } from '../models/Options';
import { DataManager } from '../models/DataManager';
import { Dayjs } from 'dayjs';
import { ChartContext } from '../../../../graph-utils/src/index.ts';

export declare enum ColumnKey {
    Duration = "duration",
    EndTime = "endTime",
    Name = "name",
    Progress = "progress",
    StartTime = "startTime"
}
export declare const ColumnKeyTitleMap: {
    duration: string;
    name: string;
    progress: string;
    startTime: string;
};
export interface ColumnListItem {
    readonly key: ColumnKey;
    readonly title: string;
    readonly minWidth?: string;
    readonly flexGrow?: number;
}
export declare const ColumnList: ColumnListItem[];
/**
 * generates grid-template-columns string based on column configuration
 * @returns CSS grid-template-columns value
 */
export declare function generateGridTemplateColumns(columns: ColumnListItem[]): string;
export declare function getTaskTextByColumn(task: Task, columnKey: ColumnKey, inputDateFormat: string): string;
export declare function getTaskRowElement(context: ChartContext, taskId: string): HTMLElement | null;
export declare function getRowBackgroundColor(index: number, rowBackgroundColors: readonly string[]): string;
export declare function setTaskRowBackgroundColor(context: ChartContext, taskId: string, bgColor: string): void;
interface TaskElements {
    taskBar: HTMLElement | null;
    taskBarRow: HTMLElement | null;
    taskRow: HTMLElement | null;
}
export declare const getTaskElements: (context: ChartContext, taskId: string) => TaskElements;
export declare const updateTaskInUI: (context: ChartContext, dataManager: DataManager, taskId: string, updates: Partial<TaskInput>, options: GanttOptions, viewMode: ViewMode, ganttStartDate: Dayjs) => void;
export {};
