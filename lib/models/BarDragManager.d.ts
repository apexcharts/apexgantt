import { Task } from './Tasks';
import { GanttOptions } from './Options';
import { DataManager } from './DataManager';
import { ViewMode } from '../util/gantt.util';
import { ChartContext } from '../../../../graph-utils/src/index.ts';

export type onUpdateBarCallback = (id: string, options: Partial<Task>) => void;
export declare class BarDragManager {
    private taskId;
    private options;
    private chartContext;
    private dataManager;
    private dragState;
    private task;
    constructor(taskId: string, options: GanttOptions, viewMode: ViewMode, chartContext: ChartContext, dataManager: DataManager);
    private calculateFinalPosition;
    private createMouseDownHandler;
    private createMouseMoveHandler;
    private createMouseUpHandler;
    private emitTaskDraggedEvent;
    private isOutOfBounds;
    private moveBar;
    private moveChildBars;
    private updateChildrenPositions;
    private updateTaskPosition;
    makeDraggable(barElement: HTMLDivElement, onUpdate?: onUpdateBarCallback): () => void;
}
