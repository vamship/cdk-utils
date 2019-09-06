'use strict';

const _path = require('path');

const { argValidator: _argValidator } = require('@vamship/arg-utils');

/**
 * Class that represents a directory in a construct hierarchy. Exposes methods
 * and properties that allow directory/path information to be used to initialize
 * and/or configure the construct.
 */
class DirInfo {
    /**
     * @param {String} name The name of the directory
     * @param {String} parentPath Path to the parent directory that contains
     *        this directory
     */
    constructor(name, parentPath) {
        _argValidator.checkString(name, 1, 'Invalid name (arg #1)');
        _argValidator.checkString(parentPath, 0, 'Invalid parentPath (arg #2)');

        this._name = name;
        parentPath = parentPath.replace(new RegExp(`\\${_path.sep}$`), '');
        this._pathTokens = parentPath.split(_path.sep);
        this._dirTokens = this._pathTokens
            .filter((item) => item !== '')
            .concat(this._name);

        this._path = this._dirTokens.join(_path.sep);
        this._absPath = _path.resolve.apply(_path, this._dirTokens);
    }

    /**
     * Gets the name of the current directory, not including any parent paths.
     *
     * @return {String} The name of the current directory.
     */
    get name() {
        return this._name;
    }

    /**
     * Gets the path of the current directory, relative to the root used when
     * initializing the directory tree.
     *
     * @return {String} The path, relative to api root.
     */
    get path() {
        return this._path;
    }

    /**
     * Gets the absolute path to the current directory.
     *
     * @return {String} The absolute directory path.
     */
    get absPath() {
        return this._absPath;
    }

    /**
     * Gets the path to an API route, formulating the path from the specified
     * base directory.
     *
     * @param {String} basePath The base path from which to calculate the
     *        api route path. This path should separate tokens using a forward
     *        slash (/)
     *
     * @return {String} The calculated relative path.
     */
    getApiRoutePath(basePath) {
        _argValidator.checkString(basePath, 0, 'Invalid basePath (arg #1)');

        const basePathTokens = basePath
            .split('/')
            .filter((item) => item !== '');

        if (basePathTokens.length > this._pathTokens.length) {
            throw new Error('Base has more levels than the directory path');
        }

        basePathTokens.forEach((token, index) => {
            if (token !== this._dirTokens[index]) {
                throw new Error('Base path does not exist in directory path');
            }
        });

        const startIndex = basePathTokens.length;

        return [''].concat(this._dirTokens.slice(startIndex)).join('/');
    }

    /**
     * Creates a child directory for the current directory.
     *
     * @param {String} name The name of the child directory
     *
     * @return {Object} An object that represents the child directory.
     */
    createChild(name) {
        _argValidator.checkString(name, 1, 'Invalid name (arg #1)');

        return new DirInfo(name, this.path);
    }
}

module.exports = DirInfo;
