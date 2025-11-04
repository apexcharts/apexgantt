import { Task } from './models/Tasks';
import { GanttUserOptions } from './models/Options';
import { BaseChart } from '../../../graph-utils/src/index.ts';

export declare class ApexGantt extends BaseChart {
    private options;
    private viewMode;
    private stylesInjected;
    private arrowLink;
    private dataManager;
    private zoomHandler;
    private timelineScrollHandlers;
    private isSyncingScroll;
    private scrollbarResizeObserver;
    private splitBarResizeHandler;
    private stateManager;
    private containerResizeObserver;
    private lastKnownWidth;
    private resizeDebounceTimer;
    constructor(element: HTMLElement, options?: GanttUserOptions);
    static setLicense(key: string): void;
    private setupShadowDOMEnvironment;
    /**
     * Inject all required styles with context awareness
     */
    private injectGanttStyles;
    private injectStylesDirectly;
    /**
     * Handle watermark display based on license validation
     */
    private handleWatermark;
    private setCSSVariables;
    private isColorDark;
    private initializeTooltip;
    render(data?: any): any;
    private performAfterActions;
    /**
     * Setup proper positioning for chart container to support dialogs
     */
    private setupChartContainerPositioning;
    private disableHeaderMousewheelScroll;
    private createLayout;
    private syncTasksColumnWidths;
    private setupScrollbarResizeObserver;
    private setupSplitBarResizeListener;
    private positionHorizontalScrollbar;
    private compensateForScrollbar;
    private setupTimelineHorizontalScroll;
    private applyScrollbarStylesToElement;
    private setupZoomEventListener;
    private setupRowBackgroundColors;
    private renderDependencyArrows;
    private setupDependencyArrowEvents;
    private rerenderTimeline;
    private updateToolbarAfterZoom;
    private cleanupEventListeners;
    private cleanupTooltips;
    private cleanupDependencyArrows;
    private createActionButton;
    private createSeparator;
    private createViewModeDisplay;
    renderToolbar(container: HTMLElement): void;
    update(options: GanttUserOptions): void;
    private detectCurrentTheme;
    private fillEmptyRowsAfterRender;
    private createEmptyTimelineRow;
    private createEmptyTaskRow;
    private cleanupScrollbarStyles;
    updateTask(taskId: string, updatedTask: Partial<Task>): void;
    zoomIn(): void;
    zoomOut(): void;
    /**
     * update the horizontal scrollbar's content width to match timeline width
     */
    private updateHorizontalScrollbarContent;
    /**
     * Check if element already has explicit dimensions from CSS
     */
    private hasExplicitDimensions;
    /**
     * Normalize dimension value to CSS string
     */
    private normalizeDimension;
    /**
     * resize observer for container to handle responsive width changes
     */
    private setupContainerResizeObserver;
    private handleContainerResize;
    private performResize;
    destroy(): void;
    isDestroyed(): boolean;
}
