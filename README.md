# ApexGantt

A JavaScript library to create Gantt diagrams built on SVG

## Installation

To add the ApexGantt to your project and its dependencies, install the package from npm.

```bash
npm install apexgantt
```

## Usage

```js
import ApexGantt from 'apexgantt';
```

To create a basic gantt with minimal configuration, write as follows:

```html
<div id="gantt-container"></div>
```

```js
const ganttOptions = {
  series: [
    {
      id: 'a',
      startTime: '10-11-2024',
      endTime: '11-01-2024',
      name: 'task 1',
      progress: 65,
    },
    {
      id: '5',
      startTime: '10-11-2024',
      endTime: '10-26-2024',
      name: 'subtask 1.1',
      parentId: 'a',
      progress: 65,
    },
  ],
};
const gantt = new ApexGantt(document.getElementById('gantt-container'), ganttOptions);
gantt.render();
```

## Setting the License

To use ApexGantt with a commercial license, set your license key before creating any chart instances:

```js
import ApexGantt from 'apexgantt';

// set license key before creating any charts
ApexGantt.setLicense('your-license-key');

const gantt = new ApexGantt(document.getElementById('gantt-container'), ganttOptions);
gantt.render();
```

## ApexGantt Options

The layout can be configured by passing a second argument to `ApexGantt` with the properties listed below.

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `series` | `TaskInput[]` | **required** | Task data array. See data format below. |
| `theme` | `'light' \| 'dark'` | `'light'` | Built-in color theme preset. |
| `width` | `number \| string` | `'100%'` | Width of the chart container. |
| `height` | `number \| string` | `500` | Height of the chart container. |
| `pixelsPerDay` | `number` | _auto-fit_ | Continuous zoom level. The header tier (year/quarter/month/week/day/hour/minute) is auto-picked from this value. Reference points: `0.5` ≈ year, `1.6` ≈ quarter, `4.9` ≈ month, `25.7` ≈ week, `80` = day. Bounds clamp to roughly `[0.25, 1280]`. **When omitted**, the chart auto-fits the data span into the visible timeline area on first render; supply an explicit value (or zoom via the toolbar) to take control. |
| `snapUnit` | `'day' \| 'hour' \| 'minute'` | `'day'` | Granularity at which task drag, resize, and inline edits snap. Independent of timeline header tier. |
| `snapValue` | `number` | `1` | Multiplier applied to `snapUnit`, e.g. `snapUnit: 'minute', snapValue: 15` → 15-min steps. |
| `inputDateFormat` | `string` | `'MM-DD-YYYY'` | dayjs-compatible format used to parse `startTime` / `endTime` values. Include time tokens (e.g. `'YYYY-MM-DD HH:mm'`) to enable sub-day editing — inline-edit inputs switch to `datetime-local` automatically. |
| `locale` | `{ direction?: 'ltr' \| 'rtl' \| 'auto', dateLocale?: GanttDateLocale, messages?: Partial<GanttMessages> }` | `{ direction: 'ltr' }` | Localization, date-locale, and text-direction. See [Localization & RTL](#localization--rtl). |
| `canvasStyle` | `string` | `''` | Arbitrary CSS injected onto the root container element. |
| `backgroundColor` | `string` | `'#FFFFFF'` | Background color of the chart container. |
| `headerBackground` | `string` | `'#F8F9FB'` (light) / `'#2A2A2A'` (dark) | Background color of the header row. |
| `rowHeight` | `number` | `40` | Height of each task row in pixels. |
| `rowBackgroundColors` | `string[]` | `['#FFFFFF']` | Alternating row background colors; the pattern cycles automatically. |
| `tasksContainerWidth` | `number` | `425` | Initial pixel width of the task-list panel. |
| `columnConfig` | `ColumnListItem[]` | `undefined` | Custom column definitions for the task-list panel. Controls which columns are shown, their order, titles, and widths. See [Column Configuration](#column-configuration). |
| `sortBy` | `SortCriterion \| SortCriterion[]` | `[{ key: 'startTime', direction: 'asc' }]` | Initial sort for the task list. **Hierarchy-preserving**: siblings are reordered within each parent, never flattened. Each `SortCriterion` is `{ key, direction?: 'asc' \| 'desc' }`; pass an array for multi-key sort (first key wins, ties break on the next). Omit for the default (start-time ascending); pass `[]` for natural (input) order. Summary (parent) rows sort by their rolled-up span/value. See [Sorting & Filtering](#sorting--filtering). |
| `filterBy` | `(task: Task) => boolean` | `undefined` | Initial filter for the task list. A predicate run against each task; a task is kept when it **matches or has a matching descendant** (so ancestors of matches stay visible to preserve tree context). Filtering is view-only — it changes which rows render but not the tree, WBS, or task data. See [Sorting & Filtering](#sorting--filtering). |
| `enableQuickFilter` | `boolean` | `false` | Show a built-in quick-filter search box in the toolbar. Typing filters the task list to rows whose configured fields contain the query (ancestors of matches stay visible); clearing it removes the filter. Drives the same view-only filter as `gantt.filter()`. See [Sorting & Filtering](#sorting--filtering). |
| `quickFilter` | `QuickFilterOptions` | `undefined` | Fine-tunes the quick-filter box: `placeholder` (defaults to the localized `quickFilterPlaceholder` message), `fields` (task string fields matched against the query; default `['name']`), and `caseSensitive` (default `false`). |
| `filterRules` | `FilterRuleSet` | `undefined` | Initial structured filter (advanced filter builder): `{ match: 'all' \| 'any', rules: FilterRule[] }`. Each `FilterRule` is `{ field, operator, value? }`; combined with `'all'` (AND) or `'any'` (OR). Compiles to the same view-only filter as `filterBy` and takes precedence over it. See [Sorting & Filtering](#sorting--filtering). |
| `enableFilterBuilder` | `boolean` | `false` | Show a built-in advanced filter builder in the toolbar: a "Filter" button (with an active-rule count badge) that opens a popover for composing field/operator/value conditions combined with All / Any. Drives the same view-only filter as `gantt.setFilterRules()`. See [Sorting & Filtering](#sorting--filtering). |
| `groupBy` | `GroupCriterion \| ColumnKey \| string` | `undefined` | Initial grouping. When set, the parent/child tree is suspended and tasks are bucketed under collapsible group headers (label + member count). Pass a bare column key, or a `GroupCriterion` (`{ field, accessor?, label?, direction? }`) for custom value extraction, labelling, and header order. Also available at runtime via `gantt.groupBy()` / `gantt.clearGrouping()`. See [Grouping](#grouping). |
| `barBackgroundColor` | `string` | `'#318CE7'` (light) / `'#818CF8'` (dark) | Default background fill color for task bars. |
| `barBorderRadius` | `string` | `'5px'` | CSS border-radius applied to task bars. |
| `barMargin` | `number` | `4` | Top and bottom margin inside each row for the task bar. |
| `barTextColor` | `string` | `'#FFFFFF'` | Text color rendered inside task bars. |
| `barLabel` | `BarLabelOptions` | `{ position: 'right', field: 'name' }` | Per-task bar label. Defaults to `position: 'right'` so labels stay visible regardless of bar width. Set `position: 'inside'` to render centered inside the bar, `'left'` to render before it, or `'auto'` to pick between `'inside'` and `'right'` based on bar width; supply `render: (task) => string \| HTMLElement` to compose the name with chips, icons, or owner info. When `position: 'left'`, the timeline auto-reserves `120px` of leading space so labels don't disappear under the task-list panel — tune via `barLabel.leadingPadding`. Outside labels are not currently rendered for milestones. |
| `summaryBarColor` | `string` | `'#94A3B8'` (light) / `'#8FBCBC'` (dark) | Fill color for summary (group) bars. |
| `milestoneColor` | `string` | `'#7C3AED'` (light) / `'#A78BFA'` (dark) | Fill color for milestone diamonds. |
| `arrowColor` | `string` | `'#94A3B8'` (light) / `'#94A3B8'` (dark) | Color of dependency arrows between tasks. Subtle slate-gray by default so links don't compete with bars. |
| `dependencies` | `DependencyOptions` | `{}` | Polish + editing for dependency arrows: `cornerRadius` (rounded joints), `hitWidth` (invisible thicker stroke for hover/click targeting), `tooltipTemplate: (ctx) => string` (HTML on hover — requires non-zero `hitWidth`), `classBuilder: (ctx) => string \| string[]` (per-arrow CSS class for cross-team / blocked / etc), `editable: boolean` (hover darkens the arrow, click selects it and reveals a "✕" affordance — click the ✕ or press <kbd>Delete</kbd> to remove via the undoable command path; on bar hover two anchor circles appear at the bar's start/finish edges, and dragging from one to another bar draws a dashed preview that commits the new dependency on release — the (source-anchor, target-anchor) pair determines the type: right→left FS, left→left SS, right→right FF, left→right SF), `allowSummaryDescendantLinks: boolean` (allow drawing edges between a summary task and its descendants; off by default since such edges confuse downstream date math). When `editable: true`, `hitWidth` is auto-bumped to at least `12` if unset. The `ctx` carries `fromTask`, `toTask`, `type`, and `lag`. |
| `calendar` | `CalendarOptions` | `undefined` | Working-calendar config. When set, weekends + holidays drive duration math, summary aggregation, and timeline stripes — durations stop counting calendar days and start counting working days. Fields: `workingWeekdays: number[]` (0 = Sunday … 6 = Saturday; default `[1, 2, 3, 4, 5]`), `holidays: Array<string \| Date \| { date, label? }>` (non-working dates regardless of weekday; mixed forms allowed), `showNonWorkingStripes: boolean` (render hatched bands over weekend/holiday columns; default `true`), `holidayTooltip: (ctx) => string` (optional HTML rendered when the user hovers a holiday stripe — `ctx.date` is the Date, `ctx.label` is whichever string was supplied in the matching entry), `dragSnapMode: 'next' \| 'previous' \| 'allow'` (what happens when a drag/resize commits onto a non-working day — `'next'` (default) snaps forward, `'previous'` snaps backward, `'allow'` permits non-working start/end. Drag preserves the source task's working-day duration across the snap; resize snaps the moving endpoint only. No effect when `snapUnit !== 'day'` or the input format carries time tokens). Absent calendar = today's behavior (every day is a working day, no stripes, no snap). |
| `borderColor` | `string` | `'#E5E7EB'` (light) / `'#3A3A3A'` (dark) | Color of cell and row divider lines. |
| `cellBorderColor` | `string` | `'#EDEFF2'` (light) / `'#3A3A3A'` (dark) | Border color for all cells in the task table and timeline grid. |
| `cellBorderWidth` | `string` | `'1px'` | CSS border-width for all cell lines. |
| `columnLines` | `boolean` | `true` | Whether to draw vertical lines between timeline columns. Set to `false` for a cleaner look that keeps only the horizontal row dividers. |
| `enableProjectBoundary` | `boolean` | `false` | When `true`, two vertical lines mark the project's earliest start and latest end across all rows. Auto-recomputes when tasks are added, removed, or rescheduled. |
| `projectBoundaryColor` | `string` | `'#7C3AED'` | Stroke colour for the project-boundary lines. Falls back to `annotationBorderColor` when omitted. |
| `enableRollups` | `boolean` | `false` | When `true`, summary (parent) rows display thin rollup markers below the summary bar at each leaf descendant's date range. Useful for keeping children visible at a glance even when the parent is collapsed. |
| `enableResize` | `boolean` | `true` | Allow the task-list panel to be resized by dragging the divider. |
| `enableExport` | `boolean` | `true` | Show the export button in the toolbar. |
| `exportFormat` | `'svg' \| 'png' \| 'pdf'` | `'svg'` | Format produced by the toolbar export button. `svg` is vector; `png` rasterizes the chart; `pdf` embeds a raster on a single page. Any format is also available programmatically via `gantt.exportChart(format)`. |
| `autoSizeColumns` | `boolean` | `true` | Auto-size each task-list column to fit its header title and cell content, growing the panel (never below `tasksContainerWidth`) so nothing is clipped. `minWidth` sets a column's preferred (default) width and `maxWidth` (default `320px`) the ceiling. The panel stays freely resizable: dragging the divider stretches columns proportionally or shrinks them (down to a small floor, so a large `minWidth` never blocks resizing). Set `false` for the legacy behavior where the panel width is split purely by `flexGrow`. See [Column Configuration](#column-configuration). |
| `resizableColumns` | `boolean` | `true` | Allow individual columns to be resized by dragging the handle at the trailing edge of each column header. A resized column is pinned to its chosen pixel width and the other columns absorb the remaining space, so you can keep some columns wide and others thin. Double-click a handle to reset that column to its auto width. Opt a single column out with `columnConfig[].resizable: false`. Also available programmatically via `gantt.setColumnWidth()` / `gantt.resetColumnWidths()`. See [Column Configuration](#column-configuration). |
| `persistState` <a id="uistate"></a> | `boolean \| { key?: string }` | `false` | Persist and restore the UI view state (zoom, scroll, sort, filter, collapse, selection) via `localStorage`. `true` uses the default key (`'apexgantt-state'`); an object sets a custom `key`. Restored on the first `render()`; saved (debounced) whenever the view changes. Also available programmatically via `gantt.getState()` / `gantt.setState()`. See [UI state persistence](#ui-state-persistence). |
| `enableInlineEdit` | `boolean` | `false` | Allow editing task fields directly in the task-list cells (double-click to edit `name`, `startTime`, `endTime`, `duration`, `progress`). Auto-enabled when `enableTaskEdit` is `true`; set explicitly to `false` to opt out. See [Inline Editing](#inline-editing). |
| `enableTaskDrag` | `boolean` | `true` | Allow tasks to be reordered by dragging rows in the task list. |
| `enableTaskEdit` | `boolean` | `false` | Show the inline task-edit form when a task row is clicked. |
| `enableTaskResize` | `boolean` | `true` | Allow task bars to be resized by dragging their handles. |
| `enableProgressDrag` | `boolean` | `true` | Allow editing task progress by dragging the small handle that appears at the bottom of the bar on hover. Snaps to whole percent on commit and emits a `taskProgressChanged` event. |
| `enableTaskEditingShortcuts` | `boolean` | `false` | Enable keyboard shortcuts on the task-list panel: `Delete` / `Backspace` removes the focused task (cascade: children), `Tab` indents under the previous sibling, `Shift+Tab` outdents to the grandparent. Off by default; opt in once you've decided the shortcuts fit your app. All operations are recorded in the undo history and respect `beforeTaskDelete` / `beforeTaskMove` hooks. |
| `enableTaskCRUDToolbar` | `boolean` | `false` | Show built-in `+ Add task` and trash-icon `Delete` buttons in the toolbar. Delete is auto-disabled when nothing is selected and deletes every selected task (cascade: children) on click; Add inserts a root-level "New task" using placeholder dates derived from the current project span. Combine with `enableSelection: true` for the delete button to be useful. |
| `enableContextMenu` | `boolean` | `false` | Show a built-in right-click menu on task bars and task-list rows with entries for Edit, Add child / sibling task, Indent, Outdent, and Delete (cascade). Entries are gated by capability — Edit only when `enableTaskEdit` is on; Indent/Outdent only when the move is legal. Off by default so consumers can ship their own menu without competing. |
| `enableAddTaskRow` | `boolean` | `false` | Render a single-line `+ Add task` row at the bottom of the task list that inserts a new root-level placeholder task on click (or Enter / Space). Disabled while row virtualisation is active (dataset ≥ 50 rows). |
| `history` | `{ enabled?: boolean; maxSize?: number }` | `{ enabled: true, maxSize: 100 }` | Configures the undo/redo history. Every mutating call (drag, resize, inline / dialog edit, add, delete, move, dependency change) is recorded unless `enabled: false`. Use `gantt.undo()` / `gantt.redo()` to traverse, `gantt.canUndo()` / `gantt.canRedo()` to gate UI affordances, and the `historyChange` event to react to changes. The toolbar shows Undo/Redo buttons when `enableTaskCRUDToolbar` is on and history is enabled; Ctrl/Cmd+Z and Ctrl+Y / Ctrl+Shift+Z trigger undo/redo from anywhere inside the chart (except text inputs). |
| `enableTooltip` | `boolean` | `true` | Show a tooltip on task-bar hover. |
| `enableSelection` | `boolean` | `false` | Enable row selection (click, Ctrl+Click, Shift+Click, keyboard). |
| `beforeTaskAdd` | `(ctx) => boolean \| void` | `undefined` | Veto hook called immediately before `gantt.addTask()` inserts a task. Return `false` to cancel the insertion. `ctx` is `{ input, parentId? }`. |
| `beforeTaskUpdate` | `(ctx) => boolean \| void` | `undefined` | Veto hook called before every update path (drag, resize, progress drag, inline / dialog edit, `gantt.updateTask()`). Return `false` to reject. `ctx` is `{ task, updates }`. |
| `beforeTaskMove` | `(ctx) => boolean \| void` | `undefined` | Veto hook called immediately before `gantt.moveTask()` re-parents a task. Return `false` to cancel. `ctx` is `{ task, oldParentId?, newParentId? }`. |
| `beforeTaskDelete` | `(ctx) => boolean \| void` | `undefined` | Veto hook called immediately before `gantt.deleteTask()` removes a task. Return `false` to cancel. `ctx` is `{ task, descendantIds, cascade: 'forbid' \| 'children' \| 'orphan' }`. `descendantIds` is empty for `'orphan'` since children survive. |
| `beforeDependencyChange` | `(ctx) => boolean \| void` | `undefined` | Veto hook called immediately before `gantt.addDependency()` / `gantt.removeDependency()` mutate an edge. Return `false` to cancel. `ctx` is `{ change: 'add'\|'remove', fromId, toId, type, lag }`. |
| `showCheckboxColumn` | `boolean` | `true` | Show a checkbox column for multi-select. Only applies when `enableSelection` is true. |
| `enableCriticalPath` | `boolean` | `false` | Calculate and highlight the critical path through dependent tasks. |
| `criticalBarColor` | `string` | `'#E53935'` (light) / `'#F87171'` (dark) | Fill color for task bars on the critical path. |
| `criticalArrowColor` | `string` | `'#E53935'` (light) / `'#F87171'` (dark) | Stroke color for dependency arrows on the critical path. |
| `enableCrosshair` | `boolean` | `false` | Show a vertical crosshair line that follows the cursor across the timeline, with a label showing the precise date/time at the pointer position. |
| `crosshairColor` | `string` | `'#3B82F6'` (light) / `'#818CF8'` (dark) | Color of the crosshair line and the label background. |
| `crosshairLabelFormat` | `(date, tier) => string` | _auto_ | Custom formatter for the crosshair label. Receives the date under the cursor and the active sub-tier (`'minute' \| 'hour' \| 'halfday' \| 'day' \| 'week' \| 'month' \| 'quarter' \| 'year'`). When omitted, the label auto-adapts to the active tier — `'ddd MM/DD/YYYY'` for day-and-coarser tiers, `'MM/DD HH:mm'` for halfday/hour/minute tiers. |
| `baseline` | `Partial<BaselineOptions>` | `undefined` | When `enabled: true`, renders a thin baseline bar below each task bar. Hovering the baseline shows a tooltip with its planned start/end dates. When `rowHeight` isn't explicitly set, the default rowHeight is bumped to make room for the baseline without squeezing the actual bar. Fields: `color: string` (primary fill / stripe color; default `'#9E9E9E'`), `striped: boolean` (fill the bar with thick diagonal stripes instead of a flat color; default `true`), `stripeColor: string` (color of the gaps between stripes; default `'#FFFFFF'`), `stripeWidth: number` (px width of each stripe band, larger values = thicker; default `3`), `stripeAngle: number` (stripe angle in degrees; default `45`). By default baselines render as thick grey/white diagonal stripes; set `striped: false` for a solid `color` fill. |
| `tooltipId` | `string` | `'apexgantt-tooltip-container'` | HTML `id` for the tooltip container element. |
| `tooltipTemplate` | `(task, dateFormat) => string` | built-in | Custom function returning an HTML string for the task tooltip. |
| `tooltipBorderColor` | `string` | `'#E5E7EB'` (light) / `'#444444'` (dark) | Border color of the tooltip. |
| `tooltipBGColor` | `string` | `'#FFFFFF'` | Background color of the tooltip. |
| `fontColor` | `string` | `'#1F2933'` (light) / `'#E0E0E0'` (dark) | Color for all text in the chart. |
| `fontFamily` | `string` | `'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'` | CSS font-family for the chart. |
| `fontSize` | `string` | `'14px'` | CSS font-size for the chart. |
| `fontWeight` | `string` | `'400'` | CSS font-weight for the chart. |
| `annotationBgColor` | `string` | `'#F9D1FC'` | Background color of annotation markers. |
| `annotationBorderColor` | `string` | `'#E273EA'` | Border color of annotation markers. |
| `annotationBorderDashArray` | `number[]` | `[]` | SVG stroke-dasharray for annotation borders, e.g. `[6, 3]`. |
| `annotationBorderWidth` | `number` | `2` | Border width of annotation markers in pixels. |
| `annotationOrientation` | `Orientation` | `Orientation.Horizontal` | Whether annotation lines are drawn horizontally or vertically. |
| `annotations` | `Annotation[]` | `[]` | Array of annotation objects to overlay on the timeline. |
| `parsing` | `ParsingConfig` | `undefined` | Field-mapping config to parse non-standard task shapes. See Data Parsing below. |
| `toolbarItems` | `ToolbarItem[]` | `[]` | Custom controls rendered in the toolbar alongside the built-in zoom and export buttons. Each item can be a `ToolbarButton`, `ToolbarSelect`, or `ToolbarSeparator`. |
| `taskListAriaLabel` | `string` | `'Task list'` | `aria-label` for the task-list table, used by screen readers. |

### Localization & RTL

Pass a `locale` object to translate strings, localize dates, and flip text direction. With the defaults (`{ direction: 'ltr' }`, no `dateLocale`, no `messages`) the output is byte-for-byte unchanged.

```ts
import localeFr from 'dayjs/locale/fr';

const gantt = new ApexGantt('#chart', {
  series: tasks,
  locale: {
    direction: 'rtl',
    dateLocale: localeFr, // months/weekdays in the timeline header render in French
    messages: {
      addTask: 'Ajouter une tâche',
      editTaskTitle: (name) => `Modifier : ${name}`,
    },
  },
});
```

| `locale` key | Type | Default | Description |
| --- | --- | --- | --- |
| `direction` | `'ltr' \| 'rtl' \| 'auto'` | `'ltr'` | Text/layout direction. `'rtl'` sets `dir="rtl"` on the container (flowing the toolbar, task list, task form, context menu, and tooltips right-to-left and moving the task-list panel to the right) **and mirrors the timeline time axis** so time flows right-to-left: the earliest date sits on the right, bars/header cells/grid lines/non-working stripes/dependency arrows/annotations are all mirrored, progress fills from the start (right) edge, and drag/resize/progress interactions are direction-aware. `'auto'` defers to the document/element. |
| `dateLocale` | `GanttDateLocale` (a `dayjs/locale/*` object) | `undefined` | Localizes every date, month, weekday, and quarter label the timeline renders. Import the dayjs locale object and pass it; ApexGantt registers it on its own bundled dayjs, so you do not need to configure dayjs yourself. |
| `messages` | `Partial<GanttMessages>` | `{}` | Overrides any subset of the generated strings (toolbar, context menu, task form + validation, baseline tooltip, add-task row, and bar aria-labels). Unset keys keep their English defaults, exported as `DEFAULT_GANTT_MESSAGES`. |

`GanttMessages` keys include: `addTask`, `deleteSelected`, `undo`, `redo`, `exportAsSvg`, `exportAsPng`, `exportAsPdf`, `quickFilterPlaceholder`, `filterButton`, `filterHeading`, `filterMatchLabel`, `filterMatchAll`, `filterMatchAny`, `filterAddCondition`, `filterApply`, `filterClear`, `filterRemoveCondition`, `filterNoConditions`, `filterOperatorLabel(operator)`, `groupNone`, `groupCountLabel(count)`, `exportFailedNoChart`, `exportFailedGeneric`, `editTask`, `addChildTask`, `addSiblingTask`, `indent`, `outdent`, `deleteTask`, `deleteTaskWithChildren`, `formTaskName`, `formStartDate`, `formEndDate`, `formProgress`, `formSubmit`, `editTaskTitle(name)`, `validationStartRequired`, `validationEndRequired`, `validationEndAfterStart`, `validationNameRequired`, `validationProgressRequired`, `validationProgressRange`, `addTaskRowLabel`, `baselineLabel`, `startLabel`, `endLabel`, `summaryAriaLabel(ctx)`, `barAriaLabel(ctx)`, `barAriaValueText(ctx)`, and `progressAriaLabel(name)`. Column headers (set via the columns API) and the default tooltip template (`tooltipTemplate`) are localized through their own options.

Default tooltip template

```js
tooltipTemplate(task, dateFormat) {
    const items = [
      `<div>
        <strong>Name:</strong>
        <span>${task.name}</span>
      </div>
      `,
    ];

    if (task.type === TaskType.Task) {
      items.push(`
        <div>
          <strong>Start:</strong>
          <span>${getTaskTextByColumn(task, ColumnKey.StartTime, dateFormat)}</span>
        </div>
        <div>
          <strong>End:</strong>
          <span>${getTaskTextByColumn(task, ColumnKey.EndTime, dateFormat)}</span>
        </div>
        <div>
          <strong>Duration:</strong>
          <span>${getTaskTextByColumn(task, ColumnKey.Duration, dateFormat)}</span>
        </div>
        <div>
          <strong>Progress:</strong>
          <span>${task.progress}%</span>
        </div>
      `);
    } else if (task.type === TaskType.Milestone) {
      items.push(`
        <div>
          <strong>Date:</strong>
          <span>${getTaskTextByColumn(task, ColumnKey.StartTime, dateFormat)}</span>
        </div>
      `);
    }

    if (task.dependency) {
      items.push(`
        <div>
          <strong>Dependency:</strong>
          <span>${task.dependency}</span>
        </div>
      `);
    }

    return `
      <div style='display:flex;flex-direction:column;align-items:left;gap:5px;padding:5px 10px;'>
        ${items.join('')}
      </div>
    `;
  },
```

### Expected data format to set as Options.series

Each tasks should be in below format

```js
[
  {
    id: 'a', // unique id of the task
    startTime: '10-11-2024', // start time of the task
    endTime: '11-01-2024', // end time of the task
    name: 'task 1', // task name
    parentId: 'a', // parent task id
    progress: 65, // progress in percentage
  },
];
```

#### Per-task fields

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `id` | `string` | **required** | Unique task identifier. Must be stable across renders. |
| `name` | `string` | **required** | Display name shown in the task list and inside the bar. |
| `startTime` | `string` | **required** | Task start date, parsed with `inputDateFormat`. Not required when `showSummaryBar` is `true`. |
| `endTime` | `string` | `startTime` | Task end date. When omitted the task renders as a milestone. Not required when `showSummaryBar` is `true`. |
| `progress` | `number` | `0` | Completion percentage (0–100). |
| `type` | `'task' \| 'milestone'` | `'task'` | Visual type of the task. |
| `parentId` | `string` | `undefined` | ID of the parent task; creates a hierarchical (indented) relationship. |
| `dependency` | `string \| TaskDependency` | `undefined` | Declares a dependency on another task. A plain string is treated as a Finish-to-Start dependency. `TaskDependency.lagUnit: 'working' \| 'calendar'` controls whether `lag` is interpreted as working days (the default when a calendar is configured) or raw calendar days. |
| `barBackgroundColor` | `string` | `undefined` | Overrides the chart-level `barBackgroundColor` for this task only. |
| `rowBackgroundColor` | `string` | `undefined` | Overrides the row background color for this task only. |
| `collapsed` | `boolean` | `false` | Whether this task's children are initially collapsed. |
| `showSummaryBar` | `boolean` | `true` | Renders this task as a summary (group) bar when it has children. Its date range is computed automatically from its descendants — `startTime`/`endTime` are ignored (a warning is logged if provided). The bar is read-only: drag, resize, and progress are disabled. Set to `false` to opt out and render the parent as a normal task bar. |
| `baseline` | `BaselineInput` | `undefined` | Planned (baseline) dates rendered as a thin bar beneath the actual bar when `baseline.enabled` is `true`. |

### Expected annotation format to set as Options.annotations

Each tasks should be in below format

```js
[
  {
    x1: '10-25-2024', // start date
    x2: 'END_DATE', // optional. If present, draw a rect from x1 to x2. If null, only draw line on x1,
    label: {
      text: 'Annotation rect', // label for the annotation
      fontColor: '#333333', // optional
      fontFamily: 'Arial', // optional
      fontSize: '12px', // optional
      fontWeight: 'bold', // optional
    },
  },
];
```

## Column Configuration

Customize which columns appear in the task-list panel, their order, titles, and widths. When `columnConfig` is provided, **it is authoritative** — only the columns you list are rendered, in the order you specify. Omitted columns are hidden. Each entry is merged with defaults, so you only need to specify overrides.

By default ([`autoSizeColumns`](#options)), each column is sized to fit its header title and the widest cell content, and the task-list panel grows so nothing is clipped. `minWidth` sets a column's preferred (default) width and `maxWidth` (default `320px`) the ceiling. The panel remains freely resizable: dragging the divider distributes width proportionally to content when widening, and shrinks columns toward a small floor when narrowing (so a large `minWidth` never blocks the resize). Set `autoSizeColumns: false` to split the fixed `tasksContainerWidth` purely by `flexGrow` (the legacy behavior), in which case columns clip to their `minWidth` when the panel is too narrow.

**Resizing a single column.** With `resizableColumns` on (the default), each column header has a drag handle at its trailing edge. Drag it to pin that column to an exact pixel width; the remaining columns absorb the leftover panel space, so you can keep some columns wide and others thin. Double-click a handle to reset that column to its auto width. Lock one column with `resizable: false` in its `columnConfig` entry. The same overrides are available programmatically via `gantt.setColumnWidth(key, px)`, `gantt.resetColumnWidths(key?)`, and `gantt.getColumnWidths()`, are included in `getState()` / `setState()`, and emit a `columnResize` event.

Available built-in column keys:

| Key | Title | Shows |
| --- | --- | --- |
| `Name` | Task Name | Task name with the collapse chevron + indentation |
| `StartTime` | Start | Start date (rolled-up start for summary rows) |
| `EndTime` | End | End date (rolled-up end for summary rows) |
| `Duration` | Duration | Duration in the active snap unit (working days when a calendar is set) |
| `Progress` | Progress | Progress percent as text |
| `ProgressRing` | Progress | Progress as an SVG ring |
| `Wbs` | WBS | Work Breakdown Structure code (`1`, `1.2`, …) |
| `Assignees` | Assignees | Comma-joined assignee names (from `task.assignees`) |
| `Predecessors` | Predecessors | Predecessor tasks by WBS, with a non-`FS` type + non-zero lag suffix (e.g. `1.2, 3SS+2d`) |
| `Successors` | Successors | Successor tasks by WBS (same notation) |
| `BaselineStart` | Baseline Start | Baseline start date (from `task.baseline.start`) |
| `BaselineEnd` | Baseline End | Baseline end date (from `task.baseline.end`) |
| `BaselineVariance` | Variance | Finish variance vs baseline in days (`+` = late, `-` = early) |

`Predecessors` / `Successors` are derived from the dependency graph and refresh automatically as dependencies or WBS change. Every built-in column except `Wbs` is sortable and filterable; `Assignees`, `Predecessors`, and `Successors` filter as text, the baseline dates as dates, and `BaselineVariance` as a number. All are groupable via [`gantt.groupBy()`](#grouping).

### Customize column widths

```js
import {ColumnKey} from 'apexgantt';

const gantt = new ApexGantt(element, {
  series: tasks,
  columnConfig: [
    {
      key: ColumnKey.Name,
      title: 'Task Name',
      minWidth: '100px',
      flexGrow: 3,
    },
    {
      key: ColumnKey.StartTime,
      title: 'Start',
      minWidth: '100px',
      flexGrow: 1.5,
    },
    {
      key: ColumnKey.Duration,
      title: 'Duration',
      minWidth: '80px',
      flexGrow: 1,
    },
    {
      key: ColumnKey.Progress,
      title: 'Progress',
      minWidth: '80px',
      flexGrow: 1,
    },
  ],
});
```

### Hide columns

Show only the columns you need by omitting the rest:

```js
const gantt = new ApexGantt(element, {
  series: tasks,
  columnConfig: [
    {key: ColumnKey.Name, title: 'Task Name'},
    {key: ColumnKey.Progress, title: 'Progress'},
  ],
});
```

You can also use `visible: false` to keep a column in the config but hide it (useful for toggling at runtime via `update()`):

```js
columnConfig: [
  {key: ColumnKey.Name, title: 'Task Name'},
  {key: ColumnKey.StartTime, title: 'Start'},
  {key: ColumnKey.Duration, title: 'Duration', visible: false}, // hidden
  {key: ColumnKey.Progress, title: 'Progress'},
],
```

### Reorder columns

Change the array order to reorder the rendered columns:

```js
columnConfig: [
  {key: ColumnKey.Progress, title: 'Progress'},
  {key: ColumnKey.Name, title: 'Task Name'},
  {key: ColumnKey.StartTime, title: 'Start'},
],
```

### Include the End Date column

The `EndTime` column is available but not shown by default. Add it to your config:

```js
columnConfig: [
  {key: ColumnKey.Name, title: 'Task Name'},
  {key: ColumnKey.StartTime, title: 'Start'},
  {key: ColumnKey.EndTime, title: 'End', minWidth: '70px', flexGrow: 1.5},
  {key: ColumnKey.Duration, title: 'Duration'},
  {key: ColumnKey.Progress, title: 'Progress'},
],
```

### Show progress as a ring instead of text

Swap the default text Progress column for the built-in SVG ring variant — same data (`task.progress`), no setup needed:

```js
columnConfig: [
  {key: ColumnKey.Name, title: 'Task Name'},
  {key: ColumnKey.StartTime, title: 'Start'},
  {key: ColumnKey.Duration, title: 'Duration'},
  {key: ColumnKey.ProgressRing, title: 'Progress', minWidth: '60px', flexGrow: 0.6},
],
```

`ColumnKey.ProgressRing` renders with sensible defaults (28px ring, blue arc). For full customisation (size, colours, accessor, per-task colour function) use the `renderers.progressRing()` factory with a custom column key — see [Built-in renderer presets](#built-in-renderer-presets).

### Include the WBS column

The `Wbs` column shows an auto-numbered Work Breakdown Structure code derived from each task's position in the parent/child tree (`1`, `1.1`, `1.1.2`, `2`, …). Codes recompute automatically when tasks are added, removed, or moved. Opt in by listing it explicitly:

```js
columnConfig: [
  {key: ColumnKey.Wbs, title: 'WBS', minWidth: '60px', flexGrow: 0.6},
  {key: ColumnKey.Name, title: 'Task Name'},
  {key: ColumnKey.StartTime, title: 'Start'},
  {key: ColumnKey.Duration, title: 'Duration'},
  {key: ColumnKey.Progress, title: 'Progress'},
],
```

The code is also available on each `Task` as `task.wbs` if you need to read it from event handlers, custom column renderers, or your own UI.

### ColumnListItem properties

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `key` | `ColumnKey \| string` | — | Built-in column identifier or any custom string id when `render` is supplied (required). |
| `title` | `string` | from defaults | Header text displayed for the column. |
| `minWidth` | `string` | `'30px'` | Minimum CSS width (used in `minmax()`). With `autoSizeColumns` on this is the column's preferred (default) width. |
| `maxWidth` | `string` | `'320px'` | Ceiling for the auto-sized width, so one long value can't dominate the panel. Ignored when `autoSizeColumns` is off. |
| `flexGrow` | `number` | `1` | Flex proportion (used as `fr` units in CSS Grid). |
| `visible` | `boolean` | `true` | Set to `false` to hide the column. |
| `resizable` | `boolean` | `true` | Set to `false` to lock this column at its auto/configured width (no drag handle) when `resizableColumns` is on. |
| `render` | `ColumnRenderer` | — | Custom cell renderer. Required for custom columns; ignored for built-in keys. |
| `accessor` | `(task) => unknown` | — | Extracts the cell's underlying value. Used by SVG export and by sorting/filtering — it is what makes a **custom** column sortable. |
| `sortable` | `boolean` | _auto_ | Whether the column participates in sorting (header click + `sortBy` / `gantt.sort()`). Defaults to `true` for built-in value columns, `false` for `Wbs`, and `true` for custom columns only when an `accessor` or `comparator` is supplied. |
| `comparator` | `(a: Task, b: Task) => number` | — | Custom sort comparator for this column. Takes precedence over `accessor`. Return negative / zero / positive for ascending order; the active direction is applied on top, and ties fall back to natural (input) order. |

## Sorting & Filtering

### Sorting

Sorting a Gantt is **hierarchy-preserving**: siblings are reordered within each parent, never flattened, so summary bars, WBS codes, and rollups stay coherent. Summary (parent) rows sort by their rolled-up span (for date/duration columns) or aggregate value.

Set an initial sort with the `sortBy` option, or drive it imperatively. By default the chart sorts by start time ascending; pass `sortBy: []` for natural (input) order.

```js
import {ColumnKey} from 'apexgantt';

const gantt = new ApexGantt(element, {
  series: tasks,
  sortBy: {key: ColumnKey.Name, direction: 'asc'},
  // multi-key: sort by progress desc, then name asc
  // sortBy: [{ key: ColumnKey.Progress, direction: 'desc' }, { key: ColumnKey.Name }],
});

gantt.sort({key: ColumnKey.Progress, direction: 'desc'}); // replace the sort
gantt.getSort();                                          // [{ key: 'progress', direction: 'desc' }]
gantt.clearSort();                                        // back to natural (input) order
```

**Clicking a sortable column header** cycles its sort ascending → descending → none (natural order), showing a ▲ / ▼ caret. **Shift+click** a header to add it as an additional sort key (multi-column sort) — each Shift+clicked column cycles ascending → descending → removed, the others are kept, and a small precedence number (1, 2, 3…) appears next to each caret. A plain click always collapses back to a single-key sort. Built-in value columns are sortable out of the box; `Wbs` is not (it is purely positional). A custom column becomes sortable when you give it an `accessor` (or a `comparator`). Override per column with `sortable`.

> Sorting is applied on demand. Editing a task's dates (drag / resize / inline edit) does not automatically re-sort the row — call `gantt.sort(gantt.getSort())` to re-apply the current sort if you want the row to move. Manual sibling re-ordering is not offered in this release, so there is no drag-vs-sort conflict.

### Filtering

A filter is a predicate run against each task. A task is **kept when it matches or has a matching descendant**, so the ancestors of matches stay visible and the tree context is preserved. Filtering is view-only: it changes which rows render but never the tree, WBS, or task data.

```js
const gantt = new ApexGantt(element, {
  series: tasks,
  filterBy: (task) => task.progress < 100, // initial filter: show incomplete work
});

gantt.filter((task) => /design/i.test(task.name)); // apply a filter
gantt.isFiltered();                                  // true
gantt.clearFilter();                                 // show every row again
```

**Built-in quick filter.** Set `enableQuickFilter: true` to render a search box in the toolbar; typing filters by the configured `quickFilter.fields` (default `['name']`).

```js
const gantt = new ApexGantt(element, {
  series: tasks,
  enableQuickFilter: true,
  quickFilter: {placeholder: 'Find a task…', fields: ['name'], caseSensitive: false},
});
```

**Advanced filter builder.** Set `enableFilterBuilder: true` for a "Filter" toolbar button that opens a popover for composing multiple conditions (field + operator + value) combined with **All** (AND) or **Any** (OR). The valid operators adapt to the column's type:

- **Text** (Name, custom): `contains`, `notContains`, `equals`, `notEquals`, `startsWith`, `endsWith`, `isEmpty`, `notEmpty`
- **Number** (Progress, Duration): `equals`, `notEquals`, `gt`, `gte`, `lt`, `lte`, `isEmpty`, `notEmpty`
- **Date** (Start, End): `on`, `before`, `after`, `isEmpty`, `notEmpty`

The same structured filter is available programmatically, with or without the UI:

```js
import {ColumnKey} from 'apexgantt';

gantt.setFilterRules({
  match: 'all', // 'all' = AND, 'any' = OR
  rules: [
    {field: ColumnKey.Progress, operator: 'lt', value: 100},
    {field: ColumnKey.StartTime, operator: 'after', value: '2024-02-01'},
  ],
});

gantt.getFilterRules(); // the active FilterRuleSet, or null
gantt.clearFilter();    // drop it
```

A custom column is filterable when it exposes an `accessor` (treated as text). For fully bespoke logic, wire `gantt.filter(predicate)` to your own controls (see the `sort-filter` demo).

> Filtering respects collapse state: a matching descendant under a collapsed parent stays hidden until the parent is expanded.

## UI state persistence

The Gantt can remember "where the user left off": zoom, scroll position, expand/collapse state, selection, sort, and filter. This view state is separate from the task data.

**Manual (`getState` / `setState`).** Capture a JSON-serializable snapshot and restore it whenever you like (for example, persist it to your own backend keyed by user).

```js
const saved = gantt.getState();
// { version: 1, zoom, scroll, collapsed, selected, sort, filterRules, quickFilter }

// later, or in a new session:
gantt.setState(saved);
```

`setState()` accepts a partial state, so you can restore just one slice:

```js
gantt.setState({sort: [{key: ColumnKey.Name, direction: 'asc'}]});
gantt.setState({collapsed: ['phase-1', 'phase-2']}, {silent: true}); // no sortChange/filterChange
```

**Automatic (`persistState`).** Set the `persistState` option to have the Gantt read from and write to `localStorage` for you. State is restored on the first `render()` and saved (debounced) whenever the view changes.

```js
const gantt = new ApexGantt(element, {series: tasks, persistState: true});
// or a custom storage key:
const gantt = new ApexGantt(element, {series: tasks, persistState: {key: 'project-42-gantt'}});
```

State stored under an incompatible schema `version` (or malformed JSON) is ignored, so upgrading the library never breaks a load. Persistence is a no-op in environments without `localStorage` (for example, server-side rendering).

## Grouping

Group the task grid by a field to bucket tasks under collapsible group headers. While grouping is active the parent/child tree is **suspended**: every task appears flat under its group header (with a member count), and the timeline shows each task's bar aligned to its grouped row.

Set it up front with the `groupBy` option or at runtime with `gantt.groupBy()`:

```js
// Bare column key — group by that column's value.
gantt.groupBy(ColumnKey.Progress);

// GroupCriterion — custom value extraction, labelling, and header order.
gantt.groupBy({
  field: 'status',
  accessor: (task) => task.status, // defaults to the column's accessor
  label: (value) => `Status: ${value}`, // defaults to String(value)
  direction: 'desc', // header order; defaults to 'asc'
});

gantt.getGroupBy(); // the active GroupCriterion, or null
gantt.isGrouping(); // boolean
gantt.clearGrouping(); // restore the tree view
```

Grouping composes with sorting and filtering: members are ordered within each group by the active sort, and a filter drops non-matching members (empty groups disappear). Tasks whose group value is empty collect under a localized "(None)" group, which always sorts last. Each group header is collapsible; clicking its chevron hides that group's members. Group headers themselves have no task bar.

> Grouping is view-only — it never mutates the task tree, WBS, or task data; clearing it returns the exact prior hierarchy. A `GroupCriterion`'s `accessor`/`label` functions are not serialized by [`persistState`](#ui-state-persistence) / `getState()` (only the `field` and `direction` are), so a restored grouping falls back to the column's own accessor.

## Split tasks

A task can be split into several **worked segments** separated by gaps on a single row (for example: work Mon–Wed, pause, resume Fri). Provide a `segments` array on the task, or split at runtime with `gantt.splitTask()`.

```js
const gantt = new ApexGantt(element, {
  series: [
    {
      id: 't1',
      name: 'Implementation',
      startTime: '2026-06-01',
      endTime: '2026-06-20',
      progress: 50,
      segments: [
        {start: '2026-06-01', end: '2026-06-06'},
        {start: '2026-06-12', end: '2026-06-20'},
      ],
    },
  ],
});
```

The task's `startTime` / `endTime` are the **envelope** (first segment start → last segment end) and are derived automatically from the segments, so summary rollups, dependencies, the timeline header, and the duration column all keep working. The bar renders one filled piece per segment joined by a thin connector line across the gaps; progress fills the worked segments left-to-right (gaps carry no progress).

Split at runtime, then clear the split by setting `segments` back to an empty array:

```js
gantt.splitTask('t1', '2026-06-08', {resumeAt: '2026-06-12'}); // open a gap
gantt.isSplit('t1'); // true
gantt.updateTask('t1', {segments: []}); // back to one contiguous bar
```

Interactions are preserved: dragging a split task moves all its segments together, and resizing adjusts its outer segment — both inferred automatically, so the same drag/resize handles work as for a normal bar.

> v1 is API-driven. Interactive split gestures (double-click / context-menu "split here"), per-segment drag/resize, and critical-path math that excludes gap time are not yet implemented; the envelope is treated as the task's span.

## Custom column renderers

You can add columns that aren't part of the built-in set by giving them a string `key` and a `render` function. Two renderer presets ship with the library — `renderers.avatars` for assignee/resource columns and `renderers.progressRing` for completion-percentage columns. Both are tree-shakeable; only the ones you import get bundled.

```js
import {ApexGantt, ColumnKey, renderers} from '@apexcharts/apexgantt';

const gantt = new ApexGantt(element, {
  series: tasks, // each task may include `assignees: Assignee[]`
  columnConfig: [
    {key: ColumnKey.Name, title: 'Task'},
    {
      key: 'assignees',
      title: 'Assigned',
      render: renderers.avatars({
        accessor: (task) => task.assignees,
        max: 4,
        size: 24,
      }),
    },
    {
      key: 'progressRing',
      title: '%',
      render: renderers.progressRing({size: 28, strokeWidth: 3}),
    },
  ],
});
```

### Built-in renderer presets

| Preset | Source | Options |
| --- | --- | --- |
| `renderers.avatars` | An assignee-stack with `+N` overflow and initials fallback. | `accessor`, `max`, `size`, `overlap`, `borderColor`, `fallbackColor` |
| `renderers.progressRing` | An SVG ring with optional centered numeric label. | `accessor`, `size`, `strokeWidth`, `progressColor`, `trackColor`, `showLabel`, `labelColor` |

### `Assignee` type

The avatar preset reads from `Assignee[]`. It is a public type you can import:

```ts
import type {Assignee} from '@apexcharts/apexgantt';

interface Assignee {
  name: string; // required
  avatarUrl?: string; // when omitted, initials are rendered
  initials?: string; // override the auto-derived initials
  color?: string; // background color for the initials fallback
}
```

### Writing your own renderer

A renderer is `(ctx, el) => string | void | (() => void)`. Return one of three things depending on how you build the cell content:

| Return | Meaning | Best for |
| --- | --- | --- |
| `string` | The library treats it as HTML and writes it to the cell via `innerHTML`. Always escape user-supplied text with the exported `escapeHtml` helper. | Vanilla JS, the built-in presets |
| `void` | You have already mounted content into `el` yourself. The library will not modify the cell's contents. | Frameworks that own their own lifecycle |
| `() => void` | Same as void, plus a cleanup function the library will invoke before the cell is discarded (row removal, full re-render, or `destroy()`). | React `createRoot`, Angular `ComponentRef`, Vue `createApp().mount()` |

```ts
import {escapeHtml, type ColumnRenderer} from '@apexcharts/apexgantt';

const statusPill: ColumnRenderer = (ctx) => {
  const status = ctx.task.status ?? 'unknown';
  return `<span class="pill pill-${escapeHtml(status)}">${escapeHtml(status)}</span>`;
};
```

The `ctx` argument provides:

| Field         | Type           | Description                                               |
| ------------- | -------------- | --------------------------------------------------------- |
| `task`        | `Task`         | The task being rendered.                                  |
| `options`     | `GanttOptions` | Resolved chart options — useful for theme-aware coloring. |
| `rowIndex`    | `number`       | Zero-based index in the visible task list.                |
| `isSummary`   | `boolean`      | True when the row is a summary (group) bar.               |
| `isMilestone` | `boolean`      | True when the task is a milestone.                        |

### Using with React, Angular, or Vue

Use the cleanup return so the framework can unmount and free resources when a row is evicted (during virtualization scroll) or when the chart is destroyed. The library guarantees the cleanup function runs synchronously before the cell is reused or removed.

```tsx
// React
import {createRoot} from 'react-dom/client';

const render: ColumnRenderer = (ctx, el) => {
  const root = createRoot(el);
  root.render(<AvatarStack assignees={ctx.task.assignees} />);
  return () => root.unmount();
};
```

```ts
// Angular — assuming you have a ViewContainerRef + a component to mount
const render: ColumnRenderer = (ctx, el) => {
  const ref = vcr.createComponent(AssigneesComponent);
  ref.setInput('task', ctx.task);
  el.appendChild(ref.location.nativeElement);
  return () => ref.destroy();
};
```

```ts
// Vue 3
import {createApp, h} from 'vue';
import AssigneesCell from './AssigneesCell.vue';

const render: ColumnRenderer = (ctx, el) => {
  const app = createApp({render: () => h(AssigneesCell, {task: ctx.task})});
  app.mount(el);
  return () => app.unmount();
};
```

### Lifecycle contract

The library invokes the cleanup function in **all three** of these cases:

1. The chart is destroyed (`gantt.destroy()`).
2. A full re-render replaces the cell (e.g. `gantt.update()`, or any `gantt.render()` call).
3. The row is evicted because the user scrolled it out of the virtualization window.

You do not need to listen for DOM mutations yourself. If your renderer returns a function, the library will call it.

## Touch & pointer support

All interactive gestures are built on **Pointer Events**, so they work with mouse, touch, and pen alike — no separate touch mode to enable. This covers dragging a task bar to reschedule it, resizing via the edge handles, dragging the in-bar progress handle, drawing dependencies from a bar's anchors, and dragging the task-list / timeline split bar.

Implementation notes:

- Interactive elements set `touch-action: none` so a touch-drag isn't stolen by the browser's pan/zoom (which would otherwise cancel the gesture).
- Each gesture is owned by the pointer that started it, so a second finger can't hijack an in-progress drag.
- If the OS interrupts a gesture (`pointercancel`), an in-flight bar drag reverts to its starting position rather than committing a partial move.

> Hover-only affordances (the crosshair, bar tooltips) naturally don't appear on touch since there is no hover, but every editing gesture and tap/selection works.

## Sub-day scheduling

Set `inputDateFormat` to a format that includes time tokens (e.g. `'YYYY-MM-DD HH:mm'`) and choose a finer `snapUnit` to schedule tasks at the hour or minute level:

```js
const gantt = new ApexGantt(element, {
  series: tasks,
  inputDateFormat: 'YYYY-MM-DD HH:mm',
  snapUnit: 'minute',
  snapValue: 15, // drags/resizes snap in 15-minute steps
  pixelsPerDay: 600, // zoom in enough that hour cells show in the header
});
```

Behavior changes when `inputDateFormat` includes time:

- The end-time of a task is treated as the **exclusive end timestamp** (a task from `10:00` to `10:30` is 30 minutes wide). Day-only formats keep the existing inclusive-end behavior (a task from `Jan 10` to `Jan 15` spans 6 cells).
- Inline-edit `startTime` / `endTime` cells switch to `datetime-local` inputs.
- The Duration column reports in the configured `snapUnit` suffix: `d` / `h` / `m`.

> **Working calendars** (weekends + holidays) are supported via the [`calendar`](#apexgantt-options) option — duration math, drag/resize snapping, and timeline stripes all honour the configured working days. Per-day working **hours** (e.g. skipping after-hours within a working day) are not yet supported and are planned for a future release.

## Inline Editing

Set `enableInlineEdit: true` to let users edit task fields directly in the task-list cells without opening a form.

```js
const gantt = new ApexGantt(element, {
  series: tasks,
  enableInlineEdit: true,
});
```

Inline editing is also auto-enabled by `enableTaskEdit: true` (which opens a dialog when a task bar is clicked), so the two surfaces ship together by default. Pass `enableInlineEdit: false` explicitly to keep the dialog without inline cell editing:

```js
new ApexGantt(element, {
  series: tasks,
  enableTaskEdit: true,
  enableInlineEdit: false, // dialog only, cells stay read-only
});
```

### How it works

- **Activate**: double-click any editable cell.
- **Commit**: press `Enter` or click outside the input (`blur`).
- **Cancel**: press `Escape` to revert without saving.

### Editable columns

| Column | Editor | Notes |
| --- | --- | --- |
| `name` | text input | Empty values are rejected (cancelled silently). |
| `startTime` | native `<input type="date">` | For tasks (not milestones), the duration is preserved — `endTime` shifts by the same delta. |
| `endTime` | native `<input type="date">` | Rejected if before `startTime`. |
| `duration` | number input (min `1`) | Edits update `endTime = startTime + duration - 1` day. `startTime` stays fixed. |
| `progress` | number input (`0`–`100`) | Values clamp to the `0–100` range. |

When `inputDateFormat` includes time tokens (e.g. `'YYYY-MM-DD HH:mm'`), the `startTime` / `endTime` editors switch from `<input type="date">` to `<input type="datetime-local">` automatically so hour/minute edits round-trip correctly.

### Cells that are not editable

- **Summary rows** (parents with `showSummaryBar`) — only `name` is editable; dates/duration/progress are derived from descendants.
- **Milestones** — only `name` and `startTime` are editable (no end / duration / progress).
- **Empty filler rows** at the bottom of the task-list panel.

### Events

Inline edits emit the same events as the inline `TaskForm` and the public `updateTask()` method, so consumers can listen on a single event regardless of which surface produced the change:

- `taskUpdate` — fires before the change is applied.
- `taskUpdateSuccess` — fires after a successful update; `detail.updatedTask` contains the resolved task.
- `taskUpdateError` — fires if the update throws.

```js
container.addEventListener('taskUpdateSuccess', (e) => {
  const {taskId, updatedTask} = e.detail;
  // persist to backend
});
```

## Data Parsing

Map your existing data structure to ApexGantt format without manual transformation.

```javascript
const apiData = [
  {
    task_id: 'T1',
    task_name: 'Design Phase',
    start_date: '01-01-2024',
    end_date: '01-15-2024',
    completion: 75,
  },
];

const gantt = new ApexGantt(document.getElementById('gantt'), {
  series: apiData,
  parsing: {
    id: 'task_id',
    name: 'task_name',
    startTime: 'start_date',
    endTime: 'end_date',
    progress: 'completion',
  },
});
```

### Nested Objects & Transforms

Use dot notation for nested properties and inline transforms for data conversion:

```javascript
const nestedData = [
  {
    project: {
      task: {id: 'T1', title: 'Design'},
      dates: {start: '01-01-2024', end: '01-15-2024'},
      status: {completion: 0.75},
    },
  },
];

const gantt = new ApexGantt(document.getElementById('gantt'), {
  series: nestedData,
  parsing: {
    id: 'project.task.id',
    name: 'project.task.title',
    startTime: 'project.dates.start',
    endTime: 'project.dates.end',
    progress: {
      key: 'project.status.completion',
      transform: (value) => value * 100, // convert to percentage
    },
  },
});
```

**Supported fields:** `id`, `name`, `startTime`, `endTime`, `progress`, `type`, `parentId`, `dependency`, `barBackgroundColor`, `rowBackgroundColor`, `collapsed`, `showSummaryBar`

## 📘 Public API

### 1. `update(options)`

Updates the entire Gantt chart with new configuration and task data.

#### Parameters

| Name | Type | Description |
| --- | --- | --- |
| `options` | `Object` | Contains updated config and data. Must include a `tasks` array and other Gantt configuration options. |

#### Example

```js
ganttInstance.update({
  series: [
    {
      id: 'task-1',
      name: 'Design Phase',
      start: '2025-07-01',
      end: '2025-07-10',
      progress: 40,
    },
    // more tasks...
  ],
  pixelsPerDay: 25.7, // week density
});
```

### 2. `updateTask(taskId, taskData)`

Updates the specific task with provided task data.

#### Parameters

| Name       | Type     | Description                    |
| ---------- | -------- | ------------------------------ |
| `taskId`   | `string` | ID of the task to be updated   |
| `taskData` | `Object` | Data of the task to be updated |

#### Example

```js
ganttInstance.updateTask('task-1', {
  name: 'Design Phase',
  start: '2025-07-01',
  end: '2025-07-10',
  progress: 40,
});
```

### 3. `addTask(input, options?)`

Inserts a new task and re-renders the chart. The operation is recorded in the undo history. Emits a `taskAdded` event on success. If a `beforeTaskAdd` hook is configured and it returns `false`, the insertion is cancelled and the method returns `null`. Throws when `input.id` is missing or already exists.

#### Parameters

| Name      | Type                    | Description                                                              |
| --------- | ----------------------- | ------------------------------------------------------------------------ |
| `input`   | `TaskInput`             | Task data; `id` is required.                                             |
| `options` | `{ parentId?: string }` | Optional parent id to insert the task under. Omit for a root-level task. |

Returns the inserted `Task`, or `null` when the `beforeTaskAdd` hook cancels.

#### Example

```js
ganttInstance.addTask({
  id: 'task-9',
  name: 'Review',
  startTime: '2026-08-01',
  endTime: '2026-08-05',
});

ganttInstance.addTask(
  {id: 'subA', name: 'Subtask', startTime: '2026-08-01', endTime: '2026-08-03'},
  {parentId: 'task-9'}
);
```

### 4. `deleteTask(taskId, options?)`

Removes a task and re-renders. Recorded in the undo history. Emits a `taskDeleted` event on success. Dependency edges that reference the removed task(s) are auto-cleaned in the same transaction, so undo restores both tasks and edges atomically; one `dependencyRemoved` event fires per auto-removed edge before `taskDeleted`.

Cascade modes:

- `'forbid'` (default) — throws when the task has children. Safe default to prevent accidental subtree loss.
- `'children'` — deletes the task plus every descendant in a single undoable transaction.
- `'orphan'` — reparents the immediate children to the deleted task's parent (or root if the deleted task was a root), then removes just the task. A `taskMoved` event fires for each reparented child. Dependency edges between surviving (reparented) children are preserved; only edges that reference the deleted task itself are cleaned up.

If a `beforeTaskDelete` hook is configured and it returns `false`, the removal is cancelled and the method returns `false`. Throws when the task id is not found, or when `cascade: 'forbid'` and the task has children.

#### Parameters

| Name      | Type                                               | Description                       |
| --------- | -------------------------------------------------- | --------------------------------- |
| `taskId`  | `string`                                           | Id of the task to remove.         |
| `options` | `{ cascade?: 'forbid' \| 'children' \| 'orphan' }` | Cascade mode. Default `'forbid'`. |

Returns `true` if the task was removed, `false` if the hook cancelled.

#### Example

```js
// leaf task — forbids by default but the task has no children so it's removed
ganttInstance.deleteTask('task-3');

// summary task — opt in to cascade
ganttInstance.deleteTask('task-1', {cascade: 'children'});

// remove a summary but keep its children, moving them to its parent
ganttInstance.deleteTask('task-1', {cascade: 'orphan'});
```

### 5. `moveTask(taskId, options?)`

Re-parents a task and re-renders. Recorded in the undo history. Emits a `taskMoved` event. If `beforeTaskMove` returns `false`, the move is cancelled and the method returns `false`.

Throws when `taskId` doesn't exist, when `newParentId` doesn't exist, when moving onto itself, or when the move would create a cycle.

Sibling reordering within the same parent is not modelled yet — that lands with Phase-4 cascade work.

#### Parameters

| Name      | Type                               | Description                                                        |
| --------- | ---------------------------------- | ------------------------------------------------------------------ |
| `taskId`  | `string`                           | Id of the task to move.                                            |
| `options` | `{ newParentId?: string \| null }` | New parent id. Pass `null` (or omit) to move the task to the root. |

Returns `true` if the move was applied (or was a no-op), `false` if the hook cancelled.

#### Example

```js
ganttInstance.moveTask('subA', {newParentId: 'p2'});
ganttInstance.moveTask('subA', {newParentId: null}); // promote to root
```

### 6. `addDependency(fromId, toId, options?)`

Creates a dependency edge between two tasks and re-renders the arrow. Recorded in undo history. Emits `dependencyAdded`. Runs through `beforeDependencyChange`.

Throws when either task doesn't exist, or when the edge already exists.

#### Parameters

| Name      | Type                                                    | Description                       |
| --------- | ------------------------------------------------------- | --------------------------------- |
| `fromId`  | `string`                                                | Source task id (predecessor).     |
| `toId`    | `string`                                                | Target task id (successor).       |
| `options` | `{ type?: 'FS' \| 'FF' \| 'SS' \| 'SF'; lag?: number }` | Defaults: `type: 'FS'`, `lag: 0`. |

Returns `true` on success, `false` if the hook cancelled.

#### Example

```js
ganttInstance.addDependency('t1', 't2'); // FS, lag 0
ganttInstance.addDependency('t1', 't2', {type: 'SS', lag: 2});
```

### 7. `removeDependency(fromId, toId)`

Removes a dependency edge and re-renders. Recorded in undo history. Emits `dependencyRemoved` with the captured `type` and `lag`. Runs through `beforeDependencyChange`.

Throws when no edge exists between the two tasks.

#### Example

```js
ganttInstance.removeDependency('t1', 't2');
```

### 7a. `canAddDependency(fromId, toId, options?)`

Tells whether a new edge `fromId → toId` would be accepted right now, without committing it. Shared by the programmatic API and the interactive draw UI so both apply the same rules.

Returns `{ ok: true }` when the edge would be accepted, or `{ ok: false, reason }` where `reason` is one of:

| reason               | meaning                                                                           |
| -------------------- | --------------------------------------------------------------------------------- |
| `self`               | `fromId === toId`                                                                 |
| `task-missing`       | either id is not in the data model                                                |
| `duplicate`          | an edge `fromId → toId` already exists                                            |
| `cycle`              | the new edge would close a cycle in the dependency graph                          |
| `summary-descendant` | one endpoint is an ancestor of the other (gated by `allowSummaryDescendantLinks`) |
| `hook-veto`          | `beforeDependencyChange` returned `false`                                         |

#### Example

```js
const verdict = ganttInstance.canAddDependency('t1', 't2');
if (verdict.ok) ganttInstance.addDependency('t1', 't2');
else console.warn(verdict.reason);
```

### 8. `undo()`

Rolls back the most recent recorded transaction through the same command bridge that forward operations use; data and DOM return to the pre-operation state. Emits `historyChange` with `kind: 'undo'`.

Returns `true` if a transaction was undone, `false` when the undo stack is empty or `history.enabled` is `false`.

#### Example

```js
ganttInstance.updateTask('t1', {progress: 90});
ganttInstance.undo(); // restores the previous progress
```

### 9. `redo()`

Replays the most recently undone transaction. Pops from the redo stack and re-executes through the command bridge; emits `historyChange` with `kind: 'redo'`.

Any new mutating call between `undo()` and `redo()` discards the redo stack — once a fresh transaction is recorded, future redos are no longer reachable.

Returns `true` if a transaction was redone, `false` otherwise.

#### Example

```js
ganttInstance.undo();
ganttInstance.redo(); // reapplies the rolled-back change
```

### 10. `canUndo()` / `canRedo()`

Returns whether an undoable / redoable transaction is currently on top of the stack. Use these to gate custom Undo/Redo UI affordances.

```js
myUndoButton.disabled = !ganttInstance.canUndo();
```

### 11. `clearHistory()`

Drops every recorded transaction and emits `historyChange` with `kind: 'clear'`. Useful after loading a fresh dataset where rolling back to a previous tree state would be incoherent.

```js
ganttInstance.update({series: freshTasks});
ganttInstance.clearHistory();
```

### 12. `getHistorySize()`

Returns the current undo/redo stack sizes as `{ undo: number, redo: number }`. Handy for debugging or surfacing a "you have N undo steps left" hint.

### 13. `zoomIn()`

Zooms in the gantt based on current view mode. View mode direction for zoom in year -> quarter -> month -> week -> day

#### Example

```js
ganttInstance.zoomOut();
```

### 14. `zoomOut()`

Zooms out the gantt based on current view mode. View mode direction for zoom in day -> week -> month -> quarter -> year

#### Example

```js
ganttInstance.zoomOut();
```

### 15. `sort(criteria)`

Apply a hierarchy-preserving sort. Pass one `SortCriterion` or an array (multi-key). Re-renders and emits `sortChange`. See [Sorting & Filtering](#sorting--filtering).

```js
gantt.sort({key: ColumnKey.Name, direction: 'asc'});
```

### 16. `clearSort()`

Clear the active sort and return to natural (input) order. Emits `sortChange`.

### 17. `getSort()`

Return the active sort criteria as `SortCriterion[]` (empty array = natural order).

### 18. `toggleSort(key, opts?)`

Cycle a column's sort ascending → descending → none. Backs the column-header click UX; no-op for non-sortable columns. Pass `{ append: true }` (Shift+click) to add the column as an extra sort key for multi-column sort instead of replacing the current one. Emits `sortChange`.

### 19. `filter(predicate)`

Apply a filter. `predicate: (task) => boolean`; a task is kept when it matches or has a matching descendant. Re-renders and emits `filterChange`.

```js
gantt.filter((task) => task.progress < 100);
```

### 20. `clearFilter()`

Clear the active filter so every row is shown again. Emits `filterChange`.

### 21. `isFiltered()`

Returns `true` when a filter is currently active.

### 22. `setFilterRules(ruleSet)`

Apply a structured filter (`FilterRuleSet`) — conditions combined with `'all'` (AND) or `'any'` (OR). Pass `null` or an empty rule list to clear. Compiles to the same view-only filter as `filter()`. Emits `filterChange`.

### 23. `getFilterRules()`

Return the active `FilterRuleSet`, or `null` when none is set.

### 24. `exportChart(format?)`

Export the chart and trigger a download. `format` is `'svg'` (vector), `'png'` (raster), or `'pdf'` (single-page, image-based); defaults to the configured `exportFormat`. Under row virtualization the full dataset is expanded for the snapshot and restored afterward. Returns a `Promise` that resolves once the download has been triggered.

```js
await gantt.exportChart('png');
```

> PNG and PDF rasterize the chart via a `<canvas>`, so they run in the browser (not in headless/jsdom environments). The PDF is generated dependency-free (a single page embedding a JPEG of the chart).

### 25. `getState()`

Capture the current UI view state (zoom, scroll, collapse, selection, sort, filter) as a JSON-serializable `GanttUiState`. Pair with `setState()` to save and restore "where the user left off", for example to your own backend.

```js
const saved = gantt.getState();
// { version: 1, zoom, scroll, collapsed, selected, sort, filterRules, quickFilter }
```

### 26. `setState(state, opts?)`

Restore a state produced by `getState()`. Any omitted field is left untouched, so a partial state (for example `{ sort: [...] }`) applies just that slice. Re-renders once, then emits `sortChange` / `filterChange` for the parts that changed. Pass `{ silent: true }` to suppress those events.

```js
gantt.setState(saved);
gantt.setState({sort: [{key: ColumnKey.Name, direction: 'asc'}]}); // partial
```

> To have the Gantt save and restore state automatically via `localStorage`, set the [`persistState`](#uistate) option instead of calling these by hand. See [UI state persistence](#ui-state-persistence).

### 27. `groupBy(criterion)`

Group the task grid by a field. While grouping is active the parent/child tree is suspended and every task appears flat under a collapsible group header (label + member count). Pass a bare column key or a `GroupCriterion` (`{ field, accessor?, label?, direction? }`). Re-renders and emits `groupChange`. See [Grouping](#grouping).

```js
gantt.groupBy(ColumnKey.Progress);
gantt.groupBy({field: 'status', label: (v) => `Status: ${v}`, direction: 'desc'});
```

### 28. `clearGrouping()`

Clear the active grouping and restore the tree view. Emits `groupChange`.

### 29. `getGroupBy()` / `isGrouping()`

`getGroupBy()` returns the active `GroupCriterion` (or `null`); `isGrouping()` returns whether grouping is active.

### 30. `splitTask(taskId, at, options?)`

Split a task into separate worked segments at `at`, producing a gap on the timeline (see [Split tasks](#split-tasks)). The segment containing `at` is cut so its first piece ends at `at` and the rest resumes at `options.resumeAt` (default: the next day — pass a later `resumeAt` for a wider gap). Routed through `updateTask`, so it is validated, undoable, and emits `taskUpdate`. No-op on milestones, summary bars, or when `at` is not strictly inside a worked span.

```js
gantt.splitTask('t3', '2026-06-10', {resumeAt: '2026-06-14'});
```

### 31. `isSplit(taskId)`

Returns whether a task is currently split into multiple worked segments.

### 32. `setColumnWidth(key, width)`

Pin a task-list column to an exact pixel width (the other columns absorb the remaining panel space). Mirrors dragging the column-header resize handle. Re-renders and emits `columnResize`.

```js
gantt.setColumnWidth(ColumnKey.Name, 260);
```

### 33. `resetColumnWidths(key?)`

Clear the manual width of one column (pass its `key`) or of every column (omit the argument), returning them to their auto/flex width. Re-renders and emits `columnResize`.

```js
gantt.resetColumnWidths(ColumnKey.Name); // one column
gantt.resetColumnWidths(); // all columns
```

### 34. `getColumnWidths()`

Return the active manual column-width overrides as a plain object (`key` → pixels). Included in `getState()` and restorable via `setState({ columnWidths })`.

## Events

ApexGantt emits CustomEvents on the container element for various user interactions, allowing you to track and respond to changes in real-time.

### Available Events

| Event | When | Detail |
| --- | --- | --- |
| `taskUpdate` | Task is being updated | `{ taskId, updates, updatedTask, timestamp }` |
| `taskUpdateSuccess` | Update completed successfully | `{ taskId, updatedTask, timestamp }` |
| `taskValidationError` | Form validation failed | `{ taskId, errors, timestamp }` |
| `taskUpdateError` | Update failed | `{ taskId, error, timestamp }` |
| `taskAdded` | Task inserted via `gantt.addTask()` | `{ taskId, task, parentId?, timestamp }` |
| `taskDeleted` | Task removed via `gantt.deleteTask()` | `{ taskId, task, removedDescendantIds, timestamp }` |
| `taskMoved` | Task re-parented via `gantt.moveTask()` | `{ taskId, oldParentId?, newParentId?, timestamp }` |
| `dependencyAdded` | Edge created via `gantt.addDependency()` | `{ fromId, toId, type, lag, timestamp }` |
| `dependencyRemoved` | Edge removed via `gantt.removeDependency()` | `{ fromId, toId, type, lag, timestamp }` |
| `taskDragged` | Task bar is dragged | `{ taskId, oldStartTime, oldEndTime, newStartTime, newEndTime, daysMoved, affectedChildTasks, timestamp }` |
| `taskResized` | Task bar is resized | `{ taskId, resizeHandle, oldStartTime, oldEndTime, newStartTime, newEndTime, durationChange, timestamp }` |
| `taskProgressChanged` | In-bar progress handle is dragged to a new value | `{ taskId, oldProgress, newProgress, timestamp }` |
| `historyChange` | The undo/redo stack changed — `kind` is `'record'`, `'undo'`, `'redo'`, or `'clear'` | `{ kind, canUndo, canRedo, undoSize, redoSize, topUndoLabel?, topRedoLabel?, timestamp }` |
| `sortChange` | Active sort changed via API or header click | `{ criteria: { key, direction }[], timestamp }` |
| `filterChange` | Active filter changed | `{ active, visibleCount, timestamp }` |
| `groupChange` | Active grouping changed via `gantt.groupBy()` / `gantt.clearGrouping()` | `{ active, field, groupCount, timestamp }` |
| `columnResize` | A task-list column was resized (header drag or API) | `{ key, width, widths, timestamp }` |

### Events Usage

#### Vanilla JS

```javascript
import ApexGantt, {GanttEvents} from 'apexgantt';

const container = document.getElementById('gantt');
const chart = new ApexGantt(container, {series: tasks});
chart.render();

// Hook into updates to save to your backend
container.addEventListener(GanttEvents.TASK_UPDATE_SUCCESS, async (e) => {
  const {updatedTask} = e.detail;
  /* use this updatedTask for any server operations */
});

// handle any errors
container.addEventListener(GanttEvents.TASK_UPDATE_ERROR, (e) => {
  console.error('Update failed:', e.detail.error);
});
```

#### React

```jsx
import {useRef, useEffect} from 'react';
import ApexGantt, {GanttEvents} from 'apexgantt';

function GanttChart({tasks}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const chart = new ApexGantt(containerRef.current, {series: tasks});
    chart.render();

    const handleSuccess = async (e) => {
      const {updatedTask} = e.detail;
      /* use this updatedTask for any server operations */
    };

    containerRef.current.addEventListener(GanttEvents.TASK_UPDATE_SUCCESS, handleSuccess);

    return () => {
      containerRef.current?.removeEventListener(GanttEvents.TASK_UPDATE_SUCCESS, handleSuccess);
      chart.destroy();
    };
  }, [tasks]);

  return <div ref={containerRef} />;
}
```
