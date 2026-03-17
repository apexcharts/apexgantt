/**
 * WAAPI (Web Animations API) helpers for the Gantt chart.
 *
 * All public functions are fire-and-forget: they call element.animate()
 * and return immediately — the render path is never blocked.
 *
 * Reduced-motion guard: reads the `.gantt-reduced-motion` class set by
 * setupReducedMotion() in gantt.ts.  This avoids a second matchMedia listener
 * and works correctly inside Shadow DOM where window.matchMedia is not scoped.
 *
 * Stagger formula: delay = min(rowIndex * 30, 500) ms.
 * For virtual-scroll updates pass rowIndex = 0 to get a flat 0 ms delay —
 * sequential staggering during active scroll feels janky and should be avoided.
 */
/** Stores previous bar geometry keyed by task ID, used by animateBarZoom. */
export interface BarGeometry {
    left: number;
    width: number;
}
/**
 * Maximum time (ms) before all bar/row entrance animations have settled.
 * = max stagger delay (500) + bar animation duration (200).
 * Used to delay arrow rendering so arrows appear after bars are in place.
 */
export declare const BAR_ANIMATION_TOTAL_MS = 200;
/** Returns true when the user has requested reduced motion. */
export declare function isReducedMotion(rootElement: HTMLElement): boolean;
/**
 * Animate a `.bar-timeline` element in with a fade + slide from above.
 * The bar starts slightly above its final row position and fades in as it
 * settles downward — gives a clean "dropping into place" feel.
 *
 * Uses `fill: 'none'` so no WAAPI composite styles linger after the animation
 * ends — the bar's inline `top`/`left`/`width` styles take over cleanly.
 */
export declare function animateBarEntrance(barElement: HTMLElement, rowIndex: number, rootElement: HTMLElement): void;
/**
 * Fade in dependency arrows after bar/row animations have settled.
 *
 * When `changedIds` is provided (collapse/expand), only the arrow `<path>`
 * elements whose `data-edgeid` involves one of those task IDs are hidden and
 * faded in — all other arrows remain fully visible throughout.
 *
 * When `changedIds` is omitted (initial render / zoom), the entire SVG element
 * is hidden and faded in as one unit.
 *
 * Pass `instant = true` (e.g. drag/resize fallback) to skip the delay.
 */
export declare function fadeInArrowsSvg(svgElement: SVGElement | null, rootElement: HTMLElement, instant?: boolean, changedIds?: Set<string>): void;
/**
 * Animate a `.bar-timeline` element from its previous position/size to its
 * new position/size after a zoom level change.
 *
 * The new `left` and `width` are already applied as inline styles by the
 * render pipeline. WAAPI temporarily overrides them (via explicit pixel
 * keyframes) and then releases control with `fill: 'none'` — the inline
 * styles resume at the correct final values with no composite style leakage.
 *
 * Pass `fromLeft === toLeft && fromWidth === toWidth` to skip (no-op).
 */
export declare function animateBarZoom(barElement: HTMLElement, from: BarGeometry, to: BarGeometry, rootElement: HTMLElement): void;
