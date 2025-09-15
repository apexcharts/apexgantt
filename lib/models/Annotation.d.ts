import { GanttOptions } from './Options';
import { ViewMode } from '../util/gantt.util';
import { Dayjs } from 'dayjs';

export declare enum Orientation {
    Horizontal = "horizontal",
    Vertical = "vertical"
}
/**
 * Interface representing the label of an annotation.
 */
interface AnnotationLabel {
    readonly fontColor?: string;
    readonly fontFamily?: string;
    readonly fontSize?: string;
    readonly fontWeight?: string;
    readonly orientation: Orientation;
    readonly text: string;
}
/**
 * Interface representing an annotation in the graph.
 */
export interface Annotation {
    readonly bgColor?: string;
    readonly borderColor: string;
    readonly borderDashArray: number;
    readonly borderWidth: number;
    readonly label?: AnnotationLabel;
    readonly x1: string;
    readonly x2?: null | string;
}
/**
 * Class for rendering annotations on a graph.
 */
export declare class AnnotationRenderer {
    private options;
    private ganttStartDate;
    private viewMode;
    constructor(options: GanttOptions, ganttStartDate: Dayjs, viewMode: ViewMode);
    private calculateWidth;
    private calculateX;
    private drawAnnotation;
    private getAnnotationStyles;
    /**
     * Render the label for an annotation.
     */
    private renderLabel;
    /**
     * Render all annotations.
     */
    render(): any[];
}
export {};
