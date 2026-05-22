declare interface AccessibilityOptions {
    readonly taskListAriaLabel?: string;
}

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

declare interface AnnotationOptions {
    readonly annotationBgColor?: string;
    readonly annotationBorderColor?: string;
    readonly annotationBorderDashArray?: number[];
    readonly annotationBorderWidth?: number;
    readonly annotationOrientation?: Orientation;
    /**
     * When true, two vertical lines are drawn across the timeline at the
     * project's earliest start and latest end, marking the overall span. The
     * lines auto-adjust as tasks are added, removed, or rescheduled.
     * @default false
     */
    readonly enableProjectBoundary?: boolean;
    /**
     * Stroke colour for the project-boundary lines. Falls back to
     * `annotationBorderColor` when omitted. @default '#7C3AED'
     */
    readonly projectBoundaryColor?: string;
}

declare class ApexGantt extends BaseChart {
    private options;
    /** Current zoom level as pixels-per-ms. Source of truth for all timeline math. */
    private pixelsPerMs;
    /** When non-null, `update()` preserves the previous zoom instead of resetting to a preset. */
    private _preservedPixelsPerMs;
    /**
     * True until we've computed an initial zoom that fits the data span into the
     * visible timeline area. Set when the user omits `pixelsPerDay`; cleared on
     * the first render that has both data and a sized container, or as soon as
     * the user supplies an explicit zoom via `update()` or the toolbar.
     */
    private needsAutoFitZoom;
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
    private _afterActionsRafId;
    private _destroyed;
    private criticalPathResult;
    /** Cached references to frequently queried DOM elements. Populated by cacheDomElements() after each render. */
    private domCache;
    private scrollManager;
    private zoomManager;
    private layoutManager;
    private styleManager;
    private crosshairManager;
    private keyboardNavigationManager;
    private selectionManager;
    private virtualScrollCoordinator;
    private readonly columnRenderManager;
    /** MediaQueryList for prefers-reduced-motion. Updated dynamically. */
    private reducedMotionMQL;
    private reducedMotionHandler;
    constructor(element: HTMLElement, options?: GanttUserOptions);
    /**
     * Compute the initial zoom level (pixels-per-ms) from user options.
     * Falls back to the library default when `pixelsPerDay` is not provided.
     */
    private computeInitialPixelsPerMs;
    /**
     * Pick a `pixels-per-ms` that fits the full data span into the visible
     * timeline area, with ~5% padding on each side. Returns `null` when we
     * can't measure (no element, zero-width container, no data, or zero-length
     * range) so the caller can fall back to the library default.
     *
     * Clamped to roughly `[0.25, 1280]` pixels-per-day to stay inside the
     * supported zoom bounds.
     */
    private computeAutoFitPixelsPerMs;
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
    /**
     * (Re)attach the timeline crosshair using the current zoom/geometry.
     * Safe to call after every render or zoom-driven rerender — it tears down
     * any previous attachment first.
     */
    private attachCrosshair;
    /**
     * Cancel any pending `performAfterActions` rAF callback.
     */
    private cancelPendingAfterActionsRaf;
    private cleanupEventListeners;
    private cleanupTooltips;
    private cleanupDependencyArrows;
    private createActionButton;
    private createSeparator;
    /**
     * Render the built-in toolbar (zoom controls, export button, and any custom
     * `toolbarItems`) into the provided container element.
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
     * Scroll position, collapsed/expanded state, and current zoom level are
     * preserved across updates unless explicitly overridden.
     *
     * @param options - Partial or full `GanttUserOptions` to apply.
     *
     * @example
     * ```ts
     * // Zoom to month density and update tasks
     * gantt.update({ pixelsPerDay: 4.9, series: newTasks });
     *
     * // Toggle dark theme at runtime
     * gantt.update({ theme: 'dark' });
     * ```
     */
    /**
     * Merge nested object option groups (baseline, barLabel) explicitly so a
     * partial user-supplied override doesn't blow away unspecified subfields.
     * Spread layers are: theme defaults → carried-over current options → incoming.
     */
    private mergeNestedOptionGroups;
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
    /**
     * Internal entry point used by inline editors in the task-list panel.
     * Applies the partial update via `updateTaskInUI` and emits the same
     * `taskUpdate` / `taskUpdateSuccess` / `taskUpdateError` events that the
     * inline TaskForm emits, so consumers see a uniform event stream regardless
     * of which UI surface produced the change.
     */
    private commitInlineEdit;
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

/**
 * A person (or team) assigned to a task. Consumed by the built-in
 * `renderers.avatars` cell renderer for an "Assigned Resources" column.
 *
 * The library does not interpret these values directly; supplying assignees
 * is only meaningful when an avatar-style column renderer is configured via
 * `columnConfig`.
 */
export declare interface Assignee {
    /** Display name. Used as the `alt` text on avatars and the initials source. */
    readonly name: string;
    /** Optional avatar image URL. When omitted, initials are rendered instead. */
    readonly avatarUrl?: string;
    /** Optional initials override. Defaults to the first letters of `name`. */
    readonly initials?: string;
    /** Optional background color for the initials fallback. */
    readonly color?: string;
}

/**
 * Configuration for the {@link avatars} column renderer.
 */
export declare interface AvatarsRendererOptions {
    /**
     * Returns the list of assignees for a task. Typically `(task) => task.assignees`.
     * Return `null`, `undefined`, or an empty array to render an empty cell.
     */
    readonly accessor: (task: Task) => readonly Assignee[] | null | undefined;
    /** Maximum number of avatars to show. Excess shown as "+N". @default 4 */
    readonly max?: number;
    /** Avatar diameter in pixels. @default 24 */
    readonly size?: number;
    /** Pixels each avatar overlaps the previous one. @default 8 */
    readonly overlap?: number;
    /** Border color around each avatar (matches the row background). @default '#FFFFFF' */
    readonly borderColor?: string;
    /** Default background color for the initials fallback when an `Assignee` lacks `color`. */
    readonly fallbackColor?: string;
}

/**
 * Controls how the per-task label is rendered next to each bar. Defaults to
 * `'right'` so labels stay readable regardless of bar width; set `position`
 * to `'inside'` to render centered inside the bar instead, or `'auto'` to
 * pick between the two based on whether the label fits. Use `render` to
 * compose names with chips, icons, or owner info.
 *
 * Outside labels are not currently rendered for milestones (the diamond is a
 * rotated element); set `render` to return an empty string to opt out for any
 * task.
 */
export declare interface BarLabelOptions {
    /** Where to render the label relative to the bar. @default 'right' */
    readonly position?: BarLabelPosition;
    /** Task field whose value populates the label when `render` is not set. @default 'name' */
    readonly field?: keyof Task;
    /** Custom renderer. Overrides `field` when provided. */
    readonly render?: BarLabelRenderer;
    /** Extra CSS class added to the label element. */
    readonly className?: string;
    /**
     * Pixels of empty space added to the start of the timeline so left-side
     * labels have room to render without being hidden behind the task-list
     * panel. Tune this up if your longest labels still get clipped, or down to
     * reclaim timeline space when labels are short.
     *
     * Auto-defaults to `120` when `position` is `'left'`, and `0` otherwise.
     * Set explicitly to `0` to disable the padding.
     */
    readonly leadingPadding?: number;
}

/**
 * Where to render the task label relative to the bar.
 *
 * - `'right'` (default) — rendered immediately to the right of the bar;
 *   always visible regardless of bar width.
 * - `'inside'` — centered inside the bar; clipped when the bar is narrower
 *   than the text.
 * - `'left'` — rendered immediately to the left of the bar.
 * - `'auto'` — `'inside'` when the label fits, otherwise `'right'`. Uses a
 *   character-width estimate for plain-text content; falls back to `'right'`
 *   when a custom `render` returns HTML/elements.
 */
export declare type BarLabelPosition = 'inside' | 'left' | 'right' | 'auto';

/**
 * Custom renderer for the bar label. Receives the resolved task and returns
 * either an HTML string (assigned via `innerHTML` — escape user input
 * yourself) or an `HTMLElement` to append. Returning `null` / `undefined`
 * falls back to rendering the value of `BarLabelOptions.field`.
 */
export declare type BarLabelRenderer = (task: Task) => string | HTMLElement | null | undefined;

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
    /** Color of the baseline bar. Defaults to '#BBD5DA' (light grey). */
    readonly color: string;
}

