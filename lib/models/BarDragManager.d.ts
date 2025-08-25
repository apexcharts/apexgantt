import { Task } from './Tasks';
import { GanttOptions } from './Options';
import { ViewMode } from '../util/gantt.util';

export type onUpdateBarCallback = (id: string, options: Partial<Task>) => void;
export declare class BarDragManager {
    private taskId;
    private options;
    private dragState;
    private task;
    constructor(taskId: string, options: GanttOptions, viewMode: ViewMode);
    private calculateFinalPosition;
    private createMouseDownHandler;
    private createMouseMoveHandler;
    private createMouseUpHandler;
    private isOutOfBounds;
    private moveBar;
    private moveChildBars;
    private updateChildrenPositions;
    private updateTaskPosition;
    makeDraggable(barElement: HTMLDivElement, onUpdate?: onUpdateBarCallback): () => void;
}
