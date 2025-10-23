import { ChartContext } from '../../../../graph-utils/src/index.ts';

export interface Edge {
    readonly id: string;
    readonly source: HTMLElement;
    readonly target: HTMLElement;
}
export interface ArrowLinkOptions {
    readonly arrowColor: string;
    readonly height: number;
    readonly paddingX: number;
    readonly paddingY: number;
    readonly width: number;
}
export declare class ArrowLink {
    private elements;
    private svg;
    options: Partial<ArrowLinkOptions>;
    private instanceId;
    private chartContext;
    constructor(instanceId?: string);
    getInstanceId(): string;
    static calculateArrowPath(fromElement: HTMLElement, toElement: HTMLElement, svg: SVGSVGElement, options: Partial<ArrowLinkOptions>): string;
    static drawArrow(fromElement: HTMLElement, toElement: HTMLElement, svg: SVGSVGElement, options: Partial<ArrowLinkOptions>, id: string, instanceId?: string, chartContext?: ChartContext): SVGPathElement;
    static updateArrow(fromElement: HTMLElement, toElement: HTMLElement, svg: SVGSVGElement, options: Partial<ArrowLinkOptions>, id: string): void;
    private createMarker;
    render(container: Element, elements: readonly Edge[], options: Partial<ArrowLinkOptions>, chartContext?: ChartContext): SVGSVGElement;
}
