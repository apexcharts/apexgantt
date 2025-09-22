export interface DependencyArrowUpdateDetail {
    fromId: string;
    toId: string;
    type: 'FF' | 'FS' | 'SF' | 'SS';
}
export interface DependencyArrowUpdateEvent extends CustomEvent {
    detail: DependencyArrowUpdateDetail;
}
export declare function isDependencyArrowUpdateEvent(event: Event): event is DependencyArrowUpdateEvent;
