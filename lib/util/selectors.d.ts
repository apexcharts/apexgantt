/**
 * CSS selector constants for Gantt DOM elements.
 *
 * Centralising selectors here prevents string duplication and makes
 * find-and-replace safe when class names change.
 */
export declare const Selectors: {
    readonly ganttContainer: ".gantt-container";
    readonly actionsContainer: ".gantt-actions-container";
    readonly splitBar: ".split-bar-container";
    readonly tasksContainer: ".tasks-container";
    readonly tasksHeader: ".tasks-header";
    readonly tasksBodyWrapper: ".tasks-body-wrapper";
    readonly tasksDataContainer: ".tasks-data-container";
    readonly tasksDataRow: ".tasks-data-row";
    readonly tasksEmptyRow: ".tasks-empty-row";
    readonly tasksDataCell: ".tasks-data-cell";
    readonly timelineContainer: ".timeline-container";
    readonly timelineHeader: ".timeline-header";
    readonly timelineHeaderCell: ".timeline-header-cell";
    readonly timelineBodyWrapper: ".timeline-body-wrapper";
    readonly timelineBody: ".timeline-body";
    readonly timelineDataRow: ".timeline-data-row";
    readonly timelineEmptyRow: ".timeline-empty-row";
    readonly timelineDataCell: ".timeline-data-cell";
    readonly horizontalScroll: ".timeline-horizontal-scroll";
    readonly horizontalScrollContent: ".timeline-horizontal-scroll-content";
    readonly barContainer: ".bar-container";
    readonly virtualizerTopSpacer: ".virtualizer-top-spacer";
    readonly virtualizerBottomSpacer: ".virtualizer-bottom-spacer";
};
export type SelectorKey = keyof typeof Selectors;
