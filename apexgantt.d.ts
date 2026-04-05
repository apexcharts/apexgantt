/**
 * Interface representing an annotation in the graph.
 */
export declare interface Annotation {
    readonly bgColor?: string;
    readonly borderColor?: string;
    readonly borderDashArray?: number;
    readonly borderWidth?: number;
    readonly label?: AnnotationLabel;
    readonly x1: string;
    readonly x2?: null | string;
}

/**
 * Interface representing the label of an annotation.
 */
export declare interface AnnotationLabel {
    readonly fontColor?: string;
    readonly fontFamily?: string;
    readonly fontSize?: string;
    readonly fontWeight?: string;
    readonly orientation?: Orientation;
    readonly text?: string;
}

declare class ApexGantt extends BaseChart {
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
    private selectionManager;
    private virtualScrollCoordinator;
    /** MediaQueryList for prefers-reduced-motion. Updated dynamically. */
    private reducedMotionMQL;
    private reducedMotionHandler;
    constructor(element: HTMLElement, options?: GanttUserOptions);
    /**
     * Set the global ApexCharts license key.
     *
     * Call this once before creating any chart instance, typically at app startup.
     * Without a valid license the chart renders with a watermark.
     *
     * @param key - The license key string provided by ApexCharts.
     *
     * @example
     * ```ts
     * import { ApexGantt } from 'apexgantt';
     * ApexGantt.setLicense('YOUR_LICENSE_KEY');
     * ```
     */
    static setLicense(key: string): void;
    /**
     * Detect prefers-reduced-motion at init time and listen for runtime changes.
     * When active, a CSS class is toggled on the root element so that the
     * `@media (prefers-reduced-motion: reduce)` rules in Gantt.style.ts disable
     * all transitions/animations automatically.
     */
    private setupReducedMotion;
    private initializeTooltip;
    /**
     * Render the Gantt chart into the element supplied in the constructor.
     *
     * Call once after construction to create the initial DOM. Subsequent renders
     * (triggered by `update()` or internal interactions) are handled automatically.
     *
     * @param _data - Reserved for future use. Pass `undefined` or omit.
     * @returns The container `HTMLElement` that hosts the chart.
     *
     * @example
     * ```ts
     * const gantt = new ApexGantt(document.getElementById('chart')!, options);
     * gantt.render();
     * ```
     */
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
    /**
     * Render the built-in toolbar (zoom controls, view-mode display, export button,
     * and any custom `toolbarItems`) into the provided container element.
     *
     * Normally called automatically by `render()`. Use this method directly only
     * when you need to mount the toolbar in a custom DOM slot outside the chart.
     *
     * @param container - The `HTMLElement` to render the toolbar into.
     *   Its `innerHTML` is replaced on each call.
     */
    renderToolbar(container: HTMLElement): void;
    /**
     * Build a single DOM element for a custom toolbar item.
     * Returns null for unknown types (future-proofing).
     */
    private createToolbarItem;
    private createToolbarButton;
    private createToolbarSelect;
    /**
     * Update chart options and re-render.
     *
     * Merges the supplied options with the current configuration. Only the keys
     * you pass are changed; unspecified keys keep their current values. Passing
     * `undefined` for a key resets it to its default value.
     *
     * Scroll position, collapsed/expanded state, and current view mode are
     * preserved across updates unless explicitly overridden.
     *
     * @param options - Partial or full `GanttUserOptions` to apply.
     *
     * @example
     * ```ts
     * // Switch to month view and update tasks
     * gantt.update({ viewMode: ViewMode.Month, series: newTasks });
     *
     * // Toggle dark theme at runtime
     * gantt.update({ theme: 'dark' });
     * ```
     */
    update(options: GanttUserOptions): void;
    private detectCurrentTheme;
    /**
     * Imperatively update a single task's data and reflect the change in the UI
     * without triggering a full re-render.
     *
     * Useful for applying real-time changes (e.g. progress updates from a server)
     * with minimal DOM work. Only the affected task bar and row are updated.
     *
     * @param taskId - The `id` of the task to update.
     * @param updatedTask - A partial `Task` object containing only the fields to change.
     *   Supply `startTime`, `endTime`, `progress`, `name`, etc. — any subset is valid.
     *
     * @throws {Error} If no task with the given `taskId` exists in the current dataset.
     *
     * @example
     * ```ts
     * // Update progress for task 't3'
     * gantt.updateTask('t3', { progress: 75 });
     *
     * // Shift a task's dates
     * gantt.updateTask('t3', { startTime: '2026-06-01', endTime: '2026-06-15' });
     * ```
     */
    updateTask(taskId: string, updatedTask: Partial<Task>): void;
    /** Returns an array of currently selected task objects. Requires `enableSelection: true`. */
    getSelectedTasks(): Task[];
    /** Programmatically set the selection to the given task IDs. Requires `enableSelection: true`. */
    setSelectedTasks(ids: string[]): void;
    /** Clear all selected tasks. Requires `enableSelection: true`. */
    clearSelection(): void;
    /**
     * Zoom in by one step (increase timeline resolution).
     *
     * Scale order from finest to coarsest: `Day → Week → Month → Quarter → Year`.
     * Calling `zoomIn()` when already at `Day` view has no effect.
     *
     * @example
     * ```ts
     * gantt.zoomIn(); // e.g. Month → Week
     * ```
     */
    zoomIn(): void;
    /**
     * Zoom out by one step (decrease timeline resolution).
     *
     * Scale order from finest to coarsest: `Day → Week → Month → Quarter → Year`.
     * Calling `zoomOut()` when already at `Year` view has no effect.
     *
     * @example
     * ```ts
     * gantt.zoomOut(); // e.g. Month → Quarter
     * ```
     */
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
    /**
     * Destroy the chart instance and free all associated resources.
     *
     * Removes all event listeners, disconnects `ResizeObserver`s, clears the
     * tooltip, clears the DOM, and nulls internal references. After calling
     * `destroy()`, the instance cannot be reused — create a new `ApexGantt`
     * instead.
     *
     * Always call `destroy()` before removing the host element from the DOM or
     * when cleaning up in frameworks (component `ngOnDestroy`, React `useEffect`
     * cleanup, Vue `onBeforeUnmount`, etc.).
     *
     * @example
     * ```ts
     * // React cleanup example
     * useEffect(() => {
     *   const gantt = new ApexGantt(ref.current!, options);
     *   gantt.render();
     *   return () => gantt.destroy();
     * }, []);
     * ```
     */
    destroy(): void;
    /**
     * Returns `true` if the chart has been destroyed or the host element is empty.
     *
     * Use this guard before calling any other method if you are unsure whether
     * `destroy()` has already been called.
     *
     * @returns `true` after `destroy()` has been called, `false` while the chart is live.
     *
     * @example
     * ```ts
     * if (!gantt.isDestroyed()) {
     *   gantt.update({ series: newTasks });
     * }
     * ```
     */
    isDestroyed(): boolean;
}
export { ApexGantt }
export default ApexGantt;

