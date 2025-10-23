import { ChartContext } from '../../../../graph-utils/src/index.ts';

interface SplitViewOptions {
    readonly leftContainerClass?: string;
    readonly leftContainerWidth?: number;
    readonly rightContainerClass?: string;
}
export declare class SplitView {
    private chartContext;
    private leftContent;
    private rightContent;
    private options;
    private isDragging;
    private leftContainer;
    private rightContainer;
    private splitBarContainer;
    private mouseMoveHandler;
    private mouseUpHandler;
    constructor(chartContext: ChartContext, leftContent: Element | Element[], rightContent: Element | Element[], options?: SplitViewOptions);
    private getSplitViewStyles;
    private injectStyles;
    private buildElements;
    private attachEventListeners;
    private dispatchResizeEvent;
    private cleanupEventListeners;
    render(): Element[];
    destroy(): void;
}
export {};
