'use strict';

const _chai = require('chai');
_chai.use(require('sinon-chai'));
_chai.use(require('chai-as-promised'));
const expect = _chai.expect;

const _index = require('../../src/index');
const ConstructFactory = require('../../src/construct-factory');
const ConstructBuilder = require('../../src/construct-builder');

describe('index', function() {
    it('should implement methods required by the interface', function() {
        expect(_index.ConstructFactory).to.equal(ConstructFactory);
        expect(_index.ConstructBuilder).to.equal(ConstructBuilder);
    });
});
