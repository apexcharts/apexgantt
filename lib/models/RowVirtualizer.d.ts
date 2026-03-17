/**
 * Configuration for the RowVirtualizer.
 */
export interface RowVirtualizerConfig {
    /** Height of each row in pixels. */
    readonly rowHeight: number;
    /** Extra rows to render above/below the visible viewport. Defaults to 5. */
    readonly overscan?: number;
    /** Total number of rows in the dataset. */
    readonly totalRows: number;
    /** Height of the scrollable container in pixels. */
    readonly containerHeight: number;
}
/**
 * Represents a contiguous range of row indices that should be rendered.
 */
export interface VisibleRange {
    /** First row index to render (inclusive). */
    readonly startIndex: number;
    /** Last row index to render (inclusive). */
    readonly endIndex: number;
}
/**
 * Pure-computation virtualizer that determines which rows are visible given
 * a scroll position, container height, row height, and overscan buffer.
 *
 * This class has **no DOM dependency** — it only computes index ranges and
 * pixel offsets. Integration code is responsible for reading scroll events
 * and applying the computed ranges to the DOM.
 *
 * @example
 * ```ts
 * const v = new RowVirtualizer({ rowHeight: 28, totalRows: 10_000, containerHeight: 600 });
 * v.setScrollTop(1400);
 * const { startIndex, endIndex } = v.getVisibleRange();
 * ```
 */
export declare class RowVirtualizer {
    private _rowHeight;
    private _overscan;
    private _totalRows;
    private _containerHeight;
    private _scrollTop;
    constructor(config: RowVirtualizerConfig);
    /**
     * Return the inclusive range `[startIndex, endIndex]` of row indices that
     * should be present in the DOM. The range includes the overscan buffer on
     * both sides of the viewport.
     *
     * When there are zero rows the returned range is `{ startIndex: 0, endIndex: -1 }`
     * — consumers should treat `endIndex < startIndex` as "nothing to render".
     */
    getVisibleRange(): VisibleRange;
    /** Total scrollable height for the full dataset (`totalRows × rowHeight`). */
    getTotalHeight(): number;
    /** Pixel offset from the top of the scroll container for the given row index. */
    getOffsetForIndex(index: number): number;
    /**
     * Height of the spacer `div` that should be placed **above** the first
     * rendered row so that the visible rows appear at the correct scroll position.
     */
    getTopSpacerHeight(): number;
    /**
     * Height of the spacer `div` that should be placed **below** the last
     * rendered row so that the scrollbar reflects the full dataset height.
     */
    getBottomSpacerHeight(): number;
    /**
     * Number of rows in the current visible range (including overscan).
     */
    getVisibleCount(): number;
    /** Update the current vertical scroll offset (clamped to ≥ 0). */
    setScrollTop(scrollTop: number): void;
    /** Update the total number of rows (e.g. after expand/collapse). Clamped to ≥ 0. */
    setTotalRows(totalRows: number): void;
    /** Update the container height (e.g. after resize). Clamped to ≥ 0. */
    setContainerHeight(containerHeight: number): void;
    /** Update the overscan buffer (e.g. after actual container height is known). */
    setOverscan(overscan: number): void;
    get scrollTop(): number;
    get totalRows(): number;
    get containerHeight(): number;
    get rowHeight(): number;
    get overscan(): number;
}