declare abstract class BaseChart {
    /* Excluded from this release type: element */
    /** Destroys the chart instance and cleans up DOM resources. */
    destroy(): void;
    /** Returns the unique identifier for this chart instance. */
    getInstanceId(): string;
}

/**
 * Planned (baseline) dates for a task, used to visualise schedule variance.
 *
 * Attach to `TaskInput.baseline`. A thin secondary bar is rendered below the
 * actual task bar when `GanttUserOptions.baseline.enabled` is `true`.
 */
export declare interface BaselineInput {
    /** Planned (baseline) start date for the task */
    readonly start: string;
    /** Planned (baseline) end date for the task */
    readonly end: string;
}

/**
 * Visual options for baseline (planned vs. actual) bars.
 *
 * Enable with `GanttUserOptions.baseline.enabled = true`. Tasks that include
 * a `baseline` field on their `TaskInput` will render a secondary thin bar
 * below the actual task bar to show schedule variance.
 */
export declare interface BaselineOptions {
    /** Whether to render baseline bars below actual bars. Defaults to false. */
    readonly enabled: boolean;
    /** Color of the baseline bar. Defaults to '#b0b8c1' (light grey). */
    readonly color: string;
}

/**
 * Identifies the built-in columns available in the task-list panel.
 *
 * Pass `ColumnKey` values inside `ColumnListItem.key` when configuring
 * `GanttUserOptions.columnConfig` to control which columns are visible
 * and in what order.
 */
export declare enum ColumnKey {
    Duration = "duration",
    EndTime = "endTime",
    Name = "name",
    Progress = "progress",
    StartTime = "startTime"
}

export declare const ColumnList: ColumnListItem[];

/**
 * Defines a single column in the task-list panel.
 *
 * Pass an array of these to `GanttUserOptions.columnConfig` to override the
 * default column set. Use `ColumnList` as the starting point and filter or
 * reorder as needed.
 */
