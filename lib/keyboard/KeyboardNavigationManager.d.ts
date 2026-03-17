import { DataManager } from '../models/DataManager';
import { ChartContext } from '../../../../graph-utils/src/index.ts';

/**
 * Manages keyboard navigation for the Gantt task list using the roving-tabindex
 * pattern (WCAG 2.1 AA — keyboard accessible, treegrid pattern).
 *
 * Supported keys (when focus is inside the task list):
 *   ArrowDown  – move focus to the next visible row
 *   ArrowUp    – move focus to the previous visible row
 *   ArrowRight – expand collapsed parent; if already expanded move to first child
 *   ArrowLeft  – collapse expanded parent; if at leaf move focus to parent row
 *   Home       – move focus to the first row
 *   End        – move focus to the last row
 *   Space      – select / deselect the focused row
 *   Enter      – activate row (open edit form) by dispatching a dblclick on the
 *                corresponding bar element in the timeline
 *   Escape     – blur the task list (return focus to host element)
 */
export declare class KeyboardNavigationManager {
    private chartContext;
    private dataManager;
    private getTaskContainer;
    private reRender;
    private keydownHandler;
    constructor(chartContext: ChartContext, dataManager: DataManager, getTaskContainer: () => HTMLElement | null, reRender: () => void);
    /**
     * Attach the keydown listener to the tasks-data-container element.
     * Call once after each render.
     */
    attach(): void;
    /** Remove the keydown listener. */
    detach(): void;
    /** Set tabindex="0" on the first real row; all others get tabindex="-1". */
    private initRovingTabindex;
    /** Returns task rows (excludes empty filler rows). */
    private getVisibleRows;
    /** Focus a row and update the roving tabindex. */
    private moveFocusToRow;
    private handleKeydown;
}
