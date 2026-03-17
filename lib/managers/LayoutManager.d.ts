import { DomCache } from './ScrollManager';
import { ViewMode } from '../util/gantt.util';
import { GanttOptionsInternal } from '../models/Options';
import { ChartContext } from '../../../../graph-utils/src/index.ts';

/**
 * LayoutManager handles all layout-related functionality for the Gantt chart.
 * This includes creating the DOM structure, syncing column widths, and filling empty rows.
 */
export declare class LayoutManager {
    private element;
    private options;
    private domCache;
    private chartContext;
    private instanceId;
    private getViewMode;
    constructor(element: HTMLElement, options: GanttOptionsInternal, domCache: DomCache, chartContext: ChartContext, instanceId: string, getViewMode: () => ViewMode);
    /**
     * Update the options reference after a theme change or update() call.
     */
    updateOptions(options: GanttOptionsInternal): void;
    /**
     * Setup proper positioning for chart container to support dialogs
     */
    setupChartContainerPositioning(): void;
    /**
     * Create the main layout structure with tasks and timeline containers
     */
    createLayout(ganttContainer: HTMLElement, tasksTable: HTMLElement | HTMLElement[], timelineElements: HTMLElement[], enableResize: boolean, tasksContainerWidth: number): void;
    /**
     * Sync column widths between tasks header and body
     */
    syncTasksColumnWidths(): void;
    /**
     * Fill empty space with empty rows to improve visual appearance
     */
    fillEmptyRowsAfterRender(): void;
    /**
     * Create an empty timeline row
     */
    private createEmptyTimelineRow;
    /**
     * Create an empty task row
     */
    private createEmptyTaskRow;
}