export declare interface ColumnListItem {
    readonly key: ColumnKey;
    readonly title: string;
    readonly minWidth?: string;
    readonly flexGrow?: number;
    readonly visible?: boolean;
}

export declare const DarkTheme: GanttTheme;

/**
 * DataParser - for parsing raw data objects into TaskInput format
 */
export declare class DataParser {
    /**
     * Extract value from nested object using dot notation path
     * @param obj - source object
     * @param path - dot notation path (e.g., 'project.task.title')
     * @returns Extracted value
     */
    private static getNestedValue;
    /**
     * single parsing value configuration
     * @param obj - Source object
     * @param parsingValue - Either a string path or object with key and transform
     * @returns Processed value
     */
    private static processParsingValue;
    /**
     * Build a TaskInput from a raw item using the provided config.
     * Returns null if required fields are missing or cannot be extracted.
     */
    private static buildTaskInput;
    /**
     * Parse an array of raw data objects into TaskInput array
     * @param data - Array of raw data objects
     * @param config - Parsing configuration mapping
     * @returns Array of TaskInput objects
     */
    static parse(data: unknown[], config: ParsingConfig): TaskInput[];
    /**
     * validate parsing configuration
     * @param config - parsing configuration to validate
     * @returns true if valid, false otherwise
     */
    static validateConfig(config: ParsingConfig): boolean;
}

/**
 * Detail payload for the `dependencyArrowUpdate` event.
 *
 * Fires when the user creates, updates, or removes a dependency arrow
 * between two tasks in the interactive dependency editor.
 */
export declare interface DependencyArrowUpdateDetail {
    fromId: string;
    toId: string;
    type: 'FF' | 'FS' | 'SF' | 'SS';
    lag?: number;
    chartInstanceId: string;
    arrowLinkInstanceId?: string;
}

/**
 * Finish-to-Finish (`FF`), Finish-to-Start (`FS`), Start-to-Finish (`SF`),
 * or Start-to-Start (`SS`) dependency relationship between two tasks.
 * Defaults to `'FS'` when not specified.
 */
export declare type DependencyType = 'FF' | 'FS' | 'SF' | 'SS';

/**
 * chart event names
 * use these constants to attach event listeners like below
 *
 * element.addEventListener(GanttEvents.TASK_UPDATE, (e) => {
 *   console.log(e.detail);
 * });
 */
/**
 * Typed event map for the `ApexGantt` container element.
 *
 * Use this interface to get fully-typed `CustomEvent.detail` when adding
 * event listeners on the gantt element. Wrapper libraries (React, Vue,
 * Angular) should bridge these events to their respective event systems
 * using this map rather than casting `Event` manually.
 *
 * @example
 * ```ts
 * import type { GanttEventMap } from 'apexgantt';
 *
 * element.addEventListener('taskDragged', (e: GanttEventMap['taskDragged']) => {
 *   console.log(e.detail.taskId, e.detail.daysMoved);
 * });
 * ```
 */
export declare interface GanttEventMap {
    /** Fires when a task is being updated (before completion). */
    taskUpdate: CustomEvent<TaskUpdateEventDetail>;
    /** Fires when task form validation fails. */
    taskValidationError: CustomEvent<TaskValidationErrorEventDetail>;
    /** Fires after a task update completes successfully. */
    taskUpdateSuccess: CustomEvent<TaskUpdateSuccessEventDetail>;
    /** Fires when a task update fails with an error. */
    taskUpdateError: CustomEvent<TaskUpdateErrorEventDetail>;
    /** Fires when a task bar is dragged to a new position. */
    taskDragged: CustomEvent<TaskDraggedEventDetail>;
    /** Fires when a task bar is resized via its handles. */
    taskResized: CustomEvent<TaskResizedEventDetail>;
    /** Fires when the set of selected tasks changes. */
    selectionChange: CustomEvent<SelectionChangeEventDetail>;
    /** Fires when a dependency arrow is updated. */
    dependencyArrowUpdate: CustomEvent<DependencyArrowUpdateDetail>;
}

