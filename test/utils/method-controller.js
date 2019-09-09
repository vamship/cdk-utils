const { asyncHelper: _asyncHelper } = require('@vamship/test-utils');

/**
 * Utility class that can be used to step through execution of a method during
 * testing. Useful when testing async functions that chain several async steps
 * together.
 */
class MethodController {
    /**
     * @param {Object} steps An enumeration of execution steps. These steps can
     *        be used to identify the step to run until by using a friendly step
     *        name instead of a numerical index. For ease of use, these steps
     *        will be exposed as properties of the instance, so take care to
     *        ensure that the step name does not conflict with existing
     *        properties.
     * @param {Function} resolver A generator function that can be used to
     *        step through the method under test. This function must yield at
     *        each step, allowing tests to be executed at that point.
     */
    constructor(steps, resolver) {
        Object.keys(steps).forEach((key) => {
            this[key] = steps[key];
        });
        this._resolver = resolver;
    }

    /**
     * Steps execution forward until the specified step. Will execute actions,
     * chaining them togehter until the specified step is reached. A promise
     * that represents the completion of the final step is returned.
     *
     * @param {Number} step The index of the step to execute until.
     * @param {Number} iteration An optional iteration value that is indicative of the
     *        test iteration, when the same function is invoked multiple times
     *        within a single test case.
     *
     * @return {Promise} promise that represents execution until the specified
     *         step.
     */
    async resolveUntil(step, iteration) {
        iteration = typeof iteration === 'number' ? iteration : 0;
        let index = 0;
        let result = { value: undefined, done: false };
        const iterator = this._resolver(iteration);

        while (index < step && !result.done) {
            result = iterator.next();
            await _asyncHelper.wait(1)();
            index++;
        }

        return result.value;
    }
}
module.exports = MethodController;
