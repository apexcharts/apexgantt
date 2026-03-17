import { Task } from '../models/Tasks';
import { Dependency } from '../models/DataManager';

export interface CriticalPathResult {
    /** IDs of tasks that lie on the critical path. */
    criticalTaskIds: Set<string>;
    /** Edge keys in the form `"fromId->toId"` for critical-path dependency arrows. */
    criticalEdgeKeys: Set<string>;
}
/**
 * Computes the critical path using the Critical Path Method (CPM).
 *
 * V1 scope: only FS (Finish-to-Start) dependencies are considered.
 * Non-FS edges are included for edge-key output only when both endpoints
 * are already identified as critical by the FS pass.
 *
 * Returns empty sets when:
 * - There are no tasks or dependencies
 * - The dependency graph contains a cycle
 */
export declare function computeCriticalPath(tasks: Task[], dependencies: Dependency[]): CriticalPathResult;