declare interface BorderOptions {
    readonly cellBorderColor: string;
    readonly cellBorderWidth: string;
    /**
     * Whether to draw vertical lines between timeline columns (the cell dividers
     * in the header and body grid). Set to `false` for a cleaner aesthetic that
     * keeps only the horizontal row dividers. @default true
     */
    readonly columnLines: boolean;
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
    ProgressRing = "progressRing",
    StartTime = "startTime",
    Wbs = "wbs"
}

export declare const ColumnList: ColumnListItem[];

/**
 * Defines a single column in the task-list panel.
 *
 * Pass an array of these to `GanttUserOptions.columnConfig` to override the
 * default column set. Use `ColumnList` as the starting point and filter or
 * reorder as needed.
 *
 * Custom columns are supported by setting `key` to any string (other than the
 * built-in `ColumnKey` values) and supplying a `render` function. Set
 * `accessor` to expose a comparable/filterable value for future sort/filter
 * features and SVG export.
 */
export declare interface ColumnListItem {
    /**
     * Identifier for the column. Use a `ColumnKey` value for built-in columns,
     * or any other string for a custom column with a `render` function.
     */
    readonly key: ColumnKey | string;
    readonly title: string;
    readonly minWidth?: string;
    readonly flexGrow?: number;
    readonly visible?: boolean;
    /**
     * Custom cell renderer. Required for custom columns; ignored for built-in
     * columns (built-ins use the library's internal renderer).
     */
    readonly render?: ColumnRenderer;
    /**
     * Extracts the underlying value of the cell from the task. Used by future
     * sort/filter features and by SVG export. Optional.
     */
    readonly accessor?: (task: Task) => unknown;
}

