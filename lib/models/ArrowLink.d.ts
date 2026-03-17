import { DependencyType } from './Tasks';
import { ChartContext } from '../../../../graph-utils/src/index.ts';

export interface Edge {
    readonly id: string;
    readonly source: HTMLElement;
    readonly target: HTMLElement;
    /** Dependency type. Defaults to 'FS'. */
    readonly dependencyType?: DependencyType;
    /** Lag in pixels (positive = lag, negative = lead). Defaults to 0. */
    readonly lagPx?: number;
}
/**
 * Edge where positions are pre-computed as pixel rects (used when virtualization
 * is active and source/target bar elements may not be in the DOM).
 */
export interface EdgeWithRects {
    readonly id: string;
    readonly sourceRect: Rect;
    readonly targetRect: Rect;
    readonly dependencyType?: DependencyType;
    readonly lagPx?: number;
}
export interface ArrowLinkOptions {
    readonly arrowColor: string;
    readonly height: number;
    readonly paddingX: number;
    readonly paddingY: number;
    readonly width: number;
}
/** Minimal bounding-rect shape used by path calculations. */
export interface Rect {
    readonly left: number;
    readonly right: number;
    readonly top: number;
    readonly bottom: number;
    readonly width: number;
    readonly height: number;
}
export declare class ArrowLink {
    private elements;
    private svg;
    options: Partial<ArrowLinkOptions>;
    private instanceId;
    private chartContext;
    constructor(instanceId?: string);
    getInstanceId(): string;
    /**
     * Compute an arrow path from pre-computed rects instead of DOM elements.
     * Used when virtualization is active and some bar elements may not be in the DOM.
     */
    static calculateArrowPathFromRects(fromRect: Rect, toRect: Rect, options: Partial<ArrowLinkOptions>, dependencyType?: DependencyType): string;
    static calculateArrowPath(fromElement: HTMLElement, toElement: HTMLElement, svg: SVGSVGElement, options: Partial<ArrowLinkOptions>, dependencyType?: DependencyType): string;
    /**
     * Finish-to-Start (FS): A finish → B start.
     * Arrow exits the right edge of A and enters the left edge of B.
     */
    private static calculateFSPath;
    /**
     * Start-to-Start (SS): A start → B start.
     * Arrow exits the left edge of A and enters the left edge of B.
     * Routes along the left side of both tasks.
     */
    private static calculateSSPath;
    /**
     * Finish-to-Finish (FF): A finish → B finish.
     * Arrow exits the right edge of A and enters the right edge of B.
     * Routes along the right side of both tasks.
     * The arrowhead arrives from the right (pointing left into B).
     */
    private static calculateFFPath;
    /**
     * Start-to-Finish (SF): A start → B finish.
     * Arrow exits the left edge of A and enters the right edge of B with a ← arrowhead.
     *
     * Route (A above B):
     *   exit A.left → go left → drop to just below B's bottom → go right past B →
     *   rise into B's mid-Y → arrowhead points left (←)
     *
     * Route (A below B):
     *   exit A.left → go left → rise to just above B's top → go right past B →
     *   drop into B's mid-Y → arrowhead points left (←)
     *
     * By routing via outside B's vertical bounds we never cross through B's bar.
     */
    private static calculateSFPath;
    static drawArrow(fromElement: HTMLElement, toElement: HTMLElement, svg: SVGSVGElement, options: Partial<ArrowLinkOptions>, id: string, instanceId?: string, chartContext?: ChartContext, dependencyType?: DependencyType, lagPx?: number): SVGPathElement;
    static updateArrow(fromElement: HTMLElement, toElement: HTMLElement, svg: SVGSVGElement, options: Partial<ArrowLinkOptions>, id: string, dependencyType?: DependencyType): void;
    private createMarker;
    render(container: Element, elements: readonly Edge[], options: Partial<ArrowLinkOptions>, chartContext?: ChartContext): SVGSVGElement;
    /**
     * Render arrows using pre-computed rects instead of DOM elements.
     * Used when virtualization is active so arrows draw correctly even when
     * source/target bars are outside the virtual window and not in the DOM.
     */
    renderFromRects(container: Element, edges: readonly EdgeWithRects[], options: Partial<ArrowLinkOptions>, chartContext?: ChartContext): SVGSVGElement;
}
