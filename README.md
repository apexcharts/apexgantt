# JavaScript Gantt Chart Component — ApexGantt

A JavaScript Gantt chart library for interactive project timelines. Renders tasks, dependencies, milestones, critical path, baselines, and annotations with drag-and-drop scheduling, multiple view modes, and light/dark themes — no framework required.

📚 **Documentation:** [apexcharts.com/apexgantt/docs](https://apexcharts.com/apexgantt/docs/) · 🎬 **Live demos:** [apexcharts.com/apexgantt/demos](https://apexcharts.com/apexgantt/demos/) · 📦 **npm:** [apexgantt](https://www.npmjs.com/package/apexgantt)

## Installation

```bash
npm install apexgantt
```

Or include directly via CDN:

```html
<script src="https://cdn.jsdelivr.net/npm/apexgantt"></script>
```

## Usage

```html
<div id="gantt-container"></div>
```

```js
import ApexGantt from 'apexgantt';

const ganttOptions = {
  series: [
    { id: 'task-1', name: 'Design',      startTime: '01-01-2026', endTime: '01-15-2026', progress: 65 },
    { id: 'task-2', name: 'Development', startTime: '01-16-2026', endTime: '02-28-2026', dependency: 'task-1' },
    { id: 'task-3', name: 'QA',          startTime: '03-01-2026', endTime: '03-15-2026', dependency: 'task-2' },
  ],
  viewMode: 'week',
};

const gantt = new ApexGantt(document.getElementById('gantt-container'), ganttOptions);
gantt.render();
```

## Features

- Task dependencies and milestones
- Critical path highlighting
- Baselines (planned vs actual)
- Annotations with date ranges
- Multiple view modes: day, week, month, quarter, year
- Drag-and-drop scheduling
- Light and dark themes
- SVG export
- TypeScript type definitions

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
| `canvasStyle` | `string` | `''` | Arbitrary CSS injected onto the root container element. |
| `backgroundColor` | `string` | `'#FFFFFF'` | Background color of the chart container. |
| `headerBackground` | `string` | `'#f3f3f3'` | Background color of the header row. |
| `rowHeight` | `number` | `28` | Height of each task row in pixels. |
| `rowBackgroundColors` | `string[]` | `['#FFFFFF']` | Alternating row background colors; the pattern cycles automatically. |
| `tasksContainerWidth` | `number` | `425` | Initial pixel width of the task-list panel. |
| `columnConfig` | `ColumnListItem[]` | `undefined` | Custom column definitions for the task-list panel. Controls which columns are shown, their order, titles, and widths. See [Column Configuration](#column-configuration). |
| `barBackgroundColor` | `string` | `'#318CE7'` (light) / `'#818CF8'` (dark) | Default background fill color for task bars. |
| `barBorderRadius` | `string` | `'5px'` | CSS border-radius applied to task bars. |
| `barMargin` | `number` | `4` | Top and bottom margin inside each row for the task bar. |
| `barTextColor` | `string` | `'#FFFFFF'` | Text color rendered inside task bars. |
| `barLabel` | `BarLabelOptions` | `{ position: 'right', field: 'name' }` | Per-task bar label. Defaults to `position: 'right'` so labels stay visible regardless of bar width. Set `position: 'inside'` to render centered inside the bar, `'left'` to render before it, or `'auto'` to pick between `'inside'` and `'right'` based on bar width; supply `render: (task) => string \| HTMLElement` to compose the name with chips, icons, or owner info. When `position: 'left'`, the timeline auto-reserves `120px` of leading space so labels don't disappear under the task-list panel — tune via `barLabel.leadingPadding`. Outside labels are not currently rendered for milestones. |
| `summaryBarColor` | `string` | `'#B9CECE'` (light) / `'#8FBCBC'` (dark) | Fill color for summary (group) bars. |
| `milestoneColor` | `string` | `'#7C3AED'` (light) / `'#A78BFA'` (dark) | Fill color for milestone diamonds. |
| `arrowColor` | `string` | `'#94A3B8'` (light) / `'#94A3B8'` (dark) | Color of dependency arrows between tasks. Subtle slate-gray by default so links don't compete with bars. |
| `dependencies` | `DependencyOptions` | `{}` | Polish + editing for dependency arrows: `cornerRadius` (rounded joints), `hitWidth` (invisible thicker stroke for hover/click targeting), `tooltipTemplate: (ctx) => string` (HTML on hover — requires non-zero `hitWidth`), `classBuilder: (ctx) => string \| string[]` (per-arrow CSS class for cross-team / blocked / etc), `editable: boolean` (hover darkens the arrow, click selects it and reveals a "✕" affordance — click the ✕ or press <kbd>Delete</kbd> to remove via the undoable command path; on bar hover two anchor circles appear at the bar's start/finish edges, and dragging from one to another bar draws a dashed preview that commits the new dependency on release — the (source-anchor, target-anchor) pair determines the type: right→left FS, left→left SS, right→right FF, left→right SF), `allowSummaryDescendantLinks: boolean` (allow drawing edges between a summary task and its descendants; off by default since such edges confuse downstream date math). When `editable: true`, `hitWidth` is auto-bumped to at least `12` if unset. The `ctx` carries `fromTask`, `toTask`, `type`, and `lag`. |
| `calendar` | `CalendarOptions` | `undefined` | Working-calendar config. When set, weekends + holidays drive duration math, summary aggregation, and timeline stripes — durations stop counting calendar days and start counting working days. Fields: `workingWeekdays: number[]` (0 = Sunday … 6 = Saturday; default `[1, 2, 3, 4, 5]`), `holidays: Array<string \| Date \| { date, label? }>` (non-working dates regardless of weekday; mixed forms allowed), `showNonWorkingStripes: boolean` (render hatched bands over weekend/holiday columns; default `true`), `holidayTooltip: (ctx) => string` (optional HTML rendered when the user hovers a holiday stripe — `ctx.date` is the Date, `ctx.label` is whichever string was supplied in the matching entry), `dragSnapMode: 'next' \| 'previous' \| 'allow'` (what happens when a drag/resize commits onto a non-working day — `'next'` (default) snaps forward, `'previous'` snaps backward, `'allow'` permits non-working start/end. Drag preserves the source task's working-day duration across the snap; resize snaps the moving endpoint only. No effect when `snapUnit !== 'day'` or the input format carries time tokens). Absent calendar = today's behavior (every day is a working day, no stripes, no snap). |
| `borderColor` | `string` | `'#DFE0E1'` | Color of cell and row divider lines. |
| `cellBorderColor` | `string` | `'#D0D7DE'` | Border color for all cells in the task table and timeline grid. |
| `cellBorderWidth` | `string` | `'1px'` | CSS border-width for all cell lines. |
| `columnLines` | `boolean` | `true` | Whether to draw vertical lines between timeline columns. Set to `false` for a cleaner look that keeps only the horizontal row dividers. |
| `enableProjectBoundary` | `boolean` | `false` | When `true`, two vertical lines mark the project's earliest start and latest end across all rows. Auto-recomputes when tasks are added, removed, or rescheduled. |
| `projectBoundaryColor` | `string` | `'#7C3AED'` | Stroke colour for the project-boundary lines. Falls back to `annotationBorderColor` when omitted. |
| `enableRollups` | `boolean` | `false` | When `true`, summary (parent) rows display thin rollup markers below the summary bar at each leaf descendant's date range. Useful for keeping children visible at a glance even when the parent is collapsed. |
| `enableResize` | `boolean` | `true` | Allow the task-list panel to be resized by dragging the divider. |
| `enableExport` | `boolean` | `true` | Show the SVG export button in the toolbar. |
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
| `crosshairColor` | `string` | `'#318CE7'` (light) / `'#818CF8'` (dark) | Color of the crosshair line and the label background. |
| `crosshairLabelFormat` | `(date, tier) => string` | _auto_ | Custom formatter for the crosshair label. Receives the date under the cursor and the active sub-tier (`'minute' \| 'hour' \| 'halfday' \| 'day' \| 'week' \| 'month' \| 'quarter' \| 'year'`). When omitted, the label auto-adapts to the active tier — `'ddd MM/DD/YYYY'` for day-and-coarser tiers, `'MM/DD HH:mm'` for halfday/hour/minute tiers. |
| `baseline` | `Partial<BaselineOptions>` | `undefined` | When `enabled: true`, renders a thin baseline bar below each task bar. Hovering the baseline shows a tooltip with its planned start/end dates. When `rowHeight` isn't explicitly set, the default rowHeight is bumped to make room for the baseline without squeezing the actual bar. |
| `tooltipId` | `string` | `'apexgantt-tooltip-container'` | HTML `id` for the tooltip container element. |
| `tooltipTemplate` | `(task, dateFormat) => string` | built-in | Custom function returning an HTML string for the task tooltip. |
| `tooltipBorderColor` | `string` | `'#BCBCBC'` | Border color of the tooltip. |
| `tooltipBGColor` | `string` | `'#FFFFFF'` | Background color of the tooltip. |
| `fontColor` | `string` | `'#000000'` | Color for all text in the chart. |
| `fontFamily` | `string` | `''` | CSS font-family for the chart. |
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

Available column keys: `Name`, `StartTime`, `EndTime`, `Duration`, `Progress`, `ProgressRing`, `Wbs`.

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
| `minWidth` | `string` | `'30px'` | Minimum CSS width (used in `minmax()`). |
| `flexGrow` | `number` | `1` | Flex proportion (used as `fr` units in CSS Grid). |
| `visible` | `boolean` | `true` | Set to `false` to hide the column. |
| `render` | `ColumnRenderer` | — | Custom cell renderer. Required for custom columns; ignored for built-in keys. |
| `accessor` | `(task) => unknown` | — | Extracts the cell's underlying value (used by SVG export and future sort/filter features). |

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
| `options` | `Object` | Contains updated config and data. Must include a `series` array and other Gantt configuration options. |

#### Example

```js
ganttInstance.update({
  series: [
    {
      id: 'task-1',
      name: 'Design Phase',
      startTime: '07-01-2025',
      endTime: '07-10-2025',
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
  startTime: '07-01-2025',
  endTime: '07-10-2025',
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

## Framework wrappers

Using a framework? Use the dedicated wrapper — all share the same core engine and task data model:

- **React** — [`react-apexgantt`](https://www.npmjs.com/package/react-apexgantt) ([GitHub](https://github.com/apexcharts/react-apexgantt))
- **Angular** — [`ngx-apexgantt`](https://www.npmjs.com/package/ngx-apexgantt) ([GitHub](https://github.com/apexcharts/ngx-apexgantt))
- **Vue** — [`vue-apexgantt`](https://www.npmjs.com/package/vue-apexgantt) ([GitHub](https://github.com/apexcharts/vue-apexgantt))
- **Blazor** — [`Blazor-ApexGantt`](https://www.nuget.org/packages/Blazor-ApexGantt/) ([GitHub](https://github.com/apexcharts/Blazor-ApexGantt))

## License

See [LICENSE](LICENSE) for details. Commercial licenses available at [apexcharts.com/pricing](https://apexcharts.com/pricing/).

## About ApexGantt

ApexGantt is part of the [ApexCharts](https://apexcharts.com/) family — a Gantt chart component for JavaScript, React, Angular, Vue, and Blazor, with one consistent API across every framework wrapper.