declare interface ColumnOptions {
    readonly columnConfig?: ColumnListItem[];
}

/**
 * Context object passed to a custom column `render` function.
 *
 * Use `task` for the row's data, `options` to read theme/format settings, and
 * the `isSummary` / `isMilestone` flags to vary rendering for grouping rows
 * and milestones.
 */
export declare interface ColumnRenderContext {
    /** The task being rendered for this row. */
    readonly task: Task;
    /** Resolved chart options (theme colors, date format, etc.). */
    readonly options: GanttOptions;
    /** Zero-based index of the row in the currently visible task list. */
    readonly rowIndex: number;
    /** True when the row is a summary (group) bar. */
    readonly isSummary: boolean;
    /** True when the row represents a milestone (no end time / diamond marker). */
    readonly isMilestone: boolean;
}

/**
 * Custom cell renderer for a column.
 *
 * Three return modes:
 *
 * - **Return a `string`** — the library treats it as HTML and assigns it to
 *   the cell via `innerHTML`. Best for vanilla JS and the built-in presets.
 *   Remember to escape user-supplied text yourself.
 * - **Return `void`** — you have already mounted content into the provided
 *   `el`. The library will not modify `el`'s contents until the next render.
 *   Use this from frameworks (React's `createRoot`, Angular's
 *   `ViewContainerRef`, Vue's `createApp().mount(el)`).
 * - **Return a cleanup function `() => void`** — same as `void`, but the
 *   library will invoke the returned function before the cell is discarded
 *   (row removal, full re-render, or `gantt.destroy()`). Required for
 *   framework adapters that need to unmount components to avoid memory
 *   leaks or stale change detection.
 *
 * @param ctx - Context describing the task and chart options.
 * @param el - The cell DOM element. Pre-attached, ready to receive content.
 */
