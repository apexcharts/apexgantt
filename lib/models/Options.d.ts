import { Task } from './Tasks';
import { Annotation, Orientation } from './Annotation';
import { ViewMode } from '../util/gantt.util';
import { ArrowLink } from '../../../../graph-utils/src/index.ts';

export interface CommonOptions {
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
export interface GanttBarOptions {
    readonly arrowColor: string;
    readonly barBackgroundColor: string;
    readonly barBorderRadius: string;
    readonly barMargin: number;
    readonly barTextColor: string;
    readonly enableTaskEdit: boolean;
}
export interface GanttRowOptions {
    readonly rowBackgroundColors: readonly string[];
    readonly rowHeight: number;
}
export interface TooltipOptions {
    readonly enableTooltip: boolean;
    readonly tooltipBGColor: string;
    readonly tooltipBorderColor: string;
    readonly tooltipId: string;
    readonly tooltipTemplate?: (task: Task, dateFormat: string) => string;
}
export interface FontOptions {
    readonly fontColor: string;
    readonly fontFamily: string;
    readonly fontSize: string;
    readonly fontWeight: string;
}
export interface AnnotationOptions {
    readonly annotationBgColor?: string;
    readonly annotationBorderColor?: string;
    readonly annotationBorderDashArray?: number[];
    readonly annotationBorderWidth?: number;
    readonly annotationOrientation?: Orientation;
    readonly annotationTextColor?: string;
}
export interface InteractiveOptions {
    readonly enableTaskDrag: boolean;
    readonly enableTaskResize: boolean;
}
export interface GanttData {
    readonly annotations: Annotation[];
    readonly series: Task[];
}
export type GanttOptions = AnnotationOptions & CommonOptions & FontOptions & GanttBarOptions & GanttData & GanttRowOptions & InteractiveOptions & TooltipOptions;
export declare const ColumnWidthByMode: Record<ViewMode, number>;
export declare function getDaysInUnit(date: any, mode: any): number;
export declare const getPixelsPerDayForUnit: (unitStartDate: any, viewMode: any) => number;
export declare const arrowLink: ArrowLink;
export declare const DefaultOptions: GanttOptions;
