import { Task } from './Tasks';
import { VisibleRange } from './RowVirtualizer';
import { GanttOptions } from './Options';
import { DataManager } from './DataManager';
import { ViewMode } from '../util/gantt.util';
import { HeaderObject } from '../util/date.util';
import { Dayjs } from 'dayjs';
import { ChartContext } from '../../../../graph-utils/src/index.ts';

export declare class TimeLine {
    viewMode: ViewMode;
    options: GanttOptions;
    chartContext: ChartContext;
    dataManager: DataManager;
    constructor(viewMode: ViewMode, options: GanttOptions, chartContext: ChartContext, dataManager: DataManager);
    generateHeader(headerData: HeaderObject[], subHeader: null | string[]): HTMLElement;
    generateRow(taskId: string, cellCount: number): HTMLElement;
    generateRows(tasks: Task[], cellCount: number): HTMLElement;
    /**
     * Render only visible timeline rows with spacer divs for scroll height.
     */
    generateRowsVirtualized(allTasks: Task[], cellCount: number, range: VisibleRange, rowHeight: number): HTMLElement;
    private fillEmptyRows;
    getHeaderData(startDate: Dayjs, endDate: Dayjs, viewMode: ViewMode): [HeaderObject[], null | string[]] | null;
    render(virtualRange?: {
        allTasks: Task[];
        range: VisibleRange;
        rowHeight: number;
    }, prevVisibleIds?: Set<string>): HTMLElement[] | null;
}