export declare type ColumnRenderer = (ctx: ColumnRenderContext, el: HTMLElement) => void | string | (() => void);

declare interface CommonOptions {
    readonly backgroundColor: string;
    readonly borderColor: string;
    readonly canvasStyle: string;
    readonly enableExport: boolean;
    readonly enableResize: boolean;
    readonly headerBackground: string;
    readonly height: number | string;
    readonly inputDateFormat: string;
    readonly pixelsPerDay?: number;
    readonly tasksContainerWidth: number;
    readonly width: number | string;
}

declare interface CriticalPathOptions {
    /** When true, tasks and arrows on the critical path are highlighted. Defaults to false. */
    readonly enableCriticalPath: boolean;
    /** Fill color for critical-path task bars. Defaults to '#e53935'. */
    readonly criticalBarColor: string;
    /** Stroke color for critical-path dependency arrows. Defaults to '#e53935'. */
    readonly criticalArrowColor: string;
}

/**
 * Custom formatter for the crosshair date label.
 *
 * @param date - The date under the cursor.
 * @param tier - The currently active sub-tier of the timeline header
 *   (`'minute' | 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year'`).
 *   Use this to vary precision based on zoom level.
 * @returns The string rendered inside the crosshair label.
 */
export declare type CrosshairLabelFormatter = (date: Date, tier: TierId) => string;

