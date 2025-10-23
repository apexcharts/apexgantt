import { Task, TaskInput } from './Tasks';
import { ChartContext } from '../../../../graph-utils/src/index.ts';
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
    private arrowLinkInstanceId;
    constructor(tasks?: TaskInput[]);
    private buildTaskTree;
    private processLevel;
    private sortTasksByDate;
    private validateTask;
    addDependency(fromId: string, toId: string, type?: Dependency['type']): void;
    addTask(taskInput: Partial<TaskInput>): void;
    calculateProgress(): number;
    getDateRange(add: number, viewMode: any): [Dayjs, Dayjs];
    getFlatSortedTasks(tasks: Task[], getAll?: boolean): Task[];
    getFlatTasks(): Task[];
    getFlatVisibleTasks(): Task[];
    getNestedChildTasks(taskId: string, visibleOnly?: boolean): Task[];
    getTaskById(id: string): null | Task;
    getTaskDependencies(taskId: string): {
        incoming: Dependency[];
        outgoing: Dependency[];
    };
    getTasks(): Task[];
    getTopParentTasks(): Task[];
    hasChildren(id: string): boolean;
    removeDependency(fromId: string, toId: string): void;
    removeTask(id: string): void;
    setTasks(taskInputs: TaskInput[]): void;
    toggleTask(id: string): void;
    setArrowLinkInstanceId(instanceId: string): void;
    updateDependencyArrows(taskId: string, chartContext?: ChartContext): void;
    updateTask(id: string, updates: Partial<TaskInput>): Task;
}
export {};