export declare const GanttEvents: {
    /**
     * emits when a task is being updated (before completion)
     */
    readonly TASK_UPDATE: "taskUpdate";
    /**
     * emits when form validation fails
     */
    readonly TASK_VALIDATION_ERROR: "taskValidationError";
    /**
     * emits after a task update completes successfully
     */
    readonly TASK_UPDATE_SUCCESS: "taskUpdateSuccess";
    /**
     * emits when a task update fails
     */
    readonly TASK_UPDATE_ERROR: "taskUpdateError";
    /**
     * emits when a task bar is dragged to a new position
     */
    readonly TASK_DRAGGED: "taskDragged";
    /**
     * emits when a task bar is resized via handles
     */
    readonly TASK_RESIZED: "taskResized";
    /**
     * emits when the set of selected tasks changes
     */
    readonly SELECTION_CHANGE: "selectionChange";
    /**
     * emits when a dependency arrow is created, updated, or removed
     */
    readonly DEPENDENCY_ARROW_UPDATE: "dependencyArrowUpdate";
};

/**
 * Complete color palette for the chart UI.
 *
 * Use `LightTheme` or `DarkTheme` as a starting point and spread-override
 * individual fields, or pass a fully custom object. Pass the result as
 * `GanttUserOptions.theme` when using a `ThemeMode` string is insufficient.
 *
 * @see {@link LightTheme} {@link DarkTheme} {@link getTheme}
 */
export declare interface GanttTheme {
    readonly tooltipBGColor: string;
    readonly tooltipBorderColor: string;
    readonly tooltipTextColor: string;
    readonly cellBorderColor: string;
    readonly rowBackgroundColors: readonly string[];
    readonly headerBackground: string;
    readonly headerTextColor: string;
    readonly barBackgroundColor: string;
    readonly barTextColor: string;
    readonly arrowColor: string;
    readonly backgroundColor: string;
    readonly textColor: string;
    readonly borderColor: string;
    readonly annotationBgColor: string;
    readonly annotationBorderColor: string;
    readonly dialogBgColor: string;
    readonly dialogBorderColor: string;
    readonly buttonBgColor: string;
    readonly buttonTextColor: string;
    readonly buttonHoverBgColor: string;
    readonly toolbarBgColor: string;
    readonly toolbarBorderColor: string;
    readonly toolbarHoverBgColor: string;
    readonly scrollbarTrackColor: string;
    readonly scrollbarThumbColor: string;
    readonly scrollbarThumbHoverColor: string;
    readonly splitBarColor: string;
    readonly splitBarHoverColor: string;
    readonly splitBarBorderColor: string;
    readonly splitBarHandleColor: string;
}

/**
 * Top-level configuration object for `ApexGantt`.
 *
 * Pass this to `new ApexGantt(element, options)` or to `gantt.update(options)`.
 * Every field is optional except `series`. Use a `GanttTheme` object or a
 * `ThemeMode` string for the `theme` field; for per-task styling use the
 * corresponding fields on `TaskInput`.
 *
 * @example
 * ```ts
 * const gantt = new ApexGantt('#chart', {
 *   series: myTasks,
 *   viewMode: ViewMode.Week,
 *   height: 400,
 * });
 * ```
 */
