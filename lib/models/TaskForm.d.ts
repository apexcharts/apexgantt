import { Task } from './Tasks';
import { DataManager } from './DataManager';
import { ChartContext } from '../../../../graph-utils/src/index.ts';

export declare class TaskForm {
    private chartContext;
    private dataManager;
    private task;
    private containerElement;
    private onSubmit;
    private dateFormat;
    private errors;
    private form;
    private submitButton;
    constructor(chartContext: ChartContext, dataManager: DataManager, task: Task, containerElement: HTMLElement, onSubmit: (updatedTask: Partial<Task>) => void, dateFormat?: string);
    private emitEvent;
    private clearError;
    private createForm;
    private formatDate;
    private handleSubmit;
    private setupFieldValidation;
    private showError;
    private updateSubmitButton;
    private validateDates;
    private validateName;
    private validateProgress;
    getElement(): HTMLFormElement;
}
