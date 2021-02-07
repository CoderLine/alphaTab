package alphaTab.visualTests

import alphaTab.ScrollMode
import alphaTab.Settings
import alphaTab.model.Score
import kotlin.contracts.ExperimentalContracts

@ExperimentalContracts
class VisualTestHelper {
    companion object {
        public fun runVisualTest(
            inputFile: String,
            settings: Settings? = null,
            tracks: MutableList<Double>? = null,
            message: String? = null
        ) {
            // TODO
        }

        public fun runVisualTestTex(
            tex: String,
            referenceFileName: String,
            settings: Settings? = null,
            tracks: MutableList<Double>? = null,
            message: String? = null
        ) {
            // TODO
        }

        public fun runVisualTestSCore(
            score: Score,
            referenceFileName: String,
            settings: Settings? = null,
            tracks: MutableList<Double>? = null,
            message: String? = null
        ) {
            // TODO
        }
    }
}
