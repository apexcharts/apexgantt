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

Loaded with a `<script>` tag instead, the library sets `window.ApexGantt`, which also carries every named export as a static property: `ApexGantt.TaskType`, `ApexGantt.GanttEvents`, `ApexGantt.DEFAULT_GANTT_MESSAGES`, `ApexGantt.ColumnKey`, `ApexGantt.renderers` and the rest.

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

ApexGantt is included in the Premium plan and above. There is no free tier: without a key, or with a key for a lower plan such as Pro, the chart works fully and carries a trial watermark. See <https://apexcharts.com/pricing>.

Set your license key once, typically at app startup:

```js
import ApexGantt from 'apexgantt';

// set the license key, ideally before the first render
ApexGantt.setLicense('your-license-key');

const gantt = new ApexGantt(document.getElementById('gantt-container'), ganttOptions);
gantt.render();
```

`setLicense` may also be called after charts have rendered (since 3.17.0): charts already on the page drop their watermark when a Premium key arrives. Calling it before the first `render()` avoids showing the watermark for a frame.

The key is shared with every other Apex product on the page. A valid key for a lower plan never replaces a Premium key already in force, so another product's `setLicense` with a Pro key cannot bring the Gantt watermark back; it is ignored with a console warning. A valid key whose plan does not include ApexGantt logs a warning saying so.

## ApexGantt Options

