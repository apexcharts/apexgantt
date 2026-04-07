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
| `viewMode` | `ViewMode` | `ViewMode.Month` | Timeline granularity: `Day`, `Week`, `Month`, `Quarter`, `Year`. |
| `inputDateFormat` | `string` | `'MM-DD-YYYY'` | dayjs-compatible format used to parse `startTime` / `endTime` values. |
| `canvasStyle` | `string` | `''` | Arbitrary CSS injected onto the root container element. |
| `backgroundColor` | `string` | `'#FFFFFF'` | Background color of the chart container. |
| `headerBackground` | `string` | `'#f3f3f3'` | Background color of the header row. |
| `rowHeight` | `number` | `28` | Height of each task row in pixels. |
| `rowBackgroundColors` | `string[]` | `['#FFFFFF']` | Alternating row background colors; the pattern cycles automatically. |
| `tasksContainerWidth` | `number` | `425` | Initial pixel width of the task-list panel. |
| `columnConfig` | `ColumnListItem[]` | `undefined` | Custom column definitions for the task-list panel. Controls which columns are shown, their order, titles, and widths. See [Column Configuration](#column-configuration). |
| `barBackgroundColor` | `string` | `'#537CFA'` | Default background fill color for task bars. |
| `barBorderRadius` | `string` | `'5px'` | CSS border-radius applied to task bars. |
| `barMargin` | `number` | `4` | Top and bottom margin inside each row for the task bar. |
| `barTextColor` | `string` | `'#FFFFFF'` | Text color rendered inside task bars. |
| `arrowColor` | `string` | `'#0D6EFD'` | Color of dependency arrows between tasks. |
| `borderColor` | `string` | `'#eff0f0'` | Color of cell and row divider lines. |
| `cellBorderColor` | `string` | `'#eff0f0'` | Border color for all cells in the task table and timeline grid. |
| `cellBorderWidth` | `string` | `'1px'` | CSS border-width for all cell lines. |
| `enableResize` | `boolean` | `true` | Allow the task-list panel to be resized by dragging the divider. |
| `enableExport` | `boolean` | `true` | Show the SVG export button in the toolbar. |
| `enableTaskDrag` | `boolean` | `true` | Allow tasks to be reordered by dragging rows in the task list. |
| `enableTaskEdit` | `boolean` | `false` | Show the inline task-edit form when a task row is clicked. |
| `enableTaskResize` | `boolean` | `true` | Allow task bars to be resized by dragging their handles. |
| `enableTooltip` | `boolean` | `true` | Show a tooltip on task-bar hover. |
| `enableCriticalPath` | `boolean` | `false` | Calculate and highlight the critical path through dependent tasks. |
| `criticalBarColor` | `string` | `'#e53935'` | Fill color for task bars on the critical path. |
| `criticalArrowColor` | `string` | `'#e53935'` | Stroke color for dependency arrows on the critical path. |
| `baseline` | `Partial<BaselineOptions>` | `undefined` | When `enabled: true`, renders a thin baseline bar below each task bar. |
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

Available column keys: `Name`, `StartTime`, `EndTime`, `Duration`, `Progress`.

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

### ColumnListItem properties

| Property   | Type        | Default       | Description                                       |
| ---------- | ----------- | ------------- | ------------------------------------------------- |
| `key`      | `ColumnKey` | —             | Which data field this column shows (required).    |
| `title`    | `string`    | from defaults | Header text displayed for the column.             |
| `minWidth` | `string`    | `'30px'`      | Minimum CSS width (used in `minmax()`).           |
| `flexGrow` | `number`    | `1`           | Flex proportion (used as `fr` units in CSS Grid). |
| `visible`  | `boolean`   | `true`        | Set to `false` to hide the column.                |

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

**Supported fields:** `id`, `name`, `startTime`, `endTime`, `progress`, `type`, `parentId`, `dependency`, `barBackgroundColor`, `rowBackgroundColor`, `collapsed`

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
  viewMode: 'Week',
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

### 3. `zoomIn()`

Zooms in the gantt based on current view mode. View mode direction for zoom in year -> quarter -> month -> week -> day

#### Example

```js
ganttInstance.zoomOut();
```

### 4. `zoomOut()`

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
| `taskDragged` | Task bar is dragged | `{ taskId, oldStartTime, oldEndTime, newStartTime, newEndTime, daysMoved, affectedChildTasks, timestamp }` |
| `taskResized` | Task bar is resized | `{ taskId, resizeHandle, oldStartTime, oldEndTime, newStartTime, newEndTime, durationChange, timestamp }` |

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
