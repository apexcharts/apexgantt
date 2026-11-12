declare abstract class BaseChart {
  /** @internal */
  protected element: HTMLElement;
  /** Destroys the chart instance and cleans up DOM resources. */
  destroy(): void;
  /** Returns the unique identifier for this chart instance. */
  getInstanceId(): string;
}

declare type TextDirection = 'ltr' | 'rtl' | 'auto';


declare interface AccessibilityOptions {
    readonly taskListAriaLabel?: string;
}

/**
 * Interface representing an annotation in the graph.
 */
export declare interface Annotation {
    /** Fill of a range annotation. @default the chart's `annotationBgColor` */
    readonly bgColor?: string;
    /** Border colour. @default the chart's `annotationBorderColor` */
    readonly borderColor?: string;
    /**
     * Dash pattern for the border, as an SVG `stroke-dasharray`: a single
     * length (equal dash and gap) or a list of dash and gap lengths in px, e.g.
     * `[6, 3]`. `0` or `[]` draws it solid. Falls back to the chart's
     * `annotationBorderDashArray`.
     * @default the chart's `annotationBorderDashArray` (`[]`, solid)
     */
    readonly borderDashArray?: number | number[];
    /** Border width in px. @default the chart's `annotationBorderWidth` */
    readonly borderWidth?: number;
    /** Optional text label drawn at the top of the annotation. */
    readonly label?: AnnotationLabel;
    /** Start date (a line when `x2` is omitted), in `inputDateFormat`. */
    readonly x1: string;
    /** End date. When set, a filled region from `x1` to `x2` is drawn. */
    readonly x2?: null | string;
}

/**
 * Interface representing the label of an annotation.
 */
