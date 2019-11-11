/**
 * Options that influence how a statement within a template is mapped.
 */
export default interface IStatementOptions {
    /**
     * Determines if the a leading comma on the mapping statement is omitted.
     */
    noComma: boolean;

    /**
     * Determines if the the value being mapped in wrapped in quotes.
     */
    noQuotes: boolean;

    /**
     * Determines if new line characters will be escaped on the value being
     * mapped.
     */
    escapeNewLine: boolean;

    /**
     * The default value to use if the input does not define the requested
     * property.
     */
    defaultValue: unknown;
} // eslint-disable-line semi
