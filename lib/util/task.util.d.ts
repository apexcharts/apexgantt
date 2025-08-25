import { ViewMode } from './gantt.util';
import { Task } from '../models/Tasks';
import { GanttOptions } from '../models/Options';
import { Dayjs } from 'dayjs';

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
    readonly width?: string;
}
export declare const ColumnList: ColumnListItem[];
export declare function getTaskTextByColumn(task: Task, columnKey: ColumnKey, inputDateFormat: string): string;
export declare function getTaskRowElement(taskId: string): HTMLElement | null;
export declare function updateColumnContent(taskId: string, columnKey: string, value: string): void;
export declare function getRowBackgroundColor(index: number, rowBackgroundColors: readonly string[]): string;
export declare function setTaskRowBackgroundColor(taskId: string, bgColor: string): void;
interface TaskElements {
    taskBar: HTMLElement | null;
    taskBarRow: HTMLElement | null;
    taskRow: HTMLElement | null;
}
export declare const getTaskElements: (taskId: string) => TaskElements;
export declare const updateTaskInUI: (taskId: string, updates: Partial<Task>, options: GanttOptions, viewMode: ViewMode, ganttStartDate: Dayjs) => void;
export {};
