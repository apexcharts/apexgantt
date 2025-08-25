import { TUnit } from './gantt.util';
import { Dayjs } from 'dayjs';

export interface HeaderObject {
    readonly data: string;
    readonly width: number;
}
export declare const MonthsInQuarter: {
    1: string[];
    2: string[];
    3: string[];
    4: string[];
};
export declare function getRange(startDate: Dayjs, endDate: Dayjs, type: TUnit): Dayjs[];
export declare function getDaysInRange(startDate: Dayjs, endDate: Dayjs): Dayjs[];
export declare function getWeeksInRange(startDate: Dayjs, endDate: Dayjs): Dayjs[];
export declare function getMonthsInRange(startDate: Dayjs, endDate: Dayjs): Dayjs[];
export declare function getQuartersInRange(startDate: Dayjs, endDate: Dayjs): Dayjs[];
export declare function getYearsInRange(startDate: Dayjs, endDate: Dayjs): Dayjs[];
export declare function getDayModeData(startDate: Dayjs, endDate: Dayjs, columnWidth: number): [HeaderObject[], string[]];
export declare function getWeekModeData(startDate: Dayjs, endDate: Dayjs, columnWidth: number): [HeaderObject[], string[]];
export declare function getMonthModeData(startDate: Dayjs, endDate: Dayjs, columnWidth: number): [HeaderObject[], string[]];
export declare function getQuarterModeData(startDate: Dayjs, endDate: Dayjs, columnWidth: number): [HeaderObject[], string[]];
export declare function getYearModeData(startDate: Dayjs, endDate: Dayjs, columnWidth: number): [HeaderObject[], null];
