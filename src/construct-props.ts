/**
 * A collection of properties that can be passed down to construct factories
 * during the init phase.
 */
export default interface IConstructProps {
    /**
     * A key value pair.
     */
    [key: string]: unknown;
} // eslint-disable-line semi
