/**
 * A collection of properties that can be passed down to construct factories
 * during the init phase.
 */
export interface IConstructProps {
    /**
     * A key value pair.
     */
    [key: string]: unknown;
}
