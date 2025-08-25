export interface DialogOptions {
    closeOnClickOutside?: boolean;
    closeOnEscape?: boolean;
    content?: HTMLElement | string;
    height?: string;
    id: string;
    modal?: boolean;
    title?: string;
    width?: string;
}
export declare class Dialog {
    private options;
    private container;
    private overlay;
    constructor(options: DialogOptions);
    private createDialog;
    private createDialogStructure;
    private setupEventListeners;
    private updateDialogContent;
    destroy(): void;
    hide(): void;
    isVisible(): boolean;
    setContent(content: HTMLElement | string): void;
    show(): void;
}