export declare interface GanttUserOptions {
    /** Color theme preset. `'light'` (default) or `'dark'`. */
    readonly theme?: ThemeMode;
    /** Background color of annotation markers. @default '#F9D1FC' */
    readonly annotationBgColor?: string;
    /** Border color of annotation markers. @default '#E273EA' */
    readonly annotationBorderColor?: string;
    /** SVG stroke-dasharray for annotation borders, e.g. `[6, 3]`. @default [] */
    readonly annotationBorderDashArray?: number[];
    /** Border width of annotation markers in pixels. @default 2 */
    readonly annotationBorderWidth?: number;
    /** Whether annotation lines are drawn horizontally or vertically. @default Orientation.Horizontal */
    readonly annotationOrientation?: Orientation;
    /** Array of annotation objects to overlay on the timeline. @default [] */
    readonly annotations?: Annotation[];
    /** Color of dependency arrows between tasks. @default '#0D6EFD' */
    readonly arrowColor?: string;
    /** Background color of the whole chart container. @default '#FFFFFF' */
    readonly backgroundColor?: string;
    /** Default background fill color for task bars. @default '#537CFA' */
    readonly barBackgroundColor?: string;
    /** CSS border-radius applied to task bars. @default '5px' */
    readonly barBorderRadius?: string;
    /** Top and bottom margin inside each row for the task bar in pixels. @default 4 */
    readonly barMargin?: number;
    /** Text color rendered inside task bars. @default '#FFFFFF' */
    readonly barTextColor?: string;
    /** Baseline options. When `enabled` is true, tasks with a `baseline` field render a thin bar below the actual bar. */
    readonly baseline?: Partial<BaselineOptions>;
    /** Color of the cell and row divider lines. @default '#eff0f0' */
    readonly borderColor?: string;
    /** Arbitrary CSS injected onto the root container element. */
    readonly canvasStyle?: string;
    /** Fill color for task bars on the critical path (requires `enableCriticalPath: true`). @default '#e53935' */
    readonly criticalBarColor?: string;
    /** Stroke color for dependency arrows on the critical path. @default '#e53935' */
    readonly criticalArrowColor?: string;
    /** When true, calculates and highlights the critical path through dependent tasks. @default false */
    readonly enableCriticalPath?: boolean;
    /** Border color for all cells in the task table and timeline grid. @default '#eff0f0' */
    readonly cellBorderColor?: string;
    /** CSS border-width for all cell lines, e.g. `'1px'`. @default '1px' */
    readonly cellBorderWidth?: string;
    /** Custom column definitions for the task-list panel. When omitted, all default columns are shown. */
    readonly columnConfig?: ColumnListItem[];
    /** Enable row selection (click, Ctrl+Click, Shift+Click, keyboard). @default false */
    readonly enableSelection?: boolean;
    /** Show the SVG export button in the toolbar. @default true */
    readonly enableExport?: boolean;
    /** Allow the task-list panel to be resized by dragging the divider. @default true */
    readonly enableResize?: boolean;
    /** Allow tasks to be reordered by dragging rows in the task list. @default true */
    readonly enableTaskDrag?: boolean;
    /** Show the inline task-edit form when a task row is clicked. @default false */
    readonly enableTaskEdit?: boolean;
    /** Allow task bars to be resized by dragging their handles. @default true */
    readonly enableTaskResize?: boolean;
    /** Show a tooltip on task-bar hover. @default true */
    readonly enableTooltip?: boolean;
    /** Color for all text in the chart. @default '#000000' */
    readonly fontColor?: string;
    /** CSS font-family for the chart. Falls back to the page default when empty. */
    readonly fontFamily?: string;
    /** CSS font-size for the chart, e.g. `'14px'`. @default '14px' */
    readonly fontSize?: string;
    /** CSS font-weight for the chart. @default '400' */
    readonly fontWeight?: string;
    /** Background color of the timeline and task-list header row. @default '#f3f3f3' */
    readonly headerBackground?: string;
    /** Height of the chart. Accepts a pixel number or a CSS string. @default 500 */
    readonly height?: number | string;
    /** dayjs-compatible format string used to parse `startTime` / `endTime` values. @default 'MM-DD-YYYY' */
    readonly inputDateFormat?: string;
    /** Alternating row background colors. The pattern cycles automatically. @default ['#FFFFFF'] */
    readonly rowBackgroundColors?: readonly string[];
    /** Height of each task row in pixels. @default 28 */
    readonly rowHeight?: number;
    /** Task data array. Required. Each item must satisfy `TaskInput`, or use `parsing` to map custom field names. */
    readonly series: TaskInput[] | Record<string, unknown>[];
    /** Initial pixel width of the task-list panel. @default 425 */
    readonly tasksContainerWidth?: number;
    /** Background color of the hover tooltip. @default '#FFFFFF' */
    readonly tooltipBGColor?: string;
    /** Border color of the hover tooltip. @default '#BCBCBC' */
    readonly tooltipBorderColor?: string;
    /** HTML `id` for the tooltip container element. @default 'apexgantt-tooltip-container' */
    readonly tooltipId?: string;
    /** Custom function returning an HTML string for the task tooltip. */
    readonly tooltipTemplate?: (task: Task, dateFormat: string) => string;
    /** Timeline granularity. @default ViewMode.Month */
    readonly viewMode?: ViewMode;
    /** Width of the chart. Accepts a pixel number or a CSS string. @default '100%' */
    readonly width?: number | string;
    /** Field-mapping config to parse non-standard task shapes without manual data transformation. */
    readonly parsing?: ParsingConfig;
    /** Show a checkbox column for multi-select. Only applies when `enableSelection` is true. @default true */
    readonly showCheckboxColumn?: boolean;
    /**
     * Custom controls rendered in the toolbar alongside the built-in zoom and export buttons.
     * Each item can be a `ToolbarButton`, `ToolbarSelect`, or `ToolbarSeparator`.
     * Use `position: 'left'` to insert before the built-in controls (default is `'right'`).
     * @default []
     */
    readonly toolbarItems?: ToolbarItem[];
    /** `aria-label` for the task-list table, used by screen readers. @default 'Task list' */
    readonly taskListAriaLabel?: string;
}

