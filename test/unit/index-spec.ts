import 'mocha';
import _chai, { expect } from 'chai';
import _sinonChai from 'sinon-chai';
import _chaiAsPromised from 'chai-as-promised';

_chai.use(_sinonChai);
_chai.use(_chaiAsPromised);

import * as _index from '../../src/index';
import ConstructBuilder from '../../src/construct-builder';
import ConstructFactory from '../../src/construct-factory';

describe('index', () => {
    it('should implement methods required by the interface', function () {
        expect(_index.ConstructBuilder).to.equal(ConstructBuilder);
        expect(_index.ConstructFactory).to.equal(ConstructFactory);
    });
});
