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
    private hasBaseline;
    calculateHeight(): number;
    private setupTooltip;
    private setupTaskEdit;
    private setupInteractions;
    drawBar(onUpdate?: onUpdateBarCallback): HTMLElement;
    /**
     * Renders a thin baseline bar positioned below the actual bar, using the
     * planned (baseline) start/end dates. The actual bar shrinks via
     * `calculateHeight()` to leave room for the baseline bar beneath it.
     *
     * Returns null if baseline rendering is disabled or the task has no baseline.
     * The element carries `pointer-events: none` so it never interferes with
     * drag/resize interactions on the main bar.
     */
    drawBaselineBar(): HTMLElement | null;
    getBarStyles(barBgColor?: string): Partial<CSSStyleDeclaration>;
    makeDraggable(barElement: HTMLDivElement, onUpdate?: onUpdateBarCallback): void;
    makeResizable(barElement: HTMLDivElement, onUpdate?: onUpdateBarCallback): void;
    cleanup(): void;
}