export declare function getTheme(mode: ThemeMode): GanttTheme;

export declare const LightTheme: GanttTheme;

/**
 * Controls whether an annotation line or region is drawn horizontally
 * (spanning the full chart width) or vertically (spanning the full chart height).
 */
export declare enum Orientation {
    Horizontal = "horizontal",
    Vertical = "vertical"
}

/**
 * Field-mapping configuration for `DataParser`.
 *
 * Maps the required and optional `TaskInput` fields to paths in a raw
 * data object. Use this when your API returns data with different key names
 * than the `TaskInput` interface expects. Pass the result as
 * `GanttUserOptions.parsing`.
 *
 * @example
 * ```ts
 * const parsing: ParsingConfig = {
 *   id: 'task_id',
 *   name: 'title',
 *   startTime: 'start_date',
 *   endTime: 'end_date',
 *   progress: { key: 'pct_complete', transform: Number },
 * };
 * ```
 */
export declare interface ParsingConfig {
    id: ParsingValue;
    name: ParsingValue;
    startTime: ParsingValue;
    endTime?: ParsingValue;
    progress?: ParsingValue;
    type?: ParsingValue;
    parentId?: ParsingValue;
    dependency?: ParsingValue;
    barBackgroundColor?: ParsingValue;
    rowBackgroundColor?: ParsingValue;
    collapsed?: ParsingValue;
}

/**
 * A field mapping value: either a dot-notation path string to a key in the
 * raw data object, or an object with a `key` path and an optional `transform`
 * function for type coercion or renaming.
 *
 * @example
 * ```ts
 * // Simple path string
 * const mapping: ParsingValue = 'meta.taskId';
 *
 * // Path + transform
 * const mapping: ParsingValue = { key: 'start_date', transform: (v) => String(v) };
 * ```
 */
export declare type ParsingValue = string | {
    key: string;
    transform?: (value: unknown) => unknown;
};

/**
 * Detail payload for the `selectionChange` event.
 *
 * Fires whenever the set of selected task rows changes (click, Ctrl+Click,
 * Shift+Click, or keyboard selection).
 */
export declare interface SelectionChangeEventDetail {
    selectedTasks: Task[];
    selectedIds: string[];
    timestamp: number;
}

/**
 * Resolved task object used internally and returned from selection/event APIs.
 *
 * Extends `TaskInput` with fields that are guaranteed to be present after the
 * data normalisation step (missing optional fields are filled with defaults).
 * Use `Task` in wrapper libraries when typing event detail payloads and the
 * return value of `getSelectedTasks()`.
 */
export declare interface Task extends TaskInput {
    /** End date is always present after normalisation (defaults to `startTime` for milestones). */
    readonly endTime: string;
    /** Nesting depth in the task hierarchy. `0` = top-level task. */
    readonly level?: number;
    /** Resolved progress value (0–100). Always present; defaults to `0`. */
    readonly progress: number;
    /** Resolved task type. Always present; defaults to `TaskType.Task`. */
    readonly type: TaskType;
    /** Computed left offset in pixels within the timeline body. Set after layout. */
    readonly left?: number;
    /** Computed width in pixels within the timeline body. Set after layout. */
    readonly width?: number;
}

/**
 * Declares a predecessor/successor relationship between two tasks.
 *
 * Attach one or more of these to `TaskInput.dependency` to draw arrows between
 * task bars and have them respected during drag/resize operations.
 */
export declare interface TaskDependency {
    /** ID of the task this task depends on */
    readonly taskId: string;
    /** Dependency type. Defaults to 'FS' (Finish-to-Start) */
    readonly type?: DependencyType;
    /** Lag/lead in days. Positive = lag (delay), negative = lead (overlap). Defaults to 0. */
    readonly lag?: number;
}

/**
 * Detail payload for the `taskDragged` event.
 *
 * Fires when a task bar is dropped at a new horizontal position. All dates are
 * formatted using `GanttUserOptions.inputDateFormat`. `affectedChildTasks`
 * lists any sub-tasks whose dates were shifted as a side-effect.
 */
export declare interface TaskDraggedEventDetail {
    taskId: string;
    oldStartTime: string;
    oldEndTime: string;
    newStartTime: string;
    newEndTime: string;
    daysMoved: number;
    affectedChildTasks: Array<{
        taskId: string;
        newStartTime: string;
        newEndTime: string;
    }>;
    timestamp: number;
}

