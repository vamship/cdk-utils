'use strict';

const { argValidator: _argValidator } = require('@vamship/arg-utils');

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
class ConstructFactory {
    /**
     * @param {String} id The id of the construct represented by this factory.
     */
    constructor(id) {
        _argValidator.checkString(id, 1, 'Invalid id (arg #1)');
        this._constructMap = {};
        this._id = id;
    }

    /**
     * Returns a construct info object for the given scope. If this object has
     * does not exist, a new object will be created and returned.
     *
     * @private
     * @param {Object} scope The scope to which the newly created construct will
     *        be bound.
     * @returns {Object} An object that wraps the construct
     */
    _getConstructInfo(scope) {
        const { stackName } = scope;

        let constructInfo = this._constructMap[stackName];

        if (!constructInfo) {
            constructInfo = {
                instance: undefined
            };
            constructInfo.promise = new Promise((resolve, reject) => {
                constructInfo.resolve = resolve;
                constructInfo.reject = reject;
            });

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
     * @returns {Promise} A promise that will be resolved after the construct
     *          has been initialized.
     */
    async _init(scope, id, dirInfo, props) {
        throw new Error('Not implemented (ConstructFactory._init())');
    }

    /**
     * Invoked to initialize the construct, and delegates actual initialization
     * to an abstract protected method.
     *
     * @param {Object} scope The scope to which the newly created construct will
     *        be bound.
     * @param {Object} dirInfo An object that contains information about the
     *        location of the construct file on the file system. This
     *        information can be used by some constructs (API methods) for
     *        initialization.
     * @param {Object} props An optional collection of properties that can be
     *        used to initialize the construct.
     *
     * @returns {Promise} A promise that will be resolved after the construct
     *          has been initialized.
     */
    async init(scope, dirInfo, props) {
        _argValidator.checkObject(scope, 'Invalid scope (arg #1)');
        _argValidator.checkObject(dirInfo, 'Invalid dirInfo (arg #2)');
        _argValidator.checkObject(props, 'Invalid props (arg #3)');

        const constructInfo = this._getConstructInfo(scope);
        if (constructInfo.instance) {
            throw new Error(
                `Construct has already been initialized for scope [${scope.stackName}]`
            );
        }

        try {
            const construct = await this._init(scope, this._id, dirInfo, props);
            constructInfo.instance = construct;
            constructInfo.resolve(construct);
        } catch (ex) {
            constructInfo.reject(ex);
            throw ex;
        }
    }

    /**
     * Returns an instance of the construct for the specified scope.
     *
     * @param {Object} scope The scope to which the newly created construct will
     *        be bound.
     *
     * @returns {Object} Reference to the construct object.
     */
    async getConstruct(scope) {
        _argValidator.checkObject(scope, 'Invalid scope (arg #1)');

        return await this._getConstructInfo(scope).promise;
    }
}

module.exports = ConstructFactory;
