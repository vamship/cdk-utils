'use strict';

const _fs = require('fs');

const { argValidator: _argValidator } = require('@vamship/arg-utils');
const { Promise } = require('bluebird');

const ConstructFactory = require('./construct-factory');
const DirInfo = require('./dir-info');

function _loadModule(path) {
    return require(path);
}

/**
 * Class that can be used to traverse a file system, load constructs from
 * individual files, initialize and then configure them.
 *
 * Constructs can be defined in individual files, but must be wrapped with a
 * ConstructFactory instance. Any file that does not export a ConstructFactory
 * instance will be ignored.
 */
class ConstructBuilder {
    /**
     * @param {String} rootPath The path to the root directory that contains the
     *        construct definitions.
     */
    constructor(rootPath) {
        _argValidator.checkString(rootPath, 1, 'Invalid rootPath (arg #1)');
        this._rootPath = rootPath;
        this._factoryModules = undefined;
    }

    /**
     * Recursively loads constructs from the specified directory.
     *
     * @static
     * @private
     * @param {DirInfo} dirInfo An object representing the directory that is
     *        currently being traversed.
     */
    static async _loadRecursive(directory) {
        _argValidator.checkInstance(
            directory,
            DirInfo,
            'Invalid directory (arg #1)'
        );
        const readdir = Promise.promisify(_fs.readdir.bind(_fs));

        const files = await readdir(directory.absPath, {
            withFileTypes: true
        });

        const results = await Promise.map(files, async (file) => {
            const { name } = file;
            if (file.isDirectory()) {
                return await ConstructBuilder._loadRecursive(
                    directory.createChild(name)
                );
            } else if (file.isFile()) {
                if (name.endsWith('.js')) {
                    return {
                        construct: _loadModule(name),
                        directory
                    };
                }
            }
        })
            .filter((item) => !!item)
            .reduce((result, modules) => result.concat(modules), []);

        return results;
    }

    /**
     * Recursively traverses the file system and loads all constructs defined
     * within the tree. The contructs are not initialized or configured.
     * Initialization and configuration can be performed by using the build()
     * method.
     *
     * @returns {Promise} A promise that is resolved or rejected based on the
     *          outcome of the load operation.
     */
    async load() {
        this._factoryModules = await ConstructBuilder._loadRecursive(
            this._rootPath
        ).filter(({ construct }) => construct instanceof ConstructFactory);
    }

    /**
     * Initializes and configures each of the loaded constructs using the
     * specified scope.
     *
     * @param {Object} scope The scope to which each of the constructs will be
     *        bound.
     */
    build(scope) {
        _argValidator.checkObject(scope, 'Invalid scope (arg #1)');
        if (!this._factoryModules) {
            throw new Error(
                'Cannot build constructs. Factory modules have not been loaded'
            );
        }

        this._factoryModules.forEach(({ construct, directory }) =>
            construct.init(scope, directory)
        );

        this._factoryModules.forEach(({ construct, directory }) =>
            construct.configure(directory)
        );
    }
}

module.exports = ConstructBuilder;