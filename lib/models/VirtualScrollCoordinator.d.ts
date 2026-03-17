import { ViewMode } from '../util/gantt.util';
import { GanttOptions } from './Options';
import { DataManager } from './DataManager';
import { Task } from './Tasks';
import { VisibleRange } from './RowVirtualizer';
import { ChartContext } from '../../../../graph-utils/src/index.ts';

/**
 * DOM references required by the coordinator. Must be populated after every
 * full render.
 */
export interface VirtualDomRefs {
    tasksDataContainer: HTMLElement | null;
    timelineBody: HTMLElement | null;
    barContainer: HTMLElement | null;
    tasksBodyWrapper: HTMLElement | null;
    timelineBodyWrapper: HTMLElement | null;
    /**
     * The main vertical scroll container. In the standard layout this is the
     * `.split-view-container` which wraps both the left (tasks) and right
     * (timeline) panels and has `overflow-y: auto`.
     */
    verticalScrollContainer: HTMLElement | null;
}
/**
 * Coordinates row virtualisation across both the Tasks (left) and Timeline
 * (right) panels of an ApexGantt chart.
 *
 * Core responsibilities:
 * - Maintain a single `RowVirtualizer` instance (source of truth for both panels)
 * - Listen for vertical scroll on both panels and keep them synchronised
 * - Schedule DOM updates via `requestAnimationFrame` — never synchronously
 * - Use the **atomic swap** pattern: add new rows first, remove old rows second,
 *   both panels mutated in a single rAF callback → zero blank frames
 * - Insert top/bottom spacer divs so scroll position reflects the full dataset
 *
 * The coordinator has **no opinion** about horizontal scrolling — that is
 * handled by ScrollManager.
 */
export declare class VirtualScrollCoordinator {
    private domRefs;
    private options;
    private chartContext;
    private dataManager;
    private getViewMode;
    private onAfterUpdate;
    /**
     * Called when a collapse/expand chevron is clicked on a virtualised row.
     * Should trigger a full re-render so the row count updates.
     */
    private onToggle;
    private virtualizer;
    private cachedVisibleTasks;
    private lastVisibleRange;
    private virtualScrollRAF;
    private verticalScrollHandler;
    private _isActive;
    /** Set of data-taskid values currently rendered in the tasks panel. */
    private renderedTaskIds;
    constructor(domRefs: VirtualDomRefs, options: GanttOptions, chartContext: ChartContext, dataManager: DataManager, getViewMode: () => ViewMode, onAfterUpdate: () => void, 
    /**
     * Called when a collapse/expand chevron is clicked on a virtualised row.
     * Should trigger a full re-render so the row count updates.
     */
    onToggle?: () => void);
    /** Whether virtualisation is currently active (dataset above threshold). */
    get isActive(): boolean;
    /** Set of task IDs currently rendered in the virtual window. */
    getRenderedTaskIds(): ReadonlySet<string>;
    /**
     * Initialise virtualisation for the current dataset. Call after every full
     * render. Returns the initial `VisibleRange` if virtualisation is active,
     * otherwise `undefined`.
     */
    initialise(allVisibleTasks: Task[]): {
        allTasks: Task[];
        range: VisibleRange;
        rowHeight: number;
    } | undefined;
    /**
     * Attach a vertical scroll listener to the main scroll container and
     * calibrate the virtualizer against actual DOM dimensions. Call once after
     * DOM is ready.
     */
    attach(): void;
    /**
     * Detach all scroll listeners and cancel pending rAF callbacks.
     */
    detach(): void;
    /**
     * Full cleanup — call from ApexGantt.destroy().
     */
    destroy(): void;
    /**
     * Notify the coordinator that the total row count has changed (e.g. after
     * collapse/expand). Clamps scrollTop if necessary and re-renders.
     */
    updateTotalRows(allVisibleTasks: Task[]): void;
    /**
     * Temporarily expand all rows into the live DOM for export.
     *
     * Call this before cloning the element for SVG export. It renders every task
     * row / bar that is outside the current virtual window and collapses spacers
     * to zero so the exported image contains the full chart.
     *
     * Returns a snapshot of the current virtual window so the caller can pass it
     * to `restoreAfterExport()` once the export is complete.
     */
    expandAllForExport(): {
        startIndex: number;
        endIndex: number;
    } | null;
    /**
     * Restore the virtual window after an export triggered by `expandAllForExport()`.
     *
     * @param snapshot - The value returned by `expandAllForExport()`.
     */
    restoreAfterExport(snapshot: {
        startIndex: number;
        endIndex: number;
    } | null): void;
    /**
     * Notify the coordinator that the container was resized.
     */
    handleResize(): void;
    /**
     * Update DOM references after a full re-render.
     */
    updateDomRefs(refs: VirtualDomRefs): void;
    /**
     * Schedule a virtualised update via requestAnimationFrame.
     * Cancels any pending frame so rapid scrolls don't stack.
     */
    private scheduleUpdate;
    /** Compare current vs. previous range and apply if different. */
    private applyIfChanged;
    /**
     * Atomic DOM update — both panels mutated in one rAF callback.
     *
     * Uses the **add-first, remove-second** pattern to prevent blank frames:
     * 1. Compute diff between currently rendered rows and newly needed rows.
     * 2. Append new rows.
     * 3. Update spacer heights.
     * 4. Remove stale rows.
     * 5. Update ARIA attributes.
     */
    private applyUpdate;
    /**
     * Patch the Tasks (left) panel using diff-based add-first / remove-second.
     */
    private patchTasksPanel;
    /**
     * Patch the Timeline (right) panel using diff-based add-first / remove-second.
     */
    private patchTimelinePanel;
    /**
     * Patch the bar container — replace bars for the visible range.
     * Bars are position:absolute so no spacer needed; we just swap them.
     */
    private patchBars;
    /**
     * Ensure top and bottom spacer divs exist in the container with the correct heights.
     */
    private updateSpacers;
    /** Helper: determine cell count from the existing timeline header. */
    private getTimelineCellCount;
}