The layout can be configured by passing a second argument to `ApexGantt` with the properties listed below.

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `series` | `TaskInput[]` | **required** | Task data array. See data format below. Passing `series` to `update()` replaces the data and clears the undo history; any other `update()` keeps the current tasks, edits included (read them back with `getTasks()`). |
| `theme` | `'light' \| 'dark' \| string` | `'light'` | Built-in color theme preset, or the name of a theme registered on the family registry (see [Named themes](#named-themes)). An `update()` that switches the theme returns the color options the theme sets (`barBackgroundColor`, `fontColor`, `rowBackgroundColors`, `arrowColor` and the others listed there) to the new theme's values, user-set ones included, unless the same call passes them; every other option carries over. Left unset (with no `backgroundColor`), it follows a design system that declares a dark variant. See [`update(options)`](#1-updateoptions). |
| `tokens` | `boolean` | `true` | `false` stops the chart reading the `--apx-*` family tokens and the page's design system (including its variant). |
| `designSystem` | `boolean` | `true` | `false` stops the chart reading the page's design system (Ignite UI's `--ig-*` tokens, including its variant). The `--apx-*` tokens still apply. Has an effect only while the `apexgantt/ignite-ui` add-on is loaded; see [Design systems](#design-systems-ignite-ui). |
| `width` | `number \| string` | `'100%'` | Width of the chart container. |
| `height` | `number \| string` | `500` | Height of the chart container. When omitted and the container already has a height of its own (a CSS rule, an inline style, a flex or grid track), the chart fills the container and follows its size; a container sized only by its content gets `500`. |
| `pixelsPerDay` | `number` | _auto-fit_ | Continuous zoom level. The header tier (year/quarter/month/week/day/hour/minute) is auto-picked from this value. Reference points: `0.5` ≈ year, `1.6` ≈ quarter, `4.9` ≈ month, `25.7` ≈ week, `80` = day. Bounds clamp to roughly `[0.25, 7680]`. **When omitted**, the chart auto-fits the data span into the visible timeline area on first render; supply an explicit value (or zoom via the toolbar) to take control. |
| `snapUnit` | `'day' \| 'hour' \| 'minute'` | `'day'` | Granularity at which task drag, resize, and inline edits snap. Independent of timeline header tier. |
| `snapValue` | `number` | `1` | Multiplier applied to `snapUnit`, e.g. `snapUnit: 'minute', snapValue: 15` → 15-min steps. |
| `inputDateFormat` | `string` | `'MM-DD-YYYY'` | dayjs-compatible format used to parse `startTime` / `endTime` values. Include time tokens (e.g. `'YYYY-MM-DD HH:mm'`) to enable sub-day editing: inline-edit inputs switch to `datetime-local` automatically. The same format displays dates (task list, tooltips, task form), and it reads the tokens listed in [Pattern tokens](#pattern-tokens), so `Q`, `Do`, `k`, `w`, `W`, `X`, `x` and `L` print values; wrap literal text in `[ ]`. The chart logs one warning when such a letter appears outside brackets. |
| `locale` | `{ pack?: GanttLocalePack, tag?: string, direction?: 'ltr' \| 'rtl' \| 'auto', dateLocale?: GanttDateLocale, messages?: GanttMessagesInput, timelineHeaderFormat?: TimelineHeaderFormat, displayDateFormat?: string, crosshairFormat?: GanttCrosshairFormat }` | `{ direction: 'ltr' }` | Localization, locale pack, date-locale, display dates and text direction. See [Localization & RTL](#localization--rtl). |
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
| `barBackgroundColor` | `string` | `'#87B7FE'` (light) / `'#818CF8'` (dark) | Default background fill color for task bars. When you do not pass it, `--apex-gantt-bar-fill` on the container sets it, then `--apx-accent`; a task's own `barBackgroundColor` wins over all of them. See [Family theme tokens](#family-theme-tokens---apx-). |
| `barBorderRadius` | `string` | `'5px'` | CSS border-radius applied to task bars. Not scaled by `--apx-radius-factor` (see [Corner radius](#corner-radius)). |
| `barMargin` | `number` | `8` | Top and bottom margin inside each row for the task bar. |
| `barTextColor` | `string` | `'#FFFFFF'` | Text color rendered inside task bars. A task's own `barTextColor` wins. |
| `barLabel` | `BarLabelOptions` | `{ position: 'right', field: 'name' }` | Per-task bar label. Defaults to `position: 'right'` so labels stay visible regardless of bar width. Set `position: 'inside'` to render centered inside the bar, `'left'` to render before it, or `'auto'` to pick between `'inside'` and `'right'` based on bar width; supply `render: (task) => string \| HTMLElement` to compose the name with chips, icons, or owner info. When `position: 'left'`, the timeline auto-reserves `120px` of leading space so labels don't disappear under the task-list panel — tune via `barLabel.leadingPadding`. Outside labels are not currently rendered for milestones. |
| `summaryBarColor` | `string` | `'#94A3B8'` (light) / `'#8FBCBC'` (dark) | Fill color for summary (group) bars. |
| `milestoneColor` | `string` | `'#7C3AED'` (light) / `'#A78BFA'` (dark) | Fill color for milestone diamonds. |
| `arrowColor` | `string` | `'#94A3B8'` (light) / `'#94A3B8'` (dark) | Color of dependency arrows between tasks. Subtle slate-gray by default so links don't compete with bars. When you do not pass it, `--apex-gantt-dependency-line` on the container sets it, then `--apx-grid`. |
| `dependencies` | `DependencyOptions` | `{}` | Polish + editing for dependency arrows: `cornerRadius` (rounded joints), `hitWidth` (invisible thicker stroke for hover/click targeting), `tooltipTemplate: (ctx) => string` (HTML on hover; requires non-zero `hitWidth`), `classBuilder: (ctx) => string \| string[]` (per-arrow CSS class for cross-team / blocked / etc), `editable: boolean` (hover darkens the arrow, click selects it and reveals a "✕" affordance: click the ✕ or press <kbd>Delete</kbd> to remove via the undoable command path; on bar hover two anchor circles appear at the bar's start/finish edges, and dragging from one to another bar draws a dashed preview that commits the new dependency on release; the (source-anchor, target-anchor) pair determines the type: right→left FS, left→left SS, right→right FF, left→right SF), `allowSummaryDescendantLinks: boolean` (allow edges between a summary task and its descendants, drawn or added with `gantt.addDependency()`; off by default since such edges confuse downstream date math). When `editable: true`, `hitWidth` is auto-bumped to at least `12` if unset. The `ctx` carries `fromTask`, `toTask`, `type`, and `lag`. |
| `calendar` | `CalendarOptions` | `undefined` | Working-calendar config. When set, weekends and holidays drive duration math, summary aggregation, and timeline stripes: durations stop counting calendar days and start counting working days. Any `calendar` object turns it on, even `{}`, which gives a Monday to Friday week, except one that holds only `weekStart` and `fiscalYearStartMonth` (those two shape the timeline header alone). Leave the option out and every day is a working day (no stripes, no snap). Fields: `workingWeekdays: number[]` (0 = Sunday to 6 = Saturday; default `[1, 2, 3, 4, 5]`; numeric strings are read as numbers, and a list naming no weekday from 0 to 6 logs a warning and uses Monday to Friday), `holidays: Array<string \| Date \| { date, label? }>` (non-working dates regardless of weekday; mixed forms allowed; strings are read with `inputDateFormat` like task dates, and ISO `YYYY-MM-DD` always works), `showNonWorkingStripes: boolean` (tint weekend and holiday columns, over the row backgrounds and under the bars, arrows and annotations; default `true`), `holidayTooltip: (ctx) => string` (optional HTML shown while the pointer is over a holiday column of the timeline, bars excepted; `ctx.date` is the Date, `ctx.label` is whichever string was supplied in the matching entry), `dragSnapMode: 'next' \| 'previous' \| 'allow'` (what happens when a drag/resize commits onto a non-working day: `'next'` (default) snaps forward, `'previous'` snaps backward, `'allow'` permits non-working start/end. Drag preserves the source task's working-day duration across the snap; resize snaps the moving endpoint only. No effect when `snapUnit !== 'day'` or the input format carries time tokens), `weekStart: number` (first day of the week, 0 = Sunday to 6 = Saturday: week cells in the timeline header start on it and week numbers follow it; default: the `locale.dateLocale`'s own week start, so Monday for `de` and Saturday for `ar`, else Sunday; any other value logs a warning and is ignored), `fiscalYearStartMonth: number` (first month of the fiscal year, 1 = January to 12; default `undefined`, calendar years. Setting any valid month, `1` included, turns fiscal-year mode on: quarter and year cells start on fiscal boundaries and their built-in labels read as fiscal periods, a fiscal year named by the calendar year it starts in, so with `4` the cell from April 2026 to March 2027 reads `FY2026` and its first quarter `#1 Apr-Jun`, and with `1` the cells stay on calendar boundaries but read `FY2026` and `#1 Jan-Mar`. It also switches on the `fiscal` rows of `locale.timelineHeaderFormat` and sets `ctx.fiscal` for label functions; see [Calendar and fiscal years](#calendar-and-fiscal-years). Month, week and day cells are unaffected; any other value logs a warning and is ignored, as if unset). `update({calendar})` rebuilds the calendar and `update({calendar: undefined})` turns it off; a theme change keeps it. |
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
| `reorderableColumns` | `boolean` | `true` | Allow columns to be reordered by dragging a column header left or right onto another column (a drop indicator shows the insertion point). The new order is reflected in the grid, included in `getState()` / `setState()`, and emitted as a `columnReorder` event. Also available programmatically via `gantt.setColumnOrder()`. See [Column Configuration](#column-configuration). |
| `persistState` <a id="uistate"></a> | `boolean \| { key?: string }` | `false` | Persist and restore the UI view state (zoom, scroll, sort, filter, collapse, selection) via `localStorage`. `true` uses the default key (`'apexgantt-state'`); an object sets a custom `key`. Restored on the first `render()`; saved (debounced) whenever the view changes. Also available programmatically via `gantt.getState()` / `gantt.setState()`. See [UI state persistence](#ui-state-persistence). |
| `enableInlineEdit` | `boolean` | `false` | Allow editing task fields directly in the task-list cells (double-click to edit `name`, `startTime`, `endTime`, `duration`, `progress`). Auto-enabled when `enableTaskEdit` is `true`; set explicitly to `false` to opt out. See [Inline Editing](#inline-editing). |
| `enableTaskDrag` | `boolean` | `true` | Allow task bars to be dragged horizontally on the timeline to reschedule them (start and end move together, snapped to `snapUnit`); dragging a parent moves its children too. It does not reorder rows, and drawing dependency links is `dependencies.editable`. Each move runs `beforeTaskUpdate`, is undoable, and fires `taskDragged`. |
| `enableTaskEdit` | `boolean` | `false` | Open the task-edit dialog (name, start, end, progress) when a task bar is double-clicked, or when Enter is pressed on a focused bar or task-list row. Saving runs `beforeTaskUpdate` with only the changed fields. Also turns on `enableInlineEdit` unless that is set explicitly. |
| `enableTaskResize` | `boolean` | `true` | Allow task bars to be resized by dragging their handles. |
| `enableDrawTask` | `boolean` | `false` | Allow creating a task by dragging across an empty stretch of the timeline: press on an empty row, drag horizontally to sweep out the date range, and release to add a task with those (snapped) start/end dates. Press `Escape` mid-drag to cancel. Off by default so existing empty-area drags stay inert. Respects `beforeTaskAdd` and is recorded in undo history. See [Drawing tasks on the timeline](#drawing-tasks-on-the-timeline). |
| `enableScrollButtons` | `boolean` | `false` | Show a small chevron at the edge of a task's row when that task's bar is scrolled out of the visible timeline window; clicking it scrolls the bar back into view (nearest-edge). Also available programmatically via `gantt.scrollToTask()`. |
| `scrollToTaskOnRowClick` | `boolean` | `false` | Clicking a task-list row scrolls that task's bar into view (nearest-edge, horizontal and vertical), the same as calling `gantt.scrollToTask()`. Composes with `enableSelection` (a single click both selects the row and reveals its bar). Clicks on the checkbox, the toggle chevron, or an active inline-edit input are ignored. |
| `enableProgressDrag` | `boolean` | `true` | Allow editing task progress by dragging the small handle that appears at the bottom of the bar on hover. Snaps to whole percent on commit and emits a `taskProgressChanged` event. |
| `enableTaskEditingShortcuts` | `boolean` | `false` | Enable keyboard shortcuts on the task-list panel: `Delete` / `Backspace` removes the focused task (cascade: children), `Tab` indents under the previous sibling, `Shift+Tab` outdents to the grandparent. Off by default; opt in once you've decided the shortcuts fit your app. All operations are recorded in the undo history and respect `beforeTaskDelete` / `beforeTaskMove` hooks. |
| `enableTaskCRUDToolbar` | `boolean` | `false` | Show built-in `+ Add task` and trash-icon `Delete` buttons in the toolbar. Delete is auto-disabled when nothing is selected and deletes every selected task (cascade: children) on click; Add inserts a root-level "New task" using placeholder dates derived from the current project span. Combine with `enableSelection: true` for the delete button to be useful. |
| `enableContextMenu` | `boolean` | `false` | Show a built-in right-click menu on task bars and task-list rows with entries for Edit, Add child / sibling task, Indent, Outdent, and Delete (cascade). Entries are gated by capability — Edit only when `enableTaskEdit` is on; Indent/Outdent only when the move is legal. Off by default so consumers can ship their own menu without competing. |
| `enableAddTaskRow` | `boolean` | `false` | Render a single-line `+ Add task` row at the bottom of the task list that inserts a new root-level placeholder task on click (or Enter / Space). Hidden while row virtualisation is active, which is whenever more than 50 rows are visible (collapsed and filtered-out rows do not count). |
| `history` | `{ enabled?: boolean; maxSize?: number }` | `{ enabled: true, maxSize: 100 }` | Configures the undo/redo history. Every mutating call (drag, resize, inline / dialog edit, add, delete, move, dependency change) is recorded unless `enabled: false`. Use `gantt.undo()` / `gantt.redo()` to traverse, `gantt.canUndo()` / `gantt.canRedo()` to gate UI affordances, and the `historyChange` event to react to changes. The toolbar shows Undo/Redo buttons when `enableTaskCRUDToolbar` is on and history is enabled; Ctrl/Cmd+Z and Ctrl+Y / Ctrl+Shift+Z trigger undo/redo from anywhere inside the chart (except text inputs). |
| `enableTooltip` | `boolean` | `true` | Show a tooltip on task-bar hover. |
| `enableSelection` | `boolean` | `false` | Enable row selection (click, Ctrl+Click, Shift+Click, keyboard). |
| `beforeTaskAdd` | `(ctx) => boolean \| void` | `undefined` | Veto hook called immediately before `gantt.addTask()` inserts a task (also the toolbar Add button, the add-task row and drawing a task). Return `false` to cancel the insertion. `ctx` is one object, `{ input, parentId? }`, where `parentId` is the parent the task will land under: the `addTask()` option, else `input.parentId`, and `undefined` for a root task (including an id that matches no task). Synchronous, like every hook: a returned Promise is not a veto. |
| `beforeTaskUpdate` | `(ctx) => boolean \| void` | `undefined` | Veto hook called before every task edit is applied: drag, resize, progress drag, keyboard move / resize, dialog save, inline edit, `gantt.updateTask()` (and `splitTask()`). `ctx` is one object, `{ task, updates }`: the task as it is now and the fields about to change (only the changed fields for a dialog save). Return `false` to reject; the bar is repainted from the model and no `taskUpdate`, `taskDragged`, `taskResized` or `taskProgressChanged` fires. Rejecting a parent drag (or a parent's keyboard move) also skips the children moved with it; rejecting one of those children keeps only that child in place, and the hook is still asked about the others. Not called for undo / redo. Synchronous: a returned Promise is not a veto. |
| `beforeTaskMove` | `(ctx) => boolean \| void` | `undefined` | Veto hook called immediately before `gantt.moveTask()` re-parents a task (also keyboard indent / outdent and the context menu). Return `false` to cancel. `ctx` is one object, `{ task, oldParentId?, newParentId? }`. Synchronous: a returned Promise is not a veto. |
| `beforeTaskDelete` | `(ctx) => boolean \| void` | `undefined` | Veto hook called immediately before `gantt.deleteTask()` removes a task. Return `false` to cancel. `ctx` is `{ task, descendantIds, cascade: 'forbid' \| 'children' \| 'orphan' }`. `descendantIds` is empty for `'orphan'` since children survive. |
| `beforeDependencyChange` | `(ctx) => boolean \| void` | `undefined` | Veto hook called immediately before `gantt.addDependency()` / `gantt.removeDependency()` mutate an edge. Return `false` to cancel. `ctx` is `{ change: 'add'\|'remove', fromId, toId, type, lag }`. |
| `showCheckboxColumn` | `boolean` | `true` | Show a checkbox column for multi-select. Only applies when `enableSelection` is true. |
| `enableCriticalPath` | `boolean` | `false` | Calculate and highlight the critical path through dependent tasks. |
| `criticalBarColor` | `string` | `'#E53935'` (light) / `'#F87171'` (dark) | Fill color for task bars on the critical path. |
| `criticalArrowColor` | `string` | `'#E53935'` (light) / `'#F87171'` (dark) | Stroke color for dependency arrows on the critical path. |
| `enableCrosshair` | `boolean` | `false` | Show a vertical crosshair line that follows the cursor across the timeline, with a label showing the precise date/time at the pointer position. |
| `crosshairColor` | `string` | `'#3B82F6'` (light) / `'#818CF8'` (dark) | Color of the crosshair line and the label background. |
| `crosshairLabelFormat` | `(date, tier) => string` | _auto_ | Custom formatter for the crosshair label. Receives the date under the cursor and the active sub-tier (`'minute' \| 'hour' \| 'halfday' \| 'day' \| 'week' \| 'month' \| 'quarter' \| 'year'`). When omitted, the label auto-adapts to the active tier: `'ddd MM/DD/YYYY'` for day-and-coarser tiers, `'MM/DD HH:mm'` for halfday/hour/minute tiers (change both patterns with `locale.crosshairFormat`), with weekday names from `locale.dateLocale` when one is set. |
| `baseline` | `Partial<BaselineOptions>` | `undefined` | When `enabled: true`, renders a thin baseline bar below each task bar. Hovering the baseline shows a tooltip with its planned start/end dates. When `rowHeight` isn't explicitly set, the default rowHeight is bumped to make room for the baseline without squeezing the actual bar. Fields: `color: string` (fill / stripe color; when omitted it defaults to the task bar's progress shade, i.e. the darker tone of the bar drawn above, so the baseline matches its bar; set an explicit color to override), `striped: boolean` (fill the bar with thick diagonal stripes instead of a flat color; default `true`), `stripeColor: string` (color of the gaps between stripes; default `'#FFFFFF'`), `stripeWidth: number` (px width of each stripe band, larger values = thicker; default `3`), `stripeAngle: number` (stripe angle in degrees; default `45`). By default baselines render as thick diagonal stripes tinted with the bar's progress color over a white background; set `striped: false` for a solid fill. |
| `tooltipId` | `string` | `'apexgantt-tooltip-container'` | HTML `id` for the tooltip container element. |
| `tooltipTemplate` | `(task, dateFormat, context) => string` | built-in | Custom function returning an HTML string for the task tooltip. `context` is a `TooltipTemplateContext`: `context.durationText` is the task's duration exactly as the Duration column shows it (`'45 m'`, `'5 wd'`), so a template need not repeat the snap and calendar rules, and `context.messages` holds the chart's resolved strings (`locale.messages` over the English defaults), so a template can reuse the translated `tooltip*Label` keys. `context.startText` and `context.endText` are the task's start and end as the task list shows them (in `locale.displayDateFormat` when one is set, else `inputDateFormat`), and `context.tag` is the chart's resolved `locale.tag` (else the pack's), so a template's `{n, number}` and `{n, plural, ...}` format as the task list does. Two-argument functions still work. The result is written as HTML: pass task text through the exported `escapeHtml`, as the built-in template does. |
| `tooltipBorderColor` | `string` | `'#E5E7EB'` (light) / `'#444444'` (dark) | Border color of the tooltip. |
| `tooltipBGColor` | `string` | `'#FFFFFF'` | Background color of the tooltip. |
| `fontColor` | `string` | `'#1F2933'` (light) / `'#E0E0E0'` (dark) | Color for all text in the chart. |
| `fontFamily` | `string` | `'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'` | CSS font-family for the chart. |
| `fontSize` | `string` | `'14px'` | CSS font-size for the chart. |
| `fontWeight` | `string` | `'400'` | CSS font-weight for the chart. |
| `annotationBgColor` | `string` | `'#DBEAFE'` (light) / `'#4A2D4D'` (dark) | Background color of annotation markers. |
| `annotationBorderColor` | `string` | `'#60A5FA'` (light) / `'#8B4D8F'` (dark) | Border color of annotation markers. |
| `annotationBorderDashArray` | `number[]` | `[]` | Dash pattern for annotation borders, as an SVG stroke-dasharray (dash and gap lengths in px), e.g. `[6, 3]`. `[]` draws a solid border. An annotation's own `borderDashArray` wins. |
| `annotationBorderWidth` | `number` | `2` | Border width of annotation markers in pixels. |
| `annotationOrientation` | `Orientation` | `Orientation.Horizontal` | Orientation of annotation labels: `Orientation.Vertical` runs the text up the annotation's edge. It turns only the label: the line or region itself still runs down the task rows. An annotation's own `label.orientation` wins. |
| `annotations` | `Annotation[]` | `[]` | Array of annotation objects to overlay on the timeline. |
| `parsing` | `ParsingConfig` | `undefined` | Field-mapping config to parse non-standard task shapes. See Data Parsing below. Passing `parsing` to `update()` re-parses the raw rows (the last `series`, or the one passed with it) and replaces the data. |
| `toolbarItems` | `ToolbarItem[]` | `[]` | Custom controls rendered in the toolbar alongside the built-in zoom and export buttons. Each item can be a `ToolbarButton`, `ToolbarSelect`, or `ToolbarSeparator`. |
| `taskListAriaLabel` | `string` | `'Gantt task list'` | `aria-label` for the task-list table, used by screen readers. Wins over the `taskListAriaLabel` message. |

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
| `pack` | `GanttLocalePack` | `undefined` | A locale pack: plain JSON-safe data (`tag`, `status`, `dir`, `messages`, `dateLocale`, `timelineHeaderFormat`, `displayDateFormat`, `displayDateTimeFormat`, `crosshairFormat`, `weekStart`, `fiscalYearStartMonth`) applied as the base layer under every other `locale` field. Each explicit `locale.*` field wins over the pack's value (`messages` and `timelineHeaderFormat` key by key and row by row), and `calendar.weekStart` and `calendar.fiscalYearStartMonth` win over the pack's. A pack that sets `fiscalYearStartMonth` puts the chart in fiscal-year mode exactly as `calendar.fiscalYearStartMonth` does, so a language pack should leave it unset (the first-party `ja` pack does). A pack never turns working days on. Object only: a string logs one warning per chart and is ignored. `update({ locale: { pack: undefined } })` returns to English. |
| `tag` | `string` | `undefined` (the pack's `tag`) | BCP 47 language tag such as `'ja'` or `'ja-JP'`. When one resolves it is set as the `lang` of the chart root (a `lang` the host set comes back when the tag goes, and on `destroy()`), and it sets the plural rules and number formatting of message templates, the collation of text sorting and grouping, and turns the progress fields (task form and inline editor) into text fields with a decimal keyboard, so a full-width IME value such as `５０` is read as 50. Without a tag or pack the root's `lang` is never touched and the fields are unchanged. A malformed tag (such as `'ja_JP'`, which should be `'ja-JP'`) is ignored as if unset. |
| `displayDateFormat` | `string` | `undefined` | dayjs pattern for read-only dates: the task list Start, End, Baseline Start and Baseline End columns and the bar, milestone and baseline tooltips, formatted in the date locale. Editors keep `inputDateFormat`, and stored dates are unchanged. Unset: the pack's `displayDateTimeFormat` when `inputDateFormat` has time tokens, else the pack's `displayDateFormat`, else `inputDateFormat` as before. |
| `crosshairFormat` | `GanttCrosshairFormat` | `undefined` | Patterns of the default crosshair label: `date` for day-and-coarser tiers (default `'ddd MM/DD/YYYY'`) and `time` for halfday, hour and minute tiers (default `'MM/DD HH:mm'`). Each wins over the pack's; the top-level `crosshairLabelFormat` function wins over both. |
| `direction` | `'ltr' \| 'rtl' \| 'auto'` | `'ltr'` | Text/layout direction. `'rtl'` sets `dir="rtl"` on the container (flowing the toolbar, task list, task form, context menu, and tooltips right-to-left and moving the task-list panel to the right) **and mirrors the timeline time axis** so time flows right-to-left: the earliest date sits on the right, bars/header cells/grid lines/non-working stripes/dependency arrows/annotations are all mirrored, progress fills from the start (right) edge, and drag/resize/progress interactions are direction-aware. `'auto'` defers to the document/element. When it is not set, the pack's `dir` applies. |
| `dateLocale` | `GanttDateLocale` (a `dayjs/locale/*` object, or the same data with `meridiem` as an `[am, pm]` pair and `ordinal` as a `'{n}日'` template) | `undefined` (the pack's `dateLocale`) | Month, weekday and AM/PM names in the timeline header, the dates in bar aria-labels (in the locale's own long date format, `LL`) and the weekday in the default crosshair label. Its week start also sets where week cells start, unless `calendar.weekStart` is set. Its name is set as the `lang` of the timeline header rows, which hold only text in that locale, so the browser draws it with that language's fonts and screen readers read it in that language; the rest of the chart keeps the page's `lang`. The header keeps the built-in English word order (`12月 2025`); change it with `timelineHeaderFormat`. Dates shown with `inputDateFormat` (task list, tooltips, task form) are not affected unless `displayDateFormat` is set. Import the dayjs locale object and pass it; ApexGantt registers it on its own bundled dayjs, so you do not need to configure dayjs yourself. |
| `messages` | `GanttMessagesInput` | `{}` | Overrides any subset of the generated strings (toolbar, including the Zoom In / Zoom Out buttons and the selection count, context menu, task form + validation, bar and baseline tooltip labels and values, column titles, durations, the add-task row, the export file name, filter operators, and every aria-label). Unset keys keep the pack's text, else their English defaults, exported as `DEFAULT_GANTT_MESSAGES`. Each function key (`editTaskTitle`, `groupCountLabel` and the rest) also takes a template string such as `'Edit: {name}'`, with `{n, number}` and `{n, plural, one {...} other {...}}` formatted in `tag`, so the whole object can be JSON. A function you pass is used as is. |
| `timelineHeaderFormat` | `TimelineHeaderFormat` | `undefined` | Timeline header labels per tier (`minute`, `hour`, `halfday`, `day`, `week`, `month`, `quarter`, `year`) and row (`top`, `sub`), in place of the built-in labels. Each row takes a dayjs pattern string (used at every width; a label wider than its cell is cut with an ellipsis), an array of `{ minWidth?, format }` candidates (sorted widest-first by the chart; the first that fits the cell is used, the narrowest below that), or a function `(date, ctx) => string` (`ctx` carries `tier`, `position`, `cellWidth`, `end`, `week`, `quarter`, `fiscalYear`, `fiscalQuarter`, `fiscal`, `locale` and a `format(pattern, date?)` helper). Patterns also take `{end:PATTERN}` (the cell's last instant), `{fy}` and `{fq}` (the fiscal year and quarter, see `calendar.fiscalYearStartMonth`); `YYYY` and `Q` stay calendar-based. An optional `fiscal` block holds rows used only while a fiscal year is in use (`calendar.fiscalYearStartMonth` or the pack's set to a valid month), so one format reads `2026年` with calendar years and `2026年度` with fiscal ones; see [Calendar and fiscal years](#calendar-and-fiscal-years). Code that walks a format's values meets that block beside the tier rows, so it skips the `fiscal` key; `TimelineHeaderTierRows` types the tier rows alone (the format without `fiscal`, and the `fiscal` block itself). Output is HTML-escaped. A formatter that throws falls back to the built-in label and logs one warning per row per chart. Rows left unset keep the built-in labels; `minute.top`, `halfday.top` and `quarter.top` never render. |

With `direction: 'rtl'` the timeline opens scrolled to its start, which sits at the right edge, and keeps the view across re-renders, zooms, `scrollToTask()` and `setState({scroll})`. Horizontal scroll offsets in `GanttUiState` (`getState().scroll.horizontal`) are measured from where the time axis starts: the left edge in LTR and the **right** edge in RTL, so `0` is the start of the timeline in both and a saved state restores the same dates even when the timeline has grown. Arrow keys on a focused bar follow the screen, so under RTL `ArrowRight` moves a bar earlier (see [Keyboard and screen readers](#keyboard-and-screen-readers)).

`GanttMessages` keys include: `zoomIn`, `zoomOut`, `addTask`, `deleteSelected`, `undo`, `redo`, `exportAsSvg`, `exportAsPng`, `exportAsPdf`, `quickFilterPlaceholder`, `filterButton`, `filterHeading`, `filterMatchLabel`, `filterMatchAll`, `filterMatchAny`, `filterAddCondition`, `filterApply`, `filterClear`, `filterRemoveCondition`, `filterNoConditions`, `filterOperatorLabel(operator)`, `groupNone`, `groupCountLabel(count)`, `exportFailedNoChart`, `exportFailedGeneric`, `editTask`, `addChildTask`, `addSiblingTask`, `indent`, `outdent`, `deleteTask`, `deleteTaskWithChildren`, `formTaskName`, `formStartDate`, `formEndDate`, `formProgress`, `formSubmit`, `editTaskTitle(name)`, `validationStartRequired`, `validationEndRequired`, `validationEndAfterStart`, `validationNameRequired`, `validationProgressRequired`, `validationProgressRange`, `addTaskRowLabel`, `baselineLabel`, `startLabel`, `endLabel`, `tooltipTaskLabel`, `tooltipStartLabel`, `tooltipEndLabel`, `tooltipDurationLabel`, `tooltipProgressLabel`, `tooltipDateLabel`, `tooltipDependsOnLabel`, `summaryAriaLabel(ctx)`, `barAriaLabel(ctx)`, `barAriaValueText(ctx)`, and `progressAriaLabel(name)`, plus the keys in the table below. The bar builders (`summaryAriaLabel`, `barAriaLabel`, `barAriaValueText`) also receive `ctx.task`, the bar's task with its current values, for labels that need more than its name and dates.

The keys below (new in 3.22) are strings; a `{name}` in one is filled with that param, and `{n, number}` and `{n, plural, ...}` work as in the function keys' templates. Each default is the English text the chart rendered before the key existed, so English output is unchanged.

| Key | Default | Params | Used for |
| --- | --- | --- | --- |
| `columnName` | `Task Name` |  | Title of the `name` column (`columnConfig[].title` wins over every `column*` key). |
| `columnStartTime` | `Start` |  | Title of the `startTime` column. |
| `columnEndTime` | `End` |  | Title of the `endTime` column. |
| `columnDuration` | `Duration` |  | Title of the `duration` column. |
| `columnProgress` | `Progress` |  | Title of the `progress` column. |
| `columnProgressRing` | `Progress` |  | Title of the `progressRing` column. |
| `columnAssignees` | `Assignees` |  | Title of the `assignees` column. |
| `columnPredecessors` | `Predecessors` |  | Title of the `predecessors` column. |
| `columnSuccessors` | `Successors` |  | Title of the `successors` column. |
| `columnBaselineStart` | `Baseline Start` |  | Title of the `baselineStart` column. |
| `columnBaselineEnd` | `Baseline End` |  | Title of the `baselineEnd` column. |
| `columnBaselineVariance` | `Variance` |  | Title of the `baselineVariance` column. |
| `columnWbs` | `WBS` |  | Title of the `wbs` column. |
| `durationDays` | `{count} d` | `count` | A duration in calendar days (Duration and Variance columns, tooltip). The variance sign stays outside: `+2 d`. |
| `durationWorkingDays` | `{count} wd` | `count` | A duration in working days. |
| `durationHours` | `{count} h` | `count` | A duration in hours (`snapUnit: 'hour'`). |
| `durationMinutes` | `{count} m` | `count` | A duration in minutes (`snapUnit: 'minute'`). |
| `progressValue` | `{value}%` | `value` | A progress value: the Progress column, the tooltip, the progress-drag label. |
| `listSeparator` | `, ` |  | Separator between assignee names in the Assignees column. |
| `tooltipDependencyValue` | `{taskId} · {type}{lag}` | `taskId`, `type`, `lag` | Value of the tooltip's dependency row. |
| `dependencyLag` | ` ({lag}d)` | `lag` | A non-zero lag, signed (`+2`); the leading space is part of the default. |
| `dependencyTypeFS` | `FS` |  | Finish-to-start (an unknown type prints as it is). |
| `dependencyTypeSS` | `SS` |  | Start-to-start. |
| `dependencyTypeFF` | `FF` |  | Finish-to-finish. |
| `dependencyTypeSF` | `SF` |  | Start-to-finish. |
| `selectedCount` | `{count} selected` | `count` | Toolbar selection count, shown while tasks are selected. |
| `newTaskName` | `New task` |  | Name of a task added from the toolbar, the context menu or by drawing. |
| `exportFileName` | `gantt-chart-{timestamp}` | `timestamp` | Exported file name; the extension is added after it. |
| `filterOperatorContains` | `contains` |  | Filter operator; likewise `filterOperatorNotContains` (`does not contain`), `filterOperatorEquals` (`equals`), `filterOperatorNotEquals` (`does not equal`), `filterOperatorStartsWith` (`starts with`), `filterOperatorEndsWith` (`ends with`), `filterOperatorGt` (`greater than`), `filterOperatorGte` (`greater or equal`), `filterOperatorLt` (`less than`), `filterOperatorLte` (`less or equal`), `filterOperatorBefore` (`before`), `filterOperatorAfter` (`after`), `filterOperatorOn` (`on`), `filterOperatorIsEmpty` (`is empty`) and `filterOperatorNotEmpty` (`is not empty`). `filterOperatorLabel` reads them. |
| `summaryAriaLabelExpand` | `{name} (summary) \u2014 expand` | `name` | Label of a summary bar that can expand (written here with the escape for U+2014). |
| `summaryAriaLabelCollapse` | `{name} (summary) \u2014 collapse` | `name` | Label of a summary bar that can collapse. |
| `barAriaLabelWithProgress` | `{name}: {start} to {end}, {progress}% complete` | `name`, `start`, `end`, `progress` | Label of a read-only bar. |
| `progressRingAriaLabel` | `{value} percent complete` | `value` | Progress-ring cell label. |
| `taskListAriaLabel` | `Gantt task list` |  | Task-list label (the `taskListAriaLabel` option wins). |
| `timelineHeaderAriaLabel` | `Timeline header` |  | Timeline header label. |
| `selectAllAriaLabel` | `Select all tasks` |  | Header checkbox label. |
| `selectTaskAriaLabel` | `Select {name}` | `name` | Row checkbox label. |
| `expandAriaLabel` | `Expand {name}` | `name` | Expand chevron of a task or group. |
| `collapseAriaLabel` | `Collapse {name}` | `name` | Collapse chevron of a task or group. |
| `columnHeaderAriaLabel` | `{title}, {sortState}{sortPosition}` | `title`, `sortState`, `sortPosition` | Label of a sortable column header. |
| `sortAscending` | `sorted ascending` |  | `sortState` of an ascending column. |
| `sortDescending` | `sorted descending` |  | `sortState` of a descending column. |
| `sortNone` | `not sorted` |  | `sortState` of an unsorted column. |
| `sortPosition` | `, sort position {position}` | `position` | `sortPosition` in a multi-column sort (`''` otherwise). |
| `resizeColumnAriaLabel` | `Resize {title} column` | `title` | Column resize handle. |
| `resizePanelsAriaLabel` | `Resize panels` |  | Splitter between the task list and the timeline. |
| `scrollToTaskEarlier` | `Scroll to task (earlier)` |  | Scroll button toward earlier dates. |
| `scrollToTaskLater` | `Scroll to task (later)` |  | Scroll button toward later dates. |
| `dependencyAriaLabel` | `Dependency from {from} to {to}` | `from`, `to`, `fromName`, `toName` | Dependency arrow (`from`/`to` are task ids, `fromName`/`toName` their names). |
| `removeDependencyAriaLabel` | `Remove dependency from {from} to {to}` | `from`, `to`, `fromName`, `toName` | Remove-dependency button. |
| `closeDialog` | `Close dialog` |  | Dialog close button. |

Messages are inserted as text or HTML, depending on where they appear, exactly as before: message text is never escaped for you, while task data in params (names, ids) keeps the escaping it always had. Do not put untrusted input in messages. The two messages that end up in an attribute inside HTML markup (`progressRingAriaLabel` and `closeDialog`) are escaped as a whole.

#### Function keys as templates

Each of the seven function keys also takes a template string, so a dictionary of strings (JSON, or Blazor's `Dictionary<string, string>`) can set them. A function you pass is used as it is. A key whose companion key is set (for example `summaryAriaLabelExpand`) picks the companion or its own text by context:

| Function key | Its template (English) | Params and companions |
| --- | --- | --- |
| `filterOperatorLabel` | `{operator}` | `operator` is the operator's `filterOperator*` text (`filterOperatorGt` for `gt`), so setting those 15 keys is usually enough. |
| `groupCountLabel` | `({count})` | `count` |
| `editTaskTitle` | `Edit Task: {name}` | `name` |
| `summaryAriaLabel` | `{name} (summary)` | `name`. A summary bar that can toggle reads `summaryAriaLabelExpand` when collapsed and `summaryAriaLabelCollapse` when expanded. |
| `barAriaLabel` | `{name}: {start} to {end}` | `name`, `start`, `end`. A read-only bar, which reports `progress`, reads `barAriaLabelWithProgress`. |
| `barAriaValueText` | `{start} to {end}, {durationDays} days` | `start`, `end`, `durationDays` |
| `progressAriaLabel` | `{name} progress` | `name` |

The seven `tooltip*` keys label the built-in bar tooltip; their defaults are the English labels it has always shown (`'Task:'`, `'Start:'`, `'End:'`, `'Duration:'`, `'Progress:'`, `'Date:'`, `'Depends on:'`). They are separate from the baseline tooltip's `startLabel` and `endLabel`, so the two tooltips can be worded differently. The values follow the other keys: dates use `displayDateFormat` when one is set (else `inputDateFormat`), the duration uses the `duration*` keys, the progress `progressValue`, and a dependency `tooltipDependencyValue`, `dependencyLag` and the `dependencyType*` keys.

Search keys are folded before they are compared: the quick filter and the filter builder's text operators apply Unicode NFKC to both sides, so full-width and other compatibility forms match their plain forms (`ＡＢＣ` finds `abc`, `ｶﾞ` finds `ガ`). What is shown is never changed. While an input method is composing, the quick filter waits for the composition to end, and an Enter that confirms a conversion does not commit an inline edit.

Default tooltip template. `m` is `context.messages`; each label falls back to its English literal when the template is called without a context, and `formatMessage` is the template filler exported by `apex-commons`.

```js
tooltipTemplate(task, dateFormat, context) {
    const m = context?.messages;
    const text = (key) => m?.[key] ?? DEFAULT_GANTT_MESSAGES[key];
    const items = [
      `<div>
        <strong>${m?.tooltipTaskLabel ?? 'Task:'}</strong>
        <span>${escapeHtml(task.name)}</span>
      </div>
      `,
    ];

    if (task.type === TaskType.Task) {
      items.push(`
        <div>
          <strong>${m?.tooltipStartLabel ?? 'Start:'}</strong>
          <span>${context?.startText ?? getTaskTextByColumn(task, ColumnKey.StartTime, dateFormat)}</span>
        </div>
        <div>
          <strong>${m?.tooltipEndLabel ?? 'End:'}</strong>
          <span>${context?.endText ?? getTaskTextByColumn(task, ColumnKey.EndTime, dateFormat)}</span>
        </div>
        <div>
          <strong>${m?.tooltipDurationLabel ?? 'Duration:'}</strong>
          <span>${context?.durationText ?? getTaskTextByColumn(task, ColumnKey.Duration, dateFormat)}</span>
        </div>
        <div>
          <strong>${m?.tooltipProgressLabel ?? 'Progress:'}</strong>
          <span>${formatMessage(text('progressValue'), {value: escapeHtml(`${task.progress}`)}, context?.tag)}</span>
        </div>
      `);
    } else if (task.type === TaskType.Milestone) {
      items.push(`
        <div>
          <strong>${m?.tooltipDateLabel ?? 'Date:'}</strong>
          <span>${context?.startText ?? getTaskTextByColumn(task, ColumnKey.StartTime, dateFormat)}</span>
        </div>
      `);
    }

    if (task.dependency) {
      const dep = typeof task.dependency === 'string' ? {taskId: task.dependency, type: 'FS', lag: 0} : task.dependency;
      const type = dep.type ?? 'FS';
      const lag = dep.lag ?? 0;
      const typeText = text(`dependencyType${type}`) ?? escapeHtml(type);
      const lagSuffix =
        lag === 0
          ? ''
          : formatMessage(text('dependencyLag'), {lag: `${lag > 0 ? '+' : ''}${escapeHtml(lag)}`}, context?.tag);
      items.push(`
      <div>
        <strong>${m?.tooltipDependsOnLabel ?? 'Depends on:'}</strong>
        <span>${formatMessage(
          text('tooltipDependencyValue'),
          {taskId: escapeHtml(dep.taskId), type: typeText, lag: lagSuffix},
          context?.tag
        )}</span>
      </div>
    `);
    }

    return items.join('');
  },
```

### Locale packs

A locale pack is one plain-data object, safe to keep as JSON, that sets a whole language at once: the messages, the date names, the header word order, how read-only dates are shown, and the week start that language's users expect. Where the year starts is a planning choice rather than a language one, so a pack is best left without a fiscal year; its header rows can still carry `fiscal` variants that switch on when a user sets one. Pass it as `locale.pack`. It is the base layer: every explicit `locale.*` and `calendar.*` option still wins over it.

ApexGantt ships one first-party pack, Japanese (`ja`). Each pack is a separate file of about 2.8 KB gzip next to the library, so the core bundle does not grow, and you load only the languages you use.

```js
// ESM (bundlers, Node)
import ApexGantt from 'apexgantt';
import {ja} from 'apexgantt/locales/ja';

const gantt = new ApexGantt(document.getElementById('gantt-container'), {
  series: tasks,
  locale: {pack: ja},
});
gantt.render();
```

```js
// CommonJS
const {ja} = require('apexgantt/locales/ja');
```

```html
<!-- CDN: the pack script sets window.ApexGanttLocales.ja, and can load before or after the library -->
<script src="https://cdn.jsdelivr.net/npm/apexgantt@3.23.1/apexgantt.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/apexgantt@3.23.1/locales/ja.min.js"></script>
<script>
  const gantt = new ApexGantt(document.getElementById('gantt-container'), {
    series: tasks,
    locale: {pack: ApexGanttLocales.ja},
  });
  gantt.render();
</script>
```

| Entry | File | Use |
| --- | --- | --- |
| `apexgantt/locales/ja` (import) | `locales/ja.es.min.js` | ESM, with types (`locales/ja.d.ts`). Named export `ja` and the default export. |
| `apexgantt/locales/ja` (require) | `locales/ja.cjs` | CommonJS: `require('apexgantt/locales/ja').ja`, with types (`locales/ja.d.cts`). |
| `locales/ja.min.js` | the same | A classic `<script>` that sets `ApexGanttLocales.ja`. |
| `apexgantt/locales/ja.json` | `locales/ja.json` | The pack as JSON, for tooling or for a server that sends it to the page. |

**React.** Pass the pack in the options: `<ApexGanttChart tasks={tasks} options={{locale: {pack: ja}}} />`. A pack is plain data and every message in it is a string, so the wrapper's structural comparison sees the same options on every render and no memoizing is needed.

**Blazor.** Every message key, the seven function keys included, now takes a string, so `LocaleOptions.Messages` (a `Dictionary<string, string>`) can carry a full translation, for example the `messages` of `locales/ja.json`. Choosing a first-party pack by name arrives with a Blazor-ApexGantt release that bundles the pack files.

#### What the ja pack sets

| Field | Value |
| --- | --- |
| `tag` | `'ja'`: the chart root gets `lang="ja"` (so Japanese glyph shapes are used and screen readers switch voice), message templates use Japanese plural and number rules, and text sorts and groups with Japanese collation. |
| `status` | `'reviewed'` (see below). |
| `messages` | All 123 string keys: every `GanttMessages` key except `filterOperatorLabel`, which reads the 15 `filterOperator*` keys the pack translates. |
| `dateLocale` | The dayjs `ja` data (month and weekday names, `L`/`LL` formats, 午前/午後, `{n}日` ordinals) as plain data. |
| `timelineHeaderFormat` | Japanese word order at every zoom: `2026年` over `第1四半期` zoomed out (`1Q` where a quarter cell is narrower than 96 px; the label is picked per cell, so near 96 px a row can mix the two, as quarters run 90 to 92 days), and further out a single `2026年` row; `2026年` over `1月` at month zoom; `2025年12月` over `12/29～`, `1/5～` at week zoom; `2025年12月29日～` over `29(月)` at day zoom (the date alone in cells narrower than 64 px); `2026年1月5日(月)` (shorter in narrow cells) over 午前/午後 or `15時` further in; `1月5日(月) 15時` (`1/5 15時` in a narrow cell at the edge) over the minutes at the deepest zoom. |
| `displayDateFormat` | `'YYYY/MM/DD'` for the task list and tooltips (`2026/01/05`), or `displayDateTimeFormat` `'YYYY/MM/DD HH:mm'` when `inputDateFormat` has time tokens. Editors keep `inputDateFormat`. |
| `crosshairFormat` | `{date: 'YYYY/M/D(ddd)', time: 'M/D H:mm'}`. |
| `timelineHeaderFormat.fiscal` | `{year: {top: '{fy}年度', sub: '{fy}年度'}}`: the year row reads `2026年度` once a fiscal year is set. |
| `weekStart` | `1`: weeks start on Monday. |

The pack sets no `fiscalYearStartMonth`, so on its own it shows calendar years (`2026年`, January to December) over calendar quarters (`第1四半期` for January to March). For 年度 planning add the fiscal year yourself. April is the right start for most Japanese organizations:

```js
locale: {pack: ja},
calendar: {fiscalYearStartMonth: 4}, // 2026年度 = April 2026 to March 2027, 第1四半期 = April to June
```

The year row then reads `2026年度` and the quarters count from April; nothing else in the pack changes. A `calendar` that holds only `weekStart` and `fiscalYearStartMonth` shapes the header and never turns the working calendar on. The pack's Monday week is overridden the same way: `calendar: {weekStart: 0}` gives Sunday weeks.

Override single messages or header rows the same way: `locale: {pack: ja, messages: {addTask: '追加'}, timelineHeaderFormat: {week: {sub: 'M/D～{end:M/D}'}}}` keeps every other key and row of the pack.

#### Precedence

| Setting | Highest to lowest |
| --- | --- |
| Messages, per key | `locale.messages`, then `pack.messages`, then English |
| Date locale | `locale.dateLocale`, then `pack.dateLocale`, then none |
| Header format, per tier and row, calendar years | `locale.timelineHeaderFormat`, then `pack.timelineHeaderFormat`, then built-in (`fiscal` blocks ignored) |
| Header format, per tier and row, while a fiscal year is in use | `locale.timelineHeaderFormat.fiscal`, then `locale.timelineHeaderFormat`, then `pack.timelineHeaderFormat.fiscal`, then `pack.timelineHeaderFormat`, then the built-in fiscal labels (`FY2026`, `#1 Apr-Jun`) |
| Week start | `calendar.weekStart`, then `pack.weekStart`, then the date locale's `weekStart`, then 0 |
| Fiscal year start | `calendar.fiscalYearStartMonth`, then `pack.fiscalYearStartMonth`, then none (calendar years). A fiscal year is in use whenever either is a valid month, `1` included, so no `calendar` value turns off a pack's fiscal year: leave the key out of the pack instead |
| Direction | `locale.direction` (when you set it), then `pack.dir`, then `'ltr'` |
| Language tag | `locale.tag`, then `pack.tag`, then none |
| Read-only date pattern | `locale.displayDateFormat`, then the pack's `displayDateTimeFormat` (time-bearing `inputDateFormat`) or `displayDateFormat`, then `inputDateFormat` |
| Crosshair label | the `crosshairLabelFormat` function, then `locale.crosshairFormat`, then `pack.crosshairFormat`, then built-in |

A function you pass in `locale.messages` beats the pack's template for that key. `update({locale: {pack: undefined}})` returns the chart to English.

#### Review status

`ja.status` is `'reviewed'` since 3.23.1: Japanese users of ApexGantt reviewed the wording, from the timeline header rows and the fiscal year labels to the filter operators and the screen-reader text. `status` is metadata only; the chart does not read it. The wording can still change in any release; when it does, that release's notes call it out under "Changed". Pin an exact version if your tests or screenshots depend on the labels. Wording comments are still welcome as issues. Packs for other languages start as `'draft'` until a native speaker signs them off.

#### Custom packs

Any object of the `GanttLocalePack` shape works as a pack, so a translation can live in your own code or come from a server as JSON. `tag` and `status` are required; every other field is optional, and the function keys of `messages` take template strings (see [Function keys as templates](#function-keys-as-templates)). A pack's messages are inserted as text or HTML exactly like `locale.messages`, so do not put untrusted input in them. The first-party packs are checked at build time to hold no `<`, `>`, `&` or `"`, so they are safe however they are inserted.

### Timeline header formats

`locale.timelineHeaderFormat` replaces the labels of the timeline header, one tier and row at a time. The header has two rows: a coarse **top** row and a fine **sub** row, each drawn from one of eight tiers (`minute`, `hour`, `halfday`, `day`, `week`, `month`, `quarter`, `year`). Rows you leave unset keep the built-in labels, and the cells themselves (where they start, how wide they are) never change; only the text does.

This recipe gives Japanese labels with Monday weeks, calendar years by default and 年度 labels once a fiscal year is set. The first-party [`ja` pack](#locale-packs) ships these rows and more, so `locale: {pack: ja}` is the shorter route; the recipe shows how the rows are built:

```ts
import ja from 'dayjs/locale/ja';

const gantt = new ApexGantt('#chart', {
  series: tasks,
  // Add fiscalYearStartMonth: 4 for 年度 planning (April to March).
  calendar: {weekStart: 1},
  locale: {
    dateLocale: ja,
    timelineHeaderFormat: {
      year: {top: 'YYYY年', sub: 'YYYY年'},
      // The year row is always above the quarters, so they never repeat it.
      // Q is a token (the calendar quarter), so a literal Q is escaped.
      quarter: {sub: [{minWidth: 96, format: '第{fq}四半期'}, {format: '{fq}[Q]'}]},
      month: {top: 'YYYY年M月', sub: 'M月'},
      week: {top: 'YYYY年M月D日～', sub: 'M/D～'},
      day: {sub: 'D'},
      // Used instead of the rows above only while a fiscal year is in use.
      fiscal: {
        year: {top: '{fy}年度', sub: '{fy}年度'},
      },
    },
    messages: {
      tooltipTaskLabel: 'タスク:',
      tooltipStartLabel: '開始:',
      tooltipEndLabel: '終了:',
      tooltipDurationLabel: '期間:',
      tooltipProgressLabel: '進捗:',
      tooltipDateLabel: '日付:',
      tooltipDependsOnLabel: '先行タスク:',
    },
  },
});
```

At week zoom this reads `2025年12月` over `12/29～`, `1/5～`; zoomed out, `2026年` over `第1四半期` (January to March 2026), or `1Q` where the quarter cell is narrower than 96 px. With `fiscalYearStartMonth: 4` added it reads `2026年度` over `第1四半期` (April to June 2026). A `calendar` that holds only `weekStart` and `fiscalYearStartMonth` shapes the header and leaves every day a working day.

#### Calendar and fiscal years

A fiscal year is in use when `calendar.fiscalYearStartMonth` (or a locale pack's `fiscalYearStartMonth`) is set to a valid month, `1` included. Left unset, the header shows calendar years and quarters. While a fiscal year is in use:

- quarter and year cells start on fiscal boundaries (with `1`, these are the calendar boundaries);
- the built-in quarter and year labels read as fiscal periods: `FY2026`, `#1 Apr-Jun`, or `#1 Jan-Mar` with a January start;
- the rows of the `fiscal` block in `timelineHeaderFormat` replace the rows of the same tier and position;
- a label function sees `ctx.fiscal === true`.

`{fy}` and `{fq}` follow the fiscal year when one is in use and are the calendar year and quarter otherwise, so `'第{fq}四半期'` serves both modes and only the year row needs a fiscal variant. With the recipe above (or the `ja` pack):

| `calendar.fiscalYearStartMonth` | Year row | Quarter row | Narrow quarter (under 96 px) |
| --- | --- | --- | --- |
| not set | `2026年` (January to December) | `第1四半期` (January to March) | `1Q` |
| `4` | `2026年度` (April 2026 to March 2027) | `第1四半期` (April to June) | `1Q` |
| `1` | `2026年度` (January to December) | `第1四半期` (January to March) | `1Q` |

The narrow label is written `'{fq}[Q]'`: a bare `Q` is the calendar quarter token, so `'{fq}Q'` prints `11`, `22`. Candidates are picked per cell, and quarters run 90 to 92 days, so at a zoom that puts the cells either side of 96 px one row shows both `第1四半期` and `1Q`.

While a fiscal year is in use, each tier and row takes the first layer that sets it:

1. `locale.timelineHeaderFormat.fiscal`
2. `locale.timelineHeaderFormat`
3. `pack.timelineHeaderFormat.fiscal`
4. `pack.timelineHeaderFormat`
5. the built-in fiscal labels

So a row you set yourself always wins over the pack, whether or not you also give it a fiscal variant: `locale: {pack: ja, timelineHeaderFormat: {year: {top: 'YYYY'}}}` reads `2026` in both modes. With no fiscal year in use the `fiscal` blocks are ignored and the order is `locale.timelineHeaderFormat`, then the pack's, then built-in. The `fiscal` block is plain data like the rest of the format, so a JSON locale pack can carry it, and switching `calendar.fiscalYearStartMonth` through `update()` switches the rows with it.

Before 3.23.0 the built-in labels read as fiscal periods only when the start month was not January, so `fiscalYearStartMonth: 1` gave calendar labels. It now gives `FY2026` and `#1 Jan-Mar`; leave the option unset for calendar labels. The same holds over a locale pack that sets `fiscalYearStartMonth` (the 3.22.0 `ja` pack did): `calendar.fiscalYearStartMonth: 1` keeps fiscal-year mode on, and an invalid value is ignored, so the pack's month applies. For calendar years with such a pack, use one without the key (the 3.23.0 `ja` pack) or spread it without it: `const {fiscalYearStartMonth, ...calendarPack} = pack`.

#### What a row can be set to

| Value | Example | Behaviour |
| --- | --- | --- |
| pattern string | `'M/D～'` | Used at every cell width. A label wider than its cell is cut with an ellipsis. An empty string blanks the row. |
| candidate array | `[{ minWidth: 90, format: 'YYYY年M月' }, { format: 'M月' }]` | Replaces the built-in list of labels for that row. The chart sorts it widest-first, so the order you write it in does not matter: the first candidate whose `minWidth` (default `0`) is at most the cell width is used, and the narrowest one below that. Each `format` is a pattern string or a function. An empty array keeps the built-in labels. |
| function | ``(date, ctx) => `第${ctx.week}週` `` | Called for every cell with the cell start as a `Date` and a context; read `ctx.cellWidth` to shorten the label yourself. |

The function's `ctx` carries `tier`, `position` (`'top'` or `'sub'`), `cellWidth`, `end`, `week`, `quarter`, `fiscalYear`, `fiscalQuarter`, `fiscal` (`true` while a fiscal year is in use, see [Calendar and fiscal years](#calendar-and-fiscal-years)), `locale` (the date locale's name, `'en'` when none is set) and `format(pattern, date?)`, which formats `date` (default: the cell start) exactly as a pattern string is applied. A function can therefore switch labels itself: ``(date, ctx) => ctx.fiscal ? `${ctx.fiscalYear}年度` : `${date.getFullYear()}年` ``.

- Output is plain text: it is HTML-escaped before it renders, so `<b>` shows as `<b>`.
- A function that throws, or returns anything but a string or a number, leaves that cell with the built-in label for its width, and the chart logs one warning per row.
- A function runs for every cell on every render and every zoom step, so keep it pure and cheap.
- `ctx.end` and `{end:}` give the cell's natural end (the last day of the week, the month or the quarter), even for the clipped cells at either end of the timeline. `ctx.cellWidth` is the clipped, rendered width.
- `update({ locale: { timelineHeaderFormat } })` re-renders the header and keeps the `dateLocale` already set; the new format object replaces the old one as a whole.

#### Pattern tokens

Patterns are dayjs format strings, run on the dayjs bundled with ApexGantt with the date locale applied. Examples are for Sunday 4 January 2026, 15:00, in English and with `dateLocale: ja`.

| Token | Meaning | en | ja |
| --- | --- | --- | --- |
| `YYYY`, `YY` | Calendar year | `2026`, `26` | `2026`, `26` |
| `M`, `MM` | Month number | `1`, `01` | `1`, `01` |
| `MMM`, `MMMM` | Month name | `Jan`, `January` | `1月`, `1月` |
| `D`, `DD` | Day of month | `4`, `04` | `4`, `04` |
| `Do` | Day of month, ordinal | `4th` | `4日` |
| `dd`, `ddd`, `dddd` | Weekday name | `Su`, `Sun`, `Sunday` | `日`, `日`, `日曜日` |
| `H`, `HH`, `h`, `hh`, `k` | Hour (24 h, 12 h, 1 to 24) | `15`, `15`, `3`, `03`, `15` | the same |
| `m`, `mm` | Minute | `0`, `00` | `0`, `00` |
| `A`, `a` | AM/PM | `PM`, `pm` | `午後`, `午後` |
| `Q` | Calendar quarter | `1` | `1` |
| `w`, `ww`, `wo` | Week of year, following the week start | `2`, `02`, `2nd` | `2`, `02`, `2日` |
| `W`, `WW` | ISO week (Monday weeks) | `1`, `01` | `1`, `01` |
| `gggg`, `GGGG` | Week year, ISO week year | `2026`, `2026` | `2026`, `2026` |
| `L`, `LL`, `l`, `ll` | The date locale's own date formats | `01/04/2026`, `January 4, 2026`, `1/4/2026`, `Jan 4, 2026` | `2026/01/04`, `2026年1月4日`, `2026/01/04`, `2026年1月4日` |
| `LT` | The date locale's time format | `3:00 PM` | `15:00` |
| `X`, `x` | Unix seconds, milliseconds |  |  |

`YYYY` and `Q` are always calendar-based. For fiscal periods use the placeholders below.

Text that should print as written goes in square brackets when it contains Latin letters, which are otherwise read as tokens: `'[Wk] w'` gives `Wk 2`, while `'Wk w'` does not. CJK text such as 年, 月, 日, 週, 第 and ～ needs no brackets.

ApexGantt fills in three placeholders before formatting:

| Placeholder | Gives | Example |
| --- | --- | --- |
| `{end:PATTERN}` | The cell's last instant, formatted with `PATTERN` | week sub `'M/D～{end:M/D}'` gives `12/29～1/4` with Monday weeks |
| `{fy}` | Fiscal year, named by the calendar year it starts in (`calendar.fiscalYearStartMonth`) | `{fy}年度` gives `2025年度` for January to March 2026 with an April start |
| `{fq}` | Fiscal quarter, 1 to 4 | `第{fq}四半期` gives `第4四半期` for January to March 2026 with an April start |

With no fiscal start set, `{fy}` is the calendar year and `{fq}` the calendar quarter. Inside `{end:...}`, `{fy}` and `{fq}` are those of the cell's last instant, so `'{fy}-{end:{fy}}'` names both ends of a cell that spans two fiscal years, and a brace in the end pattern can be escaped as `[{]` or `[}]`. Any other `{...}` text, and a `{` that is never closed, prints as written.

#### Which rows show at which zoom

Which tiers fill the two rows depends on the zoom (`pixelsPerDay`, or the zoom that fits the project when it is left unset). Each tier shows only in the rows listed here, so set every row your users can zoom to, and both `top` and `sub` for a tier that appears in both.

| Zoom (`pixelsPerDay`)                | Top row     | Sub row       |
| ------------------------------------ | ----------- | ------------- |
| under about 0.9                      | none        | `year.sub`    |
| about 0.9 to 2.6                     | `year.top`  | `quarter.sub` |
| about 2.6 to 11.4                    | `year.top`  | `month.sub`   |
| about 11.4 to 42 (week zoom is 25.7) | `month.top` | `week.sub`    |
| 42 to 400 (day zoom is 80)           | `week.top`  | `day.sub`     |
| 400 to 1920                          | `day.top`   | `halfday.sub` |
| 1920 to 7680                         | `day.top`   | `hour.sub`    |
| 7680 and over                        | `hour.top`  | `minute.sub`  |

So at week zoom, `week.top` is not on screen: the weeks are the sub row, under months. `minute.top`, `halfday.top` and `quarter.top` never render, because no finer tier sits under them.

#### React and other frameworks

The React wrapper compares options structurally, so pattern strings and candidate arrays can be written inline. Functions compare by identity: a formatter written inline in a component is a new function on every render, and each one sends an update that re-renders the chart. Define formatter functions outside the component, or memoize the options (`useMemo`). The same applies to any wrapper that updates the chart when its options change.

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
| `startTime` | `string` | **required** | Task start date, parsed with `inputDateFormat`. A parent row may omit it (and `endTime`): its summary bar spans its children. A task with no `startTime` and no children throws. When such a parent loses its last child (`deleteTask()`, `moveTask()` or `updateTask()` with a new `parentId`), it takes the span its summary bar showed as its own `startTime` and `endTime`, written in `inputDateFormat`. |
| `endTime` | `string` | `startTime` | Task end date. When omitted and `type` is not set, a task without children renders as a milestone on `startTime`, and a parent drawn as a summary bar stays a `'task'` that spans its children. A task with `type: 'task'` needs an `endTime`. Not required when `showSummaryBar` is `true`. |
| `progress` | `number` | `0` | Completion percentage (0–100). |
| `type` | `'task' \| 'milestone'` | `'task'` (`'milestone'` when `endTime` is omitted) | Visual type of the task. Accepts the `TaskType` enum or its string value; any other value logs a warning. |
| `parentId` | `string` | `undefined` | ID of the parent task; creates a hierarchical (indented) relationship. Compared by value, so `'1'` finds a task whose `id` is the number `1`. A `parentId` that matches no task, or that makes a cycle (a task naming itself, or a under b under a), logs a warning and the task is shown at the root. |
| `dependency` | `string \| TaskDependency` | `undefined` | Declares a dependency on one predecessor task (add more with `gantt.addDependency()`). A plain string is treated as a Finish-to-Start dependency; `TaskDependency` is `{ taskId, type?, lag? }`. `lag` counts working days when a `calendar` is set and calendar days otherwise, and feeds the critical path and the arrow tooltip only. `lagUnit` is deprecated and has no effect. Links never move tasks (see below). |
| `barBackgroundColor` | `string` | `undefined` | Overrides the chart-level `barBackgroundColor` for this task only. |
| `barTextColor` | `string` | `undefined` | Overrides the chart-level `barTextColor` for the label drawn inside this task's bar. Labels drawn outside the bar use the chart's font colour. |
| `rowBackgroundColor` | `string` | `undefined` | Overrides the row background color for this task only. |
| `collapsed` | `boolean` | `false` | Whether this task's children are initially collapsed. |
| `showSummaryBar` | `boolean` | `true` | Renders this task as a summary (group) bar when it has children. Its date range is computed automatically from its descendants: a `startTime`/`endTime` given on the parent is kept in its data but does not move the bar, and no warning is logged. The bar is read-only: drag, resize, and progress are disabled. Set to `false` to opt out and render the parent as a normal task bar. A `true` value is dropped when the task loses its last child, so it draws as an ordinary bar (or as a milestone when its type came from a missing `endTime`); an explicit `false` is kept. |
| `baseline` | `BaselineInput` | `undefined` | Planned (baseline) dates rendered as a thin bar beneath the actual bar when `baseline.enabled` is `true`. |
| `segments` | `TaskSegment[]` | `undefined` | Worked spans `{ start, end }` of a split task (see [Split tasks](#split-tasks)). An entry missing `start` or `end` is dropped with a warning. A single segment is a contiguous task: it sets `startTime` and `endTime`, and the field is not kept. |
| `assignees` | `Assignee[]` | `undefined` | People assigned to the task, shown by an avatar column renderer (see [`Assignee` type](#assignee-type)). |

> **Links never move tasks.** Dependencies are drawn and analysed (critical path, the Predecessors and Successors columns), but dragging or resizing a bar does not shift its successors, and a successor that starts too early is not rescheduled.

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
      orientation: Orientation.Vertical, // optional, falls back to annotationOrientation
    },
    borderDashArray: [6, 3], // optional, falls back to annotationBorderDashArray
  },
];
```

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `x1` | `string` | **required** | Date of the line, or the start of the range, in `inputDateFormat`. |
| `x2` | `string \| null` | `undefined` | End of the range. When set, a filled region from `x1` to `x2` is drawn; otherwise a line at `x1`. |
| `bgColor` | `string` | `annotationBgColor` | Fill of a range annotation, and the label background. |
| `borderColor` | `string` | `annotationBorderColor` | Border colour. |
| `borderWidth` | `number` | `annotationBorderWidth` | Border width in px. |
| `borderDashArray` | `number \| number[]` | `annotationBorderDashArray` | Dash pattern for the border: one length (equal dash and gap) or a list of dash and gap lengths in px. `0` or `[]` draws it solid. The gaps of a dashed line are left empty, so the timeline shows through them. |
| `label.text` | `string` | `undefined` | Label text. |
| `label.orientation` | `Orientation` | `annotationOrientation` | `Orientation.Horizontal` reads left to right; `Orientation.Vertical` runs the text up the annotation's edge. |
| `label.fontColor`, `label.fontFamily`, `label.fontSize`, `label.fontWeight` | `string` | the chart's font options | Label typography. |

## Column Configuration

Customize which columns appear in the task-list panel, their order, titles, and widths. When `columnConfig` is provided, **it is authoritative** — only the columns you list are rendered, in the order you specify. Omitted columns are hidden. Each entry is merged with defaults, so you only need to specify overrides.

By default ([`autoSizeColumns`](#options)), each column is sized to fit its header title and the widest cell content, and the task-list panel grows so nothing is clipped. `minWidth` sets a column's preferred (default) width and `maxWidth` (default `320px`) the ceiling. The panel remains freely resizable: dragging the divider distributes width proportionally to content when widening, and shrinks columns toward a small floor when narrowing (so a large `minWidth` never blocks the resize). Set `autoSizeColumns: false` to split the fixed `tasksContainerWidth` purely by `flexGrow` (the legacy behavior), in which case columns clip to their `minWidth` when the panel is too narrow.

**Resizing a single column.** With `resizableColumns` on (the default), each column header has a drag handle at its trailing edge. Drag it to pin that column to an exact pixel width; the remaining columns absorb the leftover panel space, so you can keep some columns wide and others thin. Double-click a handle to reset that column to its auto width. Lock one column with `resizable: false` in its `columnConfig` entry. The same overrides are available programmatically via `gantt.setColumnWidth(key, px)`, `gantt.resetColumnWidths(key?)`, and `gantt.getColumnWidths()`, are included in `getState()` / `setState()`, and emit a `columnResize` event.

**Reordering columns.** With `reorderableColumns` on (the default), drag a column header left or right onto another column to move it; a vertical drop indicator shows where it will land, and a short drag threshold keeps a plain click sorting as usual. Drive it programmatically with `gantt.setColumnOrder([...keys])` / `gantt.getColumnOrder()`. The order is included in `getState()` / `setState()` and emits a `columnReorder` event.

Available built-in column keys:

| Key | Title | Shows |
| --- | --- | --- |
| `Name` | Task Name | Task name with the collapse chevron + indentation |
| `StartTime` | Start | Start date (rolled-up start for summary rows) |
| `EndTime` | End | End date (rolled-up end for summary rows) |
| `Duration` | Duration | Duration in the snap unit's base unit, whatever the `snapValue`: days (`d`), working days (`wd`) when a calendar is set, hours (`h`) or minutes (`m`). A 45-minute task reads `45 m` with `snapValue: 15`. Sorting, filtering, grouping and the default tooltip use the same count |
| `Progress` | Progress | Progress percent as text |
| `ProgressRing` | Progress | Progress as an SVG ring |
| `Wbs` | WBS | Work Breakdown Structure code (`1`, `1.2`, …) |
| `Assignees` | Assignees | Comma-joined assignee names (from `task.assignees`) |
| `Predecessors` | Predecessors | Predecessor tasks by WBS, with a non-`FS` type + non-zero lag suffix (e.g. `1.2, 3SS+2d`) |
| `Successors` | Successors | Successor tasks by WBS (same notation) |
| `BaselineStart` | Baseline Start | Baseline start date (from `task.baseline.start`) |
| `BaselineEnd` | Baseline End | Baseline end date (from `task.baseline.end`) |
| `BaselineVariance` | Variance | Finish variance vs baseline (`+` = late, `-` = early): working days (`wd`) when a calendar is set, so weekends and holidays in between do not count, calendar days (`d`) otherwise. Sorting and filtering use the same number |

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
| `title` | `string` | from defaults | Header text displayed for the column, also used for its `aria-label` and auto-sizing. For a built-in key the default title from the table above is used when it is missing; a custom column needs its own. |
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

Set an initial sort with the `sortBy` option, or drive it imperatively. By default the chart sorts by start time ascending; pass `sortBy: []` for natural (input) order. Rows with an empty value in the sort column (no baseline, a blank custom value) stay at the bottom in both directions.

```js
import {ColumnKey} from 'apexgantt';

const gantt = new ApexGantt(element, {
  series: tasks,
  sortBy: {key: ColumnKey.Name, direction: 'asc'},
  // multi-key: sort by progress desc, then name asc
  // sortBy: [{ key: ColumnKey.Progress, direction: 'desc' }, { key: ColumnKey.Name }],
});

gantt.sort({key: ColumnKey.Progress, direction: 'desc'}); // replace the sort
gantt.getSort(); // [{ key: 'progress', direction: 'desc' }]
gantt.clearSort(); // back to natural (input) order
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
gantt.isFiltered(); // true
gantt.clearFilter(); // show every row again
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
- **Number** (Progress, Duration): `equals`, `notEquals`, `gt`, `gte`, `lt`, `lte`, `isEmpty`, `notEmpty`. A Duration rule compares the number the Duration column shows (base units of `snapUnit`, working days with a calendar), so `equals 5` matches a task that reads `5 d` or `5 wd`; sorting and grouping by Duration use the same count
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
gantt.clearFilter(); // drop it
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

`scroll.horizontal` is read from and written to the timeline body, measured from where the time axis starts (the right edge under RTL, see [Localization & RTL](#localization--rtl)); `scroll.vertical` is the row list's `scrollTop`. A `setState({scroll})` or `scrollToTask()` called straight after `render()` is not undone by the chart's first frame.

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

Group headers are ordered by their underlying value in `direction`: numbers numerically (Progress `5%` before `40%`), dates chronologically, text alphabetically. Grouping composes with sorting and filtering: members are ordered within each group by the active sort, and a filter drops non-matching members (empty groups disappear). Tasks whose group value is empty collect under a localized "(None)" group, which always sorts last. Each group header is collapsible; clicking its chevron hides that group's members. Group headers themselves have no task bar.

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

Split at runtime, then clear the split by setting `segments` back to an empty array. `splitTask` cuts the worked span that contains the date, so the date must fall inside a segment, not in a gap:

```js
// Cut the second segment (Jun 12 to Jun 20): work Jun 12 to 16, pause, resume Jun 18.
gantt.splitTask('t1', '2026-06-16', {resumeAt: '2026-06-18'});
gantt.isSplit('t1'); // true whenever the task has two or more segments
gantt.updateTask('t1', {segments: []}); // back to one contiguous bar
```

A split keeps the task's finish date: the gap is taken out of the existing span, so the work after it gets shorter rather than later. To show a slip (work resuming later and finishing later), pass the new segments through `updateTask`, for example `gantt.updateTask('t1', {segments: [{start: '2026-06-01', end: '2026-06-06'}, {start: '2026-06-15', end: '2026-06-23'}]})`. `resumeAt` must fall after the split date and no later than the segment's last day; anything else is rejected with a console warning and the task is left unchanged. With a day-only format the end day is worked, so `resumeAt` may be that last day (a one-day remainder); with a format that carries time the end is exclusive and `resumeAt` must be before it. The default `resumeAt` is the day after `at`, which leaves no visible gap when dates are whole days, so pass a later date to open one.

Interactions are preserved: dragging a split task moves all its segments together, and resizing adjusts its outer segment — both inferred automatically, so the same drag/resize handles work as for a normal bar.

> v1 is API-driven. Interactive split gestures (double-click / context-menu "split here"), per-segment drag/resize, and critical-path math that excludes gap time are not yet implemented; the envelope is treated as the task's span.

## Drawing tasks on the timeline

Set `enableDrawTask: true` to let users create a task by dragging across an empty stretch of the timeline: press on an empty row, drag horizontally to sweep out the range, and release. A preview bar tracks the cursor during the drag, and on release a task is added with the swept start/end **snapped to the active snap unit** (`snapUnit` / `snapValue`). A press that doesn't move far enough counts as a click and creates nothing; press `Escape` mid-drag to cancel.

```js
const gantt = new ApexGantt(element, {
  series: tasks,
  enableDrawTask: true,
  snapUnit: 'day',
});
```

The gesture only starts on empty timeline background (never on an existing bar or its handles), goes through the same path as `gantt.addTask()` (respects `beforeTaskAdd`, recorded in undo history, emits `taskAdded`), and the new root task then sorts into position by its dates like any other add. It's off by default so existing charts' empty-area drags stay inert.

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

## Keyboard and screen readers

Every task bar is a tab stop. Interactive bars (dragging or resizing on) have `role="slider"` and read-only ones `role="progressbar"`; the label and value text come from the `barAriaLabel` and `barAriaValueText` messages (see [Localization & RTL](#localization--rtl)), and `aria-keyshortcuts` lists only the keys that work on that bar. The label, value and value text are rebuilt after every accepted edit (drag, resize, progress drag, keyboard, dialog, inline edit or `updateTask()`), so a screen reader reads the new dates.

| Key on a focused bar | Effect | Needs |
| --- | --- | --- |
| `ArrowLeft` / `ArrowRight` | Move the bar one snap unit (`snapUnit` x `snapValue`) earlier / later, with its children | `enableTaskDrag` |
| `Shift+ArrowLeft` / `Shift+ArrowRight` | Move the bar's end one snap unit earlier / later; it never passes the start | `enableTaskResize` (not milestones) |
| `Enter` / `Space` | Open the edit dialog | `enableTaskEdit` |

Arrow keys follow the screen: under RTL the time axis is mirrored, so `ArrowRight` moves a bar earlier. Summary bars (where `Enter` / `Space` expand or collapse the group) and bars whose option is off ignore the arrow keys, and on a task bar `Enter` / `Space` are left alone (not prevented) when editing is off. With a working `calendar`, a move keeps the task's working-day length and skips non-working days in the direction of travel, and a resize lands its end on a working day.

A keyboard edit is committed exactly as a drag or resize is: it goes through `beforeTaskUpdate`, is recorded in the undo history (one step per key press) and fires the update events with `source: 'keyboard'`. Focus stays on the bar, and its value text is refreshed with the new dates.

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
- The Duration column counts in the base unit of the configured `snapUnit` (`d` / `h` / `m`), not in multiples of `snapValue`: a 45-minute task reads `45 m` with `snapValue: 15`.

> **Working calendars** (weekends + holidays) are supported via the [`calendar`](#apexgantt-options) option — duration math, drag/resize snapping, and timeline stripes all honour the configured working days. Per-day working **hours** (e.g. skipping after-hours within a working day) are not yet supported and are planned for a future release.

## Inline Editing

Set `enableInlineEdit: true` to let users edit task fields directly in the task-list cells without opening a form.

```js
const gantt = new ApexGantt(element, {
  series: tasks,
  enableInlineEdit: true,
});
```

Inline editing is also auto-enabled by `enableTaskEdit: true` (which opens a dialog when a task bar is double-clicked), so the two surfaces ship together by default. Pass `enableInlineEdit: false` explicitly to keep the dialog without inline cell editing:

```js
new ApexGantt(element, {
  series: tasks,
  enableTaskEdit: true,
  enableInlineEdit: false, // dialog only, cells stay read-only
});
```

### How it works

- **Activate**: double-click any editable cell.
- **Commit**: press `Enter` or click outside the input (`blur`). The edit runs `beforeTaskUpdate`; if the hook returns `false`, the cell goes back to what it showed before.
- **Cancel**: press `Escape` to revert without saving.

While the editor is open, the keys typed into it stay with it: Space, Home, End, the arrows and Ctrl/Cmd+A edit the text instead of moving between rows or selecting them, and Escape cancels the edit without clearing the row selection.

### Editable columns

| Column | Editor | Notes |
| --- | --- | --- |
| `name` | text input | Empty values are rejected (cancelled silently). |
| `startTime` | native `<input type="date">` | For tasks (not milestones), the duration is preserved — `endTime` shifts by the same delta. |
| `endTime` | native `<input type="date">` | Rejected if before `startTime`. |
| `duration` | number input (steps by `snapValue`) | In base units of `snapUnit` (days, hours or minutes), the same numbers the Duration column shows: with `snapUnit: 'minute', snapValue: 15` a 45-minute task reads `45` and the spinner moves in 15s. Edits set `endTime` from `startTime` (inclusive for date-only formats, so `7` days ends 6 days later); `startTime` stays fixed. With a working `calendar` and day snapping, the value counts working days, for any date format (a format with time keeps the end's time of day). |
| `progress` | number input (`0`–`100`) | Values clamp to the `0–100` range. |

When `inputDateFormat` includes time tokens (e.g. `'YYYY-MM-DD HH:mm'`), the `startTime` / `endTime` editors switch from `<input type="date">` to `<input type="datetime-local">` automatically so hour/minute edits round-trip correctly.

### Cells that are not editable

- **Summary rows** (parents with `showSummaryBar`) — only `name` is editable; dates/duration/progress are derived from descendants.
- **Milestones** — only `name` and `startTime` are editable (no end / duration / progress).
- **Empty filler rows** at the bottom of the task-list panel.

### Events

Every edit path (inline cells, the edit dialog, dragging, resizing, the progress handle, keyboard moves and `updateTask()`) commits through the same code, so one listener sees all of them. Each committed edit fires, once:

- `taskUpdate`: before the change is applied (after `beforeTaskUpdate` accepted it).
- `taskUpdateSuccess`: after it is applied; `detail.updatedTask` contains the resolved task.
- `taskUpdateError`: instead of `taskUpdateSuccess` if applying it throws; the task keeps its previous values.

Both `taskUpdate` and `taskUpdateSuccess` carry `detail.source`, which says where the edit came from: `'api'`, `'dialog'`, `'drag'`, `'inline'`, `'keyboard'`, `'progress'` or `'resize'` (the `TaskUpdateSource` type). Undo and redo fire neither event, and `updateTask(id, updates, {silent: true})` skips both.

Moving a bar that has children (a drag, or ArrowLeft / ArrowRight on the focused bar) edits the bar and every dated descendant in one gesture: each gets its own `taskUpdate` and `taskUpdateSuccess`, but all the `taskUpdate` events come first and the `taskUpdateSuccess` events follow once the whole gesture is applied, so each `updatedTask` already carries the recomputed summary dates. A descendant with no `startTime` (a summary row whose dates come from its children) is not edited.

```js
container.addEventListener('taskUpdateSuccess', (e) => {
  const {taskId, updatedTask, source} = e.detail;
  // persist to backend
});
```

> Since 3.20.0 these events fire for drags, resizes and progress drags as well. An app that saves on both `taskDragged` and `taskUpdateSuccess` now saves a drag twice; save on `taskUpdateSuccess` alone.

## Row selection

Set `enableSelection: true` to let users select task rows (click, Ctrl/Cmd+Click, Shift+Click, Space, Ctrl/Cmd+A). Selection changes fire `selectionChange` with `{ selectedTasks, selectedIds, timestamp }`.

| Method | Returns | Description |
| --- | --- | --- |
| `getSelectedTasks()` | `Task[]` | The selected tasks as task objects, in the order they were selected. |
| `setSelectedTasks(ids)` | `void` | Replace the selection with the given task ids (unknown ids are ignored). Fires `selectionChange` when the selection changed. |
| `clearSelection()` | `void` | Clear the selection. Fires `selectionChange` when something was selected. |

```js
const gantt = new ApexGantt(element, {series: tasks, enableSelection: true});
gantt.render();

gantt.setSelectedTasks(['t1', 't3']);
gantt.getSelectedTasks().map((task) => task.name);
gantt.clearSelection();
```

The selection is also part of `getState()` / `setState({selected})`. Without `enableSelection: true` these methods do nothing (`getSelectedTasks()` returns `[]`) and the chart logs one console warning saying so; `setState()` only warns when `selected` lists ids, so restoring a saved state never does.

## Custom toolbar items

`toolbarItems` adds buttons, selects and separators to the toolbar. A `ToolbarSelect` takes these fields:

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `type` | `'select'` |  | Marks the item as a select. |
| `options` | `{ value, text }[]` |  | The choices. |
| `onChange` | `(value, ctx) => void` |  | Called with the chosen value and `{ selectedTasks }`. |
| `label` | `string` | `undefined` | Text shown before the select. |
| `placeholder` | `string` | `undefined` | Disabled first option shown while nothing is chosen. |
| `value` | `string` | `undefined` | Initially selected option value (ignored if it matches no option). |
| `position` | `'left' \| 'right'` | `'right'` | Side of the built-in controls to render on. |

The toolbar is rebuilt on every render; a select keeps the option the user chose last. To set the value from code, pass a new item with `value` through `update({toolbarItems})`.

```js
new ApexGantt(element, {
  series: tasks,
  toolbarItems: [
    {
      type: 'select',
      label: 'Team',
      placeholder: 'All teams',
      value: 'design',
      options: [
        {value: 'design', text: 'Design'},
        {value: 'build', text: 'Build'},
      ],
      onChange: (value) => filterByTeam(value),
    },
  ],
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

**Supported fields:** `id`, `name`, `startTime`, `endTime`, `progress`, `type`, `parentId`, `dependency`, `barBackgroundColor`, `barTextColor`, `rowBackgroundColor`, `collapsed`, `showSummaryBar`, `baseline`, `segments`, `assignees`

A row needs an `id` and a `name`; a row without either is skipped with a warning. A row with no start date is kept when it is the parent of a dated row (directly or further down), so a parent row can leave its dates to its children. Any other row with no start date, such as an unscheduled backlog item or a row with only an end date, is skipped with a warning. A row whose `parentId` matches no row is shown at the root, with a warning.

Passing `parsing` to `update()` re-parses the raw rows the chart was last given (or the `series` passed with it) and replaces the data.

## 📘 Public API

### 1. `update(options)`

Changes chart options and re-renders. Only the keys you pass change; a key passed as `undefined` returns to its default.

One exception: a call that switches `theme` (light to dark or back) returns the color options the theme sets to the new theme's values, even ones you set yourself: `annotationBgColor`, `annotationBorderColor`, `arrowColor`, `backgroundColor`, `barBackgroundColor`, `barTextColor`, `borderColor`, `cellBorderColor`, `criticalArrowColor`, `criticalBarColor`, `crosshairColor`, `fontColor`, `headerBackground`, `milestoneColor`, `rowBackgroundColors`, `summaryBarColor`, `tooltipBGColor` and `tooltipBorderColor`. Pass a color in the same call to keep it; every other option (columns, toolbar items, hooks, locale, sorting, bar labels, dependencies, calendar, ...) carries over.

```js
// Keep the brand bar color through a light/dark switch.
gantt.update({theme: 'dark', barBackgroundColor: brandColor});
```

The current tasks are kept, with every edit made by dragging, `updateTask()`, `addTask()`, `deleteTask()`, `moveTask()` or a dependency change. Passing `series` (or `parsing`) replaces the data and clears the undo history. Passing `calendar` or `inputDateFormat` rebuilds the working calendar; a theme change keeps it. Scroll position and zoom are kept unless you pass `pixelsPerDay`.

#### Parameters

| Name      | Type                 | Description                                                                    |
| --------- | -------------------- | ------------------------------------------------------------------------------ |
| `options` | `GanttUpdateOptions` | Any subset of the [options](#apexgantt-options) (`Partial<GanttUserOptions>`). |

#### Example

```js
// Switch theme: the tasks, and the user's edits to them, stay.
ganttInstance.update({theme: 'dark'});

// Replace the data (clears undo history) and zoom to week density.
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
  pixelsPerDay: 25.7,
});
```

### 2. `updateTask(taskId, taskData, options?)`

Updates one task with the given fields and patches its row and bar in place (a change to `segments` or `collapsed` re-renders, so rows appear or disappear at once). A task whose row is not rendered (a collapsed parent's child, a filtered-out task, a row outside the virtual window) is updated all the same.

The change runs `beforeTaskUpdate` (returning `false` cancels it), is recorded in the undo history, and fires `taskUpdate` then `taskUpdateSuccess` with `source: 'api'`. Throws when the task id is unknown or the result fails validation (after firing `taskUpdateError`).

#### Parameters

| Name | Type | Description |
| --- | --- | --- |
| `taskId` | `string` | ID of the task to be updated |
| `taskData` | `Partial<TaskInput>` | The fields to change (`name`, `startTime`, `endTime`, `progress`, `collapsed`, `segments`, ...) |
| `options` | `UpdateTaskOptions` | `{ silent?: boolean }`. `silent: true` skips `taskUpdate` and `taskUpdateSuccess`, for applying a value your server sent back or rolling back a rejected save. Default `false`. |

#### Example

```js
ganttInstance.updateTask('task-1', {
  name: 'Design Phase',
  startTime: '07-01-2025',
  endTime: '07-10-2025',
  progress: 40,
});

// Apply the server's copy without re-triggering your taskUpdateSuccess save listener
ganttInstance.updateTask('task-1', {progress: 45}, {silent: true});
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

The remaining summary rows are brought up to date at once: their dates and progress follow the delete, as they do after `updateTask()`.

A parent the delete leaves with no children stops being a summary. It draws as an ordinary bar over its own dates, or as a milestone when its type came from a missing `endTime`. A parent with no `startTime` of its own (it took its dates from its children, or had only an `endTime`) keeps the span its summary bar showed: its `startTime` and `endTime` are set to that span, written in `inputDateFormat`. This is part of the same undo step, so undo restores the parent exactly as it was. It fires no `taskUpdate` event, so an app that keeps its own copy of the data should read `getTask(parentId)` after `taskDeleted`.

If a `beforeTaskDelete` hook is configured and it returns `false`, the removal is cancelled and the method returns `false`. Throws when the task id is not found, when `cascade: 'forbid'` and the task has children, or when the delete would leave a parent with no `startTime` and no summary span to keep (an undated parent with `showSummaryBar: false`). Nothing is changed when it throws.

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

Moving a parent's last child away leaves that parent as `deleteTask()` does: it stops being a summary and, with no `startTime` of its own, keeps the span its summary bar showed, in the same undo step.

Throws when `taskId` doesn't exist, when `newParentId` doesn't exist, when moving onto itself, when the move would create a cycle, or when it would leave a parent with no `startTime` and no summary span to keep.

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

Creates a dependency edge between two tasks and re-renders the arrow. Recorded in undo history. Emits `dependencyAdded`. Runs through `beforeDependencyChange`. The link is drawn and analysed but never moves either task.

Throws when the edge breaks one of the rules `canAddDependency()` (below) checks: a link from a task to itself, a task that doesn't exist, an edge that already exists, an edge that would close a cycle, or (unless `dependencies.allowSummaryDescendantLinks` is `true`) a link between a task and its own ancestor or descendant. Before 3.20 only the missing-task and duplicate cases threw. A `beforeDependencyChange` veto returns `false` instead of throwing.

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

Drops every recorded transaction and emits `historyChange` with `kind: 'clear'`. `update({series})` already does this when it replaces the data; call it yourself when undo should stop at a point of your choosing, for example after saving.

```js
await saveChart({tasks: ganttInstance.getTasks(), links: ganttInstance.getDependencies()});
ganttInstance.clearHistory();
```

### 12. `getHistorySize()`

Returns the current undo/redo stack sizes as `{ undo: number, redo: number }`. Handy for debugging or surfacing a "you have N undo steps left" hint.

### 13. `zoomIn()`

Zooms in by one step: `pixelsPerDay` is multiplied by 1.4, keeping the centre of the visible timeline in place. Zoom is continuous rather than a list of view-mode presets; the header tiers (year, quarter, month, week, day, hour, minute) follow from the resulting `pixelsPerDay`, so a tier changes after about five steps. The value is clamped to the zoom range (about `0.25` to `7680` px per day), and at the top of it `zoomIn()` does nothing.

#### Example

```js
ganttInstance.zoomIn();
```

### 14. `zoomOut()`

Zooms out by one step: `pixelsPerDay` is divided by 1.4. Clamped to the same range as `zoomIn()`, and a no-op at the bottom of it.

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

PNG and PDF lay the chart over its own paper: `backgroundColor` as it resolves through `--apex-gantt-background-color` and `--apx-surface`, so a dark chart exports dark. A transparent paper exports on the theme's paper (white, or the dark theme's), or on the Ignite UI paper when the [add-on](#design-systems-ignite-ui) chose the dark mode from the sheet's variant.

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

Split a task into separate worked segments at `at` (see [Split tasks](#split-tasks)). The segment containing `at` is cut so its first piece ends at `at` and the rest resumes at `options.resumeAt` (default: the day after `at`, which leaves no visible gap when dates are whole days; pass a later `resumeAt` to open one). The task keeps its finish date; to show a slip, pass `segments` through `updateTask` instead. Routed through `updateTask`, so it runs `beforeTaskUpdate`, is validated and undoable, and fires `taskUpdate` / `taskUpdateSuccess` with `source: 'api'`. No-op on milestones, summary bars, or when `at` is not strictly inside a worked span. A `resumeAt` that is not after `at`, or that falls after that segment's last day (day-only formats) or at or after its end (formats with time), is rejected with a console warning.

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

### 35. `setColumnOrder(keys)`

Set the left-to-right order of the task-list columns by key. Keys you list are placed first in that order; any visible columns you omit keep their relative position at the end. Mirrors dragging a column header. Re-renders and emits `columnReorder`.

```js
gantt.setColumnOrder([ColumnKey.Name, ColumnKey.Progress, ColumnKey.StartTime]);
```

### 36. `getColumnOrder()`

Return the current column order as an array of keys (left-to-right), reflecting any reorder. Included in `getState()` and restorable via `setState({ columnOrder })`.

### 37. `scrollToTask(taskId, options?)`

Scroll the timeline (and, if needed, the row list) so a task's bar is in view, using nearest-edge alignment. Backs the per-row scroll chevrons; call it directly to "locate" a task from search results, selection, or your own toolbar button.

A task hidden under a collapsed parent (or, while grouping, in a collapsed group) is revealed first: `options.expand` (`ScrollToTaskOptions`, default `true`) opens its collapsed ancestors and group, then scrolls to the row. Pass `{expand: false}` to leave them closed.

Returns `true` when the task's row is shown (scrolled to, or already in view), and `false` for an unknown id, a task the active filter hides, or a hidden task with `expand: false`.

```js
gantt.scrollToTask('task-42');
gantt.scrollToTask('task-42', {expand: false}); // only if its row is already visible
```

### 38. `getTask(taskId)`

Return a task as it is now, edits included, or `null` for an unknown id. The result is a copy, its `baseline`, `segments`, `assignees` and `dependency` included: changing it does not change the chart (use `updateTask()` for that). Custom fields you added to a task are copied by reference.

```js
const task = gantt.getTask('task-42');
```

### 39. `getTasks()`

Return every task as it is now, edits included, as copies (like `getTask()`) in tree order (each parent before its children). Collapsed and filtered-out tasks are included.

The tasks do not carry every link. A task's `dependency` holds only the link it was loaded with (removing that link clears it), so a link added with `addDependency()` or drawn by the user is not in the returned tasks. To save the chart's data after the user edited it, save `getDependencies()` with the tasks (see below).

```js
const tasks = gantt.getTasks();
```

### 39a. `getDependencies()`

Return every dependency link as it is now, as `DependencyLink` copies (`{ fromId, toId, type, lag }`): the links the tasks were loaded with and the ones added with `addDependency()` or drawn by the user, less any removed. Undo and redo are reflected.

Save it with `getTasks()` to keep the links. After loading the saved tasks, add each link that `canAddDependency()` accepts (the links the tasks carry are already there), then clear the undo history so the restore cannot be undone:

```js
// Save
await saveChart({tasks: gantt.getTasks(), links: gantt.getDependencies()});

// Load
const {tasks, links} = await loadChart();
const gantt = new ApexGantt(el, {series: tasks});
gantt.render();
for (const {fromId, toId, type, lag} of links) {
  if (gantt.canAddDependency(fromId, toId).ok) gantt.addDependency(fromId, toId, {type, lag});
}
gantt.clearHistory();
```

Each added link runs through `beforeDependencyChange` and emits `dependencyAdded`, like any other `addDependency()` call.

### 40. `expandTask(taskId)` / `collapseTask(taskId)`

Open or collapse a parent task. View state only: not recorded in undo history, and saved with the view state like `setState({collapsed})` (so `getState()` and `persistState` include it). Renders once, only when the state changes. Returns `false` for an unknown id or a task with no children, otherwise `true`.

```js
gantt.collapseTask('phase-1');
gantt.expandTask('phase-1');
```

## Events

ApexGantt emits CustomEvents on the container element for various user interactions, allowing you to track and respond to changes in real-time.

### Available Events

| Event | When | Detail |
| --- | --- | --- |
| `taskUpdate` | Once per edit on every edit path, after `beforeTaskUpdate` accepted it and just before it is applied. Not for undo / redo or `updateTask(..., {silent: true})` | `{ taskId, updates, updatedTask, source, timestamp }` |
| `taskUpdateSuccess` | Once per edit on every edit path, after it is applied. Not for undo / redo or `updateTask(..., {silent: true})` | `{ taskId, updatedTask, source, timestamp }` |
| `taskValidationError` | Form validation failed | `{ taskId, errors, timestamp }` |
| `taskUpdateError` | Applying an accepted edit threw; the task keeps its previous values | `{ taskId, error, timestamp }` |
| `taskAdded` | Task inserted via `gantt.addTask()` | `{ taskId, task, parentId?, timestamp }` |
| `taskDeleted` | Task removed via `gantt.deleteTask()` | `{ taskId, task, removedDescendantIds, timestamp }` |
| `taskMoved` | Task re-parented via `gantt.moveTask()` | `{ taskId, oldParentId?, newParentId?, timestamp }` |
| `dependencyAdded` | Edge created via `gantt.addDependency()` or drawn on the chart | `{ fromId, toId, type, lag, timestamp }` |
| `dependencyRemoved` | Edge removed via `gantt.removeDependency()` or with a deleted task | `{ fromId, toId, type, lag, timestamp }` |
| `taskDragged` | Task bar is dragged, after `beforeTaskUpdate` accepted the move | `{ taskId, oldStartTime, oldEndTime, newStartTime, newEndTime, daysMoved, affectedChildTasks, timestamp }` |
| `taskResized` | Task bar is resized, after `beforeTaskUpdate` accepted the change | `{ taskId, resizeHandle, oldStartTime, oldEndTime, newStartTime, newEndTime, durationChange, timestamp }` |
| `taskProgressChanged` | In-bar progress handle is dragged to a new value, after `beforeTaskUpdate` accepted it | `{ taskId, oldProgress, newProgress, timestamp }` |
| `historyChange` | The undo/redo stack changed — `kind` is `'record'`, `'undo'`, `'redo'`, or `'clear'` | `{ kind, canUndo, canRedo, undoSize, redoSize, topUndoLabel?, topRedoLabel?, timestamp }` |
| `sortChange` | Active sort changed via API or header click | `{ criteria: { key, direction }[], timestamp }` |
| `filterChange` | Active filter changed | `{ active, visibleCount, timestamp }` |
| `groupChange` | Active grouping changed via `gantt.groupBy()` / `gantt.clearGrouping()` | `{ active, field, groupCount, timestamp }` |
| `columnResize` | A task-list column was resized (header drag or API) | `{ key, width, widths, timestamp }` |
| `columnReorder` | Task-list columns were reordered (header drag or API) | `{ order, movedKey, timestamp }` |

`source` on `taskUpdate` / `taskUpdateSuccess` is a `TaskUpdateSource`: `'api' | 'dialog' | 'drag' | 'inline' | 'keyboard' | 'progress' | 'resize'`. A drag, resize or progress drag fires the `taskUpdate` / `taskUpdateSuccess` pair first and then its own event, so save on one or the other, not both.

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

## Family theme tokens (`--apx-*`)

Every chart in the ApexCharts family reads the same five root tokens, so a page can state its brand once and have trees, flow diagrams, Gantt charts and plots all follow:

| Token                               | Role                                                             |
| ----------------------------------- | ---------------------------------------------------------------- |
| `--apx-accent`                      | The colour that means interactive or selected                    |
| `--apx-fore`                        | Text and anything that must stay legible on the surface          |
| `--apx-grid`                        | Hairlines: borders, gridlines, connectors                        |
| `--apx-surface`                     | The plane content sits on                                        |
| `--apx-series-1` … `--apx-series-N` | An ordered categorical palette (1-based, stops at the first gap) |

```css
:root {
  --apx-accent: #5b21b6;
  --apx-fore: #101828;
  --apx-grid: #e4e7ec;
  --apx-surface: #ffffff;
}

@media (prefers-color-scheme: dark) {
  :root {
    --apx-fore: #f8fafc;
    --apx-grid: #334155;
    --apx-surface: #0f172a;
  }
}
```

Custom properties inherit, so declaring them on `:root` reaches every chart on the page. Every colour and font option resolves through the same order as the rest of the family, higher wins:

```
option you passed  >  --apex-gantt-* variable  >  --apx-* token  >  registered theme  >  design system  >  theme default
```

An option counts as passed when it is in the options you gave the constructor or any `update()`, even at its default value; passing it as `undefined` in an `update()` takes it back, and so does an `update()` that switches `theme` for the colours the theme owns, unless the same call passes them. Options you did not pass rank last, so a variable or a token themes them.

### What Gantt reads

Gantt reads the four root tokens `--apx-accent`, `--apx-fore`, `--apx-grid` and `--apx-surface`, and `--apx-font-family` for `fontFamily`. It does **not** read `--apx-series-N`: bars take one fill, not a categorical palette, so colour individual tasks with their `barBackgroundColor` instead.

| Root token      | Gantt option it stands in for                              |
| --------------- | ---------------------------------------------------------- |
| `--apx-accent`  | `barBackgroundColor`                                       |
| `--apx-fore`    | `fontColor`                                                |
| `--apx-grid`    | `cellBorderColor`, `arrowColor`                            |
| `--apx-surface` | `backgroundColor`, `headerBackground`, the base row colour |

The product variables, set on the container (or anything it inherits from), win over every option you did not pass:

| Variable | Option |
| --- | --- |
| `--apex-gantt-bar-fill` | `barBackgroundColor` (task bars) |
| `--apex-gantt-dependency-line` | `arrowColor` (dependency arrows) |
| `--apex-gantt-background-color` | `backgroundColor` |
| `--apex-gantt-header-bg` | `headerBackground` |
| `--apex-gantt-row-bg-even`, `--apex-gantt-row-bg-odd` | `rowBackgroundColors` |
| `--apex-gantt-grid-line` | `cellBorderColor` |
| `--apex-gantt-font-color` | `fontColor` |
| `--apex-gantt-font-family`, `--apex-gantt-font-size` | `fontFamily`, `fontSize`: the chart text, bar and dependency tooltips, and annotation labels that set no font of their own |

A task's own `barBackgroundColor` still wins over every layer. Values resolve when the chart renders, not live: after changing a variable or token (a theme switch, a class on `<html>`), call `gantt.update({})` or `gantt.render()` to repaint.

### Named themes

`registerTheme` from `apex-commons` records a named set of tokens on a registry shared by the whole family, so a brand theme registered once from any product is resolvable by name from all of them:

```js
import {registerTheme} from 'apex-commons';

registerTheme('acme', {
  tokens: {accent: '#5b21b6', fore: '#101828', grid: '#e4e7ec', surface: '#ffffff'},
});
```

A named theme's tokens sit one layer below the CSS `--apx-*` tokens, so the cascade still wins over the registry.

Reference it through the `theme` option. Its tokens fill the same slots as the `--apx-*` tokens (see [What Gantt reads](#what-gantt-reads)), one rank below them. A theme registered with `mode: 'dark'` gives every other colour the dark theme's value; without one it is light:

```js
registerTheme('dusk', {mode: 'dark', tokens: {accent: '#0f766e', surface: '#1c1917'}});
new ApexGantt(el, {series, theme: 'dusk'});
```

An `update()` that passes a theme of the same mode keeps the colours you set; one that changes the mode resets them as described for `theme`. A name nothing is registered under renders as `'light'`. A theme registered under `'light'` or `'dark'` adds its tokens to that built-in theme.

### Corner radius

`--apx-radius-factor` multiplies Gantt's own built-in corner radii: menus, dialogs, the task form, tooltips, dropdowns, scrollbars, milestones and roll-ups. Unset, it is `1` and every radius is exactly as before. The toolbar frame shared with the other products keeps its radii for now. The `barBorderRadius` and `dependencies.cornerRadius` options are yours and are not scaled. `tokens: false` keeps the built-in radii. The tooltip, which the chart mounts outside its container, follows the factor the chart sees, so a factor set on the container or a wrapper reaches it too.

```css
:root {
  --apx-radius-factor: 1.5;
}
```

### Design systems (Ignite UI)

Ignite UI theming is an add-on. Load it once and Gantt charts follow the Ignite UI theme on the page: bars, text, gridlines, the header, the tooltip, the font, light or dark.

```js
import 'apexgantt/ignite-ui';
```

Without a bundler, load `apexgantt.ignite-ui.min.js` with a script tag, before or after `apexgantt.min.js`. Load it before the first render: a chart rendered earlier picks it up on its next `render()` or `update()`. `designSystem: false` turns it off for one chart. Without the add-on the `--ig-*` tokens are ignored, with no error; the `--apx-*` tokens work either way.

The add-on also themes ApexTree and ApexSankey on the same page; with several of them, load it from the newest package. ApexCharts charts take their own add-on, `apexcharts/features/ignite-ui`. That one themes Gantt charts as well, but from a script tag only once `apexcharts.js` has loaded, so on a script-tag page load `apexgantt.ignite-ui.min.js` (or `apex-commons.ignite-ui.min.js`) for the Gantt charts.

With the add-on loaded, on a page that loads an Ignite UI theme, the chart reads its tokens as the lowest-ranked layer above the theme defaults: `fontColor` from `--ig-gray-800`, `cellBorderColor` and `arrowColor` from `--ig-gray-300`, `barBackgroundColor` from `--ig-primary-seed`, `fontFamily` from `--ig-font-family`, and (from Ignite UI 7.5.0) `headerBackground` from `--ig-surface-raised` and `tooltipBGColor` from `--ig-surface-overlay`. `backgroundColor` and the row colours keep the theme's own. Anything above it (an option you passed, an `--apex-gantt-*` variable, an `--apx-*` token) still wins.

When the sheet declares a dark variant and you passed neither `theme` nor `backgroundColor`, the chart takes the dark theme's colours (for every colour option you did not pass) and goes back to the light ones when the variant changes; call `gantt.render()` after switching the sheet. Text and border colours from the design system apply only while the chart's mode matches the sheet's variant: the `theme` you passed (a registered theme's `mode`), else the variant, else what your `backgroundColor` reads as. Turn the layer off with `designSystem: false`, or every token read with `tokens: false`.