export declare interface AnnotationLabel {
    /** Label text colour. @default the chart's `fontColor` */
    readonly fontColor?: string;
    /** Label font family. @default the chart's `fontFamily` */
    readonly fontFamily?: string;
    /** Label font size. @default the chart's `fontSize` */
    readonly fontSize?: string;
    /** Label font weight. @default the chart's `fontWeight` */
    readonly fontWeight?: string;
    /**
     * Orientation of this label's text. Falls back to the chart's
     * `annotationOrientation`.
     * @default the chart's `annotationOrientation` (`Orientation.Horizontal`)
     */
    readonly orientation?: Orientation;
    /** Label text. */
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
    /**
     * The `locale` option resolved against its pack: messages, tag, date locale,
     * direction and display formats. Memoised per merged `locale` object.
     */
    private get resolvedLocale();
    /** A string message of the resolved locale, filled with `params`. */
    private readonly text;
    /** The column list with built-in titles from the resolved messages (`columnConfig[].title` wins). */
    private resolveColumns;
    /** Resolved, localized user-facing strings (English defaults, then the pack's, then `locale.messages`). */
    private get messages();
    /** Whether the resolved direction (the user's, else the pack's) is right-to-left (mirrors the time axis). */
    private get isRtl();
    /**
     * Geometry of the timeline header currently on screen. Captured at every full
     * render so partial updates (drag/resize commits, inline edits, summary
     * cascades) can position bars against the SAME origin the header uses.
     *
     * Without this, `applyTaskUpdate` would recompute geometry from current data,
     * and any data change that shifts the `alignToStep(min(startTimes), subTier)`
     * result (e.g. dragging the earliest task onto a Sunday under the week tier)
     * would land bars against a different origin than the rendered header — the
     * bar visibly snaps to a wrong date.
     *
     * Cleared on zoom change or anything that triggers a full re-render.
     */
    private currentGeometry;
    /** When non-null, `update()` preserves the previous zoom instead of resetting to a preset. */
    private _preservedPixelsPerMs;
    /**
     * True until we've computed an initial zoom that fits the data span into the
     * visible timeline area. Set when the user omits `pixelsPerDay`; cleared on
     * the first render that has both data and a sized container, or as soon as
     * the user supplies an explicit zoom via `update()` or the toolbar.
     */
    private needsAutoFitZoom;
    /** The `inputDateFormat` already warned about, so its token warning logs once per chart. */
    private warnedInputDateFormat;
    /** Invalid `calendar` header settings already warned about (`key:value`), so each logs once per chart. */
    private readonly warnedCalendarSettings;
    /**
     * `locale.timelineHeaderFormat` rows (`tier.position`) whose override failed
     * and was warned about. Kept per chart, not per module: two charts each warn,
     * and a wrapper that sends new function objects on every update still warns
     * only once.
     */
    private readonly warnedHeaderFormats;
    /** Passed to the TimeLine: warn once per row when a header label override fails. */
    private readonly onHeaderFormatError;
    /**
     * True from the first render until its first frame applies the RTL start
     * scroll (see ScrollManager.setInitialHorizontalScroll). Only that first
     * paint opens at the start of the timeline: re-renders restore the captured
     * position, and a timeline-only re-render (zoom) anchors its own.
     */
    private pendingStartScroll;
    /**
     * Set when `scrollToTask` or `setState({scroll})` scrolls after a render and
     * before its first frame, so that frame's start scroll and scroll restore do
     * not undo it. Reset by every render.
     */
    private scrollRequestedSinceRender;
    /** Whether the caller passed `height` to the constructor (read before defaults are merged). */
    private readonly heightFromUser;
    /**
     * The option keys the page passed, through the constructor and every
     * `update()`. Merged with the theme defaults, a value the page set looks
     * like any other, and only these outrank the `--apex-gantt-*` variables and
     * the family tokens. A key passed as `undefined` leaves; a theme switch
     * takes out the colours the theme owns unless the same call passes them.
     */
    private readonly explicitKeys;
    /**
     * The dark theme colours in force came from the page design system's
     * variant, not from the page: they go back to the light ones when the
     * variant does.
     */
    private variantModeApplied;
    /**
     * True while `height` is unset and the container has a height of its own, so
     * the chart fills it and follows its size instead of writing the 500px default.
     */
    private fillsContainerHeight;
    /** The inline height render() last wrote, so it can be told apart from the page's own. */
    private writtenHeight;
    private arrowLink;
    /** Owns the live task data: edits land here, not in `options.series`. */
    private dataManager;
    /**
     * The last `series` as the user passed it, before `parsing`. Kept so an
     * `update({parsing})` without new data re-parses the source rows rather than
     * already-parsed tasks.
     */
    private rawSeries;
    /**
     * The `calendar` option as the user passed it (`undefined` when not passed).
     * Theme defaults carry `calendar: {}`, so the merged options cannot tell "no
     * calendar" from an explicit `{}`, which turns a Monday to Friday week on.
     */
    private userCalendar;
    /**
     * `locale.direction` as the user passed it (`undefined` when unset). Theme
     * defaults carry `direction: 'ltr'`, which would otherwise mask a pack's `dir`.
     */
    private userDirection;
    /** True while the chart root's `lang` was set by the chart from `locale.tag` or the pack. */
    private rootLangOwned;
    /** The root's own `lang` before the chart set one (`null` when it had none), restored when the tag goes. */
    private hostLang;
    /** Set once a string `locale.pack` has been warned about, so it logs once per chart. */
    private warnedStringPack;
    /** Active sort criteria. Empty array = natural (input) order. */
    private sortCriteria;
    /** Active filter predicate, or null when no filter is applied. */
    private activeFilter;
    /** Current text in the built-in quick-filter box; preserved across re-renders. */
    private quickFilterQuery;
    /** Caret position to restore in the quick-filter box after a filter re-render. */
    private quickFilterCaret;
    /** Active structured filter rules (advanced filter builder), or null. */
    private filterRuleSet;
    /** Open/closed state of the filter-builder popover, preserved across re-renders. */
    private filterBuilderOpen;
    /** In-progress (uncommitted) rule set being edited in the filter-builder popover (mutable working copy). */
    private filterBuilderDraft;
    /** Active grouping criterion (normalized), or null when not grouping. */
    private groupCriterion;
    /** Manual per-column pixel widths set by resizing a header (or `setColumnWidth`); empty = all auto. */
    private columnWidthOverrides;
    /** User-chosen column order (keys left-to-right) from a header drag or `setColumnOrder`; null = configured order. */
    private columnOrder;
    /** Pending debounce timer for the opt-in localStorage state-persistence layer. */
    private persistTimer;
    /** Listener (shared by selection + scroll) that schedules a persist; null until attached. */
    private persistChangeHandler;
    /** Whether we've attempted the one-time restore of persisted state on first render. */
    private stateRestoreAttempted;
    /** True while `setState()` is applying state, so nested renders don't re-persist mid-flight. */
    private isApplyingState;
    private stateManager;
    private history;
    /**
     * Bridge handed to every Command. Defined as an arrow-property record so it
     * captures `this` lexically — commands never see the ApexGantt instance
     * directly, only the narrow primitives they need.
     */
    /**
     * Bundle of column metadata + dispatcher passed to `updateTaskInUI` and
     * `refreshSummaryAncestors`. Without this, cells with a custom column
     * renderer would get overwritten with the default `[object Object]` text
     * since the rewriters can't tell which columns are custom.
     */
    private buildColumnRefreshContext;
    /**
     * Fit-to-content pixel widths per column when `autoSizeColumns` is on, else
     * `undefined` (columns fall back to `minWidth` + `flexGrow`). Measured against
     * the resolved fonts so the estimate matches what the browser will render.
     */
    private computeAutoColumnWidths;
    /**
     * Task-list panel width: the configured `tasksContainerWidth`, grown to the
     * total of the auto-sized columns (+ checkbox + borders) so content never
     * clips. Never shrinks below the configured width, so wider layouts keep
     * distributing the extra space via `flexGrow`.
     */
    private effectivePanelWidth;
    /**
     * Build a TimelineGeometry from the current data state, through the same
     * builder the TimeLine draws its header with. Used to capture
     * `currentGeometry` after every full render and timeline re-render, and as
     * the fallback for partial-update paths before the first one. Prefer
     * `this.currentGeometry` whenever possible (see its declaration).
     */
    private buildFreshGeometry;
    /**
     * The options bars are painted from: `this.options` with `barBackgroundColor`,
     * the font and the tooltip background replaced by what StyleManager resolved
     * at the last render (an option the page passed, `--apex-gantt-*`, `--apx-*`,
     * the design system, the default). Bars used to read the options alone, so
     * the variables and the tokens never reached them. A per-task
     * `barBackgroundColor` still wins inside Bar.
     */
    private paintOptions;
    private commandContext;
    /** `mergeKey` of the gesture whose lead update `beforeTaskUpdate` last vetoed; its later updates are skipped. */
    private vetoedMergeKey;
    /** The open {@link batchEdits} call, or `null`. */
    private editBatch;
    /**
     * Run several task edits as one: a parent dragged or moved by keyboard with
     * its descendants, or the undo / redo of such a gesture. Each edit still goes
     * through the commit path (hook, `taskUpdate`, undo history), but the work
     * every edit would repeat over the whole chart runs once at the end: the data
     * rebuild (tree, summaries, levels, WBS, dependency text), the summary rows,
     * the project-boundary lines, the critical path and any full render. Without
     * it a parent with 1000 descendants took seconds per drag.
     *
     * `taskUpdateSuccess` for edits inside the batch fires at the end, so its
     * `updatedTask` carries the rebuilt values. Nested calls join the outer batch.
     */
    private batchEdits;
    /** The commit callback handed to bars: {@link commitTaskUpdate}, able to batch a gesture's edits. */
    private barCommit;
    /** Run the refreshes a batch deferred, then fire its held `taskUpdateSuccess` events. */
    private flushEditBatch;
    /** A full render now, or at the end of the open batch. */
    private renderOrDefer;
    /**
     * Single funnel for every task edit: drag, resize, progress drag, keyboard
     * move / resize, dialog save, inline edit and `updateTask()`. Runs
     * `beforeTaskUpdate`, then builds an `UpdateTaskCommand`, executes it through
     * the bridge (which cascades summary ancestors) and records it in history,
     * firing `taskUpdate` before and `taskUpdateSuccess` after (unless
     * `meta.silent`). Undo / redo bypass this and fire neither.
     *
     * Returns `false` when the edit was not applied: the hook vetoed it, the
     * lead update of the same `meta.mergeKey` gesture was vetoed, or applying
     * it threw (`taskUpdateError` fires; rethrown for `source: 'api'`). The bar
     * is then repainted from the model so a dragged bar snaps back. Bound to
     * `this` so it can be passed down to TimeLine / VirtualScrollCoordinator as
     * a plain callback.
     */
    private commitTaskUpdate;
    /** Dispatch one of the task-update events on the chart element. */
    private dispatchTaskEvent;
    /**
     * Put a bar back where the model says it is after a rejected edit: a drag,
     * resize or progress drag has already moved it on screen. No-op when the
     * bar is not rendered.
     */
    private repaintBarFromModel;
    /**
     * Record a single command into history and fire `historyChange`. Centralized
     * so every recording path (interactive + programmatic) emits the same event
     * — anything keying off `canUndo` / `canRedo` (e.g. toolbar button enabled
     * state) stays in sync without per-site bookkeeping.
     */
    private recordSingle;
    /**
     * Record a pre-built `Transaction` (used when one user action expands to
     * multiple commands, e.g. delete-with-cascade) and fire `historyChange`.
     */
    private recordTransaction;
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
    private contextMenuManager;
    private contextMenuHandler;
    private undoRedoKeyHandler;
    private selectionManager;
    private dependencyEditManager;
    private dependencyDrawManager;
    private drawTaskManager;
    private scrollButtonsManager;
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
     * ApexGantt is included in the Premium plan and above. Without a key, or with
     * a key for a lower plan, the chart renders with a trial watermark.
     *
     * Call it once, typically at app startup. It may also be called after charts
     * have rendered (since 3.17.0): charts already on the page drop or keep their
     * watermark when the key arrives. Calling it before the first `render()`
     * avoids showing the watermark for a frame.
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
    private drawDependencyArrows;
    private setupDependencyArrowEvents;
    /**
     * Recompute the critical path from current data and re-sync the DOM. Stale
     * classes are cleared first because an edit can take a task or edge off the
     * path as well as put one on it.
     */
    private refreshCriticalPath;
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
    /** Value the user last chose in each custom toolbar select, kept across toolbar rebuilds. */
    private toolbarSelectValues;
    private createToolbarSelect;
    /**
     * Merge nested object option groups (baseline, barLabel) explicitly so a
     * partial user-supplied override doesn't blow away unspecified subfields.
     * Spread layers are: theme defaults → carried-over current options → incoming.
     */
    private mergeNestedOptionGroups;
    /**
     * Update chart options and re-render.
     *
     * Merges the supplied options with the current configuration. Only the keys
     * you pass are changed; unspecified keys keep their current values. Passing
     * `undefined` for a key resets it to its default value. The exception is a
     * call that switches `theme`: the color options the theme sets (such as
     * `barBackgroundColor`, `fontColor` and `rowBackgroundColors`; the full list
     * is on the `theme` option) return to the new theme's values, user-set ones
     * included, unless the same call passes them. Every other option carries
     * over.
     *
     * The current tasks are kept, with every edit made by dragging,
     * `updateTask()`, `addTask()`, `deleteTask()`, `moveTask()` or a dependency
     * change. Passing `series` (or `parsing`) replaces the data and clears the
     * undo history. Passing `calendar` or `inputDateFormat` rebuilds the working
     * calendar.
     *
     * Scroll position and the current zoom level are preserved unless explicitly
     * overridden; collapsed/expanded state stays with the kept tasks.
     *
     * @param options - Any subset of `GanttUserOptions` to apply.
     *
     * @example
     * ```ts
     * // Zoom to month density and replace the tasks
     * gantt.update({ pixelsPerDay: 4.9, series: newTasks });
     *
     * // Toggle dark theme at runtime; the tasks (and their edits) stay
     * gantt.update({ theme: 'dark' });
     *
     * // Keep a brand bar color through the switch
     * gantt.update({ theme: 'dark', barBackgroundColor: brandColor });
     * ```
     */
    update(options: GanttUpdateOptions): void;
    /**
     * The task inputs an `update()` call replaces the data with, or `null` when
     * the current tasks (edits included) stay. Only an explicit `series` or
     * `parsing` replaces them; `options.series` is never read back, so a later
     * update (a theme change, say) cannot bring old data back.
     */
    private seriesForUpdate;
    /**
     * Warn, once per chart, when `locale.pack` is a string (as an old wrapper
     * bridge may send). Packs are objects; a string is ignored.
     */
    private warnOnStringPack;
    /**
     * Mark the chart root with the resolved `locale.tag` (or the pack's tag).
     * The attribute is touched only when a tag resolves, or when the chart set
     * it earlier: without a tag the root keeps whatever `lang` the host gave it,
     * and a host `lang` overwritten by a tag comes back when the tag goes.
     */
    private applyRootLang;
    /** Give the root back the `lang` it had before the chart set one (none, if it had none). */
    private releaseRootLang;
    /**
     * Warn, once per chart and format, when `inputDateFormat` holds a token the
     * bundled format plugins print as a value (such as `Q` or `k`) outside
     * `[brackets]`. Before those plugins such a letter printed as written.
     */
    private warnOnPluginTokensInInputFormat;
    /**
     * The data side of `update()`: rebuild the working calendar when `calendar`
     * or `inputDateFormat` is passed, then load the replacement tasks, if any.
     * The calendar is built from the user's own `calendar` option, so a theme
     * change (whose defaults carry `calendar: {}`) never turns one on or off.
     */
    private applyDataUpdate;
    /**
     * Turn a `series` option into task inputs, mapped through `parsing` when one
     * is set. Returns `null` when the parsing config is invalid.
     */
    private resolveSeries;
    /**
     * Hand the data layer the working calendar built from the user's own
     * `calendar` option (see {@link userCalendar}) and the current date format.
     */
    private applyWorkingCalendar;
    /**
     * Keep {@link explicitKeys} in step with an `update()`: keys passed as
     * `undefined` reset and leave, a theme switch returns the colours the theme
     * owns to its defaults (so they leave too, unless this call passes them),
     * and every key this call passes joins. A `theme` or `backgroundColor` the
     * page passes makes the mode the page's, so a variant fill is dropped.
     */
    private trackExplicitKeys;
    /**
     * A `backgroundColor` passed through `update()` (with no theme switch) takes
     * the mode over from a variant fill, so the colours the fill darkened and the
     * page has not passed go to the defaults of the mode that background reads
     * as, the mode StyleManager paints in. Without this a light background kept
     * the dark rows, header and text the fill left in the options.
     */
    private takeBackVariantForBackground;
    /**
     * The page design system's variant as the lowest-ranked source of the theme
     * (D6). A chart whose page passed neither `theme` nor `backgroundColor`
     * takes the dark theme's colours while the variant is dark, for every colour
     * option the page did not pass, and goes back to the light ones when the
     * variant changes or the design system goes away. A light variant changes
     * nothing. The dark paper is the theme's own: the design system never paints
     * it.
     */
    private applyDesignSystemVariant;
    /**
     * Warn, once per chart and value, about a `calendar.weekStart` or
     * `calendar.fiscalYearStartMonth` the header has to ignore.
     */
    private warnOnInvalidCalendarSettings;
    /**
     * The mode the chart is showing now, read from its background luminance in
     * any CSS colour syntax. The `theme` option is consulted only when that
     * colour cannot be resolved: an explicit `theme: 'light'` over a dark custom
     * background still reads as dark, so `update({theme: 'dark'})` keeps the
     * user's colours instead of resetting them.
     */
    private detectCurrentTheme;
    /**
     * The chart's mode for the design system's gate and the export's paper:
     * the theme the page passed (a registered theme's `mode` for a name), else
     * a dark design-system variant that filled an unset theme, else what the
     * background reads as. See {@link resolveGanttMode}.
     */
    private resolveMode;
    /**
     * The opaque base of a PNG or PDF export: the paper the chart paints (its
     * `backgroundColor` through the family chain, `--apex-gantt-background-color`
     * and `--apx-surface` included), resolved to a colour a canvas takes. A
     * transparent or unreadable paper takes the mode's: the dark theme's, or the
     * design system's paper when its variant chose the dark mode, else white.
     */
    private exportBackground;
    /**
     * Imperatively update a single task's data and reflect the change in the UI
     * without triggering a full re-render.
     *
     * Useful for applying real-time changes (e.g. progress updates from a server)
     * with minimal DOM work. Only the affected task bar and row are updated; a
     * change to `segments` or `collapsed` re-renders. A task whose row is not
     * rendered (collapsed parent, filtered out, outside the virtual window) is
     * updated all the same.
     *
     * Runs `beforeTaskUpdate` (returning `false` cancels), is recorded in undo
     * history, and fires `taskUpdate` then `taskUpdateSuccess` with
     * `source: 'api'`. Pass `{silent: true}` to skip those two events, for
     * example when applying a server echo or rolling back a rejected save.
     *
     * @param taskId - The `id` of the task to update.
     * @param updatedTask - The task fields to change, in `TaskInput` form (`type: 'milestone'`
     *   works as a string). Supply `startTime`, `endTime`, `progress`, `name`, etc.; any subset is valid.
     * @param options - `silent` suppresses `taskUpdate` and `taskUpdateSuccess`.
     *
     * @throws {Error} If no task with the given `taskId` exists in the current
     *   dataset, or if the updated task fails validation (`taskUpdateError` fires first).
     *
     * @example
     * ```ts
     * // Update progress for task 't3'
     * gantt.updateTask('t3', { progress: 75 });
     *
     * // Shift a task's dates
     * gantt.updateTask('t3', { startTime: '2026-06-01', endTime: '2026-06-15' });
     *
     * // Apply a value the server sent back, without re-triggering your save listener
     * gantt.updateTask('t3', { progress: 80 }, { silent: true });
     * ```
     */
    updateTask(taskId: string, updatedTask: Partial<TaskInput>, options?: UpdateTaskOptions): void;
    /**
     * Split a task into separate worked segments at `at`. The segment containing
     * `at` is cut so its first piece ends at `at` and the rest resumes at
     * `resumeAt` (default: the day after `at`, which leaves no visible gap when
     * dates are whole days; pass a later `resumeAt` to open one). A task with no segments yet is treated as a
     * single span. Routed through `updateTask`, so it runs `beforeTaskUpdate`, is
     * validated and undoable, and fires `taskUpdate` / `taskUpdateSuccess` with
     * `source: 'api'`. No-op on milestones, summary bars, or when `at` does not
     * fall strictly inside a worked span.
     *
     * The task keeps its finish date: the gap is taken out of the existing span,
     * so the work after it is shorter rather than later. To show a slip (work
     * resuming later and finishing later), pass the new `segments` through
     * `updateTask` instead. `resumeAt` must fall after `at` and no later than
     * the segment's last day (day-only formats, whose end day is worked) or
     * before its end (formats with time); anything else is rejected with a
     * console warning and the task is left unchanged.
     *
     * @example gantt.splitTask('t3', '2026-06-10', { resumeAt: '2026-06-14' });
     */
    splitTask(taskId: string, at: string, options?: {
        resumeAt?: string;
    }): void;
    /** Whether a task is currently split into multiple worked segments. */
    isSplit(taskId: string): boolean;
    /**
     * Insert a new task into the chart and re-render. The operation is
     * recorded in the undo history.
     *
     * If a `beforeTaskAdd` option is configured and it returns `false`, the
     * insertion is cancelled and this method returns `null`. Otherwise emits a
     * `taskAdded` event and returns the inserted task.
     *
     * @param input - Task data. `id` is required.
     * @param options - `parentId` to insert under an existing parent.
     * @throws When a task with the same `id` already exists in the chart.
     *
     * @example
     * ```ts
     * gantt.addTask({ id: 't9', name: 'Review', startTime: '2026-08-01', endTime: '2026-08-05' });
     * gantt.addTask({ id: 'subA', name: 'Subtask', startTime: '2026-08-01', endTime: '2026-08-03' }, { parentId: 't9' });
     * ```
     */
    addTask(input: TaskInput, options?: {
        parentId?: string;
    }): Task | null;
    /**
     * Remove a task from the chart and re-render. The operation is recorded
     * in the undo history.
     *
     * Cascade modes:
     * - `'forbid'` (default): throws when the task has children. Safe default
     *   that prevents accidental data loss.
     * - `'children'`: deletes the task and every descendant in a single undoable
     *   transaction.
     * - `'orphan'`: reparents the immediate children to the deleted task's
     *   parent (or root if the deleted task was a root), then removes just the
     *   task. Useful when the children should outlive the group/summary they
     *   were under.
     *
     * Dependency edges that reference the removed task(s) are auto-cleaned in
     * the same transaction, so undo restores both tasks and edges atomically.
     * Edges that reference reparented children survive untouched.
     *
     * The remaining summary rows' dates and progress are recomputed at once. A
     * parent left with no children stops being a summary; one with no
     * `startTime` of its own keeps the span its summary bar showed as its
     * `startTime`/`endTime` (in `inputDateFormat`), recorded in the same undo
     * step so undo restores it as it was. That edit fires no `taskUpdate`.
     *
     * If a `beforeTaskDelete` option is configured and it returns `false`, the
     * removal is cancelled and this method returns `false`.
     *
     * @param taskId - The id of the task to remove.
     * @param options - `cascade` mode; defaults to `'forbid'`.
     * @returns `true` if removed, `false` if the hook cancelled.
     * @throws When no task with the given id exists, when `cascade: 'forbid'`
     *   and the task has children, or when a parent would be left with no
     *   children, no `startTime` and no summary span to keep (an undated parent
     *   with `showSummaryBar: false`). Nothing changes when it throws.
     */
    deleteTask(taskId: string, options?: {
        cascade?: 'forbid' | 'children' | 'orphan';
    }): boolean;
    /**
     * Re-parent a task. Pass `newParentId: null` (or omit it) to move the task
     * to the root. The operation is recorded in the undo history and emits a
     * `taskMoved` event.
     *
     * Sibling reordering within a parent is not supported in this release — it
     * lands alongside Phase-4 cascade work.
     *
     * @returns `true` if the move was applied, `false` when the
     *   `beforeTaskMove` hook cancelled.
     *
     * Moving a parent's last child away leaves that parent as
     * {@link deleteTask} does, in the same undo step.
     *
     * @throws When `taskId` does not exist, when `newParentId` does not exist,
     *   when the move would create a cycle (moving a task into its own
     *   descendant or onto itself), or when it would leave a parent with no
     *   children, no `startTime` and no summary span to keep.
     */
    moveTask(taskId: string, options?: {
        newParentId?: string | null;
    }): boolean;
    /**
     * Before a delete or move leaves each of `parentIds` with no children, give
     * the ones that rely on their children for dates the span their summary bar
     * shows (`DataManager.datesForEmptiedParent`), as recorded edits. The data
     * layer would date them anyway once they are empty; doing it here first puts
     * the edit in the same undo step, so undo gives the parent back its own
     * (missing) dates once its children are restored. Fires no update events.
     */
    /**
     * Throw, before anything changes, when one of `parentIds` would be left
     * with no children and no dates: a parent with no `startTime` that is not
     * drawn as a summary bar (`showSummaryBar: false`), so it has no span to keep.
     */
    private assertCanEmpty;
    private dateEmptiedParents;
    /**
     * Tell whether an edge `fromId → toId` would be accepted right now without
     * actually committing it. Used by the interactive draw UI to color the
     * preview red when the drop would be rejected, and shared with
     * `addDependency()` so the programmatic API and the drag UI apply the same
     * rules.
     *
     * Rules checked, in order:
     *   1. `self` — `fromId === toId`
     *   2. `task-missing` — either id not in the data model
     *   3. `duplicate` — an edge `fromId → toId` already exists
     *   4. `cycle` — the new edge would close a cycle in the dependency graph
     *   5. `summary-descendant` — one of the endpoints is a (direct or indirect)
     *      ancestor of the other in the task tree. Skipped when
     *      `dependencies.allowSummaryDescendantLinks` is `true`.
     *   6. `hook-veto` — `beforeDependencyChange` returned `false`
     */
    canAddDependency(fromId: string, toId: string, options?: {
        type?: DependencyType;
        lag?: number;
    }): {
        ok: true;
    } | {
        ok: false;
        reason: 'self' | 'task-missing' | 'duplicate' | 'cycle' | 'summary-descendant' | 'hook-veto';
    };
    /**
     * DFS from `toId` following outgoing edges; if `fromId` is reachable, the
     * proposed `fromId → toId` edge would close a cycle. The graph is sparse
     * (typical projects have ≪ #tasks deps), so this stays cheap even at 10k
     * tasks.
     */
    private wouldCreateCycle;
    /** True when `a` is an ancestor of `b`, or `b` is an ancestor of `a`. */
    private isAncestorDescendantPair;
    private isAncestor;
    /**
     * Create a dependency edge between two tasks and re-render the arrow.
     * Recorded in the undo history, emits a `dependencyAdded` event, and runs
     * through the `beforeDependencyChange` hook.
     *
     * The edge is judged by the same rules as {@link canAddDependency}: a
     * self-link, a missing task, a duplicate, a link that closes a cycle, and
     * (unless `dependencies.allowSummaryDescendantLinks` is `true`) a link
     * between a task and its own ancestor or descendant all throw.
     *
     * @returns `true` if the edge was added, `false` if the hook cancelled.
     * @throws When the edge breaks one of those rules.
     */
    addDependency(fromId: string, toId: string, options?: {
        type?: DependencyType;
        lag?: number;
    }): boolean;
    /**
     * Remove a dependency edge and re-render. Recorded in undo history, emits a
     * `dependencyRemoved` event, and runs through `beforeDependencyChange`.
     *
     * @returns `true` if the edge was removed, `false` if the hook cancelled.
     * @throws When no edge exists between the two tasks.
     */
    removeDependency(fromId: string, toId: string): boolean;
    /**
     * Roll back the most recent recorded transaction. The reverse of the
     * underlying command(s) runs through the same `commandContext` bridge that
     * forward operations use, so the data and DOM end up in the pre-operation
     * state and a `historyChange` event fires with `kind: 'undo'`.
     *
     * No-op (returns `false`) when the undo stack is empty or `history.enabled`
     * is `false`.
     *
     * @returns `true` if a transaction was undone.
     */
    undo(): boolean;
    /**
     * Replay the most recently undone transaction. Pops from the redo stack and
     * re-executes through the command bridge; a `historyChange` event fires with
     * `kind: 'redo'`.
     *
     * Note: any new mutating call between an `undo()` and a `redo()` discards
     * the redo stack — once a fresh transaction is recorded, future redos are
     * no longer reachable.
     *
     * @returns `true` if a transaction was redone.
     */
    redo(): boolean;
    /** Whether an undoable transaction is currently at the top of the stack. */
    canUndo(): boolean;
    /** Whether a redoable transaction is currently at the top of the stack. */
    canRedo(): boolean;
    /**
     * Drop every recorded transaction and emit `historyChange` with
     * `kind: 'clear'`. Useful after loading a fresh dataset where rolling back
     * to a previous tree state would be incoherent.
     */
    clearHistory(): void;
    /** Snapshot of the current undo/redo stack sizes. */
    getHistorySize(): {
        undo: number;
        redo: number;
    };
    /**
     * Normalize the `sortBy` option into a criteria array. `undefined` →
     * start-time ascending (preserves historical load behaviour); an explicit
     * `[]` → natural (input) order.
     */
    private normalizeSortBy;
    /** Build the active comparator from `sortCriteria` and push it to the data layer. */
    private rebuildSort;
    /** Apply the initial `sortBy` / `filterBy` / `filterRules` options at construction. */
    private applyInitialSortAndFilter;
    /**
     * Re-apply the active filter after an `update()` rebuilt the data + options.
     * Precedence: a new option in this call wins; otherwise rules > quick-filter >
     * predicate. The predicate is recompiled so changed columns/format apply.
     */
    private reapplyFilterAfterUpdate;
    /** Shared filter-evaluation context (date format, calendar and snap step). */
    private filterContext;
    /** The snap step the Duration column counts in, for sorting, filtering and grouping on it. */
    private snapInfo;
    /** Compile a structured rule set into a predicate using the current columns/context. */
    private compileRules;
    /** Normalize the `groupBy` option/argument into a {@link GroupCriterion} or null. */
    private normalizeGroupBy;
    /** Push the active grouping criterion (with its resolved column + none-label) to the data layer. */
    private rebuildGrouping;
    /** Apply the initial `groupBy` option at construction. */
    private applyInitialGrouping;
    /** Re-apply grouping after an `update()` rebuilt the data + options. */
    private reapplyGroupingAfterUpdate;
    /**
     * Group the task list by a field. While grouping is active the parent/child
     * tree is suspended and every task appears flat under a collapsible group
     * header (label + member count). Pass a {@link GroupCriterion} for custom value
     * extraction / labelling / order, or a bare column key. Re-renders and emits
     * `groupChange`.
     *
     * @example gantt.groupBy(ColumnKey.Progress);
     * @example gantt.groupBy({ field: 'status', direction: 'desc' });
     */
    groupBy(criterion: GroupCriterion | ColumnKey | string): void;
    /** Clear the active grouping and restore the parent/child tree view. Emits `groupChange`. */
    clearGrouping(): void;
    /** The active grouping criterion, or `null` when not grouping. */
    getGroupBy(): GroupCriterion | null;
    /** Whether grouping is currently active. */
    isGrouping(): boolean;
    private dispatchGroupChange;
    /**
     * Apply a sort to the task list. Hierarchy-preserving: siblings are reordered
     * within each parent (a child never leaves its parent). Pass one or more
     * {@link SortCriterion}; an empty array clears the sort (natural input order).
     * Re-renders and emits `sortChange`.
     *
     * @example gantt.sort({ key: ColumnKey.Name, direction: 'asc' });
     */
    sort(criteria: SortCriterion | SortCriterion[]): void;
    /** Clear the active sort and return to natural (input) order. Emits `sortChange`. */
    clearSort(): void;
    /** The currently active sort criteria (empty array = natural order). */
    getSort(): SortCriterion[];
    /**
     * Toggle the sort on a column through ascending → descending → none. Backs the
     * column-header click UX. No-op when the column is not sortable. Emits
     * `sortChange`.
     *
     * With `append: true` (Shift+click) the column is added as an additional sort
     * key — the existing keys are kept and this key cycles ascending → descending
     * → removed, so you can sort by several columns at once (first key wins, ties
     * break on the next). Without it, the sort is replaced by this single key.
     */
    toggleSort(key: ColumnKey | string, opts?: {
        append?: boolean;
    }): void;
    /**
     * Apply a filter to the task list. A task is kept when it matches the
     * predicate or has a matching descendant, so ancestors of matches stay
     * visible. Filtering is view-only — it changes which rows render but not the
     * tree, WBS, or task data. Re-renders and emits `filterChange`.
     *
     * @example gantt.filter((task) => task.progress < 100);
     */
    filter(predicate: TaskFilterPredicate): void;
    /** Clear the active filter so every row is shown again. Emits `filterChange`. */
    clearFilter(): void;
    /** Whether a filter is currently active. */
    isFiltered(): boolean;
    /**
     * Apply a structured filter (advanced filter builder): a {@link FilterRuleSet}
     * of conditions combined with `'all'` (AND) or `'any'` (OR), compiled to the
     * same view-only filter as `gantt.filter()`. Pass `null` (or an empty rule
     * list) to clear. Re-renders and emits `filterChange`.
     *
     * @example gantt.setFilterRules({ match: 'all', rules: [{ field: ColumnKey.Progress, operator: 'lt', value: 100 }] });
     */
    setFilterRules(ruleSet: FilterRuleSet | null): void;
    /** The active structured filter rules, or `null` when none are set. */
    getFilterRules(): FilterRuleSet | null;
    /**
     * Commit a column resize coming from a header-handle drag. The `Tasks` view
     * already updated the live grid template during the drag, so we only sync the
     * authoritative override map (so it survives the next full render), persist,
     * and emit `columnResize`. `width` is `null` when the column was reset.
     */
    private handleColumnResize;
    private dispatchColumnResize;
    /**
     * Pin a task-list column to an exact pixel width (the other columns absorb the
     * remaining panel space). Mirrors dragging the column-header resize handle.
     * Re-renders and emits `columnResize`.
     *
     * @example gantt.setColumnWidth(ColumnKey.Name, 260);
     */
    setColumnWidth(key: ColumnKey | string, width: number): void;
    /**
     * Clear the manual width of one column (pass its `key`) or of every column
     * (omit the argument), returning them to their auto/flex width. Re-renders and
     * emits `columnResize`.
     */
    resetColumnWidths(key?: ColumnKey | string): void;
    /** The active manual column-width overrides as a plain object (key → pixels). */
    getColumnWidths(): Record<string, number>;
    /**
     * Commit a column reorder coming from a header drag: store the new key order,
     * re-render so the grid reflects it, persist, and emit `columnReorder`.
     */
    private handleColumnReorder;
    private dispatchColumnReorder;
    /**
     * Set the left-to-right order of the task-list columns by key. Keys you list
     * are placed first in that order; any visible columns you omit keep their
     * relative position at the end. Mirrors dragging a column header. Re-renders
     * and emits `columnReorder`.
     *
     * @example gantt.setColumnOrder([ColumnKey.Name, ColumnKey.Progress, ColumnKey.StartTime]);
     */
    setColumnOrder(order: Array<ColumnKey | string>): void;
    /** The current column order as an array of keys (left-to-right), reflecting any reorder. */
    getColumnOrder(): string[];
    /**
     * Scroll the timeline (and, if needed, the row list) so a task's bar is in
     * view, using nearest-edge alignment (the minimum scroll that reveals it).
     * Backs the per-row scroll chevrons; call it directly to "locate" a task from
     * search results, selection, or your own toolbar button.
     *
     * By default a task hidden under a collapsed parent (or, while grouping, in a
     * collapsed group) is revealed first: its collapsed ancestors and group are
     * opened, then the row is scrolled to. Pass `{expand: false}` to leave them
     * closed.
     *
     * @param taskId - The `id` of the task to show.
     * @param options - `expand` (default `true`) opens collapsed ancestors and groups.
     * @returns `true` when the task's row is shown (scrolled to, or already in
     *   view); `false` for an unknown id, a task the active filter hides, or a
     *   hidden task with `expand: false`.
     *
     * @example
     * ```ts
     * gantt.scrollToTask('task-42');
     * gantt.scrollToTask('task-42', { expand: false }); // only if already visible
     * ```
     */
    scrollToTask(taskId: string, options?: ScrollToTaskOptions): boolean;
    /**
     * Return a task as it is now, edits included, or `null` for an unknown id.
     * The result is a copy, its `baseline`, `segments`, `assignees` and
     * `dependency` included: changing it does not change the chart (use
     * {@link updateTask} for that). Custom fields you added to a task are
     * copied by reference.
     *
     * @example const task = gantt.getTask('task-42');
     */
    getTask(taskId: string): Task | null;
    /**
     * Return every task as it is now, edits included, as copies (like
     * {@link getTask}) in tree order (each parent before its children).
     * Collapsed and filtered-out tasks are included.
     *
     * The tasks do not carry every link: a task's `dependency` holds only the
     * link it was loaded with (removing that link clears it), so a link added
     * with {@link addDependency} or drawn by the user is not in them. To save
     * the chart's data, save {@link getDependencies} with the tasks.
     *
     * @example const tasks = gantt.getTasks();
     */
    getTasks(): Task[];
    /**
     * Return every dependency link as it is now, as copies: the links the tasks
     * were loaded with and the ones added with {@link addDependency} or drawn
     * by the user, less any removed. Undo and redo are reflected.
     *
     * Save it with {@link getTasks} to keep the links. After loading the saved
     * tasks, add each link that {@link canAddDependency} accepts (the ones the
     * tasks carry are already there) and call {@link clearHistory}.
     *
     * @example const links = gantt.getDependencies(); // [{fromId: 'a', toId: 'b', type: 'FS', lag: 0}]
     */
    getDependencies(): DependencyLink[];
    /**
     * Open a collapsed parent so its children show. View state only: not
     * recorded in undo history, and saved with the view state like
     * `setState({collapsed})`. Renders once, only when the state changes.
     *
     * @returns `false` for an unknown id or a task with no children, otherwise `true`.
     *
     * @example gantt.expandTask('phase-1');
     */
    expandTask(taskId: string): boolean;
    /**
     * Collapse a parent so its children hide. The mirror of {@link expandTask}.
     *
     * @returns `false` for an unknown id or a task with no children, otherwise `true`.
     *
     * @example gantt.collapseTask('phase-1');
     */
    collapseTask(taskId: string): boolean;
    /** Shared body of {@link expandTask} and {@link collapseTask}. */
    private setTaskCollapsed;
    /**
     * Nearest-edge scroll that brings a task's bar and row into view, for a task
     * whose row is in the visible list. Returns whether a scroll was applied.
     */
    private scrollTaskIntoView;
    /**
     * Scroll bookkeeping at the start of a render. Returns whether the scroll
     * this render captures is worth restoring: one captured before the first
     * frame (a second render() in the same task) is not a position anyone chose.
     */
    private beginRenderScroll;
    /** Record a page-requested scroll so the next frame's start scroll and restore leave it alone. */
    private noteRequestedScroll;
    /**
     * Capture the current UI view state — zoom, scroll, collapse, selection, sort,
     * and filter — as a serializable object. Pair with {@link setState} to save
     * and restore "where the user left off" (e.g. to your own backend), or set the
     * `persistState` option to have the Gantt do it via localStorage.
     *
     * @example const saved = gantt.getState(); // JSON-serializable
     */
    getState(): GanttUiState;
    /**
     * Restore a UI view state produced by {@link getState}. Any omitted field is
     * left untouched, so a partial state (e.g. `{ sort: [...] }`) applies just that
     * slice. Re-renders once, then emits `sortChange` / `filterChange` for the
     * parts that changed (pass `{ silent: true }` to suppress those events).
     *
     * @example gantt.setState(savedState);
     */
    setState(state: Partial<GanttUiState>, opts?: {
        silent?: boolean;
    }): void;
    /** Apply the `sort` slice of a {@link GanttUiState} to the data layer (no render). */
    private applySortState;
    /** Apply the `columnWidths` slice of a {@link GanttUiState} (no render). Omitted → untouched; `{}` → cleared. */
    private applyColumnWidthsState;
    /** Apply the `group` slice of a {@link GanttUiState} to the data layer (no render). */
    private applyGroupState;
    /** Apply the `filterRules` / `quickFilter` slice of a {@link GanttUiState} (no render). */
    private applyFilterState;
    /**
     * Restore scroll offsets after a render (deferred so the DOM has laid out).
     * `horizontal` is measured from where the time axis starts, as `getState`
     * reports it, and is written to the timeline body (and the header and proxy
     * scrollbar with it) rather than to the proxy alone.
     */
    private applyScrollState;
    /** Resolve the persistence config, or `null` when disabled / storage is unavailable (SSR). */
    private resolvePersistence;
    /** Debounced write of the current state to storage; no-op when persistence is off. */
    private schedulePersist;
    /** Serialize and store the current state immediately (used by the debounce). */
    private writePersistedState;
    /**
     * Read and apply any persisted state. Returns `true` when state was restored
     * (the caller's render pass is superseded by the one inside `setState`).
     */
    private restorePersistedState;
    /**
     * Attach the persistence listeners once. Selection and scroll change without a
     * full `render()`, so we save on those directly; `this.element` persists across
     * renders and scroll bubbles in the capture phase, so a single set suffices.
     */
    private attachPersistenceListeners;
    /** One-time restore + listener attach on the first render. Returns true when state was restored. */
    private maybeRestorePersistedStateOnce;
    /** Remove persistence listeners and cancel the pending write. Called from `destroy()`. */
    private detachPersistence;
    /**
     * Auto-fit zoom on first render: once the container has a measurable width and
     * (usually) data, pick a zoom that shows the whole project span.
     */
    private applyAutoFitZoomIfNeeded;
    /**
     * Diff the previously-visible and now-visible task IDs so only rows whose
     * visibility changed (collapse/expand) get their arrows delayed. Returns
     * `undefined` on the first render (no previous set) to fade the whole SVG.
     */
    private computeChangedVisibleIds;
    /** Localized label for the toolbar export button, matching the active `exportFormat`. */
    private exportButtonLabel;
    /**
     * Export the chart and trigger a download. `svg` is vector; `png` and `pdf`
     * rasterize the chart (the PDF embeds the raster on a single page). Defaults
     * to the configured `exportFormat`. Under row virtualization the full dataset
     * is expanded for the snapshot and restored afterward.
     *
     * @param format Output format; defaults to `options.exportFormat` (`'svg'`).
     * @returns Resolves once the download has been triggered.
     *
     * @example await gantt.exportChart('png');
     */
    exportChart(format?: GanttExportFormat): Promise<void>;
    private dispatchSortChange;
    private dispatchFilterChange;
    /** Build the built-in quick-filter search input for the toolbar. */
    private buildQuickFilterInput;
    /**
     * Apply the quick-filter query: set the matching predicate (or clear it when
     * empty), re-render, and restore focus + caret to the search box (a full
     * re-render rebuilds the toolbar, so the input is recreated each keystroke).
     */
    private applyQuickFilter;
    /** Build a name/field-contains predicate from the quick-filter query (null when blank). */
    private buildQuickFilterPredicate;
    private restoreQuickFilterFocus;
    /**
     * Build the "Filter" toolbar control: a button (with an active-rule count
     * badge) and, when open, the rule-composer popover. Rebuilt on every toolbar
     * render from `filterBuilderOpen` / `filterBuilderDraft`, so its state
     * survives re-renders.
     */
    private buildFilterBuilder;
    /** Toggle the popover, seeding the draft from the committed rules when opening. */
    private toggleFilterBuilder;
    private cloneRuleSet;
    /** Build the popover body: match selector, rule rows, add button, and footer. */
    private buildFilterPopover;
    /** Build one condition row: field select, operator select, and a typed value input. */
    private buildFilterRow;
    /**
     * Wire a global keydown listener on the root element so Ctrl/Cmd+Z and
     * Ctrl+Y / Ctrl/Cmd+Shift+Z work anywhere inside the chart (timeline body,
     * task list, toolbar). Skipped when history is disabled, when focus is in
     * a text input/textarea (let the browser handle native undo there), and
     * when the user holds Alt (avoids stealing browser navigation shortcuts).
     */
    private attachUndoRedoShortcuts;
    /**
     * Depth of a task in the tree (root tasks = 0). Used to order cascade
     * deletion so descendants are removed before their parents.
     */
    private depthOf;
    /**
     * The parent a task passed to {@link addTask} will land under:
     * `options.parentId` over `input.parentId` (as the insert applies them), or
     * `undefined` for a root task, including when the id matches no task.
     */
    private resolveAddParent;
    private dispatchTaskAdded;
    private dispatchTaskDeleted;
    private dispatchTaskMoved;
    private dispatchHistoryChange;
    /**
     * Wire a single delegated `contextmenu` listener on the root element. The
     * handler resolves the target task from `[data-taskid]` ancestors (works
     * for both bar elements and task-list rows), builds the menu entries from
     * the current task's state, and asks `contextMenuManager` to show it.
     */
    private attachContextMenuHandler;
    /**
     * Build the entries shown in the context menu for a given task. Capability-
     * gated — "Edit" only appears when `enableTaskEdit` is on; "Indent" /
     * "Outdent" only appear when the move is legal.
     */
    private buildContextMenuItems;
    /**
     * Shared insertion path for the toolbar Add button and context-menu add
     * entries. Picks placeholder dates from the current project span so the
     * bar is visible at the default zoom.
     */
    /** Snap step in ms for the active snap unit/value (day / hour / minute). */
    private snapStepMs;
    /**
     * Create a task from a draw-on-empty-timeline gesture. `startX` / `endX` are
     * content-space pixel offsets (the gesture's two edges); we reverse them
     * through the current geometry to dates, snap to the snap unit, and add a task
     * spanning that range. Day-only formats render the end inclusive, so an
     * N-unit sweep lands `end = start + (N-1)` units. Row index is not used for
     * placement — the new root task sorts into position by its dates like any add.
     */
    private commitDrawnTask;
    private addPlaceholderTask;
    /**
     * Toolbar "+ Add task" handler. Inserts a new root-level placeholder task.
     * Shares the date-derivation logic with `addPlaceholderTask` so context-
     * menu and toolbar produce visually identical bars.
     */
    private addTaskFromToolbar;
    /**
     * Toolbar trash-icon handler. Deletes every selected task with
     * `cascade: 'children'`. Skips tasks whose ancestor is also selected
     * (since the ancestor's cascade will already remove them), and clears the
     * selection on completion. Errors per-task are swallowed and logged so one
     * blocked delete doesn't abort the batch.
     */
    private deleteSelectedFromToolbar;
    /**
     * Build the editing-command shims handed to the keyboard manager. Each
     * shim resolves the row-relative meaning of "previous sibling" /
     * "grandparent" then routes through the public `deleteTask` / `moveTask`
     * paths so the operations stay undoable and gated by validation hooks.
     */
    private buildKeyboardEditingCommands;
    /**
     * Find the id of the visible sibling immediately above `taskId` in the
     * flattened task list — used as the target parent for keyboard indent.
     * Returns `null` when there is no preceding sibling at the same level.
     */
    private findPreviousSiblingId;
    private dispatchDependencyChanged;
    /**
     * Internal entry point used by inline editors in the task-list panel. Goes
     * through {@link commitTaskUpdate} with `source: 'inline'`, so the hook,
     * history and `taskUpdate` / `taskUpdateSuccess` / `taskUpdateError` events
     * match every other edit path. Returns `false` when the edit was vetoed or
     * failed; the editor then restores the cell's original content.
     */
    private commitInlineEdit;
    /** Whether the "selection is off" warning has been logged for this chart. */
    private selectionOffWarned;
    /**
     * Log, once per chart, that a selection method was called while
     * `enableSelection` is off and therefore did nothing.
     */
    private warnSelectionOff;
    /**
     * Returns the currently selected tasks as `Task` objects, in the order they
     * were selected. Requires `enableSelection: true`; otherwise returns `[]`
     * and warns once.
     */
    getSelectedTasks(): Task[];
    /**
     * Replace the selection with the given task ids (unknown ids are ignored).
     * Fires `selectionChange` when the selection changed. Requires
     * `enableSelection: true`; otherwise does nothing and warns once.
     */
    setSelectedTasks(ids: string[]): void;
    /**
     * Clear all selected tasks. Fires `selectionChange` when something was
     * selected. Requires `enableSelection: true`; otherwise does nothing and
     * warns once.
     */
    clearSelection(): void;
    /**
     * Zoom in by one step: multiplies `pixelsPerDay` by 1.4, keeping the centre
     * of the visible timeline in place.
     *
     * Zoom is continuous, not a list of presets. The header tiers (year, quarter,
     * month, week, day, hour, minute) follow from the resulting `pixelsPerDay`,
     * so a tier changes after about five steps. The value is clamped to the zoom
     * range (about 0.25 to 7680 px per day); at the top of it this does nothing.
     *
     * @example
     * ```ts
     * gantt.zoomIn(); // e.g. 25.7 px/day (week tier) becomes 36 px/day
     * ```
     */
    zoomIn(): void;
    /**
     * Zoom out by one step: divides `pixelsPerDay` by 1.4, keeping the centre of
     * the visible timeline in place.
     *
     * The mirror of {@link zoomIn}: continuous, clamped to the same range (about
     * 0.25 to 7680 px per day), and a no-op at the bottom of it.
     *
     * @example
     * ```ts
     * gantt.zoomOut(); // e.g. 25.7 px/day (week tier) becomes about 18.4 px/day
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
    /** Write the height render() resolves, or leave the container's own in place. */
    private applyRenderHeight;
    /**
     * The inline height render() writes, or `null` to leave the container's own.
     *
     * An explicit `height` is always written. Without one, a container that
     * already has a height (a CSS rule, an inline style, a flex or grid track)
     * is filled and followed through the container ResizeObserver: writing the
     * 500px default inline used to override that CSS. A container whose height
     * only comes from its content gets the 500px default, as before.
     *
     * "Without one" is the constructor's raw options, plus any later `update()`
     * that leaves `height` at its default.
     */
    private resolveRenderHeight;
    /**
     * Whether the container's height comes from the page rather than from its
     * content. Probed with a child one pixel taller than the container: a box
     * sized by its content grows to fit it, a box with a height of its own does
     * not. The probe is removed in the same task, so it is never painted.
     */
    private containerHasOwnHeight;
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
 * Built-in column renderer that shows a stacked row of circular avatars for a
 * task's assignees, with an overflow indicator (`+N`) when the count exceeds
 * `max`. Falls back to colored initials when an assignee has no `avatarUrl`.
 *
 * @example
 * ```ts
 * import { ApexGantt, ColumnKey, renderers } from '@apexcharts/apexgantt';
 *
 * new ApexGantt('#chart', {
 *   series,
 *   columnConfig: [
 *     { key: ColumnKey.Name, title: 'Task' },
 *     {
 *       key: 'assignees',
 *       title: 'Assigned',
 *       render: renderers.avatars({
 *         accessor: (task) => task.assignees,
 *         max: 4,
 *         size: 24,
 *       }),
 *     },
 *   ],
 * });
 * ```
 */
declare function avatars(options: AvatarsRendererOptions): ColumnRenderer;

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
    /**
     * Whether to render baseline bars below actual bars.
     * @default false
     */
    readonly enabled: boolean;
    /**
     * Baseline color. When `striped` is true this paints the stripes; otherwise
     * it fills the whole bar. When omitted, the baseline uses the task bar's
     * progress shade (the darker tone of the bar drawn above), so a baseline
     * reads as the planned twin of its bar. Set an explicit color to override.
     * @default the bar's progress color (task `barBackgroundColor`, darkened)
     */
    readonly color?: string;
    /**
     * Fill the baseline bar with thick diagonal stripes that alternate between
     * `color` and `stripeColor`, instead of a flat fill.
     * @default true
     */
    readonly striped: boolean;
    /**
     * Color of the gaps between stripes. Only used when `striped` is true.
     * @default '#FFFFFF'
     */
    readonly stripeColor: string;
    /**
     * Width (px) of each stripe band when `striped` is true. Larger values
     * produce thicker stripes.
     * @default 3
     */
    readonly stripeWidth: number;
    /**
     * Angle (deg) of the stripes when `striped` is true.
     * @default 45
     */
    readonly stripeAngle: number;
}

