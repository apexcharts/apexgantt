import { Task, TaskInput } from './models/Tasks';
import { GanttUserOptions } from './models/Options';
import { BaseChart } from '../../../graph-utils/src/index.ts';

export declare class ApexGantt extends BaseChart {
    private options;
    private viewMode;
    private arrowLink;
    private dataManager;
    private stateManager;
    private containerResizeObserver;
    private lastKnownWidth;
    private lastKnownHeight;
    private resizeDebounceTimer;
    private dependencyArrowHandler;
    private rowHoverHandler;
    private rowHoverLeaveHandler;
    private criticalPathResult;
    /** Cached references to frequently queried DOM elements. Populated by cacheDomElements() after each render. */
    private domCache;
    private scrollManager;
    private zoomManager;
    private layoutManager;
    private styleManager;
    private keyboardNavigationManager;
    private virtualScrollCoordinator;
    /** MediaQueryList for prefers-reduced-motion. Updated dynamically. */
    private reducedMotionMQL;
    private reducedMotionHandler;
    constructor(element: HTMLElement, options?: GanttUserOptions);
    static setLicense(key: string): void;
    /**
     * Detect prefers-reduced-motion at init time and listen for runtime changes.
     * When active, a CSS class is toggled on the root element so that the
     * `@media (prefers-reduced-motion: reduce)` rules in Gantt.style.ts disable
     * all transitions/animations automatically.
     */
    private setupReducedMotion;
    private initializeTooltip;
    render(_data?: TaskInput[]): HTMLElement;
    private cacheDomElements;
    private clearDomCache;
    private performAfterActions;
    /**
     * Create (or re-create) the VirtualScrollCoordinator.
     * Called once per full render, before the coordinator is used.
     */
    private initVirtualScrollCoordinator;
    private setupRowHoverSync;
    private setupRowBackgroundColors;
    private fadeArrowsAfterAnimation;
    private renderDependencyArrows;
    private setupDependencyArrowEvents;
    private computeCriticalPath;
    private applyCriticalPathHighlighting;
    private rerenderTimeline;
    private cleanupEventListeners;
    private cleanupTooltips;
    private cleanupDependencyArrows;
    private createActionButton;
    private createSeparator;
    private createViewModeDisplay;
    renderToolbar(container: HTMLElement): void;
    update(options: GanttUserOptions): void;
    private detectCurrentTheme;
    updateTask(taskId: string, updatedTask: Partial<Task>): void;
    zoomIn(): void;
    zoomOut(): void;
    /**
     * update the horizontal scrollbar's content width to match timeline width
     */
    /**
     * Normalize dimension value to CSS string
     */
    private normalizeDimension;
    /**
     * resize observer for container to handle responsive width and height changes
     */
    private setupContainerResizeObserver;
    private handleContainerResize;
    private performResize;
    destroy(): void;
    isDestroyed(): boolean;
}
