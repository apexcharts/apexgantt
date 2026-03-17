import { Task } from './Tasks';

export declare const SupportedScales: string[];
export declare enum ViewMode {
    Day = "day",
    Month = "month",
    Quarter = "quarter",
    Week = "week",
    Year = "year"
}
export type TUnit = ViewMode.Day | ViewMode.Month | ViewMode.Week | ViewMode.Year;
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