/**
 * Synchronous veto hook for `gantt.addDependency()` and
 * `gantt.removeDependency()`. `change` distinguishes the direction. Return
 * `false` to cancel.
 */
export declare type BeforeDependencyChangeHook = (context: {
    change: 'add' | 'remove';
    fromId: string;
    toId: string;
    type: DependencyType;
    lag: number;
}) => boolean | undefined | void;

/**
 * Synchronous veto hook for `gantt.addTask()`. Return `false` to cancel the
 * insertion; any other return value (including `undefined`, or a Promise)
 * lets it proceed.
 */
export declare type BeforeTaskAddHook = (context: {
    input: TaskInput;
    parentId?: string;
}) => boolean | undefined | void;

/**
 * Synchronous veto hook for `gantt.deleteTask()`. Return `false` to cancel
 * the removal; any other return value lets it proceed.
 */
export declare type BeforeTaskDeleteHook = (context: {
    task: Task;
    /** Descendant ids that would be removed in the same transaction (empty for `'orphan'` or when the task has no descendants). */
    descendantIds: string[];
    cascade: 'forbid' | 'children' | 'orphan';
}) => boolean | undefined | void;

/**
 * Synchronous veto hook for `gantt.moveTask()`. `oldParentId` and
 * `newParentId` are `undefined` when the task is at (or becomes) a root.
 * Return `false` to cancel.
 */
export declare type BeforeTaskMoveHook = (context: {
    task: Task;
    oldParentId?: string;
    newParentId?: string;
}) => boolean | undefined | void;

/**
 * Synchronous veto hook for every task edit: drag, resize, progress drag,
 * keyboard move / resize, dialog save, inline edit and `gantt.updateTask()`.
 * Receives the task as it exists in the chart plus the partial update about
 * to be applied. Return `false` to cancel; any other return value (including
 * a Promise) lets it proceed.
 */
export declare type BeforeTaskUpdateHook = (context: {
    task: Task;
    updates: Partial<TaskInput>;
}) => boolean | undefined | void;

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
 * Working calendar configuration. When set, weekends + holidays drive
 * duration math, summary aggregation, and timeline stripes.
 *
 * Any `calendar` object turns the working calendar on, even `{}`, which gives
 * a Monday to Friday week with no holidays. Leave the option out and every day
 * is a working day (no stripes, no snapping). The exception is a `calendar`
 * that holds only the header settings `weekStart` and `fiscalYearStartMonth`:
 * it moves where week, quarter and year cells start and leaves every day a
 * working day.
 */
export declare interface CalendarOptions {
    /**
     * Weekdays that count as working days. 0 = Sunday, 6 = Saturday. Numeric
     * strings (`'1'`) are read as numbers. A list that names no weekday from 0
     * to 6 (`[]`, `[7]`) logs a warning and Monday to Friday is used.
     * @default [1, 2, 3, 4, 5]
     */
    readonly workingWeekdays?: number[];
    /**
     * Specific dates that are non-working regardless of weekday. Each entry
     * may be a date string, Date object, or `{date, label}` for tooltipped
     * entries. Strings are read with `inputDateFormat`, like task dates, and
     * ISO `YYYY-MM-DD` is accepted whatever the format.
     * @default []
     */
    readonly holidays?: ReadonlyArray<HolidayEntry>;
    /**
     * Render hatched / tinted bands over non-working columns in the timeline.
     * @default true
     */
    readonly showNonWorkingStripes?: boolean;
    /**
     * Optional HTML tooltip rendered when the user hovers a holiday stripe.
     * Receives `{date, label}` where `label` is whichever string was supplied
     * in the matching `HolidayEntry` (or `undefined` for plain-date entries).
     */
    readonly holidayTooltip?: (ctx: HolidayTooltipContext) => string;
    /**
     * What happens when a drag or resize commit lands on a non-working day.
     * - `'next'`: snap forward to the next working day (typical PM behavior).
     * - `'previous'`: snap backward to the previous working day.
     * - `'allow'`: permit non-working start/end — useful for ad-hoc weekend work.
     *
     * Drag preserves the source task's working-day duration across the snap;
     * resize snaps the moving endpoint only (left handle → start, right handle
     * → end). Has no effect when no calendar is configured.
     * @default 'next'
     */
    readonly dragSnapMode?: 'next' | 'previous' | 'allow';
    /**
     * First day of the week, 0 (Sunday) to 6 (Saturday). Week cells in the
     * timeline header start on it, and week numbers (`w`, the built-in `Wk`
     * labels) follow it. Unset, the `locale.dateLocale`'s own `weekStart`
     * applies (Monday for `de`, Saturday for `ar`), else Sunday. Anything other
     * than a whole number from 0 to 6 logs a warning and is ignored.
     *
     * This and {@link fiscalYearStartMonth} only shape the timeline header: a
     * `calendar` that holds nothing else does not turn the working calendar on.
     * @default undefined (the date locale's week start, else 0)
     */
    readonly weekStart?: number;
    /**
     * First month of the fiscal year, 1 (January) to 12 (December). Setting it
     * puts the timeline header in fiscal-year mode: quarter and year cells start
     * on fiscal boundaries, and their built-in labels read as fiscal periods.
     * With `4` (April), the year cell from April 2026 to March 2027 reads
     * `FY2026` (a fiscal year is named by the calendar year it starts in) and
     * its first quarter reads `#1 Apr-Jun`.
     *
     * Fiscal-year mode turns on whenever a valid month is set explicitly, `1`
     * included: `1` keeps calendar-aligned cells but labels them `FY2026` and
     * `#1 Jan-Mar`. Left unset (and with no locale pack that sets one), the
     * header shows calendar years and quarters. The same rule decides when the
     * `fiscal` block of `locale.timelineHeaderFormat` applies, and sets
     * `fiscal` in a label formatter's context.
     *
     * Month, week and day cells are unaffected. Anything other than a whole
     * number from 1 to 12 logs a warning and is ignored, as if unset.
     * @default undefined (calendar years, no fiscal-year labels)
     */
    readonly fiscalYearStartMonth?: number;
}

/**
 * Identifies the built-in columns available in the task-list panel.
 *
 * Pass `ColumnKey` values inside `ColumnListItem.key` when configuring
 * `GanttUserOptions.columnConfig` to control which columns are visible
 * and in what order.
 */
