import _fs from 'fs';
import _path from 'path';

import { Construct } from '@aws-cdk/core';

import { argValidator as _argValidator } from '@vamship/arg-utils';
import { Promise } from 'bluebird';

import ConstructFactory from './construct-factory';
import DirInfo from './dir-info';

import { IConstructProps } from './construct-props';

function _loadModule(path: string): unknown {
    const module = require(path); // eslint-disable-line @typescript-eslint/no-var-requires
    return module.default || module;
}

/**
 * Class that can be used to traverse a file system, load constructs from
 * individual files, initialize and configure them.
 *
 * Constructs can be defined in individual files, but must be wrapped with a
 * ConstructFactory instance. Any file that does not export a ConstructFactory
 * instance will be ignored.
 */
export default class ConstructBuilder {
    private _rootPath: string;
    private _factoryModules?: ConstructFactory<any>[]; // eslint-disable-line @typescript-eslint/no-explicit-any

    /**
     * @param rootPath The path to the root directory that contains the
     *        construct definitions.
     */
    constructor(rootPath: string) {
        _argValidator.checkString(rootPath, 1, 'Invalid rootPath (arg #1)');

        this._rootPath = rootPath;
        this._factoryModules = undefined;
    }

    /**
     * Recursively loads constructs from the specified directory.
     *
     * @static
     * @private
     * @param dirInfo An object representing the directory that is
     *        currently being traversed.
     */
    private static async _loadRecursive(directory: DirInfo): Promise<void> {
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
            } else if (file.isFile() && name.endsWith('.js')) {
                const modulePath = _path.resolve(directory.absPath, name);
                return {
                    construct: _loadModule(modulePath),
                    directory
                };
            }
        })
            .filter((item) => !!item)
            .reduce((result, modules) => result.concat(modules), []);

        return results;
    }

    /**
     * Initializes and configures each of the loaded constructs using the
     * specified scope.
     *
     * @param scope The scope to which each of the constructs will be bound.
     * @param [props] An optional collection of properties that will be passed
     *        down to the init/config operations.
     */
    async build(scope: Construct, props: IConstructProps): Promise<void> {
        _argValidator.checkObject(scope, 'Invalid scope (arg #1)');
        props = Object.assign({}, props);

        const modules = await ConstructBuilder._loadRecursive(
            new DirInfo(this._rootPath)
        );

        this._factoryModules = modules.filter(
            ({ construct }) => construct instanceof ConstructFactory
        );

        return Promise.map(this._factoryModules, ({ construct }) =>
            construct.init(scope, props)
        );
    }
}
