package alphaTab.visualTests

import alphaTab.Settings
import alphaTab.TestPlatform
import alphaTab.TestPlatformPartials
import alphaTab.core.ecmaScript.Uint8Array
import alphaTab.importer.AlphaTexImporter
import alphaTab.importer.ScoreLoader
import alphaTab.io.ByteBuffer
import alphaTab.model.Score
import alphaTab.rendering.RenderFinishedEventArgs
import alphaTab.rendering.ScoreRenderer
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch
import java.util.concurrent.Semaphore
import java.util.concurrent.TimeUnit
import kotlin.contracts.ExperimentalContracts

@ExperimentalContracts
@ExperimentalUnsignedTypes
class VisualTestHelperPartials {
    companion object {
        public fun runVisualTest(
            inputFile: String,
            settings: Settings? = null,
            tracks: MutableList<Double>? = null,
            message: String? = null
        ) {
            try {
                val fullInputFile = "test-data/visual-tests/$inputFile"
                val inputFileData = TestPlatformPartials.loadFile(fullInputFile)
                val referenceFileName = TestPlatform.changeExtension(fullInputFile, ".png")
                val score = ScoreLoader.loadScoreFromBytes(inputFileData, settings)

                runVisualTestScore(score, referenceFileName, settings, tracks, message)
            } catch (e: Throwable) {
                org.junit.Assert.fail("Failed to run visual test $e")
            }
        }

        public fun runVisualTestTex(
            tex: String,
            referenceFileName: String,
            settings: Settings? = null,
            tracks: MutableList<Double>? = null,
            message: String? = null
        ) {
            try {
                val actualSettings = settings ?: Settings()
                val importer = AlphaTexImporter()
                importer.init(ByteBuffer.fromString(tex), actualSettings)
                val score = importer.readScore()

                runVisualTestScore(score, referenceFileName, settings, tracks, message)
            } catch (e: Throwable) {
                org.junit.Assert.fail("Failed to run visual test $e")
            }
        }

        public fun runVisualTestScore(
            score: Score,
            referenceFileName: String,
            settings: Settings? = null,
            tracks: MutableList<Double>? = null,
            message: String? = null
        ) {
            val actualSettings = settings ?: Settings()
            val actualTracks = tracks ?: ArrayList()

            actualSettings.core.engine = "skia"
            actualSettings.core.enableLazyLoading = false
            actualSettings.core.useWorkers = false

            var actualReferenceFileName = referenceFileName
            if (!actualReferenceFileName.startsWith("test-data/")) {
                actualReferenceFileName = "test-data/visual-tests/$actualReferenceFileName"
            }

            val referenceFileData = TestPlatformPartials.loadFile(actualReferenceFileName)

            val result = ArrayList<RenderFinishedEventArgs>()
            var totalWidth = 0.0
            var totalHeight = 0.0

            val renderer = ScoreRenderer(actualSettings)
            renderer.width = 1300.0

            val waitHandle = Semaphore(1)
            waitHandle.acquire()

            var error: Throwable? = null

            renderer.partialRenderFinished.on { e ->
                result.add(e)
                waitHandle.release()
            }
            renderer.renderFinished.on { e ->
                totalWidth = e.totalWidth
                totalHeight = e.totalHeight
                result.add(e)
            }
            renderer.error.on { e ->
                error = e
                waitHandle.release()
            }

            val job = GlobalScope.launch {
                try {
                    renderer.renderScore(score, actualTracks)
                }
                catch(e:Throwable) {
                    error = e
                    waitHandle.release()
                }
            }

            if (waitHandle.tryAcquire(2000, TimeUnit.MILLISECONDS)) {
                if (error != null) {
                    org.junit.Assert.fail("Rendering failed with error $error ${error?.stackTraceToString()}")
                } else {
                    compareVisualResult(
                        totalWidth,
                        totalHeight,
                        result,
                        referenceFileName,
                        referenceFileData,
                        message
                    )
                }
            } else {
                job.cancel()
                org.junit.Assert.fail("Rendering did not complete within timeout")
            }
        }

        private fun compareVisualResult(
            totalWidth: Double,
            totalHeight: Double,
            result: MutableList<RenderFinishedEventArgs>,
            referenceFileName: String,
            referenceFileData: Uint8Array,
            message: String?
        ) {
            // TODO: get Skia to render like Chrome
            // https://github.com/mono/SkiaSharp/issues/1253
        }
    }
}
