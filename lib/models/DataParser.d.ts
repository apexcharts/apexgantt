import { TaskInput } from './Tasks';

/**
 * can be a simple path string or an object with key and transform
 */
export type ParsingValue = string | {
    key: string;
    transform?: (value: any) => any;
};
/**
 * Configuration for parsing raw data into TaskInput format
 */
export interface ParsingConfig {
    id: ParsingValue;
    name: ParsingValue;
    startTime: ParsingValue;
    endTime?: ParsingValue;
    progress?: ParsingValue;
    type?: ParsingValue;
    parentId?: ParsingValue;
    dependency?: ParsingValue;
    barBackgroundColor?: ParsingValue;
    rowBackgroundColor?: ParsingValue;
    collapsed?: ParsingValue;
}
/**
 * DataParser - for parsing raw data objects into TaskInput format
 */
export declare class DataParser {
    /**
     * Extract value from nested object using dot notation path
     * @param obj - source object
     * @param path - dot notation path (e.g., 'project.task.title')
     * @returns Extracted value
     */
    private static getNestedValue;
    /**
     * single parsing value configuration
     * @param obj - Source object
     * @param parsingValue - Either a string path or object with key and transform
     * @returns Processed value
     */
    private static processParsingValue;
    /**
     * Parse an array of raw data objects into TaskInput array
     * @param data - Array of raw data objects
     * @param config - Parsing configuration mapping
     * @returns Array of TaskInput objects
     */
    static parse(data: any[], config: ParsingConfig): TaskInput[];
    /**
     * validate parsing configuration
     * @param config - parsing configuration to validate
     * @returns true if valid, false otherwise
     */
    static validateConfig(config: ParsingConfig): boolean;
}
