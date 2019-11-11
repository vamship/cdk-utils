import { argValidator as _argValidator } from '@vamship/arg-utils';
import { Construct, Stack } from '@aws-cdk/core';

import DirInfo from './dir-info';
import { IConstructProps } from './construct-props';

/**
 * Represents a construct and its related init promise.
 */
class ConstructInfo<TConstruct extends Construct> {
    private _instance?: TConstruct;
    private _resolve: (construct: TConstruct) => void;
    private _reject: (error: Error | string) => void;
    private _promise: Promise<TConstruct>;

    /**
     */
    constructor() {
        this._resolve = () => {
            throw new Error('Construct promise resolver not initialized');
        };
        this._reject = () => {
            throw new Error('Construct promise rejecter not initialized');
        };
        this._promise = new Promise<TConstruct>((resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;
        });
    }

    /**
     * An instance of the initialized construct. This may be undefined if the
     * initialization promise has not yet settled.
     */
    public get instance(): TConstruct | undefined {
        return this._instance;
    }

    /**
     * The promise that will be resolved/rejected after the construct has been
     * initialized.
     */
    public get promise(): Promise<TConstruct> {
        return this._promise;
    }

    /**
     * Resolves the init promise for the construct.
     *
     * @param construct The construct that has just been initialized.
     */
    public resolve(construct: TConstruct): void {
        this._instance = construct;
        this._resolve(construct);
    }

    /**
     * Rejects the init promise for the construct.
     *
     * @param error The error associated with the rejection.
     */
    public reject(error: Error): void {
        this._reject(error);
    }
}

/**
 * Class that can be used to generate constructs of a specific kind, but bound
 * to different scopes. Provides methods to initialize and configure constructs,
 * and also to get instance references for a specific scope.
 *
 * The construct factory has an async initialization method that can reference
 * instances of other constructs for initialization and configuration. For
 * example, the construct for a lambda function might reference the construct
 * for a dynamodb table so that it can configure read/write access to the table.
 *
 * It is up to the developer to ensure that no circular dependencies are created
 * between constructs.
 */
export default abstract class ConstructFactory<TConstruct extends Construct> {
    private _id: string;
    private _constructMap: {
        [stackName: string]: ConstructInfo<TConstruct>;
    };

    /**
     * @param id The id of the construct represented by this factory.
     */
    constructor(id: string) {
        _argValidator.checkString(id, 1, 'Invalid id (arg #1)');
        this._constructMap = {};
        this._id = id;
    }

    /**
     * Returns a construct info object for the given scope. If this object has
     * does not exist, a new object will be created and returned.
     *
     * @private
     * @param scope The scope to which the newly created construct will
     *        be bound.
     * @returns An object that wraps the construct
     */
    private _getConstructInfo(scope: Stack): ConstructInfo<TConstruct> {
        const { stackName } = scope;

        let constructInfo = this._constructMap[stackName];

        if (!constructInfo) {
            constructInfo = new ConstructInfo<TConstruct>();
            this._constructMap[stackName] = constructInfo;
        }

        return constructInfo;
    }

    /**
     * Abstract method that must be overridden by specific construct factories,
     * initializing the construct, and setting properties appropriately. The
     * current implementation is a placeholder only, and will throw an error.
     *
     * @protected
     * @abstract
     * @param scope The scope to which the newly created construct will
     *        be bound.
     * @param id The id of the construct.
     * @param dirInfo An object that contains information about the
     *        location of the construct file on the file system. This
     *        information can be used by some constructs (API methods) for
     *        initialization.
     * @param props An optional collection of properties that can be
     *        used to initialize the construct.
     *
     * @returns A promise that will be resolved after the construct
     *          has been initialized.
     */
    protected abstract async _init(
        scope: Construct,
        id: string,
        dirInfo: DirInfo,
        props: IConstructProps
    ): Promise<TConstruct>;

    /**
     * Invoked to initialize the construct, and delegates actual initialization
     * to an abstract protected method.
     *
     * @param scope The scope to which the newly created construct will
     *        be bound.
     * @param dirInfo An object that contains information about the
     *        location of the construct file on the file system. This
     *        information can be used by some constructs (API methods) for
     *        initialization.
     * @param props An optional collection of properties that can be
     *        used to initialize the construct.
     *
     * @returns A promise that will be resolved after the construct
     *          has been initialized.
     */
    async init(
        scope: Stack,
        dirInfo: DirInfo,
        props: IConstructProps
    ): Promise<void> {
        _argValidator.checkObject(scope, 'Invalid scope (arg #1)');
        _argValidator.checkObject(dirInfo, 'Invalid dirInfo (arg #2)');
        _argValidator.checkObject(props, 'Invalid props (arg #3)');

        const constructInfo = this._getConstructInfo(scope);
        if (constructInfo.instance) {
            throw new Error(
                `Construct has already been initialized for scope [${
                    scope.stackName
                }]`
            );
        }

        try {
            const construct = await this._init(
                scope,
                this._id,
                dirInfo,
                Object.assign({}, props)
            );
            constructInfo.resolve(construct);
        } catch (ex) {
            constructInfo.reject(ex);
            throw ex;
        }
    }

    /**
     * Returns an instance of the construct for the specified scope.
     *
     * @param scope The scope to which the newly created construct will be
     *        bound.
     *
     * @returns Reference to the construct object.
     */
    async getConstruct(scope: Stack): Promise<TConstruct> {
        _argValidator.checkObject(scope, 'Invalid scope (arg #1)');

        return await this._getConstructInfo(scope).promise;
    }
}