export declare interface CrosshairOptions {
    readonly enableCrosshair: boolean;
    readonly crosshairColor: string;
    readonly crosshairLabelFormat?: CrosshairLabelFormatter;
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

/** Returns CSS class name(s) to add to a dependency arrow path. */
export declare type DependencyClassBuilder = (ctx: DependencyContext) => string | readonly string[] | undefined;

/**
 * Context passed to per-arrow `tooltipTemplate` and `classBuilder` callbacks.
 * Carries the resolved source/target tasks and the dependency metadata so
 * callers can format custom labels, tag arrows by relationship, etc.
 */
export declare interface DependencyContext {
    /** The predecessor task (the task this dependency points away from). */
    readonly fromTask: Task;
    /** The successor task (the task this dependency points to). */
    readonly toTask: Task;
    /** The dependency relationship: 'FS' | 'FF' | 'SS' | 'SF'. */
    readonly type: DependencyType;
    /** Lag/lead in days (positive = lag, negative = lead, 0 = none). */
    readonly lag: number;
}

/**
 * Visual + interaction options for dependency arrows.
 *
 * Arrows are rendered as SVG paths between bars with subtly rounded joints
 * by default. Tune `cornerRadius` for tighter or looser arcs, set `hitWidth`
 * for an invisible thicker target zone (so users can hover/click the thin
 * visible stroke), and use `tooltipTemplate` / `classBuilder` for per-arrow
 * content and styling.
 */
export declare interface DependencyOptions {
    /**
     * Pixel radius for rounded joints on dependency arrows. `0` produces sharp
     * 90° corners; larger values produce smoother arcs (clamped per-corner to
     * half the shorter adjacent segment so an arc never overshoots).
     * @default 4
     */
    readonly cornerRadius?: number;
    /**
     * Invisible hit-area thickness in pixels. When `> 0`, each arrow renders an
     * additional transparent path of this width that captures pointer events,
     * making the thin visible stroke easier to hover/click. Required for
     * `tooltipTemplate` to fire. @default 0
     */
    readonly hitWidth?: number;
    /**
     * Returns CSS class name(s) for each arrow. Use to tag arrows by
     * relationship (cross-team, blocked, optional…) and style them via custom
     * CSS rules on the resulting class.
     */
    readonly classBuilder?: DependencyClassBuilder;
    /**
     * Returns an HTML string shown when the user hovers an arrow. Requires a
     * non-zero `hitWidth` (otherwise hovering a 1–2 px stroke is impractical).
     */
    readonly tooltipTemplate?: DependencyTooltipTemplate;
}

/** Returns the HTML string used as a dependency arrow's hover tooltip. */
export declare type DependencyTooltipTemplate = (ctx: DependencyContext) => string;

/**
 * Finish-to-Finish (`FF`), Finish-to-Start (`FS`), Start-to-Finish (`SF`),
 * or Start-to-Start (`SS`) dependency relationship between two tasks.
 * Defaults to `'FS'` when not specified.
 */
export declare type DependencyType = 'FF' | 'FS' | 'SF' | 'SS';

/**
 * Escape a string so it can be safely interpolated into HTML.
 *
 * Use this in any custom column `render` function that returns a string and
 * interpolates user-supplied text (task names, assignee names, etc.). Without
 * escaping, user-controlled values can break out of the surrounding markup or
 * inject script tags.
 *
 * @example
 * ```ts
 * render: (ctx) => `<span title="${escapeHtml(ctx.task.name)}">${escapeHtml(ctx.task.name)}</span>`
 * ```
 */
export declare function escapeHtml(value: unknown): string;

declare interface FontOptions {
    readonly fontColor: string;
    readonly fontFamily: string;
    readonly fontSize: string;
    readonly fontWeight: string;
}

declare interface GanttBarOptions {
    readonly arrowColor: string;
    readonly barBackgroundColor: string;
    readonly barBorderRadius: string;
    readonly barLabel: BarLabelOptions;
    readonly barMargin: number;
    readonly barTextColor: string;
    readonly enableTaskEdit: boolean;
    /**
     * When true, summary (parent) rows display thin "rollup" markers below the
     * summary bar at each leaf descendant's date range — a glance-able overview
     * of children that stays visible even when the parent is collapsed.
     * @default false
     */
    readonly enableRollups: boolean;
    readonly summaryBarColor: string;
    readonly milestoneColor: string;
}

declare interface GanttBaselineConfig {
    readonly baseline: BaselineOptions;
}

declare interface GanttData {
    readonly annotations: Annotation[];
    readonly series: TaskInput[];
}

declare interface GanttDependencyConfig {
    readonly dependencies: DependencyOptions;
}

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
    /** Fires when the in-bar progress handle is dragged. */
    taskProgressChanged: CustomEvent<TaskProgressChangedEventDetail>;
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
     * emits when the in-bar progress handle is dragged to a new value
     */
    readonly TASK_PROGRESS_CHANGED: "taskProgressChanged";
    /**
     * emits when the set of selected tasks changes
     */
    readonly SELECTION_CHANGE: "selectionChange";
    /**
     * emits when a dependency arrow is created, updated, or removed
     */
    readonly DEPENDENCY_ARROW_UPDATE: "dependencyArrowUpdate";
};

declare type GanttOptions = GanttOptionsInternal;

declare type GanttOptionsInternal = AccessibilityOptions & AnnotationOptions & BorderOptions & CommonOptions & ColumnOptions & CriticalPathOptions & CrosshairOptions & FontOptions & GanttBarOptions & GanttBaselineConfig & GanttData & GanttDependencyConfig & GanttRowOptions & InteractiveOptions & ParsingOptions & SelectionOptions & ToolbarOptions & TooltipOptions;

