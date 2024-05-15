import { VisualTestHelper } from "../VisualTestHelper";

describe('BrokenRendersTests', () => {
    it('let-ring-empty-voice', async () =>{
        await VisualTestHelper.runVisualTest('issues/let-ring-empty-voice.gp');
    })
})