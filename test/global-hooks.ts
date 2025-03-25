/** @target web */
import * as chai from 'chai';
import { afterAll, beforeEachTest, initializeJestSnapshot } from './mocha.jest-snapshot';

export const mochaHooks = {
    beforeAll: async function () {
        chai.config.truncateThreshold = 0; // disable truncating
        await initializeJestSnapshot();
    },

    beforeEach: function (done) {
        beforeEachTest(this.currentTest!);
        done();
    },

    afterAll: function (done) {
        afterAll();
        done();
    }
} satisfies Mocha.RootHookObject;
