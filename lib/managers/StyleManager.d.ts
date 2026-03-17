import { DomCache } from './ScrollManager';
import { GanttOptionsInternal } from '../models/Options';
import { ChartContext } from '../../../../graph-utils/src/index.ts';

/**
 * StyleManager handles all style-related functionality for the Gantt chart.
 * This includes CSS injection, CSS variables, shadow DOM setup, and watermark handling.
 */
export declare class StyleManager {
    private element;
    private domCache;
    private options;
    private chartContext;
    private isShadowDOM;
    private instanceId;
    private stylesInjected;
    constructor(element: HTMLElement, domCache: DomCache, options: GanttOptionsInternal, chartContext: ChartContext, isShadowDOM: boolean, instanceId: string);
    /**
     * Setup shadow DOM environment if needed
     */
    setupShadowDOMEnvironment(): void;
    /**
     * Inject all required styles with context awareness
     */
    injectGanttStyles(): void;
    /**
     * Inject styles directly for shadow DOM
     */
    injectStylesDirectly(): void;
    /**
     * Set CSS custom properties based on options.
     * User-defined --apex-gantt-* CSS variables on the container element take
     * precedence over JS option values.
     */
    setCSSVariables(): void;
    /**
     * Handle watermark display based on license validation
     */
    handleWatermark(): void;
    /**
     * Determine if a color is dark based on luminance
     */
    isColorDark(color: string): boolean;
    /**
     * Cleanup scrollbar-specific styles
     */
    cleanupScrollbarStyles(): void;
    /**
     * Update the options reference after a theme change or update() call.
     */
    updateOptions(options: GanttOptionsInternal): void;
    /**
     * Reset styles injected flag (useful for re-rendering)
     */
    resetStylesInjected(): void;
    /**
     * Check if styles have been injected
     */
    areStylesInjected(): boolean;
}
