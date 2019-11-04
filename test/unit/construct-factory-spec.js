'use strict';

const _chai = require('chai');
_chai.use(require('sinon-chai'));
_chai.use(require('chai-as-promised'));
const _sinon = require('sinon');

const Promise = require('bluebird').Promise;
const expect = _chai.expect;

const { testValues: _testValues } = require('@vamship/test-utils');

const ConstructFactory = require('../../src/construct-factory');

describe('ConstructFactory', () => {
    function _createInstance(id, noOverride) {
        id = id || _testValues.getString('id');

        const factory = new ConstructFactory(id);
        if (!noOverride) {
            factory._init = () => ({});
        }

        return factory;
    }

    function _createScope(stackName) {
        stackName = stackName || _testValues.getString('stackName');
        return {
            stackName,
            toString: () => stackName
        };
    }

    describe('ctor()', () => {
        it('should throw an error if invoked without a valid id', () => {
            const inputs = _testValues.allButString('');
            const error = 'Invalid id (arg #1)';

            inputs.forEach((id) => {
                const wrapper = () => new ConstructFactory(id);

                expect(wrapper).to.throw(error);
            });
        });

        it('should return an object with the expected methods and properties', () => {
            const id = _testValues.getString('id');
            const factory = new ConstructFactory(id);

            expect(factory).to.be.an('object');

            // Public methods
            expect(factory.init).to.be.a('function');
            expect(factory.getConstruct).to.be.a('function');

            // Protected methods
            expect(factory._init).to.be.a('function');
        });
    });

    describe('_init() [default behavior]', () => {
        it('should throw an error if invoked', async () => {
            const factory = _createInstance(undefined, true);
            const error = 'Not implemented (ConstructFactory._init())';

            const ret = factory._init();
            await expect(ret).to.be.rejectedWith(error);
        });
    });

    describe('init()', () => {
        it('should throw an error if invoked without a valid scope', async () => {
            const inputs = _testValues.allButObject();
            const error = 'Invalid scope (arg #1)';

            const result = Promise.map(inputs, (scope) => {
                const factory = _createInstance();
                const dirInfo = {};
                const props = {};

                const ret = factory.init(scope, dirInfo, props);
                return expect(ret).to.be.rejectedWith(error);
            });

            await expect(result).to.have.been.fulfilled;
        });

        it('should throw an error if invoked without valid dirInfo', async () => {
            const inputs = _testValues.allButObject();
            const error = 'Invalid dirInfo (arg #2)';

            const result = Promise.map(inputs, (dirInfo) => {
                const factory = _createInstance();
                const scope = {};
                const props = {};
                const wrapper = () => factory.init(scope, dirInfo, props);

                const ret = factory.init(scope, dirInfo, props);
                return expect(ret).to.be.rejectedWith(error);
            });

            await expect(result).to.have.been.fulfilled;
        });

        it('should throw an error if invoked without valid dirInfo', async () => {
            const inputs = _testValues.allButObject();
            const error = 'Invalid props (arg #3)';

            const result = Promise.map(inputs, (props) => {
                const factory = _createInstance();
                const scope = {};
                const dirInfo = {};
                const wrapper = () => factory.init(scope, dirInfo, props);

                const ret = factory.init(scope, dirInfo, props);
                return expect(ret).to.be.rejectedWith(error);
            });

            await expect(result).to.have.been.fulfilled;
        });

        it('should throw an error if a construct for the specific scope has already been created', async () => {
            const stackName = 'my_stack_1';

            const factory = _createInstance();
            const scope = _createScope(stackName);
            const error = `Construct has already been initialized for scope [${stackName}]`;

            await factory.init(scope, {}, {});

            const ret = factory.init(scope, {}, {});

            await expect(ret).to.be.rejectedWith(error);
        });

        it('should invoke the protected init method to create a new instance', () => {
            const id = _testValues.getString('id');
            const stackName = 'my_stack_1';
            const scope = _createScope(stackName);
            const dirInfo = {};
            const props = {};

            const factory = _createInstance(id);
            const initMock = _sinon.stub(factory, '_init');

            expect(initMock).to.not.have.been.called;

            factory.init(scope, dirInfo, props);

            expect(initMock).to.have.been.calledOnce;
            expect(initMock).to.have.been.calledWithExactly(
                scope,
                id,
                dirInfo,
                props
            );
        });

        it('should throw an error if the protected init method throws an error', async () => {
            const id = _testValues.getString('id');
            const stackName = 'my_stack_1';
            const scope = _createScope(stackName);
            const dirInfo = {};
            const props = {};
            const error = 'something went wrong!';

            const factory = _createInstance(id);
            const instance = factory.getConstruct(scope);

            factory._init = async () => {
                await Promise.reject(error);
            };

            const ret = factory.init(scope, dirInfo, props);
            await expect(ret).to.be.rejectedWith(error);
            await expect(instance).to.be.rejectedWith(error);
        });

        it('should resolve the promise if the protected init method resolves', async () => {
            const id = _testValues.getString('id');
            const stackName = 'my_stack_1';
            const scope = _createScope(stackName);
            const dirInfo = {};
            const props = {};
            const expectedConstruct = {};

            const factory = _createInstance(id);
            const instance = factory.getConstruct(scope);

            factory._init = async () => {
                return await Promise.resolve(expectedConstruct);
            };

            const ret = factory.init(scope, dirInfo, props);
            await expect(ret).to.be.fulfilled;
            await expect(instance).to.be.fulfilled.then((data) => {
                expect(data).to.equal(expectedConstruct);
            });
        });
    });

    describe('getConstruct()', () => {
        it('should throw an error if invoked without a valid scope', async () => {
            const inputs = _testValues.allButObject();
            const error = 'Invalid scope (arg #1)';

            const result = Promise.map(inputs, (scope) => {
                const factory = _createInstance();

                const ret = factory.getConstruct(scope);
                return expect(ret).to.be.rejectedWith(error);
            });

            return expect(result).to.have.been.fulfilled;
        });

        it('should return a reference to the construct after the init promise has been resolved', async () => {
            const stackName = 'my_stack_1';
            const scope = _createScope(stackName);
            const expectedConstruct = {};

            let resolveWaiter = null;

            const factory = _createInstance();
            factory._init = async () => {
                const waiter = new Promise((resolve, reject) => {
                    resolveWaiter = resolve;
                });

                await waiter;
                return expectedConstruct;
            };
            factory.init(scope, {}, {});

            const ret = factory.getConstruct(scope);

            expect(ret).to.not.equal(expectedConstruct);

            resolveWaiter();
            const construct = await ret;

            expect(construct).to.equal(expectedConstruct);
        });
    });
});
