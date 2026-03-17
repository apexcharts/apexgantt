import { ParsingConfig } from '../models/DataParser';
import { ThemeMode } from './Theme';
import { Task, TaskInput } from './Tasks';
import { Annotation, Orientation } from './Annotation';
import { ColumnListItem } from '../util/task.util';
import { ViewMode } from '../util/gantt.util';

export interface AnnotationOptions {
    readonly annotationBgColor?: string;
    readonly annotationBorderColor?: string;
    readonly annotationBorderDashArray?: number[];
    readonly annotationBorderWidth?: number;
    readonly annotationOrientation?: Orientation;
}
export interface BorderOptions {
    readonly cellBorderColor: string;
    readonly cellBorderWidth: string;
}
export interface CommonOptions {
    readonly backgroundColor: string;
    readonly borderColor: string;
    readonly canvasStyle: string;
    readonly enableExport: boolean;
    readonly enableResize: boolean;
    readonly headerBackground: string;
    readonly height: number | string;
    readonly inputDateFormat: string;
    readonly tasksContainerWidth: number;
    readonly viewMode: ViewMode;
    readonly width: number | string;
}
export interface ColumnOptions {
    readonly columnConfig?: ColumnListItem[];
}
export interface FontOptions {
    readonly fontColor: string;
    readonly fontFamily: string;
    readonly fontSize: string;
    readonly fontWeight: string;
}
export interface GanttBarOptions {
    readonly arrowColor: string;
    readonly barBackgroundColor: string;
    readonly barBorderRadius: string;
    readonly barMargin: number;
    readonly barTextColor: string;
    readonly enableTaskEdit: boolean;
}
export interface GanttData {
    readonly annotations: Annotation[];
    readonly series: TaskInput[];
}
export interface GanttRowOptions {
    readonly rowBackgroundColors: readonly string[];
    readonly rowHeight: number;
}
export interface InteractiveOptions {
    readonly enableTaskDrag: boolean;
    readonly enableTaskResize: boolean;
}
export interface AccessibilityOptions {
    readonly taskListAriaLabel?: string;
}
export interface TooltipOptions {
    readonly enableTooltip: boolean;
    readonly tooltipBGColor: string;
    readonly tooltipBorderColor: string;
    readonly tooltipId: string;
    readonly tooltipTemplate?: (task: Task, dateFormat: string) => string;
}
export interface ParsingOptions {
    readonly parsing?: ParsingConfig;
}
export interface BaselineOptions {
    /** Whether to render baseline bars below actual bars. Defaults to false. */
    readonly enabled: boolean;
    /** Color of the baseline bar. Defaults to '#b0b8c1' (light grey). */
    readonly color: string;
}
export interface GanttBaselineConfig {
    readonly baseline: BaselineOptions;
}
export interface CriticalPathOptions {
    /** When true, tasks and arrows on the critical path are highlighted. Defaults to false. */
    readonly enableCriticalPath: boolean;
    /** Fill color for critical-path task bars. Defaults to '#e53935'. */
    readonly criticalBarColor: string;
    /** Stroke color for critical-path dependency arrows. Defaults to '#e53935'. */
    readonly criticalArrowColor: string;
}
export type GanttOptionsInternal = AccessibilityOptions & AnnotationOptions & BorderOptions & CommonOptions & ColumnOptions & CriticalPathOptions & FontOptions & GanttBarOptions & GanttBaselineConfig & GanttData & GanttRowOptions & InteractiveOptions & ParsingOptions & TooltipOptions;
/** Mutable intermediate type used only during options merging in update() */
export type GanttOptionsMutable = {
    -readonly [K in keyof GanttOptionsInternal]: GanttOptionsInternal[K];
};
export interface GanttUserOptions {
    readonly theme?: ThemeMode;
    readonly annotationBgColor?: string;
    readonly annotationBorderColor?: string;
    readonly annotationBorderDashArray?: number[];
    readonly annotationBorderWidth?: number;
    readonly annotationOrientation?: Orientation;
    readonly annotations?: Annotation[];
    readonly arrowColor?: string;
    readonly backgroundColor?: string;
    readonly barBackgroundColor?: string;
    readonly barBorderRadius?: string;
    readonly barMargin?: number;
    readonly barTextColor?: string;
    /** Baseline options. When `enabled` is true, tasks with a `baseline` field render a thin bar below the actual bar. */
    readonly baseline?: Partial<BaselineOptions>;
    readonly borderColor?: string;
    readonly canvasStyle?: string;
    readonly criticalBarColor?: string;
    readonly criticalArrowColor?: string;
    readonly enableCriticalPath?: boolean;
    readonly cellBorderColor?: string;
    readonly cellBorderWidth?: string;
    readonly columnConfig?: ColumnListItem[];
    readonly enableExport?: boolean;
    readonly enableResize?: boolean;
    readonly enableTaskDrag?: boolean;
    readonly enableTaskEdit?: boolean;
    readonly enableTaskResize?: boolean;
    readonly enableTooltip?: boolean;
    readonly fontColor?: string;
    readonly fontFamily?: string;
    readonly fontSize?: string;
    readonly fontWeight?: string;
    readonly headerBackground?: string;
    readonly height?: number | string;
    readonly inputDateFormat?: string;
    readonly rowBackgroundColors?: readonly string[];
    readonly rowHeight?: number;
    readonly series: TaskInput[] | Record<string, unknown>[];
    readonly tasksContainerWidth?: number;
    readonly tooltipBGColor?: string;
    readonly tooltipBorderColor?: string;
    readonly tooltipId?: string;
    readonly tooltipTemplate?: (task: Task, dateFormat: string) => string;
    readonly viewMode?: ViewMode;
    readonly width?: number | string;
    readonly parsing?: ParsingConfig;
    readonly taskListAriaLabel?: string;
}
export type GanttOptions = GanttOptionsInternal;
export declare const ColumnWidthByMode: Record<ViewMode, number>;
export declare function getDaysInUnit(date: string | Date, mode: ViewMode): number;
export declare const getPixelsPerDayForUnit: (unitStartDate: string | Date, viewMode: ViewMode) => number;
export declare function getDefaultOptions(theme?: ThemeMode): GanttOptionsInternal;
export declare const DefaultOptions: GanttOptionsInternal;
