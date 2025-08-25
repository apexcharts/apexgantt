import { Task } from './Tasks';
import { GanttOptions } from './Options';
import { ViewMode } from '../util/gantt.util';
import { HeaderObject } from '../util/date.util';
import { Dayjs } from 'dayjs';

export declare class TimeLine {
    viewMode: ViewMode;
    options: GanttOptions;
    constructor(viewMode: ViewMode, options: GanttOptions);
    generateHeader(headerData: HeaderObject[], subHeader: null | string[]): HTMLElement;
    generateRow(taskId: string, cellCount: number): HTMLElement;
    generateRows(tasks: Task[], cellCount: number): HTMLElement;
    getHeaderData(startDate: Dayjs, endDate: Dayjs, viewMode: ViewMode): [HeaderObject[], null | string[]] | null;
    render(): HTMLElement[] | null;
}