declare interface GanttRowOptions {
    readonly rowBackgroundColors: readonly string[];
    readonly rowHeight: number;
}

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
    /**
     * Fill color for summary (group) bars. Renders distinct from regular task bars
     * to make the parent/child hierarchy visually obvious.
     */
    readonly summaryBarColor: string;
    /**
     * Fill color for milestone diamonds. Defaults to a violet accent so milestones
     * pop against the regular task bar palette.
     */
    readonly milestoneColor: string;
    /** Fill color for task bars on the critical path. */
    readonly criticalBarColor: string;
    /** Stroke color for dependency arrows on the critical path. */
    readonly criticalArrowColor: string;
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
 *   pixelsPerDay: 80, // day-density timeline
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
    /**
     * When true, two vertical lines mark the project's earliest start and
     * latest end across all rows. Auto-recomputes when tasks change.
     * @default false
     */
    readonly enableProjectBoundary?: boolean;
    /**
     * Stroke colour for the project-boundary lines. Falls back to
     * `annotationBorderColor` when omitted. @default '#7C3AED'
     */
    readonly projectBoundaryColor?: string;
    /** Color of dependency arrows between tasks. @default '#94A3B8' */
    readonly arrowColor?: string;
    /** Background color of the whole chart container. @default '#FFFFFF' */
    readonly backgroundColor?: string;
    /** Default background fill color for task bars. @default '#87B7FE' (light) / '#818CF8' (dark) */
    readonly barBackgroundColor?: string;
    /** CSS border-radius applied to task bars. @default '5px' */
    readonly barBorderRadius?: string;
    /**
     * Per-task bar label. Default renders the task name immediately to the
     * right of the bar so narrow bars don't clip the text. Set
     * `position: 'inside'` to render centered inside the bar instead, or
     * `'auto'` to pick automatically; supply `render` to compose names with
     * chips/icons/avatars.
     */
    readonly barLabel?: BarLabelOptions;
    /** Top and bottom margin inside each row for the task bar in pixels. @default 4 */
    readonly barMargin?: number;
    /** Text color rendered inside task bars. @default '#FFFFFF' */
    readonly barTextColor?: string;
    /**
     * Fill color for summary (group) bars. Renders distinct from regular task
     * bars to make the parent/child hierarchy visually obvious.
     * @default '#B9CECE' (light) / '#8FBCBC' (dark)
     */
    readonly summaryBarColor?: string;
    /**
     * Fill color for milestone diamonds.
     * @default '#7C3AED' (light) / '#A78BFA' (dark)
     */
    readonly milestoneColor?: string;
    /** Baseline options. When `enabled` is true, tasks with a `baseline` field render a thin bar below the actual bar. */
    readonly baseline?: Partial<BaselineOptions>;
    /**
     * Dependency arrow polish: rounded joints (`cornerRadius`), invisible hit
     * area for hover/click (`hitWidth`), per-arrow CSS class (`classBuilder`),
     * and HTML hover tooltip (`tooltipTemplate`).
     */
    readonly dependencies?: DependencyOptions;
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
    /**
     * Show a vertical crosshair line that follows the cursor across the timeline,
     * with a label displaying the precise date/time at the pointer position.
     * Useful for reading exact positions on long timelines.
     * @default false
     */
    readonly enableCrosshair?: boolean;
    /** Color of the crosshair line and label background. @default '#87B7FE' (light) / '#818CF8' (dark) */
    readonly crosshairColor?: string;
    /**
     * Custom formatter for the crosshair label text. Receives the date under the
     * cursor and the current sub-tier of the timeline header. When omitted, the
     * label auto-adapts to the active tier: `'ddd MM/DD/YYYY'` for day/week/
     * month/quarter/year tiers and `'MM/DD HH:mm'` for hour/minute tiers.
     */
    readonly crosshairLabelFormat?: CrosshairLabelFormatter;
    /** Border color for all cells in the task table and timeline grid. @default '#D0D7DE' */
    readonly cellBorderColor?: string;
    /** CSS border-width for all cell lines, e.g. `'1px'`. @default '1px' */
    readonly cellBorderWidth?: string;
    /** Custom column definitions for the task-list panel. When omitted, all default columns are shown. */
    readonly columnConfig?: ColumnListItem[];
    /**
     * Whether to draw vertical lines between timeline columns (the cell
     * dividers in the header and body grid). Set to `false` for a cleaner
     * aesthetic that keeps only the horizontal row dividers. @default true
     */
    readonly columnLines?: boolean;
    /**
     * When `true`, summary (parent) rows display thin rollup markers below the
     * summary bar at each leaf descendant's date range — a glance-able overview
     * of children that stays visible even when the parent is collapsed.
     * @default false
     */
    readonly enableRollups?: boolean;
    /**
     * Allow editing task fields directly in the task-list cells. When `true`,
     * double-clicking a `name`, `startTime`, `endTime`, `duration`, or
     * `progress` cell swaps the cell for an input. Commit with Enter or blur,
     * cancel with Escape. Summary rows, milestones (date/duration/progress),
     * and empty rows are not editable.
     *
     * Auto-enabled when `enableTaskEdit` is `true` unless explicitly set to
     * `false`. Set `enableInlineEdit: false` alongside `enableTaskEdit: true`
     * to keep the bar-click dialog without inline cell editing.
     * @default false
     */
    readonly enableInlineEdit?: boolean;
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
    /**
     * Allow editing task progress by dragging the small handle at the bottom of
     * the bar. The handle becomes visible on bar hover and snaps to whole
     * percent on commit. Emits a `taskProgressChanged` event.
     * @default true
     */
    readonly enableProgressDrag?: boolean;
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
    /**
     * Initial zoom level expressed as **pixels per day**. Continuous; the
     * timeline header automatically picks calendar tiers (year/quarter/month/
     * week/day/hour/minute) appropriate for the current zoom.
     *
     * Reference values (calibrated to match the legacy view-mode presets):
     * - Year ≈ `0.5`
     * - Quarter ≈ `1.6`
     * - Month ≈ `4.9`
     * - Week ≈ `25.7`
     * - Day = `80`
     *
     * Bounds are clamped to roughly `[0.25, 1280]` px/day. Values outside this
     * range are clipped.
     *
     * **When omitted**, the chart auto-fits the full data range into the visible
     * timeline area on first render so a long project doesn't open scrolled.
     * Supply an explicit value here (or zoom via the toolbar) to take control.
     */
    readonly pixelsPerDay?: number;
    /** Width of the chart. Accepts a pixel number or a CSS string. @default '100%' */
    readonly width?: number | string;
    /** Field-mapping config to parse non-standard task shapes without manual data transformation. */
    readonly parsing?: ParsingConfig;
    /** Show a checkbox column for multi-select. Only applies when `enableSelection` is true. @default true */
    readonly showCheckboxColumn?: boolean;
    /**
     * Granularity at which task drag, resize, and inline edits snap. Affects
     * data updates only — the timeline header tier is independent and follows
     * `pixelsPerDay`.
     *
     * - `'day'` (default): drags snap to whole days, end-time treated as
     *   inclusive (a 1-day task spans one cell).
     * - `'hour'` / `'minute'`: drags snap to whole hours / minutes. Combine
     *   with `snapValue` (e.g., `snapUnit: 'minute'`, `snapValue: 15` for
     *   15-minute steps). End-time is treated as the exclusive end timestamp
     *   when `inputDateFormat` includes time tokens (e.g. `HH:mm`).
     *
     * @default 'day'
     */
    readonly snapUnit?: SnapUnit;
    /**
     * Multiplier applied to `snapUnit`. Examples: `snapUnit: 'minute',
     * snapValue: 15` snaps to 15-min increments; `snapUnit: 'hour',
     * snapValue: 6` snaps to 6-hour increments.
     * @default 1
     */
    readonly snapValue?: number;
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

