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
    /**
     * Setup proper positioning for chart container to support dialogs
     */
    private setupChartContainerPositioning;
    private createLayout;
    private syncTasksColumnWidths;
    private compensateForScrollbar;
    private setupZoomEventListener;
    private setupRowBackgroundColors;
    private renderDependencyArrows;
    private setupDependencyArrowEvents;
    private createExportDropdown;
    private rerenderTimeline;
    private setupTimelineHeaderScroll;
    private updateToolbarAfterZoom;
    private cleanupEventListeners;
    private cleanupTooltips;
    private cleanupDependencyArrows;
    private createActionButton;
    private createSeparator;
    private createViewModeDisplay;
    renderToolbar(container: HTMLElement): void;
    update(options: GanttUserOptions): void;
    updateTask(taskId: string, updatedTask: Partial<Task>): void;
    zoomIn(): void;
    zoomOut(): void;
    /**
     * Check if element already has explicit dimensions from CSS
     */
    private hasExplicitDimensions;
    /**
     * Normalize dimension value to CSS string
     */
    private normalizeDimension;
    destroy(): void;
    isDestroyed(): boolean;
}
