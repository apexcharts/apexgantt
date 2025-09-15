import { Task } from './models/Tasks';
import { GanttOptions } from './models/Options';

export declare class ApexGantt {
    element: HTMLElement;
    private options;
    private viewMode;
    constructor(element: HTMLElement, options?: GanttOptions);
    static setLicense(key: string): void;
    /**
     * Handle watermark display based on license validation
     */
    private handleWatermark;
    private renderDependencyArrows;
    private setCSSVariables;
    render(): void;
    renderToolbar(container: Element): void;
    update(options: GanttOptions): void;
    updateTask(taskId: string, updatedTask: Partial<Task>): void;
    zoomIn(): void;
    zoomOut(): void;
}
