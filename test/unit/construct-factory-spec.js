'use strict';

const _chai = require('chai');
_chai.use(require('sinon-chai'));
_chai.use(require('chai-as-promised'));
const _sinon = require('sinon');

const expect = _chai.expect;

const { testValues: _testValues } = require('@vamship/test-utils');

const ConstructFactory = require('../../src/construct-factory');

describe('ConstructFactory', function() {
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
            expect(factory.configure).to.be.a('function');
            expect(factory.getInstance).to.be.a('function');

            // Protected methods
            expect(factory._init).to.be.a('function');
            expect(factory.configure).to.be.a('function');
        });
    });

    describe('_init() [default behavior]', () => {
        it('should throw an error if invoked', () => {
            const factory = _createInstance(undefined, true);
            const error = 'Not implemented (ConstructFactory._init())';

            const wrapper = () => factory._init();
            expect(wrapper).to.throw(error);
        });
    });

    describe('_configure() [default behavior]', () => {
        it('should do nothing when invoked', () => {
            const factory = _createInstance(undefined, true);

            factory._configure();
        });
    });

    describe('init()', () => {
        it('should throw an error if invoked without a valid scope', () => {
            const inputs = _testValues.allButObject();
            const error = 'Invalid scope (arg #1)';

            inputs.forEach((scope) => {
                const factory = _createInstance();
                const props = {};
                const dirInfo = {};
                const wrapper = () => factory.init(scope, props, dirInfo);

                expect(wrapper).to.throw(error);
            });
        });

        it('should throw an error if invoked without valid props', () => {
            const inputs = _testValues.allButObject();
            const error = 'Invalid props (arg #2)';

            inputs.forEach((props) => {
                const factory = _createInstance();
                const scope = {};
                const dirInfo = {};
                const wrapper = () => factory.init(scope, props, dirInfo);

                expect(wrapper).to.throw(error);
            });
        });

        it('should throw an error if invoked without valid dirInfo', () => {
            const inputs = _testValues.allButObject();
            const error = 'Invalid dirInfo (arg #3)';

            inputs.forEach((dirInfo) => {
                const factory = _createInstance();
                const scope = {};
                const props = {};
                const wrapper = () => factory.init(scope, props, dirInfo);

                expect(wrapper).to.throw(error);
            });
        });

        it('should throw an error if a construct for the specific scope has already been created', () => {
            const stackName = 'my_stack_1';

            const factory = _createInstance();
            const scope = _createScope(stackName);
            const error = `Construct has already been initialized for scope [${stackName}]`;

            factory.init(scope, {}, {});

            const wrapper = () => factory.init(scope, {}, {});

            expect(wrapper).to.throw(error);
        });

        it('should invoke the protected init method to create a new instance', () => {
            const id = _testValues.getString('id');
            const stackName = 'my_stack_1';
            const scope = _createScope(stackName);
            const props = {};
            const dirInfo = {};

            const factory = _createInstance(id);
            const initMock = _sinon.stub(factory, '_init');

            expect(initMock).to.not.have.been.called;

            factory.init(scope, props, dirInfo);

            expect(initMock).to.have.been.calledOnce;
            expect(initMock).to.have.been.calledWithExactly(
                scope,
                id,
                props,
                dirInfo
            );
        });
    });

    describe('configure()', () => {
        it('should throw an error if invoked without a valid scope', () => {
            const inputs = _testValues.allButObject();
            const error = 'Invalid scope (arg #1)';

            inputs.forEach((scope) => {
                const factory = _createInstance();
                const props = {};
                const dirInfo = {};
                const wrapper = () => factory.configure(scope, props, dirInfo);

                expect(wrapper).to.throw(error);
            });
        });

        it('should throw an error if invoked without valid props', () => {
            const inputs = _testValues.allButObject();
            const error = 'Invalid props (arg #2)';

            inputs.forEach((props) => {
                const factory = _createInstance();
                const scope = {};
                const dirInfo = {};
                const wrapper = () => factory.configure(scope, props, dirInfo);

                expect(wrapper).to.throw(error);
            });
        });

        it('should throw an error if invoked without valid dirInfo', () => {
            const inputs = _testValues.allButObject();
            const error = 'Invalid dirInfo (arg #3)';

            inputs.forEach((dirInfo) => {
                const factory = _createInstance();
                const scope = {};
                const props = {};
                const wrapper = () => factory.configure(scope, props, dirInfo);

                expect(wrapper).to.throw(error);
            });
        });

        it('should throw an error if the construct has been initialized for the scope', () => {
            const stackName = 'my_stack_1';

            const factory = _createInstance();
            const scope = _createScope(stackName);
            const error = `Construct has not been initialized for scope [${stackName}]`;

            const wrapper = () => factory.configure(scope, {}, {});

            expect(wrapper).to.throw(error);
        });

        it('should invoke the protected configure method on an existing instance', () => {
            const stackName = 'my_stack_1';
            const scope = _createScope(stackName);
            const props = {};
            const dirInfo = {};
            const construct = {};

            const factory = _createInstance();
            factory._init = () => construct;

            factory.init(scope, props, dirInfo);

            const configureMock = _sinon.stub(factory, '_configure');

            expect(configureMock).to.not.have.been.called;

            factory.configure(scope, props, dirInfo);

            expect(configureMock).to.have.been.calledOnce;
            expect(configureMock).to.have.been.calledWithExactly(
                construct,
                props,
                dirInfo
            );
        });
    });

    describe('getInstance()', () => {
        it('should throw an error if invoked without a valid scope', () => {
            const inputs = _testValues.allButObject();
            const error = 'Invalid scope (arg #1)';

            inputs.forEach((scope) => {
                const factory = _createInstance();
                const wrapper = () => factory.getInstance(scope);

                expect(wrapper).to.throw(error);
            });
        });

        it('should throw an error if the construct has been initialized for the scope', () => {
            const stackName = 'my_stack_1';

            const factory = _createInstance();
            const scope = _createScope(stackName);
            const error = `Construct has not been initialized for scope [${stackName}]`;

            const wrapper = () => factory.getInstance(scope);

            expect(wrapper).to.throw(error);
        });

        it('should return a reference to the construct initialized for the specified scope', () => {
            const stackName = 'my_stack_1';
            const scope = _createScope(stackName);
            const construct = {};

            const factory = _createInstance();
            factory._init = () => construct;
            factory.init(scope, {}, {});

            const ret = factory.getInstance(scope);

            expect(ret).to.equal(construct);
        });
    });
});
