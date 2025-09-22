export declare class StyleInjection {
    private static injectedStyles;
    /**
     * Inject CSS styles into the correct context (document.head or shadow root)
     * @param css - CSS string to inject
     * @param id - Optional ID for the style element to prevent duplicates
     */
    static injectStyles(css: string, id?: string): void;
    /**
     * Check if a style with given ID has been injected
     */
    static hasStyle(id: string): boolean;
    /**
     * Remove a style by ID
     */
    static removeStyle(id: string): void;
    /**
     * Clear all injected styles
     */
    static clearAll(): void;
}
