'use strict';

const { argValidator: _argValidator } = require('@vamship/arg-utils');

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
class ConstructFactory {
    /**
     * @param {String} id The id of the construct represented by this factory.
     */
    constructor(id) {
        _argValidator.checkString(id, 1, 'Invalid id (arg #1)');
        this._map = {};
        this._id = id;
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
     * @returns {Object} Reference to an initialized construct object.
     */
    _init(scope, id, dirInfo, props) {
        throw new Error('Not implemented (ConstructFactory._init())');
    }

    /**
     * Abstract method that must be overridden by specific construct factories,
     * configuring the construct after all constructs have been initialized. The
     * current implementation is a placeholder that does nothing.
     *
     * @protected
     * @param {Object} construct Reference to the initialized construct.
     * @param {Object} dirInfo An object that contains information about the
     *        location of the construct file on the file system. This
     *        information can be used by some constructs (API methods) for
     *        initialization.
     * @param {Object} props An optional collection of properties that can be
     *        used to configure the construct.
     */
    _configure(construct, dirInfo, props) {}

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
    init(scope, dirInfo, props) {
        _argValidator.checkObject(scope, 'Invalid scope (arg #1)');
        _argValidator.checkObject(dirInfo, 'Invalid dirInfo (arg #2)');
        _argValidator.checkObject(props, 'Invalid props (arg #3)');

        const { stackName } = scope;

        if (this._map[stackName]) {
            throw new Error(
                `Construct has already been initialized for scope [${stackName}]`
            );
        }

        this._map[stackName] = this._init(scope, this._id, dirInfo, props);
    }

    /**
     * Invoked to allow the construct to configure itself during the
     * configuration pass. This method delegates actual configuration to a
     * protected abstract method.
     *
     * @param {Object} scope The scope to which the newly created construct will
     *        be bound.
     * @param {Object} dirInfo An object that contains information about the
     *        location of the construct file on the file system. This
     *        information can be used by some constructs (API methods) for
     *        initialization.
     * @param {Object} props An optional collection of properties that can be
     *        used to configure the construct.
     */
    configure(scope, dirInfo, props) {
        _argValidator.checkObject(scope, 'Invalid scope (arg #1)');
        _argValidator.checkObject(dirInfo, 'Invalid dirInfo (arg #2)');
        _argValidator.checkObject(props, 'Invalid props (arg #3)');

        const { stackName } = scope;

        const construct = this._map[stackName];

        if (!construct) {
            throw new Error(
                `Construct has not been initialized for scope [${stackName}]`
            );
        }
        this._configure(construct, dirInfo, props);
    }

    /**
     * Returns an instance of the construct for the specified scope.
     *
     * @param {Object} scope The scope to which the newly created construct will
     *        be bound.
     *
     * @returns {Object} Reference to the construct object.
     */
    getInstance(scope) {
        _argValidator.checkObject(scope, 'Invalid scope (arg #1)');

        const { stackName } = scope;

        const construct = this._map[stackName];

        if (!construct) {
            throw new Error(
                `Construct has not been initialized for scope [${stackName}]`
            );
        }

        return construct;
    }
}

module.exports = ConstructFactory;
