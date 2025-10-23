import { ViewMode } from '../util/gantt.util';
import { DataManager } from './DataManager';

export declare class GanttStateManager {
    private state;
    /**
     * capture current state before re-render
     */
    captureState(element: HTMLElement, dataManager: DataManager, viewMode: ViewMode): void;
    /**
     * restore state after re-render
     */
    restoreState(element: HTMLElement, skipScroll?: boolean): void;
    /**
     * Get stored view mode
     */
    getViewMode(): ViewMode;
    hasState(): boolean;
    clearState(): void;
}
