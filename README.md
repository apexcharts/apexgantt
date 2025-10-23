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

## ApexGantt Options

The layout can be configured by either setting the properties in the table below by passing a second arg to ApexGantt with these properties set. The latter takes precedence.

| Options                   | Default                       | Description                                         |
| ------------------------- | ----------------------------- | --------------------------------------------------- |
| width                     | `100%`                        | The width of graph container                        |
| height                    | `500px`                       | The height of graph container                       |
| series,                   | `[]`                          | Data for gantt. See format below                    |
| theme,                    | `light`                       | Built in light and dark theme for easy styling      |
| canvasStyle               | `None`                        | The css styles for canvas root container            |
| viewMode                  | `ViewMode.Month`              | View mode                                           |
| arrowColor                | `#0D6EFD`                     | Color for the dependency arrows                     |
| rowHeight                 | `28`                          | Height for timeline row                             |
| rowBackgroundColors       | `['#FFFFFF']`                 | Alternate row colors.                               |
| barBackgroundColor        | `#537CFA`                     | Background color for timeline bar                   |
| barBorderRadius           | `5px`                         | Border radius for timeline bar                      |
| barMargin                 | `4`                           | Top and bottom margin for timeline bar              |
| barTextColor              | `#FFFFFF`                     | Text color for timeline bar                         |
| cellBorderColor           | `#eff0f0`                     | Border color for all table cells and timeline cells |
| cellBorderWidth           | `1px`                         | Border width for all table cells and timeline cells |
| enableToolbar             | `false`                       | Enable/disable graph toolbar                        |
| enableResize              | `true`                        | Enable/disable gantt sidebar resize                 |
| enableExport              | `true`                        | Enable/disable gantt export options                 |
| enableTaskDrag            | `true`                        | Enable/disable gantt export options                 |
| enableTaskEdit            | `false`                       | Enable/disable gantt export options                 |
| enableTaskResize          | `true`                        | Enable/disable gantt export options                 |
| headerBackground          | `#f3f3f3`                     | Background color for header                         |
| inputDateFormat           | `MM-DD-YYYY`                  | Input date format                                   |
| tasksContainerWidth       | `425`                         | Task sidebar container width                        |
| tooltipId                 | `apexgantt-tooltip-container` | The tooltip HTML element id                         |
| tooltipTemplate           | `tooltipTemplate`             | The HTML template for tooltip                       |
| tooltipBorderColor        | `#BCBCBC`                     | The border color of tooltip                         |
| tooltipBGColor            | `#FFFFFF`                     | The background color of tooltip                     |
| fontSize                  | `14px`                        | The size of font of nodes                           |
| fontFamily                | `None`                        | The font family of nodes                            |
| fontWeight                | `400`                         | The font weight of nodes                            |
| fontColor                 | `#000000`                     | The font color of nodes                             |
| annotationBgColor         | `#F9D1FC`                     | The backgrond color of annotation                   |
| annotationBorderColor     | `#E273EA`                     | The backgrond color of annotation                   |
| annotationBorderDashArray | `[]`                          | The border dash array of annotation                 |
| annotationBorderWidth     | `2`                           | The border width of annotation                      |
| annotationOrientation     | `Orientation.Horizontal`      | The orientation of annotation                       |
| annotations               | `[]`                          | See sample data below                               |

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

ApexGantt emits CustomEvents on the container element when tasks are updated through the dialog form.

| Event                 | When                          | Detail                                        |
| --------------------- | ----------------------------- | --------------------------------------------- |
| `taskUpdate`          | Task is being updated         | `{ taskId, updates, updatedTask, timestamp }` |
| `taskUpdateSuccess`   | Update completed successfully | `{ taskId, updatedTask, timestamp }`          |
| `taskValidationError` | Form validation failed        | `{ taskId, errors, timestamp }`               |
| `taskUpdateError`     | Update failed                 | `{ taskId, error, timestamp }`                |

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
