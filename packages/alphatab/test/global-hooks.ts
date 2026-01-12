/** @target web */
import * as chai from 'chai';
import { afterAll, beforeEachTest, initializeJestSnapshot } from './mocha.jest-snapshot';
import { TestPlatform } from 'test/TestPlatform';

export const mochaHooks = {
    async beforeAll() {
        chai.config.truncateThreshold = 0; // disable truncating
        await initializeJestSnapshot();
    },

    beforeEach: function (done) {
        beforeEachTest(this.currentTest!);
        TestPlatform.currentTestName = this.currentTest!.title;
        done();
    },

    afterAll(done) {
        afterAll();
        done();
    }
} satisfies Mocha.RootHookObject;
