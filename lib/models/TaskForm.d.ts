import { Task } from './Tasks';

export declare class TaskForm {
    private task;
    private onSubmit;
    private dateFormat;
    private errors;
    private form;
    private submitButton;
    constructor(task: Task, onSubmit: (updatedTask: Partial<Task>) => void, dateFormat?: string);
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