export declare enum ColumnKey {
    Assignees = "assignees",
    BaselineEnd = "baselineEnd",
    BaselineStart = "baselineStart",
    BaselineVariance = "baselineVariance",
    Duration = "duration",
    EndTime = "endTime",
    Name = "name",
    Predecessors = "predecessors",
    Progress = "progress",
    ProgressRing = "progressRing",
    StartTime = "startTime",
    Successors = "successors",
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
    /**
     * Header text for the column, also used for the header's `aria-label` and
     * when auto-sizing the column. For a built-in `ColumnKey` the default title
     * (for example `'End'` for `ColumnKey.EndTime`) is used if this is missing
     * at runtime, so plain JavaScript configs can omit it.
     */
    readonly title: string;
    /**
     * Minimum CSS width of the column, used in `minmax()`. With
     * `autoSizeColumns` on it is the column's preferred (default) width.
     * @default '30px'
     */
    readonly minWidth?: string;
    /**
     * Upper bound for auto-sized column width (e.g. `'240px'`). Caps how wide the
     * column grows to fit content when `autoSizeColumns` is on, so one long value
     * can't dominate the panel. Ignored when auto-sizing is off. @default '320px'
     */
    readonly maxWidth?: string;
    /** Share of the free panel width the column takes, used as `fr` units in the CSS grid. @default 1 */
    readonly flexGrow?: number;
    /** Set `false` to keep the column in the config but hide it. @default true */
    readonly visible?: boolean;
    /**
     * Whether this column can be resized by dragging the handle at its header's
     * trailing edge (requires the `resizableColumns` option). Set `false` to lock
     * a single column at its auto/configured width. @default true
     */
    readonly resizable?: boolean;
    /**
     * Custom cell renderer. Required for custom columns; ignored for built-in
     * columns (built-ins use the library's internal renderer).
     */
    readonly render?: ColumnRenderer;
    /**
     * Extracts the underlying value of the cell from the task. Used by sorting,
     * filtering, and SVG export. Optional for built-in columns (they have native
     * extractors); for a custom column it is what makes the column sortable.
     */
    readonly accessor?: (task: Task) => unknown;
    /**
     * Whether the column participates in sorting (header click + the `sortBy`
     * option / `gantt.sort()` API). Defaults to `true` for built-in value
     * columns, `false` for the `Wbs` column, and `true` for custom columns only
     * when an `accessor` or `comparator` is supplied.
     */
    readonly sortable?: boolean;
    /**
     * Custom sort comparator for this column. When provided it takes precedence
     * over `accessor`-based comparison. Receives two tasks and returns a negative
     * / zero / positive number (ascending order); the active sort direction is
     * applied on top. Stable: equal results fall back to natural (input) order.
     */
    readonly comparator?: TaskComparator;
}

