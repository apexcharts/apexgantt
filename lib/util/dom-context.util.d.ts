interface HTMLCollectionLike<T extends Element = Element> {
    [index: number]: T;
    [Symbol.iterator](): Iterator<T>;
    item(index: number): null | T;
    readonly length: number;
    namedItem?(name: string): null | T;
}
export declare class DomContext {
    private static context;
    /**
     * Auto-detect and set the appropriate DOM context based on an element
     */
    static autoDetectContext(element: HTMLElement): void;
    /**
     * Initialize context from a container element - call this when creating Gantt
     */
    static initFromElement(element: HTMLElement): void;
    static createElement(tagName: string): HTMLElement;
    static createTextNode(data: string): Text;
    static getContext(): Document | ShadowRoot;
    static getElementById(id: string): HTMLElement | null;
    static getElementsByClassName(className: string): HTMLCollectionLike<Element> | HTMLCollectionOf<Element>;
    static querySelector<T extends Element = Element>(selector: string): null | T;
    static querySelectorAll<T extends Element = Element>(selector: string): NodeListOf<T>;
    static setContext(context: Document | ShadowRoot): void;
    /**
     * Helper method to get the container for appending elements (document.body or shadow root)
     */
    static getAppendContainer(): Node;
    /**
     * Helper method to get body element - for compatibility
     * @deprecated Use getAppendContainer() instead
     */
    static getBody(): Element;
    /**
     * Helper method to dispatch events in the correct context
     */
    static dispatchEvent(event: CustomEvent): void;
    /**
     * Add event listener in the correct context
     */
    static addEventListener(type: string, listener: EventListener, options?: boolean | AddEventListenerOptions): void;
    /**
     * Remove event listener from the correct context
     */
    static removeEventListener(type: string, listener: EventListener, options?: boolean | EventListenerOptions): void;
}
export {};
