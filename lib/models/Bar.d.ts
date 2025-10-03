import { Task } from './Tasks';
import { GanttOptions } from './Options';
import { DataManager } from './DataManager';
import { onUpdateBarCallback } from './BarDragManager';
import { ViewMode } from '../util/gantt.util';
import { Dayjs } from 'dayjs';
import { ChartContext } from '../../../../graph-utils/src/index.ts';

export declare class Bar {
    task: Task;
    ganttStartDate: Dayjs;
    options: GanttOptions;
    viewMode: ViewMode;
    index: number;
    chartContext: ChartContext;
    dataManager: DataManager;
    private tooltipHandler;
    constructor(task: Task, ganttStartDate: Dayjs, options: GanttOptions, viewMode: ViewMode, index: number, chartContext: ChartContext, dataManager: DataManager);
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
