import { Task } from './Tasks';
import { GanttOptions } from './Options';
import { ViewMode } from '../util/gantt.util';

export type onUpdateBarCallback = (id: string, options: Partial<Task>) => void;
export declare class BarResizeManager {
    private taskId;
    private options;
    private interactionState;
    private task;
    constructor(taskId: string, options: GanttOptions, viewMode: ViewMode);
    private createMouseMoveHandler;
    private createMouseUpHandler;
    private createResizeMouseDownHandler;
    makeResizable(barElement: HTMLDivElement, onUpdate?: onUpdateBarCallback): () => void;
}
