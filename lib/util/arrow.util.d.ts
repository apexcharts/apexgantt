import { DependencyType } from '../models/Tasks';
import { ChartContext } from '../../../../graph-utils/src/index.ts';

export declare function updateArrow(context: ChartContext, fromId: string, toId: string, arrowLinkInstanceId: string, dependencyType?: DependencyType, rowHeight?: number): boolean;
