import { Task } from './Tasks';
import { GanttOptions } from './Options';
import { DataManager } from './DataManager';
import { ViewMode } from '../util/gantt.util';
import { ChartContext } from '../../../../graph-utils/src/index.ts';

export type onUpdateBarCallback = (id: string, options: Partial<Task>) => void;
export declare class BarResizeManager {
    private taskId;
    private options;
    private chartContext;
    private dataManager;
    private interactionState;
    private task;
    constructor(taskId: string, options: GanttOptions, viewMode: ViewMode, chartContext: ChartContext, dataManager: DataManager);
    private createMouseMoveHandler;
    private createMouseUpHandler;
    private emitTaskResizedEvent;
    private createResizeMouseDownHandler;
    makeResizable(barElement: HTMLDivElement, onUpdate?: onUpdateBarCallback): () => void;
}
