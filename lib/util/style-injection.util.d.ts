import { ChartContext } from '../../../../graph-utils/src/index.ts';

export declare class StyleInjection {
    private static injectedStyles;
    /**
     * Inject CSS styles into the correct context using ChartContext
     * @param chartContext - Chart context instance
     * @param css - CSS string to inject
     * @param id - Optional ID for the style element to prevent duplicates
     */
    static injectStyles(chartContext: ChartContext, css: string, id?: string): void;
    /**
     * Check if a style with given ID has been injected
     */
    static hasStyle(id: string): boolean;
    /**
     * Remove a style by ID using ChartContext
     */
    static removeStyle(chartContext: ChartContext, id: string): void;
    /**
     * Clear all injected styles using ChartContext
     */
    static clearAll(chartContext: ChartContext): void;
}
