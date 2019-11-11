/**
 * Representation of required and optional parameters to an API Gateway method.
 * The parameters are broken up into three section, one for each location that
 * might contain the parameter - header, path or querystring.
 */
export default interface IRequestParams {
    /**
     * Defines the header parameters used by the method.
     */
    header: { [key: string]: boolean };

    /**
     * Defines the path parameters used by the method.
     */
    path: { [key: string]: boolean };

    /**
     * Defines the querystring parameters used by the method.
     */
    querystring: { [key: string]: boolean };
} // eslint-disable-line semi
