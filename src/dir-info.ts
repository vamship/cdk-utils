import _path from 'path';
import { argValidator as _argValidator } from '@vamship/arg-utils';

/**
 * Class that represents a directory in a construct hierarchy. Exposes methods
 * and properties that allow directory/path information to be used to initialize
 * and/or configure the construct.
 */
export default class DirInfo {
    private _name: string;
    private _path: string;
    private _absPath: string;
    private _parentPath: string;
    private _absPathTokens: string[];

    /**
     * @param path The path to the directory.
     */
    constructor(path) {
        _argValidator.checkString(path, 1, 'Invalid path (arg #1)');

        const parsedPath = _path.parse(_path.normalize(path));
        this._name = parsedPath.base;
        this._path = _path.join(parsedPath.dir, parsedPath.base);
        this._absPath = _path.resolve(path);
        this._parentPath = _path.resolve(parsedPath.dir);

        this._absPathTokens = this._absPath.split(_path.sep);
    }

    /**
     * Gets the name of the current directory, not including any parent paths.
     *
     * @return The name of the current directory.
     */
    public get name(): string {
        return this._name;
    }

    /**
     * Gets the normalized path of the current directory. This path may be
     * relative or absolute depending on how the object was initialized.
     *
     * @return The normalized path.
     */
    public get path(): string {
        return this._path;
    }

    /**
     * Gets the absolute path to the current directory.
     *
     * @return The absolute directory path.
     */
    public get absPath(): string {
        return this._absPath;
    }

    /**
     * Gets the absolute normalized path of the parent directory.
     *
     * @return The normalized path.
     */
    public get parentPath(): string {
        return this._parentPath;
    }

    /**
     * Gets the path to an API route, formulating the path from the specified
     * base directory.
     *
     * @param basePath The base path from which to calculate the
     *        api route path. This path should separate tokens using a forward
     *        slash (/)
     *
     * @return The calculated relative path.
     */
    public getApiRoutePath(basePath: string): string {
        _argValidator.checkString(basePath, 1, 'Invalid basePath (arg #1)');

        const basePathTokens = _path.resolve(basePath).split(_path.sep);

        if (basePathTokens.length > this._absPathTokens.length) {
            throw new Error('Base has more levels than the directory path');
        }

        basePathTokens.forEach((token, index) => {
            if (token !== this._absPathTokens[index]) {
                throw new Error('Base path does not exist in directory path');
            }
        });

        const startIndex = basePathTokens.length;

        return [''].concat(this._absPathTokens.slice(startIndex)).join('/');
    }

    /**
     * Creates a child directory for the current directory.
     *
     * @param name The name of the child directory
     *
     * @return {Object} An object that represents the child directory.
     */
    public createChild(name: string): DirInfo {
        _argValidator.checkString(name, 1, 'Invalid name (arg #1)');

        return new DirInfo(_path.join(this.path, name));
    }
}
