import { Task } from './Tasks';
import { GanttOptions } from './Options';
import { onUpdateBarCallback } from './BarDragManager';
import { ViewMode } from '../util/gantt.util';
import { Dayjs } from 'dayjs';

export declare class Bar {
    task: Task;
    ganttStartDate: Dayjs;
    options: GanttOptions;
    viewMode: ViewMode;
    index: number;
    private tooltipHandler;
    constructor(task: Task, ganttStartDate: Dayjs, options: GanttOptions, viewMode: ViewMode, index: number);
    static calculateWidth(task: Task, viewMode: ViewMode, options: GanttOptions): number;
    static calculateX(task: Task, ganttStartDate: Dayjs, viewMode: ViewMode, options: GanttOptions): number;
    calculateHeight(): number;
    private setupTooltip;
    private setupTaskEdit;
    private setupInteractions;
    drawBar(onUpdate?: onUpdateBarCallback): HTMLElement;
    getBarStyles(barBgColor?: string): Partial<CSSStyleDeclaration>;
    makeDraggable(barElement: HTMLDivElement, onUpdate?: onUpdateBarCallback): void;
    makeResizable(barElement: HTMLDivElement, onUpdate?: onUpdateBarCallback): void;
    cleanup(): void;
}
