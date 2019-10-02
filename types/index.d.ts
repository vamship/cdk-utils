import { Construct } from '@aws-cdk/core';

declare module vamship__cdk_utils {
    /**
     * Structure that represents a construct and its related metadata.
     */
    interface ConstructInfo {
        /**
         * Reference to the initialized construct.
         */
        construct: Construct;

        /**
         * Information about the directory that the construct was defined in.
         */
        directory: DirInfo;
    }

    /**
     * Generic interface for key value pairs.
     */
    interface IProps {
        /**
         * Generic key/value pair.
         */
        [key: string]: any;
    }

    /**
     * Class that represents a directory in a construct hierarchy. Exposes methods
     * and properties that allow directory/path information to be used to initialize
     * and/or configure the construct.
     */
    class DirInfo {
        /**
         * @param {String} path The path to the directory.
         */
        constructor(path: string);

        /**
         * Gets the name of the current directory, not including any parent paths.
         *
         * @return {String} The name of the current directory.
         */
        public name: string;

        /**
         * Gets the normalized path of the current directory. This path may be
         * relative or absolute depending on how the object was initialized.
         *
         * @return {String} The normalized path.
         */
        public path: string;

        /**
         * Gets the absolute path to the current directory.
         *
         * @return {String} The absolute directory path.
         */
        public absPath: string;

        /**
         * Gets the absolute normalized path of the parent directory.
         *
         * @return {String} The normalized path.
         */
        public parentPath: string;

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
        public getApiRoutePath(basePath: string): string;

        /**
         * Creates a child directory for the current directory.
         *
         * @param {String} name The name of the child directory
         *
         * @return {Object} An object that represents the child directory.
         */
        public createChild(name: string): DirInfo;
    }

    /**
     * Class that represents a directory in a construct hierarchy. Exposes methods
     * and properties that allow directory/path information to be used to initialize
     * and/or configure the construct.
     */
    class ConstructBuilder {
        /**
         * @param {String} rootPath The path to the root directory that contains the
         *        construct definitions.
         */
        constructor(rootPath: string);

        /**
         * Recursively loads constructs from the specified directory.
         *
         * @static
         * @private
         * @param {DirInfo} dirInfo An object representing the directory that is
         *        currently being traversed.
         */
        private static _loadRecursive(
            directory: DirInfo
        ): Promise<ConstructInfo[]>;

        /**
         * Recursively loads constructs from the specified directory, but in a
         * synchronous manner. This is the synchronous equivalent of the
         * _loadRecursive() method.
         *
         * @static
         * @private
         * @param {DirInfo} dirInfo An object representing the directory that is
         *        currently being traversed.
         */
        private static _loadRecursiveSync(directory: DirInfo): ConstructInfo[];

        /**
         * Recursively traverses the file system and loads all constructs defined
         * within the tree. This can be executed as an asynchronous pre-build step
         * prior to initializing and configuring modules using build().
         *
         * @returns {Promise} A promise that is resolved or rejected based on the
         *          outcome of the load operation.
         */
        public prefetchConstructs(): Promise<void>;

        /**
         * Initializes and configures each of the loaded constructs using the
         * specified scope.
         *
         * @param {Object} scope The scope to which each of the constructs will be
         *        bound.
         * @param {Object} [props] An optional collection of properties that will be
         *        passed down to the init/config operations.
         */
        public build(scope: Construct, props?: IProps): void;
    }

    /**
     * Class that can be used to generate constructs of a specific kind, but bound
     * to different scopes. Provides methods to initialize and configure constructs,
     * and also to get instance references for a specific scope.
     *
     * The construct factory is intended to be invoked in two passes:
     * 1. The first pass initializes all of the constructs in the factory
     * 2. The second pass is used to configure the constructs
     *
     * The second pass may reference other construct instances - for example,
     * granting a lambda function access to specific tables - that have been
     * initialized in the first pass.
     */
    abstract class ConstructFactory<TConstruct extends Construct> {
        /**
         * @param {String} id The id of the construct represented by this factory.
         */
        constructor(id: string);

        /**
         * Abstract method that must be overridden by specific construct factories,
         * initializing the construct, and setting properties appropriately. The
         * current implementation is a placeholder only, and will throw an error.
         *
         * @protected
         * @param {Object} scope The scope to which the newly created construct will
         *        be bound.
         * @param {String} id The id of the construct.
         * @param {Object} dirInfo An object that contains information about the
         *        location of the construct file on the file system. This
         *        information can be used by some constructs (API methods) for
         *        initialization.
         * @param {Object} props An optional collection of properties that can be
         *        used to initialize the construct.
         *
         * @returns {Object} Reference to an initialized construct object.
         */
        protected abstract _init(
            scope: Construct,
            id: string,
            dirInfo: DirInfo,
            props?: IProps
        ): TConstruct;

        /**
         * Abstract method that must be overridden by specific construct factories,
         * configuring the construct after all constructs have been initialized. The
         * current implementation is a placeholder that does nothing.
         *
         * @protected
         * @param {Object} construct Reference to the initialized construct.
         * @param {Object} scope The scope to which construct is bound.
         * @param {Object} dirInfo An object that contains information about the
         *        location of the construct file on the file system. This
         *        information can be used by some constructs (API methods) for
         *        initialization.
         * @param {Object} props An optional collection of properties that can be
         *        used to configure the construct.
         */
        protected _configure(
            construct: TConstruct,
            scope: Construct,
            dirInfo: DirInfo,
            props?: IProps
        ): void;

        /**
         * Invoked to initialize the construct during the initialization pass. This
         * method delegates actual initialization to an abstract protected method.
         *
         * @param {Object} scope The scope to which the newly created construct will
         *        be bound.
         * @param {Object} dirInfo An object that contains information about the
         *        location of the construct file on the file system. This
         *        information can be used by some constructs (API methods) for
         *        initialization.
         * @param {Object} props An optional collection of properties that can be
         *        used to initialize the construct.
         */
        public init(scope: Construct, dirInfo: DirInfo, props?: IProps): void;

        /**
         * Invoked to allow the construct to configure itself during the
         * configuration pass. This method delegates actual configuration to a
         * protected abstract method.
         *
         * @param {Object} scope The scope to which construct that is being
         *        configured will be bound.
         * @param {Object} dirInfo An object that contains information about the
         *        location of the construct file on the file system. This
         *        information can be used by some constructs (API methods) for
         *        initialization.
         * @param {Object} props An optional collection of properties that can be
         *        used to configure the construct.
         */
        public configure(
            scope: TConstruct,
            dirInfo: DirInfo,
            props: IProps
        ): void;

        /**
         * Returns an instance of the construct for the specified scope.
         *
         * @param {Object} scope The scope to which the newly created construct will
         *        be bound.
         *
         * @returns {Object} Reference to the construct object.
         */
        public getInstance(scope: Construct): TConstruct;
    }
}

export = vamship__cdk_utils;
