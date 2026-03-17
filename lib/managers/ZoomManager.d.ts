import { DomCache } from './ScrollManager';
import { ViewMode } from '../util/gantt.util';
import { ChartContext } from '../../../../graph-utils/src/index.ts';

/**
 * Callbacks for zoom-related actions that require re-rendering
 */
export interface ZoomCallbacks {
    onViewModeChange: (viewMode: ViewMode) => void;
    onToolbarUpdate: () => void;
    onTimelineRerender: () => void;
    onDependencyArrowsRender: () => void;
    onScrollbarUpdate: () => void;
    onScrollbarPosition: () => void;
}
/**
 * ZoomManager handles all zoom-related functionality for the Gantt chart.
 * This includes zoom in/out operations, zoom event listeners, and toolbar updates.
 */
export declare class ZoomManager {
    private element;
    private domCache;
    private chartContext;
    private instanceId;
    private getViewMode;
    private callbacks;
    private zoomHandler;
    constructor(element: HTMLElement, domCache: DomCache, chartContext: ChartContext, instanceId: string, getViewMode: () => ViewMode, callbacks: ZoomCallbacks);
    /**
     * Setup zoom event listener (Ctrl+Wheel)
     */
    setupZoomEventListener(): void;
    /**
     * Zoom in to a finer view mode
     */
    zoomIn(): void;
    /**
     * Zoom out to a coarser view mode
     */
    zoomOut(): void;
    /**
     * Update toolbar buttons after zoom
     */
    updateToolbarAfterZoom(): void;
    /**
     * Cleanup zoom handlers
     */
    cleanup(): void;
}
