import { ChartContext } from '../../../../graph-utils/src/index.ts';

export declare function getBarElement(context: ChartContext, taskId: string): HTMLElement | null;
export declare function getBarRowElement(context: ChartContext, taskId: string): HTMLElement | null;
export declare function getTaskRowElement(context: ChartContext, taskId: string): HTMLElement | null;
export declare function updateColumnContent(context: ChartContext, taskId: string, columnKey: string, value: string): void;
export declare function setTaskRowBackgroundColor(context: ChartContext, taskId: string, bgColor: string): void;
