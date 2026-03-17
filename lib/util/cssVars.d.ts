/**
 * Reads a CSS custom property value from an element using getComputedStyle.
 * Returns an empty string if the property is not set.
 */
export declare function readCSSVar(element: HTMLElement, name: string): string;
/**
 * Reads all supported ApexGantt CSS custom properties from the given element
 * and returns an object of resolved values.  Empty string means the variable
 * was not set by the user, so the caller should fall back to the JS option.
 *
 * Supported CSS custom properties:
 *   --apex-gantt-bar-fill         → barBackgroundColor
 *   --apex-gantt-background-color → backgroundColor
 *   --apex-gantt-row-bg-even      → rowBackgroundColors[0]
 *   --apex-gantt-row-bg-odd       → rowBackgroundColors[1]
 *   --apex-gantt-header-bg        → headerBackground
 *   --apex-gantt-grid-line        → cellBorderColor
 *   --apex-gantt-dependency-line  → arrowColor
 *   --apex-gantt-font-family      → fontFamily
 *   --apex-gantt-font-size        → fontSize
 *   --apex-gantt-font-color       → fontColor
 */
export declare function readGanttCSSVars(element: HTMLElement): {
    barFill: string;
    bgColor: string;
    rowBgEven: string;
    rowBgOdd: string;
    headerBg: string;
    gridLine: string;
    dependencyLine: string;
    fontFamily: string;
    fontSize: string;
    fontColor: string;
};