/**
 * Raw task data shape passed to `new ApexGantt()` via `GanttUserOptions.series`
 * or to `DataParser.parse()`.
 *
 * Dates are supplied as strings and parsed using `GanttUserOptions.inputDateFormat`
 * (default: `'YYYY-MM-DD'`). Any format understood by dayjs is valid when the
 * corresponding `inputDateFormat` is specified.
 *
 * @example
 * ```ts
 * const task: TaskInput = {
 *   id: 'task-1',
 *   name: 'Design Phase',
 *   startTime: '2026-01-01',
 *   endTime: '2026-01-15',
 *   progress: 60,
 *   type: TaskType.Task,
 * };
 * ```
 */
export declare interface TaskInput {
    /** Unique identifier for the task. Must be stable across renders. */
    readonly id: string;
    /** Display name shown in the task list column and task bar. */
    readonly name: string;
    /**
     * Task start date string. Parsed using `GanttUserOptions.inputDateFormat`.
     * @example `'2026-01-01'` (default format `'YYYY-MM-DD'`)
     */
    readonly startTime: string;
    /**
     * Task end date string. Parsed using `GanttUserOptions.inputDateFormat`.
     * When omitted, the task renders as a milestone on `startTime`.
     * @example `'2026-01-15'`
     */
    readonly endTime?: string;
    /**
     * Completion percentage (0–100). Renders a filled progress portion inside
     * the task bar. @default 0
     */
    readonly progress?: number;
    /**
     * Visual type of the task. `'task'` renders a bar; `'milestone'` renders a
     * diamond marker. @default TaskType.Task
     */
    readonly type?: TaskType;
    /**
     * ID of the parent task. Nested tasks are rendered as children in the
     * task list and inherit the parent's row background color.
     */
    readonly parentId?: string;
    /**
     * Dependency on another task. Accepts either a plain task ID string
     * (backwards-compatible, treated as Finish-to-Start with 0 lag) or a full
     * `TaskDependency` object for typed dependency with lag/lead support.
     * @example `'task-2'`
     * @example `{ taskId: 'task-2', type: 'FS', lag: 2 }`
     */
    readonly dependency?: string | TaskDependency;
    /** Override the task bar fill color for this specific task. */
    readonly barBackgroundColor?: string;
    /** Override the row background color for this specific task row. */
    readonly rowBackgroundColor?: string;
    /**
     * Baseline (planned) dates for comparison against actual dates.
     * Rendered as a thin bar below the actual task bar when
     * `GanttUserOptions.baseline.enabled` is `true`.
     */
    readonly baseline?: BaselineInput;
    /**
     * Whether this task's child tasks are collapsed (hidden) in the task list.
     * Mutable so it can be toggled by the expand/collapse UI without a full
     * options update. @default false
     */
    collapsed?: boolean;
}

/**
 * Detail payload for the `taskResized` event.
 *
 * Fires when a task bar is resized by dragging its left or right handle.
 * `durationChange` is the signed delta in days (positive = longer, negative = shorter).
 * All date strings are formatted using `GanttUserOptions.inputDateFormat`.
 */
export declare interface TaskResizedEventDetail {
    taskId: string;
    resizeHandle: 'left' | 'right';
    oldStartTime: string;
    oldEndTime: string;
    newStartTime: string;
    newEndTime: string;
    durationChange: number;
    timestamp: number;
}

/**
 * Discriminates how a task is rendered in the timeline.
 *
 * - `Task` — rendered as a horizontal bar spanning `startTime` to `endTime`.
 * - `Milestone` — rendered as a diamond marker at `startTime` with no duration.
 */
export declare enum TaskType {
    Milestone = "milestone",
    Task = "task"
}

/**
 * Detail payload for the `taskUpdateError` event.
 *
 * Fires when a task update fails after submission. `error` contains the
 * underlying `Error` instance for logging or user feedback.
 */
export declare interface TaskUpdateErrorEventDetail {
    taskId: string;
    error: Error;
    timestamp: number;
}

/**
 * Detail payload for the `taskUpdate` event.
 *
 * Fires immediately when a task update is submitted (before server-side
 * validation). Use `taskUpdateSuccess` or `taskUpdateError` to react to the
 * final outcome.
 */
export declare interface TaskUpdateEventDetail {
    taskId: string;
    updates: Partial<Task>;
    updatedTask: Task;
    timestamp: number;
}

