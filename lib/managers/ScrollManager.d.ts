import { ViewMode } from '../util/gantt.util';
import { GanttOptionsInternal } from '../models/Options';
import { ChartContext } from '../../../../graph-utils/src/index.ts';

/**
 * DOM cache for frequently queried elements
 */
export interface DomCache {
    ganttContainer: HTMLElement | null;
    timelineContainer: HTMLElement | null;
    timelineBody: HTMLElement | null;
    timelineBodyWrapper: HTMLElement | null;
    timelineHeader: HTMLElement | null;
    horizontalScroll: HTMLElement | null;
    horizontalScrollContent: HTMLElement | null;
    tasksContainer: HTMLElement | null;
    tasksBodyWrapper: HTMLElement | null;
    tasksHeader: HTMLElement | null;
    tasksDataContainer: HTMLElement | null;
    splitBar: HTMLElement | null;
    actionsContainer: HTMLElement | null;
}
/**
 * ScrollManager handles all scroll-related functionality for the Gantt chart.
 * This includes horizontal scrolling synchronization, scrollbar positioning,
 * and resize observers.
 */
export declare class ScrollManager {
    private element;
    private options;
    private domCache;
    private chartContext;
    private instanceId;
    private getViewMode;
    private scrollbarResizeObserver;
    private splitBarResizeHandler;
    private timelineScrollHandlers;
    private isSyncingScroll;
    constructor(element: HTMLElement, options: GanttOptionsInternal, domCache: DomCache, chartContext: ChartContext, instanceId: string, getViewMode: () => ViewMode);
    /**
     * Setup horizontal scroll synchronization between timeline and scrollbar
     */
    setupTimelineHorizontalScroll(): void;
    /**
     * Position the horizontal scrollbar at the bottom of the gantt container
     */
    positionHorizontalScrollbar(): void;
    /**
     * Compensate for scrollbar width by adding padding to header
     */
    compensateForScrollbar(): void;
    /**
     * Setup resize observer for scrollbar positioning
     */
    setupScrollbarResizeObserver(): void;
    /**
     * Setup listener for split bar resize events
     */
    setupSplitBarResizeListener(): void;
    /**
     * Update the horizontal scrollbar's content width to match timeline width
     */
    updateHorizontalScrollbarContent(): void;
    /**
     * Apply custom scrollbar styles for dark theme
     */
    private applyScrollbarStylesToElement;
    /**
     * Update the options reference after a theme change or update() call.
     */
    updateOptions(options: GanttOptionsInternal): void;
    /**
     * Disable mousewheel scrolling on timeline header
     */
    disableHeaderMousewheelScroll(): void;
    /**
     * Determine if a color is dark based on luminance
     */
    private isColorDark;
    /**
     * Cleanup scroll handlers and observers
     */
    cleanup(): void;
}
