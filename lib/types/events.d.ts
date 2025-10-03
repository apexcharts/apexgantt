import { Task } from '../models/Tasks';

export interface DependencyArrowUpdateDetail {
    fromId: string;
    toId: string;
    type: 'FF' | 'FS' | 'SF' | 'SS';
    chartInstanceId: string;
    arrowLinkInstanceId?: string;
}
export interface DependencyArrowUpdateEvent extends CustomEvent {
    detail: DependencyArrowUpdateDetail;
}
export declare function isDependencyArrowUpdateEvent(event: Event): event is DependencyArrowUpdateEvent;
export interface TaskUpdateEventDetail {
    taskId: string;
    updates: Partial<Task>;
    updatedTask: Task;
    timestamp: number;
}
export interface TaskValidationErrorEventDetail {
    taskId: string;
    errors: Array<{
        field: string;
        message: string;
    }>;
    timestamp: number;
}
export interface TaskUpdateSuccessEventDetail {
    taskId: string;
    updatedTask: Task;
    timestamp: number;
}
export interface TaskUpdateErrorEventDetail {
    taskId: string;
    error: Error;
    timestamp: number;
}
/**
 * chart event names
 * use these constants to attach event listeners like below
 *
 * element.addEventListener(GanttEvents.TASK_UPDATE, (e) => {
 *   console.log(e.detail);
 * });
 */
export declare const GanttEvents: {
    /**
     * emits when a task is being updated (before completion)
     */
    readonly TASK_UPDATE: "taskUpdate";
    /**
     * emits when form validation fails
     */
    readonly TASK_VALIDATION_ERROR: "taskValidationError";
    /**
     * emits after a task update completes successfully
     */
    readonly TASK_UPDATE_SUCCESS: "taskUpdateSuccess";
    /**
     * emits when a task update fails
     */
    readonly TASK_UPDATE_ERROR: "taskUpdateError";
};
