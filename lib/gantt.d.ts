import { Task } from './models/Tasks';
import { GanttUserOptions } from './models/Options';

export declare class ApexGantt {
    element: HTMLElement;
    private options;
    private viewMode;
    private stylesInjected;
    constructor(element: HTMLElement, options?: GanttUserOptions);
    static setLicense(key: string): void;
    /**
     * Alternative method to inject styles directly for shadow DOM
     */
    private injectStylesDirectly;
    /**
     * Inject all required styles for shadow DOM support
     */
    private injectGanttStyles;
    /**
     * Handle watermark display based on license validation
     */
    private handleWatermark;
    private setCSSVariables;
    private initializeTooltip;
    private setupZoomEventListener;
    private setupRowBackgroundColors;
    private renderDependencyArrows;
    private setupDependencyArrowEvents;
    private createZoomButtons;
    private createViewModeContainer;
    private createExportDropdown;
    private createLayout;
    private rerenderTimeline;
    private updateToolbarAfterZoom;
    render(): void;
    renderToolbar(container: HTMLElement): void;
    update(options: GanttUserOptions): void;
    updateTask(taskId: string, updatedTask: Partial<Task>): void;
    zoomIn(): void;
    zoomOut(): void;
    destroy(): void;
}
