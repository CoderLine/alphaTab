/** @target web */
import * as chai from 'chai';
import { afterAll, beforeEachTest, initializeJestSnapshot } from './mocha.jest-snapshot';

export const mochaHooks = {
    async beforeAll() {
        chai.config.truncateThreshold = 0; // disable truncating
        await initializeJestSnapshot();
    },

    beforeEach: function (done) {
        beforeEachTest(this.currentTest!);
        done();
    },

    afterAll(done) {
        afterAll();
        done();
    }
} satisfies Mocha.RootHookObject;