/**
 * Detail payload for the `taskUpdateSuccess` event.
 *
 * Fires after a task update completes without error. `updatedTask` contains
 * the fully resolved `Task` object with all applied changes.
 */
export declare interface TaskUpdateSuccessEventDetail {
    taskId: string;
    updatedTask: Task;
    timestamp: number;
}

/**
 * Detail payload for the `taskValidationError` event.
 *
 * Fires when the inline task-edit form fails client-side validation.
 * `errors` contains one entry per failing field with a human-readable message.
 */
export declare interface TaskValidationErrorEventDetail {
    taskId: string;
    errors: Array<{
        field: string;
        message: string;
    }>;
    timestamp: number;
}

/** Color-mode selector. Switches between the built-in `LightTheme` and `DarkTheme` presets. */
export declare type ThemeMode = 'dark' | 'light';

/**
 * A plain button in the custom toolbar area.
 *
 * @example
 * {
 *   type: 'button',
 *   label: 'Send to Buffer',
 *   tooltip: 'Publish selected tasks to Buffer',
 *   requiresSelection: true,
 *   onClick: ({ selectedTasks }) => publish(selectedTasks),
 * }
 */
export declare interface ToolbarButton {
    type: 'button';
    /** Text label shown inside the button. */
    label?: string;
    /** SVG string rendered as the button icon. */
    icon?: string;
    /** Tooltip shown on hover (`title` attribute). */
    tooltip?: string;
    /**
     * Where to insert the button relative to the built-in zoom/view controls.
     * @default 'right'
     */
    position?: 'left' | 'right';
    /**
     * Static disabled flag, or a function evaluated on every selection change.
     * Use a function to disable the button when nothing is selected.
     *
     * @example
     * disabled: ({ selectedTasks }) => selectedTasks.length === 0
     */
    disabled?: boolean | ((context: ToolbarContext) => boolean);
    /**
     * When true the button is automatically disabled whenever the selection is
     * empty.  Equivalent to `disabled: ({ selectedTasks }) => selectedTasks.length === 0`
     * but more ergonomic for the common case.
     * @default false
     */
    requiresSelection?: boolean;
    /**
     * When true, the button label is augmented with the selection count badge,
     * e.g. "Send (3)".  Only meaningful when a `label` is also set.
     * @default false
     */
    showCount?: boolean;
    /** Called when the button is clicked. */
    onClick: (context: ToolbarContext) => void;
}

/**
 * Context object passed to toolbar item callbacks so they can read
 * the current selection without needing a reference to the chart instance.
 */
export declare interface ToolbarContext {
    /** Currently selected task objects. Empty array when nothing is selected. */
    selectedTasks: Task[];
}

/** Union of all supported toolbar item types. */
export declare type ToolbarItem = ToolbarButton | ToolbarSelect | ToolbarSeparator;

/**
 * A `<select>` dropdown in the custom toolbar area.
 *
 * @example
 * {
 *   type: 'select',
 *   label: 'Content Type',
 *   placeholder: 'Filter by type…',
 *   options: [
 *     { value: 'blog', text: 'Blog Post' },
 *     { value: 'video', text: 'Video' },
 *   ],
 *   onChange: (value, { selectedTasks }) => filter(value, selectedTasks),
 * }
 */
export declare interface ToolbarSelect {
    type: 'select';
    /** Optional label rendered before the `<select>` element. */
    label?: string;
    /** Placeholder option rendered when no value is chosen. */
    placeholder?: string;
    /** Where to insert relative to built-in controls. @default 'right' */
    position?: 'left' | 'right';
    /** List of options shown in the dropdown. */
    options: ReadonlyArray<{
        value: string;
        text: string;
    }>;
    /** Called when the selected value changes. */
    onChange: (value: string, context: ToolbarContext) => void;
}

/**
 * A thin vertical divider line between toolbar items.
 */
export declare interface ToolbarSeparator {
    type: 'separator';
    /** Where to insert relative to built-in controls. @default 'right' */
    position?: 'left' | 'right';
}

/**
 * Timeline granularity — controls the column width and header labels.
 *
 * Pass as `GanttUserOptions.viewMode`. Use the toolbar's zoom controls
 * or call `gantt.zoomIn()` / `gantt.zoomOut()` to switch dynamically.
 */
export declare enum ViewMode {
    Day = "day",
    Month = "month",
    Quarter = "quarter",
    Week = "week",
    Year = "year"
}

export { }