declare interface InteractiveOptions {
    readonly enableInlineEdit: boolean;
    readonly enableTaskDrag: boolean;
    readonly enableTaskResize: boolean;
    readonly enableProgressDrag: boolean;
    readonly snapUnit: SnapUnit;
    readonly snapValue: number;
}

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

declare interface ParsingOptions {
    readonly parsing?: ParsingConfig;
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
 * Configuration for the {@link progressRing} column renderer.
 */
export declare interface ProgressRingRendererOptions {
    /**
     * Returns the percentage (0–100) for the task. Defaults to `task.progress`.
     * Values are clamped to `[0, 100]`; `null`/`undefined` are treated as `0`.
     */
    readonly accessor?: (task: Task) => number | null | undefined;
    /** Outer diameter of the ring in pixels. @default 32 */
    readonly size?: number;
    /** Stroke width of the ring in pixels. @default 3 */
    readonly strokeWidth?: number;
    /** Color of the progress arc. Accepts a static hex string or a per-task function. @default '#EF4444' */
    readonly progressColor?: string | ((task: Task, value: number) => string);
    /** Color of the background track. @default '#E5E7EB' */
    readonly trackColor?: string;
    /** Show the percentage as a text label inside the ring. @default true */
    readonly showLabel?: boolean;
    /** Label text color. Defaults to `currentColor` (inherits cell color). */
    readonly labelColor?: string;
}

export declare namespace renderers {
        {
        avatars,
        AvatarsRendererOptions,
        progressRing,
        ProgressRingRendererOptions
    }
}

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

declare interface SelectionOptions {
    readonly enableSelection: boolean;
    readonly showCheckboxColumn: boolean;
}

export declare type SnapUnit = 'day' | 'hour' | 'minute';

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
    /**
     * Work Breakdown Structure code derived from the task's position in the
     * hierarchy (e.g. `'1'`, `'1.1'`, `'1.1.2'`, `'2'`). Recomputed whenever the
     * tree changes; render via the `ColumnKey.Wbs` column or read directly.
     */
    readonly wbs?: string;
    /** Resolved progress value (0–100). Always present; defaults to `0`. */
    readonly progress: number;
    /** Resolved task type. Always present; defaults to `TaskType.Task`. */
    readonly type: TaskType;
    /** Computed left offset in pixels within the timeline body. Set after layout. */
    readonly left?: number;
    /** Computed width in pixels within the timeline body. Set after layout. */
    readonly width?: number;
    /**
     * Computed summary start date (ISO string). Set by `DataManager.computeSummaryDates()`
     * when `showSummaryBar` is `true`; equals the earliest `startTime` among all descendants.
     */
    readonly summaryStart?: string;
    /**
     * Computed summary end date (ISO string). Set by `DataManager.computeSummaryDates()`
     * when `showSummaryBar` is `true`; equals the latest `endTime` among all descendants.
     */
    readonly summaryEnd?: string;
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
    /**
     * Days the task moved. Fractional when `snapUnit` is `'hour'` or `'minute'`
     * (e.g., a 6-hour move reports `0.25`).
     */
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
    /**
     * When `true`, this task renders as a summary (group) bar whose date range
     * is automatically computed from the earliest start and latest end of all
     * its descendants. The task's own `startTime`/`endTime` are ignored — a
     * warning is logged if both are provided. Drag, resize, and progress are
     * disabled on summary bars; they are always read-only.
     * @default true
     */
    readonly showSummaryBar?: boolean;
    /**
     * People (or teams) assigned to this task. Consumed by the built-in
     * `renderers.avatars` column renderer; ignored unless an avatar-style
     * column is configured via `columnConfig`.
     */
    readonly assignees?: readonly Assignee[];
}

/**
 * Detail payload for the `taskProgressChanged` event.
 *
 * Fires when the in-bar progress handle is dragged to a new value (the white
 * wedge that becomes visible on bar hover). Both values are integer percent
 * 0–100; identical-value drags are suppressed.
 */
export declare interface TaskProgressChangedEventDetail {
    taskId: string;
    oldProgress: number;
    newProgress: number;
    timestamp: number;
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

/** Identifier for a timeline tier. Ordered finest to coarsest. */
export declare type TierId = 'minute' | 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';

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

declare interface ToolbarOptions {
    readonly toolbarItems: ToolbarItem[];
}

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

declare interface TooltipOptions {
    readonly enableTooltip: boolean;
    readonly tooltipBGColor: string;
    readonly tooltipBorderColor: string;
    readonly tooltipId: string;
    readonly tooltipTemplate?: (task: Task, dateFormat: string) => string;
}

export { }
