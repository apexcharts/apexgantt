import { ChartContext } from '../../../../graph-utils/src/index.ts';

export interface DialogOptions {
    closeOnClickOutside?: boolean;
    closeOnEscape?: boolean;
    content?: HTMLElement | string;
    height?: string;
    id: string;
    modal?: boolean;
    title?: string;
    width?: string;
    positionRelativeToChart?: boolean;
}
export declare class Dialog {
    private chartContext;
    private options;
    private container;
    private overlay;
    private keydownHandler;
    private clickOutsideHandler;
    constructor(chartContext: ChartContext, options: DialogOptions);
    private createDialog;
    private createDialogStructure;
    /**
     * Position dialog relative to the chart container
     */
    private positionRelativeToChart;
    private setupEventListeners;
    private trapFocus;
    private updateDialogContent;
    private cleanupEventListeners;
    destroy(): void;
    hide(): void;
    isVisible(): boolean;
    setContent(content: HTMLElement | string): void;
    show(): void;
}
