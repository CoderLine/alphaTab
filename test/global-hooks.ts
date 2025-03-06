/** @target web */
import * as chai from 'chai';

export const mochaHooks = {
    beforeAll() {
        chai.config.truncateThreshold = 0; // disable truncating
    }
};