declare interface ColumnOptions {
    readonly columnConfig?: ColumnListItem[];
    /**
     * Initial sort applied to the task list. One or more {@link SortCriterion}
     * (or a single criterion). Sorting is hierarchy-preserving: siblings are
     * reordered within each parent, never flattened. Omit for the default
     * (start-time ascending); pass `[]` for natural (input) order.
     * @default [{ key: ColumnKey.StartTime, direction: 'asc' }]
     */
    readonly sortBy?: SortCriterion | SortCriterion[];
    /**
     * Initial filter applied to the task list. A predicate run against each task;
     * a task is kept when it matches or has a matching descendant (ancestors of
     * matches stay visible). Omit for no filter. @default undefined
     */
    readonly filterBy?: TaskFilterPredicate;
    /**
     * Initial structured filter (advanced filter builder). A {@link FilterRuleSet}
     * of conditions combined with `'all'` (AND) / `'any'` (OR), compiled to the
     * same view-only filter as `filterBy`. Takes precedence over `filterBy` when
     * both are set. @default undefined
     */
    readonly filterRules?: FilterRuleSet;
    /**
     * Initial grouping applied to the task list. A {@link GroupCriterion} (or a
     * bare column key). When set, the parent/child tree is suspended and tasks are
     * bucketed under collapsible group headers. Omit for no grouping.
     * @default undefined
     */
    readonly groupBy?: GroupCriterion | ColumnKey | string;
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

/**
 * Detail for the `columnReorder` event, fired when task-list columns are
 * reordered by dragging a column header, or via `gantt.setColumnOrder()`.
 */
export declare interface ColumnReorderEventDetail {
    /** Column keys in their new left-to-right order (visible columns only). */
    order: string[];
    /** Key of the column that was moved (the dragged column); `null` for a bulk `setColumnOrder`. */
    movedKey: string | null;
    timestamp: number;
}

/**
 * Detail for the `columnResize` event, fired when a task-list column is resized
 * by dragging its header handle, via `gantt.setColumnWidth()`, or reset via
 * `gantt.resetColumnWidths()`.
 */
export declare interface ColumnResizeEventDetail {
    /** Key of the column that changed. */
    key: string;
    /** New pixel width, or `null` when the column was reset to its auto width. */
    width: number | null;
    /** All active manual column-width overrides after the change (key → pixels). */
    widths: Record<string, number>;
    timestamp: number;
}

declare interface CommonOptions {
    readonly backgroundColor: string;
    readonly borderColor: string;
    readonly canvasStyle: string;
    readonly enableExport: boolean;
    /** Format the toolbar export button produces. @default 'svg' */
    readonly exportFormat: GanttExportFormat;
    readonly enableResize: boolean;
    readonly headerBackground: string;
    readonly height: number | string;
    readonly inputDateFormat: string;
    readonly pixelsPerDay?: number;
    /**
     * Persist the UI view state (zoom, scroll, sort, filter, collapse, selection)
     * to `localStorage` and restore it on load. `true` uses the default key;
     * an object customizes it. @default false
     */
    readonly persistState: boolean | GanttStatePersistenceOptions;
    /**
     * Auto-size task-list columns to fit their header + cell content, growing the
     * panel so nothing clips. Set `false` to distribute the panel width by
     * `flexGrow` (legacy behavior). @default true
     */
    readonly autoSizeColumns: boolean;
    readonly resizableColumns: boolean;
    readonly reorderableColumns: boolean;
    readonly tasksContainerWidth: number;
    readonly width: number | string;
    /** See {@link GanttUserOptions.tokens}. */
    readonly tokens?: boolean;
    /** See {@link GanttUserOptions.designSystem}. */
    readonly designSystem?: boolean;
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
 *   (`'minute' | 'hour' | 'halfday' | 'day' | 'week' | 'month' | 'quarter' | 'year'`).
 *   Use this to vary precision based on zoom level.
 * @returns The string rendered inside the crosshair label.
 */
export declare type CrosshairLabelFormatter = (date: Date, tier: TierId) => string;

export declare interface CrosshairOptions {
    readonly enableCrosshair: boolean;
    readonly crosshairColor: string;
    readonly crosshairLabelFormat?: CrosshairLabelFormatter;
}

/** The dark preset: the colours of a chart created with `theme: 'dark'`. */
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
     * Returns null when `id` or `name` is missing. A missing start date is
     * settled later by {@link keepScheduledRows}, once every row is known.
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
     * Drop rows that have no start date and no dated row below them. A parent
     * row may leave its dates to its children (its summary bar spans them), so
     * an undated row is kept when a dated row sits somewhere underneath it.
     * Any other undated row (an unscheduled backlog item, a row with only an
     * end date) is skipped with a warning, as it would have nothing to draw.
     * Ids are matched by value, so a numeric id and a string `parentId` meet.
     */
    private static keepScheduledRows;
    /**
     * validate parsing configuration
     * @param config - parsing configuration to validate
     * @returns true if valid, false otherwise
     */
    static validateConfig(config: ParsingConfig): boolean;
}

/**
 * English defaults for every {@link GanttMessages} string. These reproduce the
 * exact text the Gantt rendered before localization support, so a chart with no
 * `locale.messages` overrides is visually and semantically unchanged.
 */
export declare const DEFAULT_GANTT_MESSAGES: GanttMessages;

/**
 * Detail payload for the `dependencyArrowUpdate` event.
 *
 * Internal "redraw the arrow" signal fired when a task connected to the edge
 * moves and the arrow path needs recomputing. Not a CRUD event — use
 * `dependencyAdded` / `dependencyRemoved` for create / remove notifications.
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
 * Detail payload for `dependencyAdded` and `dependencyRemoved`. Identifies the
 * edge and includes the `type` / `lag` that was active at the time of the
 * change. For removal, the values are the captured pre-removal values.
 */
export declare interface DependencyChangeEventDetail {
    fromId: string;
    toId: string;
    type: 'FF' | 'FS' | 'SF' | 'SS';
    lag: number;
    timestamp: number;
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
 * One dependency link of the chart, as `gantt.getDependencies()` returns it:
 * the links the tasks were loaded with (each task's `dependency`) and the ones
 * added later with `gantt.addDependency()` or drawn on the chart.
 */
export declare interface DependencyLink {
    /** ID of the predecessor task, where the arrow starts. */
    readonly fromId: string;
    /** ID of the successor task, where the arrow ends. */
    readonly toId: string;
    /**
     * Dependency type.
     * @default 'FS'
     */
    readonly type: DependencyType;
    /**
     * Lag (positive) or lead (negative) in days, as on `TaskDependency.lag`.
     * @default 0
     */
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
    /**
     * Enables interactive editing of dependency arrows: hover darkens the arrow,
     * clicking selects it and reveals a "✕" affordance at the head; clicking the
     * "✕" (or pressing Delete on a focused arrow) removes the edge via the same
     * undoable command path as `gantt.removeDependency()`.
     *
     * Also enables drawing new dependencies: on bar hover, two solid circles
     * appear at the bar's start and finish edges. Drag from a circle onto
     * another bar's start or finish edge to create a dependency. The
     * (source anchor, target anchor) pair determines the type:
     * right→left = FS, left→left = SS, right→right = FF, left→right = SF.
     *
     * When `true`, `hitWidth` is auto-bumped to at least 12 px unless the user
     * supplied a larger value — without a hit area, the thin visible stroke is
     * effectively unclickable.
     *
     * @default false
     */
    readonly editable?: boolean;
    /**
     * Allow drawing dependencies between a summary task and one of its own
     * descendants (or vice versa). Off by default because a summary's dates
     * are derived from its descendants, so such links are semantically
     * meaningless and confuse downstream date math (e.g. critical path).
     *
     * Applies to links drawn by hand (`editable: true`) and to the programmatic
     * API whether or not `editable` is set: `gantt.canAddDependency()` reports
     * such a link as `'summary-descendant'` and `gantt.addDependency()` throws.
     * Links given in the data (`dependency` on a task) are not checked.
     *
     * @default false
     */
    readonly allowSummaryDescendantLinks?: boolean;
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

/**
 * Detail for the `filterChange` event, fired when the active filter changes via
 * `gantt.filter()` / `gantt.clearFilter()`.
 */
export declare interface FilterChangeEventDetail {
    /** Whether a filter is active after the change. */
    active: boolean;
    /** Number of rows visible under the active filter (visible task count). */
    visibleCount: number;
    timestamp: number;
}

/**
 * Comparison operators for a structured {@link FilterRule}. Which operators are
 * valid depends on the column's value type (text / number / date); see the
 * filter builder. `isEmpty` / `notEmpty` apply to any type and ignore `value`.
 */
export declare type FilterOperator = 'contains' | 'notContains' | 'equals' | 'notEquals' | 'startsWith' | 'endsWith' | 'gt' | 'gte' | 'lt' | 'lte' | 'before' | 'after' | 'on' | 'isEmpty' | 'notEmpty';

/** A single structured filter condition: compare a column's value with `value`. */
export declare interface FilterRule {
    /** Column key whose value is tested (a `ColumnKey` or a custom column id). */
    readonly field: ColumnKey | string;
    /** Comparison operator. */
    readonly operator: FilterOperator;
    /**
     * Comparison operand. A number for number columns, a `YYYY-MM-DD` string for
     * date columns, free text otherwise. Ignored by `isEmpty` / `notEmpty`.
     */
    readonly value?: string | number;
}

/**
 * A set of {@link FilterRule}s combined with boolean logic. Compiles to a
 * {@link TaskFilterPredicate} and backs the advanced filter builder.
 */
export declare interface FilterRuleSet {
    /** `'all'` = every rule must match (AND); `'any'` = at least one (OR). */
    readonly match: 'all' | 'any';
    /** The rules to evaluate. An empty list means "no filter". */
    readonly rules: FilterRule[];
}

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

declare interface GanttCalendarConfig {
    readonly calendar: CalendarOptions;
}

/** Default crosshair label patterns as strings, for JSON and Blazor users. */
export declare interface GanttCrosshairFormat {
    /** dayjs pattern on day-and-coarser tiers. @default 'ddd MM/DD/YYYY' */
    readonly date?: string;
    /** dayjs pattern on halfday, hour and minute tiers. @default 'MM/DD HH:mm' */
    readonly time?: string;
}

declare interface GanttData {
    readonly annotations: Annotation[];
    readonly series: TaskInput[];
}

/**
 * A dayjs-compatible locale object (the shape exported by `dayjs/locale/*`
 * modules). Pass one to {@link LocaleOptions.dateLocale} to localize the month,
 * weekday and meridiem names in the timeline header, the dates in bar
 * aria-labels, and the default crosshair label. Dates shown with
 * `inputDateFormat` (task list, tooltips, task form) keep that format.
 * ApexGantt registers it on its own bundled dayjs instance, so the host does
 * not need to import dayjs locales.
 *
 * Structurally mirrors dayjs's `ILocale`; an imported `dayjs/locale/*` object
 * satisfies it directly. Only `name` is required.
 */
export declare interface GanttDateLocale {
    readonly name: string;
    readonly weekdays?: string[];
    readonly weekdaysShort?: string[];
    readonly weekdaysMin?: string[];
    readonly months?: string[];
    readonly monthsShort?: string[];
    readonly weekStart?: number;
    readonly yearStart?: number;
    readonly formats?: Partial<Record<string, string>>;
    readonly relativeTime?: Partial<Record<string, string>>;
    /**
     * AM/PM name for an hour. Besides dayjs's function form it takes a plain
     * `[am, pm]` pair (`['午前', '午後']`), which is JSON-safe: the first name is
     * used before noon and the second from noon on, in both cases.
     * @default undefined (dayjs's English `AM`/`PM`)
     */
    readonly meridiem?: ((hour: number, minute: number, isLowercase: boolean) => string) | readonly [am: string, pm: string];
    /**
     * Ordinal form of a number (the `Do` token). Besides dayjs's function form
     * it takes a template string in which `{n}` is the number (`'{n}日'`).
     * @default undefined (dayjs's English `1st`, `2nd`)
     */
    readonly ordinal?: ((n: number) => string) | string;
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
    /** Fires once per accepted edit on every edit path, just before it is applied. */
    taskUpdate: CustomEvent<TaskUpdateEventDetail>;
    /** Fires when task form validation fails. */
    taskValidationError: CustomEvent<TaskValidationErrorEventDetail>;
    /** Fires once per edit on every edit path, after it has been applied. */
    taskUpdateSuccess: CustomEvent<TaskUpdateSuccessEventDetail>;
    /** Fires when a task update fails with an error. */
    taskUpdateError: CustomEvent<TaskUpdateErrorEventDetail>;
    /** Fires after a task is inserted via `gantt.addTask()`. */
    taskAdded: CustomEvent<TaskAddedEventDetail>;
    /** Fires after a task is removed via `gantt.deleteTask()`. */
    taskDeleted: CustomEvent<TaskDeletedEventDetail>;
    /** Fires after a task is re-parented via `gantt.moveTask()`. */
    taskMoved: CustomEvent<TaskMovedEventDetail>;
    /** Fires after a dependency edge is created via `gantt.addDependency()` or drawn on the chart. */
    dependencyAdded: CustomEvent<DependencyChangeEventDetail>;
    /** Fires after a dependency edge is removed via `gantt.removeDependency()` or with a deleted task. */
    dependencyRemoved: CustomEvent<DependencyChangeEventDetail>;
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
    /** Fires after a record/undo/redo/clear mutates the history stack. */
    historyChange: CustomEvent<HistoryChangeEventDetail>;
    /** Fires after the active sort changes (API or header click). */
    sortChange: CustomEvent<SortChangeEventDetail>;
    /** Fires after the active filter changes. */
    filterChange: CustomEvent<FilterChangeEventDetail>;
    /** Fires after the active grouping changes (API). */
    groupChange: CustomEvent<GroupChangeEventDetail>;
    /** Fires after a task-list column is resized (header drag or API). */
    columnResize: CustomEvent<ColumnResizeEventDetail>;
    /** Fires after task-list columns are reordered (header drag or API). */
    columnReorder: CustomEvent<ColumnReorderEventDetail>;
}

export declare const GanttEvents: {
    /**
     * emits once per accepted edit on every edit path, just before it is applied
     */
    readonly TASK_UPDATE: "taskUpdate";
    /**
     * emits when form validation fails
     */
    readonly TASK_VALIDATION_ERROR: "taskValidationError";
    /**
     * emits once per edit on every edit path, after it has been applied
     */
    readonly TASK_UPDATE_SUCCESS: "taskUpdateSuccess";
    /**
     * emits when a task update fails
     */
    readonly TASK_UPDATE_ERROR: "taskUpdateError";
    /**
     * emits after a task is inserted via `gantt.addTask()`
     */
    readonly TASK_ADDED: "taskAdded";
    /**
     * emits after a task is removed via `gantt.deleteTask()`
     */
    readonly TASK_DELETED: "taskDeleted";
    /**
     * emits after a task is re-parented via `gantt.moveTask()`
     */
    readonly TASK_MOVED: "taskMoved";
    /**
     * emits after a dependency edge is created via `gantt.addDependency()`
     */
    readonly DEPENDENCY_ADDED: "dependencyAdded";
    /**
     * emits after a dependency edge is removed via `gantt.removeDependency()`
     */
    readonly DEPENDENCY_REMOVED: "dependencyRemoved";
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
    /**
     * emits after the undo/redo stack changes — record, undo, redo, or clear
     */
    readonly HISTORY_CHANGE: "historyChange";
    /**
     * emits after the active sort changes (via API or column-header click)
     */
    readonly SORT_CHANGE: "sortChange";
    /**
     * emits after the active filter changes
     */
    readonly FILTER_CHANGE: "filterChange";
    /**
     * emits after the active grouping changes (via API)
     */
    readonly GROUP_CHANGE: "groupChange";
    /**
     * emits after a task-list column is resized (header drag or API)
     */
    readonly COLUMN_RESIZE: "columnResize";
    /**
     * emits after task-list columns are reordered (header drag or API)
     */
    readonly COLUMN_REORDER: "columnReorder";
};

/** Supported export formats. `svg` is vector; `png`/`pdf` rasterize the SVG. */
export declare type GanttExportFormat = 'svg' | 'png' | 'pdf';

/**
 * A first-party or custom locale pack: plain JSON-safe data. Explicit
 * `locale.*` and `calendar.*` options always win over the pack's values.
 */
export declare interface GanttLocalePack {
    /** BCP 47 tag, used for the chart root `lang`, plural rules and collation. */
    readonly tag: string;
    /** `'draft'` until a native-speaker reviewer signs it off. */
    readonly status: 'draft' | 'reviewed';
    /** Text direction of the language. `locale.direction` wins. @default 'ltr' */
    readonly dir?: 'ltr' | 'rtl';
    /** Message overrides. `locale.messages` wins key by key. @default undefined */
    readonly messages?: GanttMessagesInput;
    /** Date names and formats. `locale.dateLocale` wins. @default undefined */
    readonly dateLocale?: GanttDateLocale;
    /** Header labels. `locale.timelineHeaderFormat` wins per tier and row. @default undefined */
    readonly timelineHeaderFormat?: TimelineHeaderFormat;
    /** Display pattern for dates when `inputDateFormat` has no time tokens. `locale.displayDateFormat` wins. @default undefined */
    readonly displayDateFormat?: string;
    /** Display pattern for dates when `inputDateFormat` has time tokens. `locale.displayDateFormat` wins. @default undefined */
    readonly displayDateTimeFormat?: string;
    /** Crosshair patterns. `crosshairLabelFormat` and `locale.crosshairFormat` win. @default undefined */
    readonly crosshairFormat?: GanttCrosshairFormat;
    /** First day of the week, 0 to 6. `calendar.weekStart` wins. Never turns on working days. @default undefined */
    readonly weekStart?: number;
    /**
     * First month of the fiscal year, 1 to 12. `calendar.fiscalYearStartMonth`
     * wins. Setting it puts the chart in fiscal-year mode, as an explicit
     * `calendar.fiscalYearStartMonth` does (see
     * {@link CalendarOptions.fiscalYearStartMonth}), so a language pack should
     * leave it unset and let users opt in. Never turns on working days.
     * @default undefined
     */
    readonly fiscalYearStartMonth?: number;
}

/**
 * Every user-facing string the Gantt generates internally (toolbar, context
 * menu, task form, validation, bar and baseline tooltips, add-task row, and
 * bar aria-labels). Override any subset via {@link LocaleOptions.messages}; unset
 * keys keep their English defaults ({@link DEFAULT_GANTT_MESSAGES}). Strings
 * that embed runtime values are functions so each locale controls grammar.
 */
export declare interface GanttMessages {
    /** Zoom-in toolbar button (its tooltip and aria-label). @default 'Zoom In' */
    readonly zoomIn: string;
    /** Zoom-out toolbar button (its tooltip and aria-label). @default 'Zoom Out' */
    readonly zoomOut: string;
    /** "Add task" toolbar button. @default 'Add task' */
    readonly addTask: string;
    /** "Delete selected" toolbar button. @default 'Delete selected' */
    readonly deleteSelected: string;
    /** Undo toolbar button. @default 'Undo (Ctrl+Z)' */
    readonly undo: string;
    /** Redo toolbar button. @default 'Redo (Ctrl+Y)' */
    readonly redo: string;
    /** Export toolbar button (SVG format). @default 'Export as SVG' */
    readonly exportAsSvg: string;
    /** Export toolbar button (PNG format). @default 'Export as PNG' */
    readonly exportAsPng: string;
    /** Export toolbar button (PDF format). @default 'Export as PDF' */
    readonly exportAsPdf: string;
    /** Placeholder for the built-in quick-filter search box. @default 'Search tasks…' */
    readonly quickFilterPlaceholder: string;
    /** Advanced filter builder: toolbar button label. @default 'Filter' */
    readonly filterButton: string;
    /** Filter builder: popover heading. @default 'Filter tasks' */
    readonly filterHeading: string;
    /** Filter builder: match-mode label. @default 'Match' */
    readonly filterMatchLabel: string;
    /** Filter builder: match-all (AND) option. @default 'All' */
    readonly filterMatchAll: string;
    /** Filter builder: match-any (OR) option. @default 'Any' */
    readonly filterMatchAny: string;
    /** Filter builder: add-condition button. @default '+ Add condition' */
    readonly filterAddCondition: string;
    /** Filter builder: apply button. @default 'Apply' */
    readonly filterApply: string;
    /** Filter builder: clear button. @default 'Clear' */
    readonly filterClear: string;
    /** Filter builder: remove-condition button aria-label. @default 'Remove condition' */
    readonly filterRemoveCondition: string;
    /** Filter builder: empty-state text shown when no conditions exist. @default 'No conditions yet.' */
    readonly filterNoConditions: string;
    /**
     * Filter builder: human-readable label for a comparison operator. By default
     * it reads the `filterOperator*` key of the operator (`filterOperatorGt` for
     * `'gt'`); an unknown operator prints as is.
     */
    readonly filterOperatorLabel: (operator: FilterOperator) => string;
    /** Filter operator `contains`. @default 'contains' */
    readonly filterOperatorContains: string;
    /** Filter operator `notContains`. @default 'does not contain' */
    readonly filterOperatorNotContains: string;
    /** Filter operator `equals`. @default 'equals' */
    readonly filterOperatorEquals: string;
    /** Filter operator `notEquals`. @default 'does not equal' */
    readonly filterOperatorNotEquals: string;
    /** Filter operator `startsWith`. @default 'starts with' */
    readonly filterOperatorStartsWith: string;
    /** Filter operator `endsWith`. @default 'ends with' */
    readonly filterOperatorEndsWith: string;
    /** Filter operator `gt`. @default 'greater than' */
    readonly filterOperatorGt: string;
    /** Filter operator `gte`. @default 'greater or equal' */
    readonly filterOperatorGte: string;
    /** Filter operator `lt`. @default 'less than' */
    readonly filterOperatorLt: string;
    /** Filter operator `lte`. @default 'less or equal' */
    readonly filterOperatorLte: string;
    /** Filter operator `before`. @default 'before' */
    readonly filterOperatorBefore: string;
    /** Filter operator `after`. @default 'after' */
    readonly filterOperatorAfter: string;
    /** Filter operator `on`. @default 'on' */
    readonly filterOperatorOn: string;
    /** Filter operator `isEmpty`. @default 'is empty' */
    readonly filterOperatorIsEmpty: string;
    /** Filter operator `notEmpty`. @default 'is not empty' */
    readonly filterOperatorNotEmpty: string;
    /** Group header label for tasks whose group value is empty. @default '(None)' */
    readonly groupNone: string;
    /** Group header member-count label, e.g. `(3)`. @default `(n)` => `(${n})` */
    readonly groupCountLabel: (count: number) => string;
    /** Alert when export cannot find the chart. @default 'Export failed: Chart not found. Please refresh and try again.' */
    readonly exportFailedNoChart: string;
    /** Generic export-failure alert. @default 'Export failed. Please check the console for details.' */
    readonly exportFailedGeneric: string;
    /**
     * Name of an exported file, without its extension. Param: `timestamp`.
     * @default 'gantt-chart-{timestamp}'
     */
    readonly exportFileName: string;
    /** Toolbar selection count, shown while tasks are selected. Param: `count`. @default '{count} selected' */
    readonly selectedCount: string;
    /** Name of a task added from the toolbar or the add-task row. @default 'New task' */
    readonly newTaskName: string;
    /** Context-menu "Edit task". @default 'Edit task' */
    readonly editTask: string;
    /** Context-menu "Add child task". @default 'Add child task' */
    readonly addChildTask: string;
    /** Context-menu "Add sibling task". @default 'Add sibling task' */
    readonly addSiblingTask: string;
    /** Context-menu "Indent". @default 'Indent' */
    readonly indent: string;
    /** Context-menu "Outdent". @default 'Outdent' */
    readonly outdent: string;
    /** Context-menu delete for a leaf task. @default 'Delete task' */
    readonly deleteTask: string;
    /** Context-menu delete for a task with children. @default 'Delete (with children)' */
    readonly deleteTaskWithChildren: string;
    /** Task-form name label. @default 'Task Name' */
    readonly formTaskName: string;
    /** Task-form start-date label. @default 'Start Date' */
    readonly formStartDate: string;
    /** Task-form end-date label. @default 'End Date' */
    readonly formEndDate: string;
    /** Task-form progress label. @default 'Progress (%)' */
    readonly formProgress: string;
    /** Task-form submit button. @default 'Update' */
    readonly formSubmit: string;
    /** Edit-task dialog title. @default `Edit Task: ${name}` */
    readonly editTaskTitle: (name: string) => string;
    /** @default 'Start date is required' */
    readonly validationStartRequired: string;
    /** @default 'End date is required' */
    readonly validationEndRequired: string;
    /** @default 'End date must be after start date' */
    readonly validationEndAfterStart: string;
    /** @default 'Task name is required' */
    readonly validationNameRequired: string;
    /** @default 'Progress is required' */
    readonly validationProgressRequired: string;
    /** @default 'Progress must be between 0 and 100' */
    readonly validationProgressRange: string;
    /** Visible label on the inline add-task row. @default '+ Add task' */
    readonly addTaskRowLabel: string;
    /** Baseline tooltip "Baseline:" label. @default 'Baseline:' */
    readonly baselineLabel: string;
    /** Baseline tooltip "Start:" label. @default 'Start:' */
    readonly startLabel: string;
    /** Baseline tooltip "End:" label. @default 'End:' */
    readonly endLabel: string;
    /** Bar tooltip task-name label. @default 'Task:' */
    readonly tooltipTaskLabel: string;
    /** Bar tooltip start-date label. @default 'Start:' */
    readonly tooltipStartLabel: string;
    /** Bar tooltip end-date label. @default 'End:' */
    readonly tooltipEndLabel: string;
    /** Bar tooltip duration label. @default 'Duration:' */
    readonly tooltipDurationLabel: string;
    /** Bar tooltip progress label. @default 'Progress:' */
    readonly tooltipProgressLabel: string;
    /** Bar tooltip milestone-date label. @default 'Date:' */
    readonly tooltipDateLabel: string;
    /** Bar tooltip dependency label. @default 'Depends on:' */
    readonly tooltipDependsOnLabel: string;
    /**
     * Builds a summary-bar aria-label. `task` is the summary task itself, for
     * labels that need more than its name (an owner, a status, a custom field).
     */
    readonly summaryAriaLabel: (ctx: {
        name: string;
        canToggle: boolean;
        collapsed: boolean;
        readonly task: Task;
    }) => string;
    /**
     * Builds an interactive/read-only bar aria-label. `progress` is set for
     * read-only bars. `task` is the bar's task, with its current values.
     */
    readonly barAriaLabel: (ctx: {
        name: string;
        start: string;
        end: string;
        progress?: number;
        readonly task: Task;
    }) => string;
    /**
     * Builds the bar aria-valuetext (interactive bars). `task` is the bar's task,
     * with its current values.
     */
    readonly barAriaValueText: (ctx: {
        start: string;
        end: string;
        durationDays: number;
        readonly task: Task;
    }) => string;
    /** Builds the progress-handle aria-label. @default `${name} progress` */
    readonly progressAriaLabel: (name: string) => string;
    /**
     * Summary-bar aria-label when it can expand. Read only when this key, or
     * `summaryAriaLabelCollapse`, is set and `summaryAriaLabel` is not a
     * function. Param: `name`. @default '{name} (summary) \u2014 expand'
     */
    readonly summaryAriaLabelExpand: string;
    /** Summary-bar aria-label when it can collapse. Param: `name`. @default '{name} (summary) \u2014 collapse' */
    readonly summaryAriaLabelCollapse: string;
    /**
     * Bar aria-label of a read-only bar, which reports progress. Params: `name`,
     * `start`, `end`, `progress`. @default '{name}: {start} to {end}, {progress}% complete'
     */
    readonly barAriaLabelWithProgress: string;
    /** Progress-ring cell aria-label. Param: `value`. @default '{value} percent complete' */
    readonly progressRingAriaLabel: string;
    /** Task-list aria-label. `accessibility.taskListAriaLabel` wins. @default 'Gantt task list' */
    readonly taskListAriaLabel: string;
    /** Timeline header aria-label. @default 'Timeline header' */
    readonly timelineHeaderAriaLabel: string;
    /** Header checkbox aria-label. @default 'Select all tasks' */
    readonly selectAllAriaLabel: string;
    /** Row checkbox aria-label. Param: `name`. @default 'Select {name}' */
    readonly selectTaskAriaLabel: string;
    /** Expand-chevron aria-label. Param: `name`. @default 'Expand {name}' */
    readonly expandAriaLabel: string;
    /** Collapse-chevron aria-label. Param: `name`. @default 'Collapse {name}' */
    readonly collapseAriaLabel: string;
    /**
     * Column-header aria-label. Params: `title`, `sortState` (one of the
     * `sort*` keys) and `sortPosition` (the `sortPosition` text, or `''`).
     * @default '{title}, {sortState}{sortPosition}'
     */
    readonly columnHeaderAriaLabel: string;
    /** Sort state of an ascending column. @default 'sorted ascending' */
    readonly sortAscending: string;
    /** Sort state of a descending column. @default 'sorted descending' */
    readonly sortDescending: string;
    /** Sort state of an unsorted column. @default 'not sorted' */
    readonly sortNone: string;
    /** Position of a column in a multi-column sort. Param: `position`. @default ', sort position {position}' */
    readonly sortPosition: string;
    /** Column resize-handle aria-label. Param: `title`. @default 'Resize {title} column' */
    readonly resizeColumnAriaLabel: string;
    /** Splitter aria-label. @default 'Resize panels' */
    readonly resizePanelsAriaLabel: string;
    /** Scroll button toward earlier dates. @default 'Scroll to task (earlier)' */
    readonly scrollToTaskEarlier: string;
    /** Scroll button toward later dates. @default 'Scroll to task (later)' */
    readonly scrollToTaskLater: string;
    /**
     * Dependency arrow aria-label. Params: `from` and `to` (task ids),
     * `fromName` and `toName`. @default 'Dependency from {from} to {to}'
     */
    readonly dependencyAriaLabel: string;
    /**
     * Remove-dependency button aria-label. Params: `from`, `to`, `fromName` and
     * `toName`. @default 'Remove dependency from {from} to {to}'
     */
    readonly removeDependencyAriaLabel: string;
    /** Dialog close-button aria-label. @default 'Close dialog' */
    readonly closeDialog: string;
    /** Title of the `name` column. `columnConfig[].title` wins. @default 'Task Name' */
    readonly columnName: string;
    /** Title of the `startTime` column. @default 'Start' */
    readonly columnStartTime: string;
    /** Title of the `endTime` column. @default 'End' */
    readonly columnEndTime: string;
    /** Title of the `duration` column. @default 'Duration' */
    readonly columnDuration: string;
    /** Title of the `progress` column. @default 'Progress' */
    readonly columnProgress: string;
    /** Title of the `progressRing` column. @default 'Progress' */
    readonly columnProgressRing: string;
    /** Title of the `assignees` column. @default 'Assignees' */
    readonly columnAssignees: string;
    /** Title of the `predecessors` column. @default 'Predecessors' */
    readonly columnPredecessors: string;
    /** Title of the `successors` column. @default 'Successors' */
    readonly columnSuccessors: string;
    /** Title of the `baselineStart` column. @default 'Baseline Start' */
    readonly columnBaselineStart: string;
    /** Title of the `baselineEnd` column. @default 'Baseline End' */
    readonly columnBaselineEnd: string;
    /** Title of the `baselineVariance` column. @default 'Variance' */
    readonly columnBaselineVariance: string;
    /** Title of the `wbs` column. @default 'WBS' */
    readonly columnWbs: string;
    /** A duration in calendar days. Param: `count`. @default '{count} d' */
    readonly durationDays: string;
    /** A duration in working days. Param: `count`. @default '{count} wd' */
    readonly durationWorkingDays: string;
    /** A duration in hours. Param: `count`. @default '{count} h' */
    readonly durationHours: string;
    /** A duration in minutes. Param: `count`. @default '{count} m' */
    readonly durationMinutes: string;
    /** A progress value (cells, bar labels, the tooltip). Param: `value`. @default '{value}%' */
    readonly progressValue: string;
    /** Separator between assignee names. @default ', ' */
    readonly listSeparator: string;
    /**
     * Value of the tooltip's dependency row. Params: `taskId`, `type` (a
     * `dependencyType*` key) and `lag` (the `dependencyLag` text, or `''`).
     * @default '{taskId} · {type}{lag}'
     */
    readonly tooltipDependencyValue: string;
    /** Lag of a dependency, signed (`+2`). Not used for zero lag. Param: `lag`. @default ' ({lag}d)' */
    readonly dependencyLag: string;
    /** Finish-to-start dependency. @default 'FS' */
    readonly dependencyTypeFS: string;
    /** Start-to-start dependency. @default 'SS' */
    readonly dependencyTypeSS: string;
    /** Finish-to-finish dependency. @default 'FF' */
    readonly dependencyTypeFF: string;
    /** Start-to-finish dependency. @default 'SF' */
    readonly dependencyTypeSF: string;
}

/**
 * {@link GanttMessages} as input: every key optional, and every function key
 * also takes a template string. In a template, `{name}` inserts a param,
 * `{n, number}` formats a number in the chart's `tag`, and
 * `{n, plural, one {...} other {...}}` picks a plural branch. Strings keep
 * JSON and Blazor users away from functions.
 */
export declare type GanttMessagesInput = {
    readonly [K in keyof GanttMessages]?: GanttMessages[K] extends (...args: never[]) => string ? GanttMessages[K] | string : GanttMessages[K];
};

declare type GanttOptions = GanttOptionsInternal;

declare type GanttOptionsInternal = AccessibilityOptions & AnnotationOptions & BorderOptions & CommonOptions & ColumnOptions & CriticalPathOptions & CrosshairOptions & FontOptions & GanttBarOptions & GanttBaselineConfig & GanttCalendarConfig & GanttData & GanttDependencyConfig & GanttRowOptions & InteractiveOptions & ParsingOptions & SelectionOptions & ToolbarOptions & TooltipOptions & {
    /** Localization, date-locale, and text-direction options. See {@link LocaleOptions}. */
    readonly locale?: LocaleOptions;
};

declare interface GanttRowOptions {
    readonly rowBackgroundColors: readonly string[];
    readonly rowHeight: number;
}

/**
 * Configuration for opt-in localStorage persistence of the {@link GanttUiState}.
 * Pass `persistState: true` for the defaults, or an object to customize the key.
 */
export declare interface GanttStatePersistenceOptions {
    /** localStorage key under which the state is saved. @default 'apexgantt-state' */
    key?: string;
}

/**
 * Color palette of a built-in preset, holding the colours the chart renders
 * for that mode.
 *
 * The `theme` option takes a {@link ThemeMode} string or the name of a theme
 * registered on the family registry, not a `GanttTheme`. To start from a
 * preset and change a few colours, spread it into the top-level options and
 * override fields:
 * `new ApexGantt(el, {...LightTheme, barBackgroundColor: '#22C55E', series: tasks})`.
 * Keys that share a name with a `GanttUserOptions` colour option apply when
 * spread; `textColor` is the same colour as the `fontColor` option. Keys marked
 * "Derived" describe a surface the chart paints from those options: they are
 * informational, not options, and have no effect when spread.
 *
 * @see {@link LightTheme} {@link DarkTheme} {@link getTheme}
 */
export declare interface GanttTheme {
    readonly tooltipBGColor: string;
    readonly tooltipBorderColor: string;
    /** Derived from `fontColor`; not an option. */
    readonly tooltipTextColor: string;
    readonly cellBorderColor: string;
    readonly rowBackgroundColors: readonly string[];
    readonly headerBackground: string;
    /** Derived from `fontColor`; not an option. */
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
    /** Text colour, the `fontColor` option. Derived: spread `fontColor` to change it. */
    readonly textColor: string;
    readonly borderColor: string;
    readonly annotationBgColor: string;
    readonly annotationBorderColor: string;
    /** Derived from `backgroundColor`; not an option. */
    readonly dialogBgColor: string;
    /** Derived from `borderColor`; not an option. */
    readonly dialogBorderColor: string;
    /** Derived from `barBackgroundColor`; not an option. */
    readonly buttonBgColor: string;
    /** Derived from `barTextColor`; not an option. */
    readonly buttonTextColor: string;
    /** Derived from `arrowColor`; not an option. */
    readonly buttonHoverBgColor: string;
    /** Derived from `backgroundColor`; not an option. */
    readonly toolbarBgColor: string;
    /** Derived from `borderColor`; not an option. */
    readonly toolbarBorderColor: string;
    /** Derived from `cellBorderColor`; not an option. */
    readonly toolbarHoverBgColor: string;
    /** Derived from `backgroundColor`; not an option. */
    readonly scrollbarTrackColor: string;
    /** Derived from `borderColor`; not an option. */
    readonly scrollbarThumbColor: string;
    /** Derived from `cellBorderColor`; not an option. */
    readonly scrollbarThumbHoverColor: string;
    /** Derived from `cellBorderColor`; not an option. */
    readonly splitBarColor: string;
    /** Derived from `arrowColor`; not an option. */
    readonly splitBarHoverColor: string;
    /** Derived from `borderColor`; not an option. */
    readonly splitBarBorderColor: string;
    /** Derived from `fontColor`; not an option. */
    readonly splitBarHandleColor: string;
    /** Text colour for the task list, headers and tooltips. Optional so existing custom palettes stay valid. */
    readonly fontColor?: string;
    /** Crosshair line colour. Optional so existing custom palettes stay valid. */
    readonly crosshairColor?: string;
}

/**
 * The `theme` option: a {@link ThemeMode}, or the name of a theme registered
 * on the family registry (`registerTheme` from `apex-commons`), which brings
 * its tokens and, through its `mode`, the light or dark colours.
 */
export declare type GanttThemeName = ThemeMode | (string & {});

/**
 * A serializable snapshot of the Gantt's view state: everything that is a
 * user's "where I left off" rather than the task data itself. Produced by
 * `gantt.getState()` and consumed by `gantt.setState()`; also what the opt-in
 * localStorage persistence layer reads and writes.
 *
 * Every field is optional on input to `setState()` so a partial state (e.g.
 * only `sort`) applies just that slice and leaves the rest untouched.
 */
export declare interface GanttUiState {
    /** Schema version; set to {@link GANTT_STATE_VERSION} by `getState()`. */
    version: number;
    /** Zoom level as pixels-per-day (same unit as the `pixelsPerDay` option). */
    zoom?: number;
    /**
     * Scroll offsets in pixels: `horizontal` = timeline, `vertical` = grid rows.
     * `horizontal` is measured from where the time axis starts: the left edge in
     * LTR, the right edge under RTL (`locale.direction: 'rtl'`), so `0` is the
     * start of the timeline either way.
     */
    scroll?: {
        horizontal: number;
        vertical: number;
    };
    /** IDs of collapsed summary rows. Rows not listed are expanded. */
    collapsed?: string[];
    /** IDs of selected task rows (requires `enableSelection`). */
    selected?: string[];
    /** Active sort criteria; an empty array means natural (input) order. */
    sort?: Array<{
        key: string;
        direction: 'asc' | 'desc';
    }>;
    /** Active advanced-filter rule set, or `null` when no structured filter is set. */
    filterRules?: FilterRuleSet | null;
    /** Text in the built-in quick-filter box. */
    quickFilter?: string;
    /**
     * Active grouping: the field grouped by and header order, or `null` when not
     * grouping. Only the serializable parts are stored — a custom `accessor` /
     * `label` on the criterion is not persisted (restore falls back to the
     * column's own accessor).
     */
    group?: {
        field: string;
        direction?: 'asc' | 'desc';
    } | null;
    /**
     * Manual per-column pixel widths set by resizing a column header (or
     * `gantt.setColumnWidth()`), keyed by column key. Columns not listed keep
     * their auto/flex width. Omitted (or empty) when no column has been resized.
     */
    columnWidths?: Record<string, number>;
    /**
     * Column keys in their user-chosen left-to-right order (from dragging a
     * column header or `gantt.setColumnOrder()`). Omitted when the order has not
     * been changed from the configured/default order.
     */
    columnOrder?: string[];
}

/**
 * Options accepted by `gantt.update()`: any subset of {@link GanttUserOptions}.
 * Only the keys you pass change; a key passed as `undefined` returns to its
 * default. The exception is a call that switches `theme`: the color options
 * the theme sets (listed on {@link GanttUserOptions.theme}) return to the new
 * theme's values unless the same call passes them. The current tasks (edits included) are kept unless
 * `series` or `parsing` is passed, which replaces the data and clears the undo
 * history.
 */
export declare type GanttUpdateOptions = Partial<GanttUserOptions>;

/**
 * Top-level configuration object for `ApexGantt`.
 *
 * Pass this to `new ApexGantt(element, options)` or to `gantt.update(options)`.
 * Every field is optional except `series`. The `theme` field takes a
 * `ThemeMode` string or a registered theme's name; to start from a preset's
 * colours, spread `LightTheme` or `DarkTheme` into these options. For
 * per-task styling use the corresponding fields on `TaskInput`.
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
    /**
     * Color theme preset. `'light'` (default) or `'dark'`, or the name of a
     * theme registered on the family registry (`registerTheme` from
     * `apex-commons`, or `ApexCharts.registerTheme`): its `tokens` rank below
     * the `--apx-*` tokens and above the design system, and its `mode: 'dark'`
     * picks the dark theme's colours (light otherwise). A theme registered
     * under `'light'` or `'dark'` adds its tokens to that theme.
     *
     * An `update()` that switches the theme returns the color options the theme
     * sets (`annotationBgColor`, `annotationBorderColor`, `arrowColor`,
     * `backgroundColor`, `barBackgroundColor`, `barTextColor`, `borderColor`,
     * `cellBorderColor`, `criticalArrowColor`, `criticalBarColor`,
     * `crosshairColor`, `fontColor`, `headerBackground`, `milestoneColor`,
     * `rowBackgroundColors`, `summaryBarColor`, `tooltipBGColor`,
     * `tooltipBorderColor`) to the new theme's values, user-set ones included,
     * unless the same call passes them. Every other option carries over.
     *
     * Left unset (and with no `backgroundColor` passed), the chart follows a
     * page design system that declares a dark variant (Ignite UI's
     * `--ig-theme-variant: dark`, with the `apexgantt/ignite-ui` add-on
     * loaded): it renders the dark theme's colours until the variant changes. A
     * theme you pass is always kept. An `update()` that unsets it (`theme:
     * undefined`) returns the chart to no theme: the light colours, or the
     * variant's dark ones.
     *
     * @default 'light'
     */
    readonly theme?: GanttThemeName;
    /**
     * `false` stops the chart reading the shared `--apx-*` family tokens and the
     * page's design system (including its light or dark variant). Options and
     * `--apex-gantt-*` variables still apply.
     * @default true
     */
    readonly tokens?: boolean;
    /**
     * `false` stops the chart reading the page's design system (Ignite UI's
     * `--ig-*` tokens, including its variant). The `--apx-*` family tokens still
     * apply. Has an effect only while the `apexgantt/ignite-ui` add-on is
     * loaded: without it the chart reads no design system.
     * @default true
     */
    readonly designSystem?: boolean;
    /** Localization, date-locale, and text-direction (RTL) options. See {@link LocaleOptions}. @default { direction: 'ltr' } */
    readonly locale?: LocaleOptions;
    /** Background color of annotation markers. @default '#DBEAFE' (light) / '#4A2D4D' (dark) */
    readonly annotationBgColor?: string;
    /** Border color of annotation markers. @default '#60A5FA' (light) / '#8B4D8F' (dark) */
    readonly annotationBorderColor?: string;
    /**
     * Dash pattern for annotation borders, as an SVG `stroke-dasharray`: dash and
     * gap lengths in px, e.g. `[6, 3]`. An empty array draws a solid border. An
     * annotation's own `borderDashArray` wins over this. @default []
     */
    readonly annotationBorderDashArray?: number[];
    /** Border width of annotation markers in pixels. @default 2 */
    readonly annotationBorderWidth?: number;
    /**
     * Orientation of annotation LABELS: `Orientation.Horizontal` reads left to
     * right, `Orientation.Vertical` runs the text up the annotation's edge. It
     * turns only the label: the line or region itself still runs down the task
     * rows. An annotation's own `label.orientation` wins over this.
     * @default Orientation.Horizontal
     */
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
    /**
     * Color of dependency arrows between tasks. When you do not pass it,
     * `--apex-gantt-dependency-line` on the container sets it, then `--apx-grid`,
     * then a page design system's hairline colour. Resolved at render.
     * @default '#94A3B8'
     */
    readonly arrowColor?: string;
    /** Background color of the whole chart container. @default '#FFFFFF' */
    readonly backgroundColor?: string;
    /**
     * Default background fill color for task bars. When you do not pass it,
     * `--apex-gantt-bar-fill` on the container sets it, then `--apx-accent`, then
     * a page design system's accent; a task's own `barBackgroundColor` wins over
     * all of them. Resolved at render. @default '#87B7FE' (light) / '#818CF8' (dark)
     */
    readonly barBackgroundColor?: string;
    /** CSS border-radius applied to task bars; not scaled by `--apx-radius-factor`. @default '5px' */
    readonly barBorderRadius?: string;
    /**
     * Per-task bar label. Default renders the task name immediately to the
     * right of the bar so narrow bars don't clip the text. Set
     * `position: 'inside'` to render centered inside the bar instead, or
     * `'auto'` to pick automatically; supply `render` to compose names with
     * chips/icons/avatars.
     */
    readonly barLabel?: BarLabelOptions;
    /** Top and bottom margin inside each row for the task bar in pixels. @default 8 */
    readonly barMargin?: number;
    /** Text color rendered inside task bars. A task's own `barTextColor` wins. @default '#FFFFFF' */
    readonly barTextColor?: string;
    /**
     * Fill color for summary (group) bars. Renders distinct from regular task
     * bars to make the parent/child hierarchy visually obvious.
     * @default '#94A3B8' (light) / '#8FBCBC' (dark)
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
     * Working calendar config. When set, weekends + holidays drive duration
     * math, summary aggregation, and timeline stripes. Any object turns it on,
     * even `{}` (a Monday to Friday week), except one holding only the header
     * settings `weekStart` and `fiscalYearStartMonth`. Absent = every day is a
     * working day. `update({calendar})` rebuilds it; `update({calendar: undefined})`
     * turns it off. See {@link CalendarOptions}.
     * @default undefined
     */
    readonly calendar?: CalendarOptions;
    /**
     * Dependency arrow polish: rounded joints (`cornerRadius`), invisible hit
     * area for hover/click (`hitWidth`), per-arrow CSS class (`classBuilder`),
     * and HTML hover tooltip (`tooltipTemplate`).
     */
    readonly dependencies?: DependencyOptions;
    /** Color of the cell and row divider lines. @default '#E5E7EB' (light) / '#3A3A3A' (dark) */
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
    /** Color of the crosshair line and label background. @default '#3B82F6' (light) / '#818CF8' (dark) */
    readonly crosshairColor?: string;
    /**
     * Custom formatter for the crosshair label text. Receives the date under the
     * cursor and the current sub-tier of the timeline header. When omitted, the
     * label auto-adapts to the active tier: `'ddd MM/DD/YYYY'` for day/week/
     * month/quarter/year tiers and `'MM/DD HH:mm'` for halfday/hour/minute
     * tiers, with weekday names from `locale.dateLocale` when one is set.
     * @default undefined (the tier-adaptive label)
     */
    readonly crosshairLabelFormat?: CrosshairLabelFormatter;
    /** Border color for all cells in the task table and timeline grid. @default '#EDEFF2' (light) / '#3A3A3A' (dark) */
    readonly cellBorderColor?: string;
    /** CSS border-width for all cell lines, e.g. `'1px'`. @default '1px' */
    readonly cellBorderWidth?: string;
    /** Custom column definitions for the task-list panel. When omitted, all default columns are shown. */
    readonly columnConfig?: ColumnListItem[];
    /**
     * Initial sort for the task list. One or more {@link SortCriterion}.
     * Hierarchy-preserving: siblings are sorted within each parent. Omit for the
     * default (start-time ascending); pass `[]` for natural (input) order.
     * @default [{ key: ColumnKey.StartTime, direction: 'asc' }]
     */
    readonly sortBy?: SortCriterion | SortCriterion[];
    /**
     * Initial filter for the task list. A predicate run against each task; a task
     * is kept when it matches or has a matching descendant. @default undefined
     */
    readonly filterBy?: TaskFilterPredicate;
    /**
     * Initial structured filter (advanced filter builder): a {@link FilterRuleSet}
     * of conditions combined with `'all'` / `'any'`. Takes precedence over
     * `filterBy` when both are set. @default undefined
     */
    readonly filterRules?: FilterRuleSet;
    /**
     * Initial grouping: a {@link GroupCriterion} or a bare column key. When set,
     * the parent/child tree is suspended and tasks are bucketed under collapsible
     * group headers, ordered and labelled by the criterion. Also available at
     * runtime via `gantt.groupBy()` / `gantt.clearGrouping()`. @default undefined
     */
    readonly groupBy?: GroupCriterion | ColumnKey | string;
    /**
     * Show a built-in advanced filter builder in the toolbar — a "Filter" button
     * that opens a popover for composing field/operator/value conditions combined
     * with All (AND) / Any (OR). Drives the same view-only filter as
     * `gantt.setFilterRules()`. @default false
     */
    readonly enableFilterBuilder?: boolean;
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
     * to keep the bar double-click dialog without inline cell editing.
     * @default false
     */
    readonly enableInlineEdit?: boolean;
    /** Enable row selection (click, Ctrl+Click, Shift+Click, keyboard). @default false */
    readonly enableSelection?: boolean;
    /** Show the export button in the toolbar. @default true */
    readonly enableExport?: boolean;
    /**
     * Format produced by the toolbar export button: `'svg'` (vector), `'png'`
     * (raster), or `'pdf'` (single-page, image-based). Any format is also
     * available programmatically via `gantt.exportChart(format)`. @default 'svg'
     */
    readonly exportFormat?: GanttExportFormat;
    /**
     * Persist and restore the UI view state (zoom, scroll, sort, filter, collapse,
     * selection) via `localStorage`. Pass `true` to enable with the default key
     * (`'apexgantt-state'`), or an object to set a custom key. Restored on the
     * first `render()`; saved (debounced) whenever the view changes. State is also
     * available programmatically via `gantt.getState()` / `gantt.setState()`.
     * @default false
     */
    readonly persistState?: boolean | GanttStatePersistenceOptions;
    /**
     * Auto-size each task-list column to fit its header title and cell content,
     * growing the task-list panel (never below `tasksContainerWidth`) so nothing
     * is clipped. `flexGrow` still distributes any extra width, `minWidth` is a
     * floor, and `maxWidth` (per column, default `320px`) is the ceiling. Set to
     * `false` for the legacy behavior where the panel width is split purely by
     * `flexGrow`. @default true
     */
    readonly autoSizeColumns?: boolean;
    /**
     * Allow individual task-list columns to be resized by dragging the handle at
     * the trailing edge of each column header. A resized column is pinned to its
     * chosen pixel width (the other columns absorb the remaining space), so users
     * can keep some columns wide and others thin. Double-click a handle to reset
     * that column to its auto width. Opt a single column out with
     * `columnConfig[].resizable: false`. @default true
     */
    readonly resizableColumns?: boolean;
    /**
     * Allow columns to be reordered by dragging a column header left or right onto
     * another column. The new order is reflected in the grid, included in
     * `getState()` / `setState()`, and emitted as a `columnReorder` event. Also
     * available programmatically via `gantt.setColumnOrder()`. @default true
     */
    readonly reorderableColumns?: boolean;
    /** Allow the task-list panel to be resized by dragging the divider. @default true */
    readonly enableResize?: boolean;
    /**
     * Allow task bars to be dragged horizontally on the timeline to reschedule
     * them (start and end move together, snapped to `snapUnit`). Dragging a
     * parent moves its children with it. It does not reorder rows; drawing
     * dependency links is `dependencies.editable`. Each move runs
     * `beforeTaskUpdate`, is undoable, and fires `taskDragged`.
     * @default true
     */
    readonly enableTaskDrag?: boolean;
    /**
     * Open the task-edit dialog (name, start, end, progress) when a task bar is
     * double-clicked, or when Enter is pressed on a focused bar or task-list row. Saving
     * runs `beforeTaskUpdate` with only the changed fields. Also turns on
     * `enableInlineEdit` unless that is set explicitly.
     * @default false
     */
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
    /**
     * Enable keyboard shortcuts for task editing: `Delete` / `Backspace` to
     * delete the focused row (cascade: 'children'), `Tab` / `Shift+Tab` to
     * indent / outdent in the tree. Off by default because mutations from
     * navigation keys can surprise users — opt in once you've decided the
     * shortcuts are right for your app.
     *
     * Requires the task-list panel to have keyboard focus; the existing
     * roving-tabindex navigation (ArrowUp/Down, Home/End) is unaffected.
     *
     * @default false
     */
    readonly enableTaskEditingShortcuts?: boolean;
    /**
     * Show built-in `+ Add Task` and trash-icon `Delete` buttons in the toolbar.
     * The delete button is auto-disabled when nothing is selected; clicking it
     * deletes every selected task (cascade: 'children') and clears the selection.
     * The add button inserts a new task at the root level with placeholder
     * dates derived from the current project span — the user can then rename or
     * reposition it via inline / dialog edit.
     *
     * Off by default; opt in to expose CRUD affordances in the toolbar. The
     * delete button works against the current `selectionManager` selection, so
     * `enableSelection: true` is also required for it to do anything useful.
     *
     * @default false
     */
    readonly enableTaskCRUDToolbar?: boolean;
    /**
     * Show a built-in right-click context menu on task bars and task-list rows
     * with entries for Edit, Add child / sibling task, Indent, Outdent, and
     * Delete (cascade). Off by default so consumers can ship their own menu
     * without competing with the built-in one. Entries are gated by the
     * underlying capability — e.g. Indent / Outdent only appear when a sibling
     * / parent exists; Edit only appears when `enableTaskEdit` is on.
     *
     * @default false
     */
    readonly enableContextMenu?: boolean;
    /**
     * Show a single-line "+ Add task" row at the bottom of the task list. The
     * row renders below the last real task and reads like a button: clicking
     * it inserts a new root-level placeholder task and emits `taskAdded`.
     *
     * Hidden while row virtualisation is active, which is whenever more than
     * 50 rows are visible (collapsed and filtered-out rows do not count). At
     * that size the toolbar Add button or the context menu is the better
     * affordance. Off by default.
     *
     * @default false
     */
    readonly enableAddTaskRow?: boolean;
    /**
     * Allow creating a task by dragging across an empty stretch of the timeline:
     * press on an empty row, drag horizontally to sweep out the date range, and
     * release to add a task with those (snapped) start/end dates. Off by default
     * so an existing chart's empty-area drags stay inert; enable it to match
     * "draw a new bar" from dedicated project tools. Respects `beforeTaskAdd` and
     * is recorded in undo history like any other add. @default false
     */
    readonly enableDrawTask?: boolean;
    /**
     * Show a small chevron at the edge of a task's row when that task's bar is
     * scrolled out of the visible timeline window; clicking it scrolls the bar
     * into view. Also available programmatically via `gantt.scrollToTask()`.
     * @default false
     */
    readonly enableScrollButtons?: boolean;
    /**
     * Clicking a task-list row scrolls that task's bar into view (nearest-edge,
     * horizontal + vertical), the same as calling `gantt.scrollToTask()`. Off by
     * default; composes with `enableSelection` (a click both selects and reveals).
     * @default false
     */
    readonly scrollToTaskOnRowClick?: boolean;
    /**
     * Configures the undo/redo history stack. Every mutating call (drag, resize,
     * inline / dialog edit, add, delete, move, dependency change) is recorded
     * unless `enabled: false`. Use `gantt.undo()` / `gantt.redo()` to traverse,
     * `gantt.canUndo()` / `gantt.canRedo()` to gate UI affordances, and the
     * `historyChange` event to react to changes.
     *
     * The stack is bounded by `maxSize` (FIFO eviction) so a long editing session
     * doesn't grow unbounded; bump it when you need a longer trail.
     *
     * @default { enabled: true, maxSize: 100 }
     */
    readonly history?: Partial<HistoryOptions>;
    /** Show a tooltip on task-bar hover. @default true */
    readonly enableTooltip?: boolean;
    /** Color for all text in the chart. @default '#1F2933' (light) / '#E0E0E0' (dark) */
    readonly fontColor?: string;
    /** CSS font-family for the chart. @default 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' */
    readonly fontFamily?: string;
    /** CSS font-size for the chart, e.g. `'14px'`. @default '14px' */
    readonly fontSize?: string;
    /** CSS font-weight for the chart. @default '400' */
    readonly fontWeight?: string;
    /** Background color of the timeline and task-list header row. @default '#F8F9FB' (light) / '#2A2A2A' (dark) */
    readonly headerBackground?: string;
    /**
     * Height of the chart. Accepts a pixel number or a CSS string.
     *
     * When omitted and the container already has a height of its own (a CSS
     * rule, an inline style, a flex or grid track), the chart fills the container
     * and follows its size. A container sized only by its content gets 500px.
     * @default 500
     */
    readonly height?: number | string;
    /**
     * dayjs-compatible format string used to parse `startTime` / `endTime` values.
     * Changing it with `update()` does not rewrite the stored dates, so pass
     * `series` in the new format alongside it. It is also how dates are shown,
     * and since 3.22 `Q`, `Do`, `k`, `w`, `W`, `X`, `x` and `L` print values
     * there; wrap text that should print as written in `[ ]` (the chart warns
     * once about such a letter outside brackets).
     * @default 'MM-DD-YYYY'
     */
    readonly inputDateFormat?: string;
    /** Alternating row background colors. The pattern cycles automatically. @default ['#FFFFFF'] */
    readonly rowBackgroundColors?: readonly string[];
    /** Height of each task row in pixels. @default 40 */
    readonly rowHeight?: number;
    /**
     * Task data array. Required. Each item must satisfy `TaskInput`, or use
     * `parsing` to map custom field names. Read when the chart is created and
     * whenever `update()` is passed `series` (which replaces the data and clears
     * the undo history). Any other `update()` keeps the current tasks, edits
     * included; read them back with `getTasks()`.
     */
    readonly series: TaskInput[] | Record<string, unknown>[];
    /** Initial pixel width of the task-list panel. @default 425 */
    readonly tasksContainerWidth?: number;
    /** Background color of the hover tooltip. @default '#FFFFFF' */
    readonly tooltipBGColor?: string;
    /** Border color of the hover tooltip. @default '#E5E7EB' (light) / '#444444' (dark) */
    readonly tooltipBorderColor?: string;
    /** HTML `id` for the tooltip container element. @default 'apexgantt-tooltip-container' */
    readonly tooltipId?: string;
    /**
     * Custom function returning an HTML string for the task tooltip. Called as
     * `(task, dateFormat, context)`; `context.durationText` is the task's
     * duration as the Duration column shows it (snap unit, working days).
     * @default built-in template (name, start, end, duration, progress)
     */
    readonly tooltipTemplate?: TooltipTemplate;
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
     * Bounds are clamped to roughly `[0.25, 7680]` px/day. Values outside this
     * range are clipped.
     *
     * **When omitted**, the chart auto-fits the full data range into the visible
     * timeline area on first render so a long project doesn't open scrolled.
     * Supply an explicit value here (or zoom via the toolbar) to take control.
     */
    readonly pixelsPerDay?: number;
    /** Width of the chart. Accepts a pixel number or a CSS string. @default '100%' */
    readonly width?: number | string;
    /**
     * Field-mapping config to parse non-standard task shapes without manual data
     * transformation. Passing `parsing` to `update()` re-parses the last raw
     * `series` (or the one passed alongside it), replacing the current data and
     * clearing the undo history.
     * @default undefined
     */
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
    /**
     * Show a built-in quick-filter search box in the toolbar. Typing filters the
     * task list to rows whose configured fields contain the query (ancestors of
     * matches stay visible); clearing it removes the filter. Drives the same
     * view-only filter as `gantt.filter()`. @default false
     */
    readonly enableQuickFilter?: boolean;
    /** Fine-tunes the built-in quick-filter search box (placeholder, fields, case-sensitivity). */
    readonly quickFilter?: QuickFilterOptions;
    /**
     * `aria-label` for the task-list table, used by screen readers. Wins over
     * the `taskListAriaLabel` message.
     * @default 'Gantt task list'
     */
    readonly taskListAriaLabel?: string;
    /**
     * Veto hook called immediately before a task is inserted via
     * `gantt.addTask()`, the toolbar Add button, the add-task row or drawing a
     * task on the timeline. Receives one object, `{input, parentId}`: the task
     * input about to be inserted and the id of the parent it will land under
     * (the `addTask()` option, else `input.parentId`; `undefined` for a root
     * task, including an id that matches no task). Return `false` to cancel the insertion. Useful for enforcing
     * permissions or validating the payload against external rules.
     *
     * Hooks are synchronous: the return value is read immediately, so a
     * returned Promise is not a veto (it is not `false`) and the insertion goes
     * ahead. To confirm asynchronously, cancel here and call `addTask()` again
     * once the answer arrives.
     *
     * @default undefined
     */
    readonly beforeTaskAdd?: BeforeTaskAddHook;
    /**
     * Veto hook called before every task edit is applied: bar drag, resize,
     * progress drag, keyboard move / resize, dialog save, inline edit, and
     * `gantt.updateTask()` (also `splitTask()`). Receives one object,
     * `{task, updates}`: the task as it is now and the fields about to change
     * (only the changed fields for a dialog save). Return `false` to reject the
     * change; the bar is repainted from the model and no `taskUpdate`,
     * `taskDragged`, `taskResized` or `taskProgressChanged` fires. When a parent
     * drag or keyboard move is rejected, the children moved with it are skipped
     * too; rejecting one of those children keeps only that child in place, and
     * the hook is still asked about the others. Undo and redo do not call it.
     *
     * Synchronous: a returned Promise is not a veto.
     *
     * @default undefined
     */
    readonly beforeTaskUpdate?: BeforeTaskUpdateHook;
    /**
     * Veto hook called immediately before a task is re-parented via
     * `gantt.moveTask()` (also keyboard indent / outdent and the context menu).
     * Receives one object, `{task, oldParentId, newParentId}`, with the parent
     * ids `undefined` for a root. Return `false` to cancel. Synchronous: a
     * returned Promise is not a veto.
     *
     * @default undefined
     */
    readonly beforeTaskMove?: BeforeTaskMoveHook;
    /**
     * Veto hook called immediately before a task is removed via
     * `gantt.deleteTask()`. Return `false` to cancel. The hook receives the
     * full snapshot of the task plus the descendants that *would* be removed
     * when `cascade: 'children'` is requested.
     *
     * @default undefined
     */
    readonly beforeTaskDelete?: BeforeTaskDeleteHook;
    /**
     * Veto hook called immediately before a dependency edge is added or removed
     * via `gantt.addDependency()` / `gantt.removeDependency()`. `change`
     * distinguishes the direction. Return `false` to cancel.
     *
     * @default undefined
     */
    readonly beforeDependencyChange?: BeforeDependencyChangeHook;
}

export declare function getTheme(mode: ThemeMode): GanttTheme;

/**
 * Detail for the `groupChange` event, fired when the active grouping changes via
 * `gantt.groupBy()` / `gantt.clearGrouping()`.
 */
export declare interface GroupChangeEventDetail {
    /** Whether grouping is active after the change. */
    active: boolean;
    /** The field being grouped by, or `null` when grouping was cleared. */
    field: string | null;
    /** Number of groups produced by the active grouping (0 when cleared). */
    groupCount: number;
    timestamp: number;
}

/**
 * Describes how to group the task grid by a field. When active, the parent/child
 * tree is suspended and every task appears flat under a collapsible group header.
 *
 * Pass a bare `ColumnKey`/string to `gantt.groupBy()` (or the `groupBy` option)
 * to group by that column's value, or this object form to customize how the
 * group value is extracted, labelled, and ordered.
 */
export declare interface GroupCriterion {
    /** Column key whose value tasks are grouped by (a `ColumnKey` or custom column id). */
    readonly field: ColumnKey | string;
    /**
     * Extract the raw group value from a task. Overrides the column's `accessor`.
     * Tasks with an equal value (by `String(value)`) land in the same group.
     */
    readonly accessor?: (task: Task) => unknown;
    /** Format a raw group value into the header label. Defaults to `String(value)`. */
    readonly label?: (value: unknown) => string;
    /**
     * Order of the group headers by their underlying value: numbers numerically,
     * dates chronologically, text alphabetically. The "(None)" group is always
     * last. @default 'asc'
     */
    readonly direction?: SortDirection;
}

/**
 * Detail payload for the `historyChange` event.
 *
 * Fires after every mutation that touches the undo/redo stacks — recording a
 * new command, undo, redo, or `clearHistory()`. Use it to keep external
 * Undo/Redo UI affordances in sync with the gantt's internal state.
 *
 * `kind` identifies what triggered the change:
 * - `'record'` — a new command was pushed; `canUndo` is now true and the redo
 *   stack was cleared.
 * - `'undo'` — `gantt.undo()` ran successfully; the popped transaction moved
 *   to the redo stack.
 * - `'redo'` — `gantt.redo()` ran successfully; the popped transaction moved
 *   back to the undo stack.
 * - `'clear'` — `gantt.clearHistory()` (or disabling the stack via
 *   `update({history: {enabled: false}})`) emptied both stacks.
 */
export declare interface HistoryChangeEventDetail {
    kind: 'record' | 'undo' | 'redo' | 'clear';
    canUndo: boolean;
    canRedo: boolean;
    undoSize: number;
    redoSize: number;
    /** Label of the transaction at the top of the undo stack, if any. */
    topUndoLabel?: string;
    /** Label of the transaction at the top of the redo stack, if any. */
    topRedoLabel?: string;
    timestamp: number;
}

/**
 * Configures the undo/redo history stack that backs every mutating API on the
 * Gantt instance. Every command (drag, resize, inline / dialog edit, add,
 * delete, move, dependency change, programmatic `updateTask` / `addTask` /
 * `moveTask` / `addDependency` / `removeDependency`) is captured here so the
 * caller can roll the state back through `gantt.undo()` / `gantt.redo()`.
 *
 * Set `enabled: false` to opt out completely — useful when the host app
 * implements its own history layer (e.g. CRDT-backed sync). When disabled,
 * `gantt.undo()` / `gantt.redo()` are no-ops and `canUndo()` / `canRedo()`
 * return false.
 */
export declare interface HistoryOptions {
    /** When false, no commands are recorded and `undo`/`redo` are no-ops. @default true */
    readonly enabled: boolean;
    /** Maximum number of undo entries retained. Older entries drop off the bottom. @default 100 */
    readonly maxSize: number;
}

/**
 * A single holiday or non-working calendar entry. Accept plain dates for
 * one-line config or an object form when you want a label that appears in
 * the holiday tooltip.
 */
export declare type HolidayEntry = string | Date | {
    readonly date: string | Date;
    readonly label?: string;
};

/**
 * Tooltip context passed to {@link CalendarOptions.holidayTooltip}. The
 * `label` is whichever string the host supplied in {@link HolidayEntry}, or
 * `undefined` for plain-date entries.
 */
export declare interface HolidayTooltipContext {
    readonly date: Date;
    readonly label?: string;
}

declare interface InteractiveOptions {
    readonly enableInlineEdit: boolean;
    readonly enableTaskDrag: boolean;
    readonly enableTaskResize: boolean;
    readonly enableProgressDrag: boolean;
    readonly enableTaskEditingShortcuts: boolean;
    readonly enableTaskCRUDToolbar: boolean;
    readonly enableContextMenu: boolean;
    readonly enableAddTaskRow: boolean;
    readonly enableDrawTask: boolean;
    readonly enableScrollButtons: boolean;
    readonly scrollToTaskOnRowClick: boolean;
    readonly history: HistoryOptions;
    readonly snapUnit: SnapUnit;
    readonly snapValue: number;
    readonly beforeTaskAdd?: BeforeTaskAddHook;
    readonly beforeTaskUpdate?: BeforeTaskUpdateHook;
    readonly beforeTaskMove?: BeforeTaskMoveHook;
    readonly beforeTaskDelete?: BeforeTaskDeleteHook;
    readonly beforeDependencyChange?: BeforeDependencyChangeHook;
}

/** The light preset: the colours of a chart with no colour options. */
export declare const LightTheme: GanttTheme;

/**
 * Localization, date-locale, and text-direction options.
 *
 * With the defaults (`direction: 'ltr'`, no `dateLocale`, no message overrides)
 * the output is byte-for-byte identical to builds that predate i18n support.
 */
export declare interface LocaleOptions {
    /**
     * A locale pack ({@link GanttLocalePack}): the base layer under every other
     * `locale` field. Each explicit `locale.*` field wins over the pack's value,
     * and `calendar.weekStart` and `calendar.fiscalYearStartMonth` win over the
     * pack's. Object only: a string logs one warning per chart and is ignored.
     * @default undefined
     */
    readonly pack?: GanttLocalePack;
    /**
     * BCP 47 language tag such as `'ja'` or `'ja-JP'`. When it resolves (here or
     * from `pack.tag`), it is set as the chart root's `lang`, and it drives the
     * plural rules and number formatting of message templates. A malformed tag
     * (such as `'ja_JP'`) is ignored, as if unset, so sorting and grouping never
     * throw.
     * @default undefined (falls back to `pack.tag`)
     */
    readonly tag?: string;
    /**
     * dayjs pattern for read-only dates: the task list Start, End, Baseline
     * Start and Baseline End columns and the bar and baseline tooltips, formatted
     * with the active date locale. Editors keep `inputDateFormat`. Unset: the
     * pack's `displayDateTimeFormat` when `inputDateFormat` has time tokens, else
     * the pack's `displayDateFormat`, else `inputDateFormat` as before.
     * @default undefined
     */
    readonly displayDateFormat?: string;
    /**
     * Patterns for the default crosshair label. The top-level
     * `crosshairLabelFormat` function wins. See {@link GanttCrosshairFormat}.
     * @default undefined (the built-in patterns)
     */
    readonly crosshairFormat?: GanttCrosshairFormat;
    /**
     * Text and layout direction. `'rtl'` mirrors the timeline horizontally
     * (time flows right-to-left, the task list moves to the right) and sets
     * `dir="rtl"` on the container; `'auto'` defers to the document/element.
     * When it is not set, the pack's `dir` applies.
     * @default 'ltr'
     */
    readonly direction?: TextDirection;
    /**
     * dayjs-compatible locale object for the timeline header labels, the dates
     * in bar aria-labels and the default crosshair label. Its name is also set
     * as the `lang` of the timeline header rows (not the chart root, whose other
     * text keeps the page's language). Dates shown with `inputDateFormat`
     * (task list, tooltips, task form) are not affected; the header's word
     * order can be changed with {@link timelineHeaderFormat}. Import one from
     * `dayjs/locale/*` (e.g. `import localeFr from 'dayjs/locale/fr'`) and pass
     * it here. See {@link GanttDateLocale}. Wins over the pack's `dateLocale`.
     * @default undefined (English)
     */
    readonly dateLocale?: GanttDateLocale;
    /**
     * Overrides for the Gantt's generated strings. See {@link GanttMessages}.
     * Each function key also takes a template string (see
     * {@link GanttMessagesInput}). Wins over the pack's messages key by key.
     * @default {} (the English defaults, {@link DEFAULT_GANTT_MESSAGES})
     */
    readonly messages?: GanttMessagesInput;
    /**
     * Labels for the timeline header, per tier and row, in place of the built-in
     * English-ordered ones. Only the rows you set change. See
     * {@link TimelineHeaderFormat}. Merged over the pack's
     * `timelineHeaderFormat` per tier and row; its `fiscal` block applies only
     * while a fiscal year is in use.
     * @default undefined (the built-in labels)
     */
    readonly timelineHeaderFormat?: TimelineHeaderFormat;
}

/**
 * Orientation of an annotation's label text. `Horizontal` reads left to right
 * along the top of the annotation; `Vertical` runs the text up its leading edge,
 * which keeps a label on a narrow line from spilling across the timeline. Only
 * the label turns: the annotation itself still runs down the task rows.
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
 * A row needs an `id` and a `name`; a row without either is skipped with a
 * warning. A row with no start date is kept only when it is a parent of a
 * dated row (directly or further down), and its summary bar spans its
 * children. Any other row with no start date (an unscheduled item, a row with
 * only an end date) is skipped with a warning.
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
    /** Source of the per-task `barTextColor` (the label colour inside the bar). */
    barTextColor?: ParsingValue;
    rowBackgroundColor?: ParsingValue;
    collapsed?: ParsingValue;
    /** Path to `TaskInput.showSummaryBar` (a boolean; `false` draws a parent as a normal bar). */
    showSummaryBar?: ParsingValue;
    /** Path to `TaskInput.baseline`, a `{start, end}` object of planned dates. */
    baseline?: ParsingValue;
    /** Path to `TaskInput.segments`, an array of `{start, end}` worked spans. */
    segments?: ParsingValue;
    /** Path to `TaskInput.assignees`, an array of `Assignee` objects. */
    assignees?: ParsingValue;
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
 * Built-in column renderer that draws an SVG progress ring for the task's
 * completion percentage, with an optional centered numeric label.
 *
 * Reads from `task.progress` by default; override with `accessor` for
 * computed values.
 *
 * @example
 * ```ts
 * import { ApexGantt, ColumnKey, renderers } from '@apexcharts/apexgantt';
 *
 * new ApexGantt('#chart', {
 *   series,
 *   columnConfig: [
 *     { key: ColumnKey.Name, title: 'Task' },
 *     {
 *       key: 'progressRing',
 *       title: '%',
 *       render: renderers.progressRing({
 *         size: 28,
 *         strokeWidth: 3,
 *         progressColor: (_task, value) => value > 80 ? '#22C55E' : value >= 40 ? '#3B82F6' : '#EF4444',
 *       }),
 *     },
 *   ],
 * });
 * ```
 */
declare function progressRing(options?: ProgressRingRendererOptions): ColumnRenderer;

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

/**
 * Configures the built-in quick-filter search box (enabled via
 * `enableQuickFilter`).
 */
export declare interface QuickFilterOptions {
    /**
     * Placeholder text for the search input. Falls back to the localized
     * `quickFilterPlaceholder` message when omitted.
     */
    readonly placeholder?: string;
    /**
     * Task string fields matched against the query. @default ['name']
     */
    readonly fields?: ReadonlyArray<keyof Task | string>;
    /**
     * Match case-sensitively. @default false
     */
    readonly caseSensitive?: boolean;
}

declare namespace renderers {
    export {
        avatars,
        AvatarsRendererOptions,
        progressRing,
        ProgressRingRendererOptions
    }
}
export { renderers }

/** Options for `gantt.scrollToTask()`. */
export declare interface ScrollToTaskOptions {
    /**
     * Open the task's collapsed ancestors (and, while grouping, its collapsed
     * group) before scrolling. With `false`, a task hidden that way is not
     * scrolled to and `scrollToTask()` returns `false`.
     * @default true
     */
    readonly expand?: boolean;
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
 * Detail for the `sortChange` event, fired when the active sort changes via
 * `gantt.sort()` / `gantt.clearSort()` or a column-header click.
 */
export declare interface SortChangeEventDetail {
    /** Active sort criteria after the change. Empty array = natural (input) order. */
    criteria: ReadonlyArray<{
        key: string;
        direction: 'asc' | 'desc';
    }>;
    timestamp: number;
}

/**
 * A single sort key: which column to sort by and in which direction.
 * Multiple criteria sort by the first key, breaking ties with the next.
 */
export declare interface SortCriterion {
    /** Column key to sort by (a `ColumnKey` or a custom column id). */
    readonly key: ColumnKey | string;
    /** Sort direction. @default 'asc' */
    readonly direction?: SortDirection;
}

/** Sort direction for a {@link SortCriterion}. */
export declare type SortDirection = 'asc' | 'desc';

/**
 * Resolved task object used internally and returned from selection/event APIs.
 *
 * Extends `TaskInput` with fields that are guaranteed to be present after the
 * data normalisation step (missing optional fields are filled with defaults).
 * Use `Task` in wrapper libraries when typing event detail payloads and the
 * return value of `getSelectedTasks()`.
 */
export declare interface Task extends TaskInput {
    /** Start date. Always present after normalisation (an empty string on a summary row given no dates). */
    readonly startTime: string;
    /** End date is always present after normalisation (defaults to `startTime` for milestones). */
    readonly endTime: string;
    /**
     * Nesting depth in the task hierarchy, counted from 1: a top-level task is
     * `1`, its children `2`, and so on (the row's `aria-level`). Recomputed
     * whenever the tree changes.
     */
    readonly level?: number;
    /**
     * Work Breakdown Structure code derived from the task's position in the
     * hierarchy (e.g. `'1'`, `'1.1'`, `'1.1.2'`, `'2'`). Recomputed whenever the
     * tree changes; render via the `ColumnKey.Wbs` column or read directly.
     */
    readonly wbs?: string;
    /**
     * Comma-separated references to this task's predecessors (the tasks it depends
     * on), by WBS code with a non-`FS` type and non-zero lag suffix (e.g.
     * `'1.2, 3SS+2d'`). Derived by `DataManager` from the dependency list and
     * refreshed whenever the tree, sort, or dependencies change. Render via the
     * `ColumnKey.Predecessors` column.
     */
    readonly predecessors?: string;
    /** Comma-separated references to this task's successors (tasks that depend on it); see {@link predecessors}. */
    readonly successors?: string;
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
    /**
     * View-only flag marking a synthetic group-header row produced while grouping
     * is active (`gantt.groupBy(...)`). Group headers are never stored in the data
     * model — they exist only in the flat render list — so real-task queries,
     * selection, and dependencies never see them.
     */
    readonly isGroup?: boolean;
    /** Stable key of the group this header represents (group rows only). */
    readonly groupKey?: string;
    /** Display label for the group header (group rows only). */
    readonly groupLabel?: string;
    /** Number of member tasks in the group (group rows only). */
    readonly groupCount?: number;
}

/**
 * Detail payload for the `taskAdded` event.
 *
 * Fires after a task has been inserted via `gantt.addTask()`. `parentId` is
 * the resolved parent (root tasks omit it). Listen to this to mirror the
 * insertion in a backend or external store.
 */
export declare interface TaskAddedEventDetail {
    taskId: string;
    task: Task;
    parentId?: string;
    timestamp: number;
}

/**
 * Comparator over two tasks returning negative / zero / positive (ascending).
 * Used by `ColumnListItem.comparator` and internally by the sort engine.
 */
export declare type TaskComparator = (a: Task, b: Task) => number;

/**
 * Detail payload for the `taskDeleted` event.
 *
 * Fires after a task has been removed via `gantt.deleteTask()`. When
 * `cascade: 'children'` was used, one event fires per removed task and
 * `removedDescendantIds` lists every descendant included in the same
 * transaction. `task` is the snapshot of the task at the moment it was
 * removed — useful for backend sync.
 */
export declare interface TaskDeletedEventDetail {
    taskId: string;
    task: Task;
    /** Sibling descendant ids removed in the same transaction (empty for leaf or non-cascading deletes). */
    removedDescendantIds: string[];
    timestamp: number;
}

/**
 * Declares a predecessor/successor relationship between two tasks.
 *
 * Set one of these as `TaskInput.dependency` to draw an arrow from the
 * predecessor's bar to this task's bar. A task's `dependency` takes one
 * predecessor; add more links with `gantt.addDependency()`.
 *
 * Links are drawn and analysed (critical path, the Predecessors and Successors
 * columns) but never move tasks: dragging or resizing a bar does not shift its
 * successors, and a successor that starts too early is not rescheduled.
 */
export declare interface TaskDependency {
    /** ID of the task this task depends on */
    readonly taskId: string;
    /** Dependency type. Defaults to 'FS' (Finish-to-Start) */
    readonly type?: DependencyType;
    /**
     * Lag (positive, a delay) or lead (negative, an overlap) in days. Counts
     * working days when a `calendar` is set and calendar days otherwise. It feeds
     * the critical path and the arrow tooltip only; it never moves a task.
     * @default 0
     */
    readonly lag?: number;
    /**
     * Has no effect: `lag` always counts working days when a calendar is set and
     * calendar days otherwise.
     * @deprecated Ignored. Remove it from your data.
     */
    readonly lagUnit?: 'working' | 'calendar';
}

/**
 * Detail payload for the `taskDragged` event.
 *
 * Fires when a task bar is dropped at a new horizontal position, after
 * `beforeTaskUpdate` accepted the move (a vetoed drag fires nothing and the
 * bar returns to its place). All dates are formatted using
 * `GanttUserOptions.inputDateFormat`. `affectedChildTasks` lists the sub-tasks
 * whose dates were shifted with it.
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
 * Predicate deciding whether a task matches an active filter. A task is kept
 * when it matches OR has a descendant that matches (ancestors of matches stay
 * visible so the tree context is preserved).
 */
export declare type TaskFilterPredicate = (task: Task) => boolean;

/**
 * Raw task data shape passed to `new ApexGantt()` via `GanttUserOptions.series`
 * or to `DataParser.parse()`.
 *
 * Dates are supplied as strings and parsed using `GanttUserOptions.inputDateFormat`
 * (default: `'MM-DD-YYYY'`). Any format understood by dayjs is valid when the
 * corresponding `inputDateFormat` is specified.
 *
 * @example
 * ```ts
 * const task: TaskInput = {
 *   id: 'task-1',
 *   name: 'Design Phase',
 *   startTime: '01-01-2026',
 *   endTime: '01-15-2026',
 *   progress: 60,
 *   type: 'task',
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
     * Required for a task or milestone. A parent row may omit it (and
     * `endTime`): its summary bar spans its children. A task with no
     * `startTime` and no children throws. When such a parent later loses its
     * last child (`deleteTask`, `moveTask`, or `updateTask` with a new
     * `parentId`), it is given the span its summary bar showed as its own
     * `startTime` and `endTime`, written in `inputDateFormat`.
     * @example `'01-01-2026'` (default format `'MM-DD-YYYY'`)
     */
    readonly startTime?: string;
    /**
     * Task end date string. Parsed using `GanttUserOptions.inputDateFormat`.
     * When omitted and `type` is not set, a task without children renders as a
     * milestone on `startTime`, and a parent drawn as a summary bar stays a
     * `'task'` spanning its children. A task with `type: 'task'` needs an
     * `endTime`.
     * @example `'01-15-2026'`
     */
    readonly endTime?: string;
    /**
     * Completion percentage (0–100). Renders a filled progress portion inside
     * the task bar. @default 0
     */
    readonly progress?: number;
    /**
     * Visual type of the task. `'task'` renders a bar; `'milestone'` renders a
     * diamond marker. Accepts the `TaskType` enum or its string value. Any other
     * value logs a warning.
     * @default 'task' when `endTime` is set or the task is a summary parent, `'milestone'` otherwise
     */
    readonly type?: TaskType | `${TaskType}`;
    /**
     * ID of the parent task. Nested tasks are rendered as children in the
     * task list and inherit the parent's row background color. Compared by
     * value, so `'1'` finds a task whose `id` is the number `1`. A `parentId`
     * that matches no task, or that makes a cycle (a task naming itself, or a
     * under b under a), logs a warning and the task is attached to the root.
     */
    readonly parentId?: string;
    /**
     * Dependency on one predecessor task. Accepts either a plain task ID string
     * (backwards-compatible, treated as Finish-to-Start with 0 lag) or a full
     * `TaskDependency` object for typed dependency with lag/lead support. Add
     * more predecessors with `gantt.addDependency()`. Links never move tasks.
     * @example `'task-2'`
     * @example `{ taskId: 'task-2', type: 'FS', lag: 2 }`
     */
    readonly dependency?: string | TaskDependency;
    /** Override the task bar fill color for this specific task. */
    readonly barBackgroundColor?: string;
    /**
     * Override the colour of the label drawn inside this task's bar (`barLabel`
     * position `'inside'`, or `'auto'` when the label fits). Labels drawn outside
     * the bar use the chart's font colour. Pair it with `barBackgroundColor` when
     * a per-task fill needs a contrasting label.
     * @default undefined (the chart-level `barTextColor`)
     */
    readonly barTextColor?: string;
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
     * its descendants. The bar always spans that computed range: a
     * `startTime`/`endTime` given on the task is kept in its data but does not
     * move the bar, and no warning is logged. Drag, resize, and progress are
     * disabled on summary bars; they are always read-only. A `true` value is
     * dropped when the task loses its last child, so it draws as an ordinary
     * bar (or a milestone, when its type came from a missing `endTime`); an
     * explicit `false` is kept.
     * @default true
     */
    readonly showSummaryBar?: boolean;
    /**
     * People (or teams) assigned to this task. Consumed by the built-in
     * `renderers.avatars` column renderer; ignored unless an avatar-style
     * column is configured via `columnConfig`.
     */
    readonly assignees?: readonly Assignee[];
    /**
     * Worked spans of a split task. When two or more are provided, the task
     * renders as separate bar pieces with gaps between them, and its
     * `startTime`/`endTime` are derived from the segments (first start → last end).
     * Omit (or provide fewer than two) for a normal contiguous task: a single
     * segment sets `startTime`/`endTime` and is not kept.
     * Each entry needs `start` and `end`; an entry missing either is dropped
     * with a warning.
     * Split a task at runtime via `gantt.splitTask()`.
     */
    readonly segments?: readonly TaskSegment[];
}

/**
 * Detail payload for the `taskMoved` event.
 *
 * Fires after a task is re-parented via `gantt.moveTask()`. `oldParentId` and
 * `newParentId` are `undefined` when the task was (or becomes) a root.
 */
export declare interface TaskMovedEventDetail {
    taskId: string;
    oldParentId?: string;
    newParentId?: string;
    timestamp: number;
}

/**
 * Detail payload for the `taskProgressChanged` event.
 *
 * Fires when the in-bar progress handle is dragged to a new value (the white
 * wedge that becomes visible on bar hover), after `beforeTaskUpdate` accepted
 * it. Both values are integer percent 0 to 100; identical-value drags are
 * suppressed.
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
 * Fires when a task bar is resized by dragging its left or right handle, after
 * `beforeTaskUpdate` accepted the change.
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
 * One worked span of a split task. A task with two or more `segments` renders as
 * separate bar pieces with gaps between them (e.g. work Mon–Wed, pause, resume
 * Fri). Dates are strings parsed with `GanttUserOptions.inputDateFormat`.
 *
 * The task's own `startTime`/`endTime` remain the overall envelope (first
 * segment start → last segment end) and are derived automatically from the
 * segments, so summary rollups, dependencies, and the timeline all keep working.
 */
export declare interface TaskSegment {
    /** Start date of this worked span. */
    readonly start: string;
    /** End date of this worked span. */
    readonly end: string;
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
 * Fires when applying an accepted edit throws (for example a task that fails
 * validation). `error` contains the underlying `Error` instance for logging
 * or user feedback. The chart keeps the previous values.
 */
export declare interface TaskUpdateErrorEventDetail {
    taskId: string;
    error: Error;
    timestamp: number;
}

/**
 * Detail payload for the `taskUpdate` event.
 *
 * Fires once per edit, after `beforeTaskUpdate` accepted it and just before it
 * is applied, on every edit path (see {@link TaskUpdateSource}). Does not fire
 * for undo / redo or for `updateTask(id, updates, {silent: true})`. Use
 * `taskUpdateSuccess` or `taskUpdateError` to react to the final outcome.
 */
export declare interface TaskUpdateEventDetail {
    taskId: string;
    /** The fields this edit changes. */
    updates: Partial<Task>;
    /** The task as it will read once the edit is applied. */
    updatedTask: Task;
    /** The edit path that produced the update. */
    source: TaskUpdateSource;
    timestamp: number;
}

/**
 * Which edit path produced a task update. Carried by `taskUpdate` and
 * `taskUpdateSuccess` so one listener can tell the paths apart.
 *
 * - `'api'`: `gantt.updateTask()` (and `gantt.splitTask()`, which calls it)
 * - `'dialog'`: the edit dialog opened by double-clicking a bar
 * - `'drag'`: dragging a bar (and the children moved with a parent)
 * - `'inline'`: an inline cell edit in the task list
 * - `'keyboard'`: moving or resizing a focused bar with the arrow keys
 * - `'progress'`: dragging the in-bar progress handle
 * - `'resize'`: dragging a bar's resize handle
 */
export declare type TaskUpdateSource = 'api' | 'dialog' | 'drag' | 'inline' | 'keyboard' | 'progress' | 'resize';

/**
 * Detail payload for the `taskUpdateSuccess` event.
 *
 * Fires once per edit after it has been applied, on every edit path (see
 * {@link TaskUpdateSource}). `updatedTask` contains the fully resolved `Task`
 * object with all applied changes. Does not fire for undo / redo or for
 * `updateTask(id, updates, {silent: true})`.
 */
export declare interface TaskUpdateSuccessEventDetail {
    taskId: string;
    updatedTask: Task;
    /** The edit path that produced the update. */
    source: TaskUpdateSource;
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

export { TextDirection }

/** Color-mode selector. Switches between the built-in `LightTheme` and `DarkTheme` presets. */
export declare type ThemeMode = 'dark' | 'light';

/** Identifier for a timeline tier. Ordered finest to coarsest. */
export declare type TierId = 'minute' | 'hour' | 'halfday' | 'day' | 'week' | 'month' | 'quarter' | 'year';

/** Whether a tier is rendered as the top (coarse) row or the sub (fine) row. */
export declare type TierPosition = 'top' | 'sub';

/**
 * Timeline header labels per tier (`minute`, `hour`, `halfday`, `day`, `week`,
 * `month`, `quarter`, `year`) and row (`top`, `sub`). Only the rows you set
 * change, so an absent or empty object renders the built-in labels.
 *
 * Which rows show depends on the zoom (`pixelsPerDay`, or the zoom that fits
 * the project when it is unset): at week density (about 26 px per day) the
 * top row is `month` and the sub row is `week`; `week` becomes the top row
 * only once zoomed in to day cells (42 px per day or more). Set both rows of
 * a tier when the zoom can vary. `minute.top`, `halfday.top` and
 * `quarter.top` never render, because no finer tier sits under them.
 *
 * The optional `fiscal` block holds rows used only while a fiscal year is in
 * use, so one format (or one locale pack) can read `2026年` with calendar
 * years and `2026年度` once `calendar.fiscalYearStartMonth` is set.
 *
 * Code that walks the values of a format (`Object.values`, `Object.entries`)
 * meets the `fiscal` block beside the tier rows, so it narrows on the key
 * (`if (key === 'fiscal') continue`) and can annotate the rows it keeps as
 * {@link TimelineHeaderTierRows}.
 */
export declare type TimelineHeaderFormat = TimelineHeaderTierRows & {
    /**
     * Rows used instead of the ones above while a fiscal year is in use, that
     * is while `calendar.fiscalYearStartMonth` (or a locale pack's
     * `fiscalYearStartMonth`) is set to a valid month, `1` included. With no
     * fiscal year set the block is ignored. JSON-safe like the rest of the
     * format, so a locale pack can carry it.
     *
     * While a fiscal year is in use, each tier and row takes the first of these
     * that sets it: the user's `locale.timelineHeaderFormat.fiscal`, the user's
     * `locale.timelineHeaderFormat`, the pack's `timelineHeaderFormat.fiscal`,
     * the pack's `timelineHeaderFormat`, then the built-in fiscal labels
     * (`FY2026`, `#1 Apr-Jun`). A row the user sets therefore wins over every
     * row of the pack, fiscal or not.
     *
     * @example
     * // 2026年 with calendar years, 2026年度 once calendar.fiscalYearStartMonth is set.
     * {year: {top: 'YYYY年', sub: 'YYYY年'}, fiscal: {year: {top: '{fy}年度', sub: '{fy}年度'}}}
     * @default undefined (the rows above apply in fiscal-year mode too)
     */
    readonly fiscal?: TimelineHeaderTierRows;
};

/** One width-gated label in a candidate array (see {@link TimelineHeaderLabelFormat}). */
export declare interface TimelineHeaderLabelCandidate {
    /**
     * Narrowest cell width (px) this candidate is used at.
     * @default 0
     */
    readonly minWidth?: number;
    /** A pattern string or a function, as in {@link TimelineHeaderLabelFormat}. */
    readonly format: string | TimelineHeaderLabelFormatter;
}

/**
 * What a {@link TimelineHeaderLabelFormatter} is told about the cell it labels.
 * Dates are plain `Date`s, so the types never depend on the dayjs bundled with
 * ApexGantt.
 */
export declare interface TimelineHeaderLabelContext {
    /** Tier the cell belongs to. */
    readonly tier: TierId;
    /** Row the cell renders in: `'top'` (the coarse row) or `'sub'` (the fine row). */
    readonly position: TierPosition;
    /**
     * Rendered width of the cell in px. The cells at either end of the timeline
     * can be clipped, so they are narrower than their siblings.
     */
    readonly cellWidth: number;
    /**
     * The cell's last instant (its exclusive end minus 1 ms): for a week cell,
     * the last day of the week. This is the cell's natural end, even when the
     * cell is clipped at the end of the timeline.
     */
    readonly end: Date;
    /** Week of the year by the date locale's rules and the effective week start (the `w` token). */
    readonly week: number;
    /** Calendar quarter of the cell start, 1 to 4 (the `Q` token). */
    readonly quarter: number;
    /**
     * Fiscal year of the cell start, named by the calendar year it starts in
     * (`{fy}`). With `calendar.fiscalYearStartMonth: 4`, April 2026 to March
     * 2027 is fiscal year 2026. With no fiscal start set it is the calendar year.
     */
    readonly fiscalYear: number;
    /** Fiscal quarter of the cell start, 1 to 4 (`{fq}`). With no fiscal start set it is the calendar quarter. */
    readonly fiscalQuarter: number;
    /**
     * Whether a fiscal year is in use: `true` when `calendar.fiscalYearStartMonth`
     * (or the locale pack's `fiscalYearStartMonth`) is set to a valid month, `1`
     * included, and `false` when neither is. Lets one formatter write fiscal
     * labels (`2026年度`) in fiscal-year mode and calendar labels (`2026年`)
     * otherwise. The same rule decides when the `fiscal` block of
     * {@link TimelineHeaderFormat} applies.
     */
    readonly fiscal: boolean;
    /** Name of `locale.dateLocale` (such as `'ja'`), or `'en'` when none is set. */
    readonly locale: string;
    /**
     * Format `date` (default: the cell start) with a pattern, exactly as a string
     * {@link TimelineHeaderLabelFormat} is applied: the date locale and week
     * start are in force, and `{end:PATTERN}` (the cell's last instant),
     * `{fy}` and `{fq}` (the fiscal year and quarter of `date`) work too.
     */
    readonly format: (pattern: string, date?: Date) => string;
}

/**
 * How one tier and row is labelled.
 *
 * - **string**: a dayjs pattern applied to the cell start at every width. A
 *   label wider than its cell is cut with an ellipsis. Besides the core dayjs
 *   tokens it takes `Q`, `Do`, `k`/`kk`, `X`/`x` (advancedFormat), `w`/`ww`/`wo`
 *   (week of year, following the week start), `W`/`WW` (ISO week), `gggg`/`GGGG`
 *   (week year) and `L`/`LL`/`LLL`/`LLLL` with their lowercase forms (the date
 *   locale's own date formats). Wrap Latin text in `[...]` (`'[Wk] w'`); CJK text
 *   such as 年, 月, 週 needs no escaping. Three placeholders are filled in by
 *   ApexGantt: `{end:PATTERN}` is the cell's last instant formatted with
 *   PATTERN (`'M/D-{end:M/D}'` gives `12/28-1/3` for a Sunday week), `{fy}` is the fiscal year
 *   and `{fq}` the fiscal quarter (see `calendar.fiscalYearStartMonth`). `YYYY`
 *   and `Q` stay calendar-based. Inside `{end:...}`, `{fy}`/`{fq}` are those of
 *   the cell's last instant. Any other `{...}`, or a `{` never closed, prints
 *   as written.
 * - **candidate array**: replaces the built-in list of labels for that row.
 *   It is sorted widest-first (the order you write it in does not matter); the
 *   first candidate whose `minWidth` is at most the cell width is used, and the
 *   narrowest one below that. An empty array keeps the built-in labels.
 * - **function**: called at every width; read `context.cellWidth` to shorten
 *   the label yourself.
 */
export declare type TimelineHeaderLabelFormat = string | TimelineHeaderLabelFormatter | ReadonlyArray<TimelineHeaderLabelCandidate>;

/**
 * Function form of a header label: return the text for the cell starting at
 * `date`. The text is HTML-escaped before it renders, so return plain text.
 * It runs for every cell on every render and zoom step, so keep it pure and
 * cheap. If it throws (or returns anything but a string or a number) the
 * cell shows the built-in label for its width, and the chart logs one warning
 * for that row.
 */
export declare type TimelineHeaderLabelFormatter = (date: Date, context: TimelineHeaderLabelContext) => string;

/** Label overrides for one tier. A row left unset keeps its built-in labels. */
export declare interface TimelineHeaderTierFormat {
    /**
     * Label when this tier is the top (coarse) row.
     * @default undefined (the built-in labels)
     */
    readonly top?: TimelineHeaderLabelFormat;
    /**
     * Label when this tier is the sub (fine) row.
     * @default undefined (the built-in labels)
     */
    readonly sub?: TimelineHeaderLabelFormat;
}

/**
 * The tier rows of a {@link TimelineHeaderFormat}: one optional
 * {@link TimelineHeaderTierFormat} per tier (`minute`, `hour`, `halfday`,
 * `day`, `week`, `month`, `quarter`, `year`). It is the shape of the format
 * without its `fiscal` key, and the shape of the `fiscal` block itself, which
 * is the type `TimelineHeaderFormat` had before 3.23.0.
 */
export declare type TimelineHeaderTierRows = Partial<Record<TierId, TimelineHeaderTierFormat>>;

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
    /**
     * Show a built-in quick-filter search box in the toolbar. As the user types,
     * the task list is filtered to rows whose configured fields contain the
     * query (ancestors of matches stay visible). Drives the same view-only filter
     * as `gantt.filter()`. @default false
     */
    readonly enableQuickFilter: boolean;
    /** Fine-tunes the built-in quick-filter search box. See {@link QuickFilterOptions}. */
    readonly quickFilter?: QuickFilterOptions;
    /**
     * Show the built-in advanced filter builder (a "Filter" toolbar button that
     * opens a rule-composer popover). @default false
     */
    readonly enableFilterBuilder: boolean;
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
    /**
     * Initially selected option `value`. Once the user picks an option, that
     * choice is kept across re-renders; pass a new item object (for example
     * through `update({toolbarItems})`) to set the value again. Ignored when it
     * matches none of `options`.
     * @default undefined (the placeholder, or the first option when there is none)
     */
    value?: string;
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
    readonly tooltipTemplate?: TooltipTemplate;
}

/**
 * Builds the bar tooltip's HTML. `context` carries values worked out with the
 * chart's settings (see {@link TooltipTemplateContext}); a two-argument
 * function still works. The result is written as HTML, so pass task text
 * through the exported `escapeHtml` before interpolating it, as the default
 * template does.
 */
export declare type TooltipTemplate = (task: Task, dateFormat: string, context?: TooltipTemplateContext) => string;

/**
 * Values the chart works out for `tooltipTemplate`, passed as its third
 * argument so a template can show what the task list shows.
 */
export declare interface TooltipTemplateContext {
    /**
     * The task's duration exactly as the Duration column shows it: a count of
     * the `snapUnit`'s base unit (`'45 m'`, `'6 h'`, `'14 d'`), or of working
     * days (`'5 wd'`) when a `calendar` is set with day snapping.
     */
    readonly durationText: string;
    /**
     * The chart's resolved strings (the English defaults merged with
     * `locale.messages`), so a custom template can reuse the translated tooltip
     * labels. The chart always passes it; it is optional only so code that
     * builds a context by hand keeps compiling.
     * @default undefined (the default template then uses the English labels)
     */
    readonly messages?: GanttMessages;
    /**
     * The task's start date as the task list shows it: in
     * `locale.displayDateFormat` (or the pack's display format) when one is set,
     * else in `inputDateFormat`.
     * @default undefined (the default template then formats with `dateFormat`)
     */
    readonly startText?: string;
    /**
     * The task's end date as the task list shows it. See {@link startText}.
     * @default undefined (the default template then formats with `dateFormat`)
     */
    readonly endText?: string;
    /**
     * The chart's BCP 47 tag (`locale.tag`, else the pack's), so `{n, number}`
     * and `{n, plural, ...}` in the tooltip messages format as they do in the
     * task list.
     * @default undefined (the runtime's locale)
     */
    readonly tag?: string;
}

/**
 * Options for `gantt.updateTask()`.
 */
export declare interface UpdateTaskOptions {
    /**
     * Suppress the `taskUpdate` and `taskUpdateSuccess` events for this call.
     * Use it for rollbacks and for applying a server echo, so the listener that
     * saves edits does not send the same change back. The change is still
     * vetted by `beforeTaskUpdate` and recorded in undo history.
     * @default false
     */
    silent?: boolean;
}

export { }
