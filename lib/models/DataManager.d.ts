import { Task } from './Tasks';
import { Dayjs } from 'dayjs';

type Dependency = {
    fromId: string;
    toId: string;
    type: 'FF' | 'FS' | 'SF' | 'SS';
};
export declare class DataManager {
    private dependencies;
    private taskMap;
    private taskTree;
    constructor(tasks?: Task[]);
    private buildTaskTree;
    private processLevel;
    /**
     * Sort tasks recursively by a specified date field (start or end).
     * @param field - The date field to sort by ('start' or 'end').
     */
    private sortTasksByDate;
    /**
     * Validate a single task.
     * @param task - Task to validate
     * @returns - The validated task
     */
    private validateTask;
    /**
     * Add a new dependency between tasks
     */
    addDependency(fromId: string, toId: string, type?: Dependency['type']): void;
    /**
     * Add a new task to the list.
     * @param task - Task to add
     */
    addTask(task: Partial<Task>): void;
    /**
     * Calculate the overall progress of all tasks.
     * @returns - Total progress percentage (0-100)
     */
    calculateProgress(): number;
    /**
     * Get a date range from all tasks.
     * @returns - The start and end date from all tasks
     */
    getDateRange(add: number, viewMode: any): [Dayjs, Dayjs];
    getFlatSortedTasks(tasks: Task[], getAll?: boolean): Task[];
    getFlatTasks(): Task[];
    getFlatVisibleTasks(): Task[];
    getNestedChildTasks(taskId: string, visibleOnly?: boolean): Task[];
    /**
     * Get a task by ID.
     * @param id - ID of the task
     * @returns - The task or null if not found
     */
    getTaskById(id: string): null | Task;
    /**
     * Get all dependencies for a task
     * @param taskId - ID of the task
     * @returns Object containing incoming and outgoing dependencies
     */
    getTaskDependencies(taskId: string): {
        incoming: Dependency[];
        outgoing: Dependency[];
    };
    /**
     * Get a all tasks.
     * @returns - The all tasks
     */
    getTasks(): Task[];
    /**
     * Get a all top parent tasks.
     * @returns - The all tasks
     */
    getTopParentTasks(): Task[];
    hasChildren(id: string): boolean;
    /**
     * Remove a dependency
     */
    removeDependency(fromId: string, toId: string): void;
    /**
     * Remove a task by ID.
     * @param id - ID of the task to remove
     */
    removeTask(id: string): void;
    /**
     * Validate and set the initial list of tasks.
     * @param tasks - Array of tasks to initialize the DataManager
     */
    setTasks(tasks: Task[]): void;
    toggleTask(id: string): void;
    /**
     * Update arrow positions when a task is moved
     * @param taskId - ID of the task being moved
     * @param dx - Change in x position
     */
    updateDependencyArrows(taskId: string): void;
    /**
     * Update an existing task by ID.
     * @param id - ID of the task to update
     * @param updates - Partial task updates
     */
    updateTask(id: string, updates: Partial<Task>): Task;
}
export declare const dataManager: DataManager;
export {};
