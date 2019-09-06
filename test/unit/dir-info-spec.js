'use strict';

const _chai = require('chai');
_chai.use(require('sinon-chai'));
_chai.use(require('chai-as-promised'));

const expect = _chai.expect;

const _path = require('path');
const { testValues: _testValues } = require('@vamship/test-utils');

const DirInfo = require('../../src/dir-info');

describe('DirInfo', () => {
    function _createInstance(name, parentPath) {
        name = typeof name !== 'string' ? _testValues.getString('name') : name;
        parentPath =
            typeof parentPath !== 'string' ? _createPath() : parentPath;

        const dirInfo = new DirInfo(name, parentPath);

        return dirInfo;
    }

    function _createPath(depth) {
        depth = depth >= 0 ? depth : 3;

        return new Array(depth)
            .fill(0)
            .map((item, index) => _testValues.getString(`path_${index}`))
            .join(_path.sep);
    }

    describe('ctor()', () => {
        it('should throw an error if invoked without a valid name', () => {
            const input = _testValues.allButString('');
            const error = 'Invalid name (arg #1)';

            input.forEach((name) => {
                const parentPath = _createPath();
                const wrapper = () => new DirInfo(name, parentPath);

                expect(wrapper).to.throw(error);
            });
        });

        it('should throw an error if invoked without a valid parentPath', () => {
            const input = _testValues.allButString();
            const error = 'Invalid parentPath (arg #2)';

            input.forEach((parentPath) => {
                const name = _testValues.getString('name');
                const wrapper = () => new DirInfo(name, parentPath);

                expect(wrapper).to.throw(error);
            });
        });

        it('should return an object with expected methods and properties', () => {
            const name = _testValues.getString('name');
            const parentPath = _createPath();

            const dirInfo = new DirInfo(name, parentPath);

            expect(dirInfo).to.be.an('object');
            expect(dirInfo.name).to.equal(name);
            expect(dirInfo.path).to.be.a('string');
            expect(dirInfo.absPath).to.be.a('string');
            expect(dirInfo.getApiRoutePath).to.be.a('function');
            expect(dirInfo.createChild).to.be.a('function');
        });
    });

    describe('[path]', () => {
        it('should return just the directory path if initialized with an empty parent', () => {
            const parentPath = '';
            const name = _testValues.getString('name');
            const expectedPath = name;

            const dirInfo = _createInstance(name, parentPath);
            expect(dirInfo.path).to.equal(expectedPath);
        });

        it('should return just the directory path if initialized at the root level', () => {
            const parentPath = _path.sep;
            const name = _testValues.getString('name');
            const expectedPath = name;

            const dirInfo = _createInstance(name, parentPath);
            expect(dirInfo.path).to.equal(expectedPath);
        });

        it('should strip trailing slashes from the name', () => {
            const parentPath = _path.sep;
            const name = `${_testValues.getString('name')}${_path.sep}`;
            const expectedPath = `${name}`;

            const dirInfo = _createInstance(name, parentPath);
            expect(dirInfo.path).to.equal(expectedPath);
        });

        it('should return the relative path of the directory', () => {
            const parentPath = _createPath();
            const name = _testValues.getString('name');
            const expectedPath = _path.join(parentPath, name);

            const dirInfo = _createInstance(name, parentPath);
            expect(dirInfo.path).to.equal(expectedPath);
        });
    });

    describe('[absPath]', () => {
        it('should return the absolute path of the directory', () => {
            const parentPath = _createPath();
            const name = _testValues.getString('name');
            const expectedPath = _path.resolve(parentPath, name);

            const dirInfo = _createInstance(name, parentPath);
            expect(dirInfo.absPath).to.equal(expectedPath);
        });
    });

    describe('getApiRoutePath()', () => {
        it('should throw an error if invoked without a valid basePath', () => {
            const input = _testValues.allButString();
            const error = 'Invalid basePath (arg #1)';

            input.forEach((basePath) => {
                const dirInfo = _createInstance();
                const wrapper = () => dirInfo.getApiRoutePath(basePath);

                expect(wrapper).to.throw(error);
            });
        });

        it('should throw an error if the base path is longer than the directory path', () => {
            const parentPath = _createPath(4);
            const basePath = _createPath(5).replace(
                new RegExp(_path.sep, 'g'),
                '/'
            );
            const dirInfo = _createInstance(undefined, parentPath);
            const error = 'Base has more levels than the directory path';

            const wrapper = () => dirInfo.getApiRoutePath(basePath);

            expect(wrapper).to.throw(error);
        });

        it('should throw an error if the base path does not completely exist in the directory path', () => {
            const parentPath = _createPath();
            const basePath = _createPath().replace(
                new RegExp(_path.sep, 'g'),
                '/'
            );
            const dirInfo = _createInstance(undefined, parentPath);
            const error = 'Base path does not exist in directory path';

            const wrapper = () => dirInfo.getApiRoutePath(basePath);

            expect(wrapper).to.throw(error);
        });

        it('should return the relative path of the directory if the base path is empty', () => {
            const name = 'third';
            const parentPath = 'myapi/first/second';
            const dirInfo = _createInstance(name, parentPath);
            const basePath = '';
            const expectedPath = '/myapi/first/second/third';

            const routePath = dirInfo.getApiRoutePath(basePath);
            expect(routePath).to.equal(expectedPath);
        });

        it('should return the portion of the path that does not include the base path', () => {
            const name = 'third';
            const parentPath = 'ignore/this/myapi/first/second';
            const dirInfo = _createInstance(name, parentPath);
            const basePath = 'ignore/this';
            const expectedPath = '/myapi/first/second/third';

            const routePath = dirInfo.getApiRoutePath(basePath);
            expect(routePath).to.equal(expectedPath);
        });
    });

    describe('createChild()', () => {
        it('should throw an error if invoked without a valid name', () => {
            const input = _testValues.allButString();
            const error = 'Invalid name (arg #1)';

            input.forEach((name) => {
                const dirInfo = _createInstance();
                const wrapper = () => dirInfo.createChild(name);

                expect(wrapper).to.throw(error);
            });
        });

        it('should create and return a new child object', () => {
            const name = _testValues.getString('child');
            const dirInfo = _createInstance();

            const child = dirInfo.createChild(name);
            expect(child).to.be.an.instanceof(DirInfo);
        });

        it('should initialize the child with correct parameters', () => {
            const name = _testValues.getString('child');
            const dirInfo = _createInstance();

            const child = dirInfo.createChild(name);
            expect(child.name).to.equal(name);
            expect(child.path).to.equal(_path.join(dirInfo.path, name));
        });
    });
});
